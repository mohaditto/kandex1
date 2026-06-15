const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { normalizeRole } = require('../middlewares/roleMiddleware');

function roleVariants(role) {
    const normalized = normalizeRole(role);
    if (normalized === 'Administrador') return ['Administrador'];
    if (normalized === 'Líder') return ['Líder'];
    return ['Miembro'];
}

function isEnumMismatch(err) {
    return ['ER_TRUNCATED_WRONG_VALUE_FOR_FIELD', 'WARN_DATA_TRUNCATED', 'ER_WARN_DATA_TRUNCATED'].includes(err.code)
        || String(err.message || '').includes("Data truncated for column 'rol'");
}

async function queryWithRoleFallback(query, params, rolIndex) {
    const variants = roleVariants(params[rolIndex]);
    let lastError;

    for (const variant of variants) {
        const nextParams = [...params];
        nextParams[rolIndex] = variant;
        try {
            return await db.promise().query(query, nextParams);
        } catch (err) {
            if (!isEnumMismatch(err)) throw err;
            lastError = err;
        }
    }

    throw lastError;
}

function normalizeUser(row) {
    return row ? { ...row, rol: normalizeRole(row.rol) } : row;
}

class Usuario {
    static async create({ nombre_usuario, email, password, rol }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await queryWithRoleFallback(
            'INSERT INTO usuarios (nombre_usuario, email, password_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre_usuario, email, hashedPassword, rol],
            3
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return normalizeUser(rows[0]);
    }

    static async findAll() {
        const [rows] = await db.promise().query(
            `SELECT u.*,
                    GROUP_CONCAT(e.nombre_equipo ORDER BY e.nombre_equipo SEPARATOR ', ') AS equipos
             FROM usuarios u
             LEFT JOIN equipo_usuarios eu ON eu.usuario_id = u.id
             LEFT JOIN equipos e ON e.id = eu.equipo_id
             GROUP BY u.id
             ORDER BY u.nombre_usuario`
        );
        return rows.map(normalizeUser);
    }

    static async findById(id) {
        const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE id = ?', [id]);
        return normalizeUser(rows[0]);
    }

    static async update(id, { nombre_usuario, email, rol }) {
        await queryWithRoleFallback(
            'UPDATE usuarios SET nombre_usuario = ?, email = ?, rol = ? WHERE id = ?',
            [nombre_usuario, email, rol, id],
            2
        );
    }
}

module.exports = Usuario;
