/**
 * Script para verificar tareas de usuarios y equipos
 * Ejecuta: node debug-tasks.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugTasks() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('📊 VERIFICACIÓN DE TAREAS Y EQUIPOS\n');
        console.log('='.repeat(80) + '\n');

        // 1. Verificar usuarios
        console.log('👥 USUARIOS EN EL SISTEMA:');
        const [usuarios] = await connection.execute(
            'SELECT id, nombre_usuario, email, rol FROM usuarios ORDER BY id'
        );
        usuarios.forEach(u => {
            console.log(`  ${u.id}. ${u.nombre_usuario.padEnd(15)} - ${u.email.padEnd(20)} [${u.rol}]`);
        });

        console.log('\n' + '='.repeat(80) + '\n');

        // 2. Verificar equipos
        console.log('👥 EQUIPOS EN EL SISTEMA:');
        const [equipos] = await connection.execute(
            'SELECT id, nombre_equipo FROM equipos ORDER BY id'
        );
        equipos.forEach(e => {
            console.log(`  ${e.id}. ${e.nombre_equipo}`);
        });

        console.log('\n' + '='.repeat(80) + '\n');

        // 3. Verificar relación usuario-equipo
        console.log('🔗 RELACIONES USUARIO-EQUIPO (equipo_usuarios):');
        const [relations] = await connection.execute(
            `SELECT eu.id, u.nombre_usuario, e.nombre_equipo, u.rol
             FROM equipo_usuarios eu
             JOIN usuarios u ON u.id = eu.usuario_id
             JOIN equipos e ON e.id = eu.equipo_id
             ORDER BY u.nombre_usuario, e.nombre_equipo`
        );
        
        if (relations.length === 0) {
            console.log('  ⚠️  No hay relaciones usuario-equipo!');
        } else {
            relations.forEach(r => {
                console.log(`  ${r.nombre_usuario.padEnd(15)} → ${r.nombre_equipo.padEnd(20)} (${r.rol})`);
            });
        }

        console.log('\n' + '='.repeat(80) + '\n');

        // 4. Verificar tareas por usuario
        console.log('📋 TAREAS POR USUARIO:');
        for (const usuario of usuarios) {
            const [tareas] = await connection.execute(
                `SELECT COUNT(*) as count FROM tareas WHERE usuario_id = ?`,
                [usuario.id]
            );
            console.log(`  ${usuario.nombre_usuario.padEnd(15)} - ${tareas[0].count} tarea(s)`);
        }

        console.log('\n' + '='.repeat(80) + '\n');

        // 5. Verificar tareas por equipo
        console.log('📋 TAREAS POR EQUIPO:');
        for (const equipo of equipos) {
            const [tareas] = await connection.execute(
                `SELECT COUNT(*) as count FROM tareas WHERE equipo_id = ?`,
                [equipo.id]
            );
            console.log(`  ${equipo.nombre_equipo.padEnd(20)} - ${tareas[0].count} tarea(s)`);
        }

        console.log('\n' + '='.repeat(80) + '\n');

        // 6. Verificar qué tareas vería cada usuario
        console.log('🔍 TAREAS VISIBLES POR USUARIO:\n');
        
        for (const usuario of usuarios) {
            console.log(`\n📌 ${usuario.nombre_usuario} (${usuario.rol}):`);
            
            if (usuario.rol === 'Administrador') {
                // Admin ve todas
                const [tareas] = await connection.execute(
                    `SELECT COUNT(*) as count FROM tareas`
                );
                console.log(`   ✓ Ve TODAS las tareas (${tareas[0].count} total)`);
            } else if (usuario.rol === 'Líder') {
                // Líder ve tareas de sus equipos
                const [tareas] = await connection.execute(
                    `SELECT COUNT(DISTINCT t.id) as count
                     FROM tareas t
                     INNER JOIN equipo_usuarios eu ON eu.equipo_id = t.equipo_id
                     WHERE eu.usuario_id = ?`,
                    [usuario.id]
                );
                console.log(`   ✓ Ve ${tareas[0].count} tarea(s) de sus equipos`);
                
                // Mostrar tareas específicas
                const [detalles] = await connection.execute(
                    `SELECT t.id, t.titulo, e.nombre_equipo, u.nombre_usuario
                     FROM tareas t
                     INNER JOIN equipo_usuarios eu ON eu.equipo_id = t.equipo_id
                     LEFT JOIN equipos e ON e.id = t.equipo_id
                     LEFT JOIN usuarios u ON u.id = t.usuario_id
                     WHERE eu.usuario_id = ?
                     ORDER BY e.nombre_equipo, t.id`,
                    [usuario.id]
                );
                
                detalles.forEach(d => {
                    console.log(`     - "${d.titulo}" (${d.nombre_equipo} - Creador: ${d.nombre_usuario})`);
                });
            } else {
                // Miembro ve solo sus tareas
                const [tareas] = await connection.execute(
                    `SELECT COUNT(*) as count FROM tareas WHERE usuario_id = ?`,
                    [usuario.id]
                );
                console.log(`   ✓ Ve ${tareas[0].count} tarea(s) propias`);
                
                // Mostrar tareas específicas
                const [detalles] = await connection.execute(
                    `SELECT t.id, t.titulo, e.nombre_equipo
                     FROM tareas t
                     LEFT JOIN equipos e ON e.id = t.equipo_id
                     WHERE t.usuario_id = ?
                     ORDER BY t.id`,
                    [usuario.id]
                );
                
                detalles.forEach(d => {
                    console.log(`     - "${d.titulo}" (${d.nombre_equipo})`);
                });
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('\n✅ Verificación completada!\n');
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

debugTasks();
