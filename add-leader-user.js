/**
 * Script para agregar usuario de prueba con rol Líder
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function addLeaderUser() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('🔧 Agregando usuario Líder de prueba...\n');

        // Datos del usuario líder
        const nombre_usuario = 'lider_test';
        const email = 'lider@kandex.com';
        const password = 'Lider123!';
        const rol = 'Líder';

        // Verificar si ya existe
        const [existe] = await connection.execute(
            'SELECT id FROM usuarios WHERE nombre_usuario = ?',
            [nombre_usuario]
        );

        if (existe.length > 0) {
            console.log(`⚠️  El usuario "${nombre_usuario}" ya existe. Actualizando a rol "Líder"...`);
            await connection.execute(
                'UPDATE usuarios SET rol = ? WHERE nombre_usuario = ?',
                [rol, nombre_usuario]
            );
        } else {
            // Crear hash de contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar usuario
            await connection.execute(
                'INSERT INTO usuarios (nombre_usuario, email, password_hash, rol) VALUES (?, ?, ?, ?)',
                [nombre_usuario, email, hashedPassword, rol]
            );
            console.log(`✅ Usuario "${nombre_usuario}" creado exitosamente`);
        }

        // Verificación
        const [usuario] = await connection.execute(
            'SELECT id, nombre_usuario, email, rol FROM usuarios WHERE nombre_usuario = ?',
            [nombre_usuario]
        );

        if (usuario.length > 0) {
            const u = usuario[0];
            console.log(`
📋 Detalles del usuario Líder:
  ID: ${u.id}
  Usuario: ${u.nombre_usuario}
  Email: ${u.email}
  Rol: ${u.rol}
  Contraseña: ${password}

✅ Usuario Líder disponible para pruebas!
`);
        }

        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addLeaderUser();
