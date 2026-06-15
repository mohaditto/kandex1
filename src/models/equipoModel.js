const db = require('../config/db');

class Equipo {
    static async create({ nombre_equipo, descripcion }) {
        const [result] = await db.promise().query(
            'INSERT INTO equipos (nombre_equipo, descripcion) VALUES (?, ?)',
            [nombre_equipo, descripcion]
        );
        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.promise().query('SELECT * FROM equipos');
        return rows;
    }

    static async findByUser(usuario_id) {
        const [rows] = await db.promise().query(
            `SELECT e.*
             FROM equipos e
             JOIN equipo_usuarios eu ON eu.equipo_id = e.id
             WHERE eu.usuario_id = ?
             ORDER BY e.nombre_equipo`,
            [usuario_id]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.promise().query('SELECT * FROM equipos WHERE id = ?', [id]);
        return rows[0];
    }

    static async addUser(equipo_id, usuario_id) {
        await db.promise().query(
            'INSERT IGNORE INTO equipo_usuarios (equipo_id, usuario_id) VALUES (?, ?)',
            [equipo_id, usuario_id]
        );
    }

    static async removeUser(equipo_id, usuario_id) {
        await db.promise().query(
            'DELETE FROM equipo_usuarios WHERE equipo_id = ? AND usuario_id = ?',
            [equipo_id, usuario_id]
        );
    }

    static async getTeamsByUser(usuario_id) {
        const [rows] = await db.promise().query(
            'SELECT e.* FROM equipos e JOIN equipo_usuarios eu ON e.id = eu.equipo_id WHERE eu.usuario_id = ? ORDER BY e.nombre_equipo',
            [usuario_id]
        );
        return rows;
    }

    static async getUsersByTeam(equipo_id) {
        const [rows] = await db.promise().query(
            'SELECT u.* FROM usuarios u JOIN equipo_usuarios eu ON u.id = eu.usuario_id WHERE eu.equipo_id = ?',
            [equipo_id]
        );
        return rows;
    }

    static async update(id, { nombre_equipo, descripcion }) {
        await db.promise().query(
            'UPDATE equipos SET nombre_equipo = ?, descripcion = ? WHERE id = ?',
            [nombre_equipo, descripcion, id]
        );
    }

    static async delete(id) {
        await db.promise().query('DELETE FROM equipos WHERE id = ?', [id]);
    }
}

module.exports = Equipo;
