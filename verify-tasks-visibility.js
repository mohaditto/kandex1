/**
 * Script para verificar tareas visibles después del cambio
 * Ejecuta: node verify-tasks-visibility.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyTasksVisibility() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('📊 VERIFICACIÓN DE VISIBILIDAD DE TAREAS\n');
        console.log('='.repeat(60) + '\n');

        // Obtener todos los usuarios
        const [usuarios] = await connection.execute(
            'SELECT id, nombre_usuario, rol FROM usuarios ORDER BY nombre_usuario'
        );

        for (const usuario of usuarios) {
            console.log(`👤 ${usuario.nombre_usuario} (${usuario.rol})`);
            console.log('-'.repeat(50));

            let tareas;

            if (usuario.rol === 'Administrador') {
                // Admin ve todas las tareas
                [tareas] = await connection.execute(
                    'SELECT COUNT(*) as count FROM tareas'
                );
                console.log(`   📋 Ve ${tareas[0].count} tarea(s) (TODAS)`);
            } else if (usuario.rol === 'Líder') {
                // Líder ve tareas de sus equipos
                [tareas] = await connection.execute(
                    `SELECT COUNT(DISTINCT t.id) as count
                     FROM tareas t
                     INNER JOIN equipo_usuarios eu ON eu.equipo_id = t.equipo_id
                     WHERE eu.usuario_id = ?`,
                    [usuario.id]
                );
                console.log(`   📋 Ve ${tareas[0].count} tarea(s) de sus equipos`);

                // Mostrar equipos del líder
                const [equipos] = await connection.execute(
                    `SELECT DISTINCT e.nombre_equipo
                     FROM equipo_usuarios eu
                     JOIN equipos e ON e.id = eu.equipo_id
                     WHERE eu.usuario_id = ?`,
                    [usuario.id]
                );
                if (equipos.length) {
                    console.log(`   🎯 Equipos: ${equipos.map(e => e.nombre_equipo).join(', ')}`);
                }
            } else if (usuario.rol === 'Miembro') {
                // Miembro ve tareas de sus equipos
                [tareas] = await connection.execute(
                    `SELECT COUNT(DISTINCT t.id) as count
                     FROM tareas t
                     INNER JOIN equipo_usuarios eu ON eu.equipo_id = t.equipo_id
                     WHERE eu.usuario_id = ?`,
                    [usuario.id]
                );
                console.log(`   📋 Ve ${tareas[0].count} tarea(s) de sus equipos`);

                // Mostrar equipos del miembro
                const [equipos] = await connection.execute(
                    `SELECT DISTINCT e.nombre_equipo
                     FROM equipo_usuarios eu
                     JOIN equipos e ON e.id = eu.equipo_id
                     WHERE eu.usuario_id = ?`,
                    [usuario.id]
                );
                if (equipos.length) {
                    console.log(`   🎯 Equipos: ${equipos.map(e => e.nombre_equipo).join(', ')}`);
                } else {
                    console.log(`   ⚠️  No está asignado a ningún equipo`);
                }
            }

            console.log('');
        }

        console.log('='.repeat(60) + '\n');

        // Resumen de tareas por equipo
        console.log('📈 RESUMEN DE TAREAS POR EQUIPO:\n');
        const [equiposTareas] = await connection.execute(
            `SELECT e.nombre_equipo, COUNT(t.id) as total_tareas
             FROM equipos e
             LEFT JOIN tareas t ON t.equipo_id = e.id
             GROUP BY e.id, e.nombre_equipo
             ORDER BY e.nombre_equipo`
        );

        equiposTareas.forEach(eq => {
            console.log(`  ${eq.nombre_equipo}: ${eq.total_tareas} tarea(s)`);
        });

        console.log('\n✅ Verificación completada\n');

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

verifyTasksVisibility();
