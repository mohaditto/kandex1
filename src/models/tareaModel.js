const db = require('../config/db');
const { ESTADOS_TAREA_VALIDOS, normalizarEstado } = require('../config/taskStates');
const { normalizeRole } = require('../middlewares/roleMiddleware');

const PRIORIDADES_VALIDAS = ['Baja', 'Media', 'Alta', 'Urgente'];

function normalizeRows(rows) {
    return rows.map(row => ({ ...row, estado: normalizarEstado(row.estado) }));
}

async function queryWithLegacyEstadoFallback(query, params, estadoIndex) {
    try {
        return await db.promise().query(query, params);
    } catch (err) {
        const isEnumMismatch = ['ER_TRUNCATED_WRONG_VALUE_FOR_FIELD', 'WARN_DATA_TRUNCATED', 'ER_WARN_DATA_TRUNCATED'].includes(err.code)
            || String(err.message || '').includes("Data truncated for column 'estado'");
        if (params[estadoIndex] === 'En proceso' && isEnumMismatch) {
            const fallbackParams = [...params];
            fallbackParams[estadoIndex] = 'En progreso';
            return db.promise().query(query, fallbackParams);
        }
        throw err;
    }
}

class Tarea {
    static async create({ usuario_id, equipo_id, titulo, descripcion, estado, prioridad, fecha_inicio, fecha_limite }) {
        // Crea una tarjeta del tablero asociada a un usuario y a un equipo.
        const estadoFinal = ESTADOS_TAREA_VALIDOS.includes(estado) ? estado : 'Por realizar';
        const prioridadFinal = PRIORIDADES_VALIDAS.includes(prioridad) ? prioridad : 'Media';
        const [result] = await queryWithLegacyEstadoFallback(
            'INSERT INTO tareas (usuario_id, equipo_id, titulo, descripcion, estado, prioridad, fecha_inicio, fecha_limite) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, equipo_id, titulo, descripcion, estadoFinal, prioridadFinal, fecha_inicio, fecha_limite],
            4
        );
        return result.insertId;
    }

    static async findByUser(usuario_id) {
        // Ordena por estado y posicion para reconstruir el tablero Kanban.
        const [rows] = await db.promise().query(
            'SELECT * FROM tareas WHERE usuario_id = ? ORDER BY estado, posicion',
            [usuario_id]
        );
        return normalizeRows(rows);
    }

    static async findByLeader(usuario_id) {
        const [rows] = await db.promise().query(
            `SELECT DISTINCT t.*
             FROM tareas t
             JOIN equipo_usuarios eu ON eu.equipo_id = t.equipo_id
             WHERE eu.usuario_id = ?
             ORDER BY t.estado, t.posicion`,
            [usuario_id]
        );
        return normalizeRows(rows);
    }

    static async findAll() {
        const [rows] = await db.promise().query(
            `SELECT t.*, u.nombre_usuario, u.email, e.nombre_equipo
             FROM tareas t
             LEFT JOIN usuarios u ON u.id = t.usuario_id
             LEFT JOIN equipos e ON e.id = t.equipo_id
             ORDER BY t.fecha_creacion DESC, t.id DESC`
        );
        return normalizeRows(rows);
    }

    static async findById(id) {
        const [rows] = await db.promise().query('SELECT * FROM tareas WHERE id = ?', [id]);
        return rows[0] ? normalizeRows(rows)[0] : undefined;
    }

    static async canAccess(id, user) {
        if (!user) return false;
        const role = normalizeRole(user.rol);
        if (role === 'Administrador') return true;

        const [rows] = await db.promise().query(
            `SELECT t.usuario_id, eu.usuario_id AS lider_equipo
             FROM tareas t
             LEFT JOIN equipo_usuarios eu ON eu.equipo_id = t.equipo_id AND eu.usuario_id = ?
             WHERE t.id = ?`,
            [user.id, id]
        );
        const tarea = rows[0];
        if (!tarea) return false;
        if (tarea.usuario_id === user.id) return true;
        return role === 'Líder' && tarea.lider_equipo === user.id;
    }

    static async update(id, { titulo, descripcion, estado, prioridad, fecha_inicio, fecha_limite }) {
        const estadoFinal = ESTADOS_TAREA_VALIDOS.includes(estado) ? estado : 'Por realizar';
        const prioridadFinal = PRIORIDADES_VALIDAS.includes(prioridad) ? prioridad : 'Media';
        let query = 'UPDATE tareas SET titulo = ?, descripcion = ?, estado = ?, prioridad = ?, fecha_inicio = ?, fecha_limite = ?';
        const params = [titulo, descripcion, estadoFinal, prioridadFinal, fecha_inicio, fecha_limite];
        
        if (estadoFinal === 'Realizado') {
            // Marca fecha_finalizacion automaticamente cuando la tarea queda completada.
            query = 'UPDATE tareas SET titulo = ?, descripcion = ?, estado = ?, prioridad = ?, fecha_inicio = ?, fecha_limite = ?, fecha_finalizacion = NOW()';
        }
        
        await queryWithLegacyEstadoFallback(query + ' WHERE id = ?', [...params, id], 2);
    }

    static async delete(id) {
        await db.promise().query('DELETE FROM tareas WHERE id = ?', [id]);
    }

    static async updatePosition(id, posicion, estado) {
        // Persiste el drag and drop del tablero: columna nueva y orden dentro de ella.
        const estadoFinal = ESTADOS_TAREA_VALIDOS.includes(estado) ? estado : 'Por realizar';
        await queryWithLegacyEstadoFallback(
            'UPDATE tareas SET posicion = ?, estado = ? WHERE id = ?',
            [posicion, estadoFinal, id]
            , 1
        );
    }
}

module.exports = Tarea;
