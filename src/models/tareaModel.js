const db = require('../config/db');
const { ESTADOS_TAREA_VALIDOS } = require('../config/taskStates');

class Tarea {
    static async create({ usuario_id, equipo_id, titulo, descripcion, estado, prioridad, fecha_inicio, fecha_limite }) {
        // Crea una tarjeta del tablero asociada a un usuario y a un equipo.
        const estadoFinal = ESTADOS_TAREA_VALIDOS.includes(estado) ? estado : 'Por realizar';
        const [result] = await db.promise().query(
            'INSERT INTO tareas (usuario_id, equipo_id, titulo, descripcion, estado, prioridad, fecha_inicio, fecha_limite) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, equipo_id, titulo, descripcion, estadoFinal, prioridad || 'Media', fecha_inicio, fecha_limite]
        );
        return result.insertId;
    }

    static async findByUser(usuario_id) {
        // Ordena por estado y posicion para reconstruir el tablero Kanban.
        const [rows] = await db.promise().query(
            'SELECT * FROM tareas WHERE usuario_id = ? ORDER BY estado, posicion',
            [usuario_id]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.promise().query('SELECT * FROM tareas WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, { titulo, descripcion, estado, prioridad, fecha_inicio, fecha_limite }) {
        const estadoFinal = ESTADOS_TAREA_VALIDOS.includes(estado) ? estado : 'Por realizar';
        let query = 'UPDATE tareas SET titulo = ?, descripcion = ?, estado = ?, prioridad = ?, fecha_inicio = ?, fecha_limite = ?';
        const params = [titulo, descripcion, estadoFinal, prioridad, fecha_inicio, fecha_limite];
        
        if (estadoFinal === 'Realizado') {
            // Marca fecha_finalizacion automaticamente cuando la tarea queda completada.
            query = 'UPDATE tareas SET titulo = ?, descripcion = ?, estado = ?, prioridad = ?, fecha_inicio = ?, fecha_limite = ?, fecha_finalizacion = NOW()';
        }
        
        await db.promise().query(query + ' WHERE id = ?', [...params, id]);
    }

    static async delete(id) {
        await db.promise().query('DELETE FROM tareas WHERE id = ?', [id]);
    }

    static async updatePosition(id, posicion, estado) {
        // Persiste el drag and drop del tablero: columna nueva y orden dentro de ella.
        const estadoFinal = ESTADOS_TAREA_VALIDOS.includes(estado) ? estado : 'Por realizar';
        await db.promise().query(
            'UPDATE tareas SET posicion = ?, estado = ? WHERE id = ?',
            [posicion, estadoFinal, id]
        );
    }
}

module.exports = Tarea;
