const db = require('../config/db');

class Comentario {
    static async create({ tarea_id, usuario_id, contenido }) {
        const [result] = await db.promise().query(
            'INSERT INTO comentarios (tarea_id, usuario_id, contenido) VALUES (?, ?, ?)',
            [tarea_id, usuario_id, contenido]
        );

        return { id: result.insertId, tarea_id, usuario_id, contenido };
    }

    static async findByTarea(tarea_id) {
        const [rows] = await db.promise().query(
            'SELECT c.*, u.nombre_usuario FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id WHERE c.tarea_id = ? ORDER BY c.fecha_creacion DESC',
            [tarea_id]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.promise().query(
            'SELECT c.*, u.nombre_usuario FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = ?',
            [id]
        );
        return rows[0];
    }

    static async delete(id) {
        await db.promise().query('DELETE FROM comentarios WHERE id = ?', [id]);
    }
}

module.exports = Comentario;