/**
 * Script para asignar usuarios a equipos
 * Ejecuta: node setup-user-teams.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupUserTeams() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('🔧 ASIGNANDO USUARIOS A EQUIPOS\n');

        // Definir asignaciones
        const asignaciones = [
            // Líder nestor -> múltiples equipos
            { usuario: 'nestor', equipo: 'Equipo Frontend' },
            { usuario: 'nestor', equipo: 'Equipo Backend' },
            { usuario: 'nestor', equipo: 'Equipo QA' },
        ];

        console.log('📋 Asignaciones a realizar:\n');
        for (const asignacion of asignaciones) {
            // Obtener IDs
            const [usuarios] = await connection.execute(
                'SELECT id FROM usuarios WHERE nombre_usuario = ?',
                [asignacion.usuario]
            );
            const [equipos] = await connection.execute(
                'SELECT id FROM equipos WHERE nombre_equipo = ?',
                [asignacion.equipo]
            );

            if (!usuarios.length) {
                console.log(`  ⚠️  Usuario "${asignacion.usuario}" no encontrado`);
                continue;
            }
            if (!equipos.length) {
                console.log(`  ⚠️  Equipo "${asignacion.equipo}" no encontrado`);
                continue;
            }

            const usuarioId = usuarios[0].id;
            const equipoId = equipos[0].id;

            try {
                await connection.execute(
                    'INSERT IGNORE INTO equipo_usuarios (equipo_id, usuario_id) VALUES (?, ?)',
                    [equipoId, usuarioId]
                );
                console.log(`  ✓ ${asignacion.usuario} → ${asignacion.equipo}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`  → ${asignacion.usuario} ya está en ${asignacion.equipo}`);
                } else {
                    console.log(`  ✗ Error: ${err.message}`);
                }
            }
        }

        console.log('\n✅ Asignaciones completadas!\n');

        // Verificación
        console.log('📊 Verificación final de tareas visibles:\n');
        const [usuarios] = await connection.execute(
            'SELECT id, nombre_usuario, rol FROM usuarios WHERE rol IN ("Líder", "Miembro") ORDER BY nombre_usuario'
        );

        for (const usuario of usuarios) {
            if (usuario.rol === 'Líder') {
                const [tareas] = await connection.execute(
                    `SELECT COUNT(DISTINCT t.id) as count
                     FROM tareas t
                     INNER JOIN equipo_usuarios eu ON eu.equipo_id = t.equipo_id
                     WHERE eu.usuario_id = ?`,
                    [usuario.id]
                );
                console.log(`  ${usuario.nombre_usuario} (Líder): ${tareas[0].count} tarea(s)`);
            }
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

setupUserTeams();
