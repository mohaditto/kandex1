const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Usuario {
    static async create({ nombre_usuario, email, password, rol }) {
        // Hash antes de guardar: la BD nunca recibe el password original.
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.promise().query(
            'INSERT INTO usuarios (nombre_usuario, email, password_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre_usuario, email, hashedPassword, rol]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        // Se usa durante el login para ubicar al usuario por su email unico.
        const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows[0];
    }

    // Agregar aqui mas consultas relacionadas con usuarios si el proyecto crece.
}

module.exports = Usuario;
