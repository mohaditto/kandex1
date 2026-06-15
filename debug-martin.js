/**
 * Script para debuggear el problema de Martin
 * Ejecuta: node debug-martin.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugMartin() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('🔍 DEBUG: MARTIN Y EQUIPO DE INTEGRACION\n');

        // 1. Buscar a Martin
        const [martins] = await connection.execute(
            'SELECT id, nombre_usuario, rol, email FROM usuarios WHERE nombre_usuario LIKE ?',
            ['%martin%']
        );

        if (!martins.length) {
            console.log('❌ No se encontró usuario con nombre que contenga "martin"');
            console.log('\n📋 Usuarios disponibles:');
            const [todos] = await connection.execute(
                'SELECT id, nombre_usuario, rol FROM usuarios ORDER BY nombre_usuario'
            );
            todos.forEach(u => {
                console.log(`  - ${u.nombre_usuario} - ${u.rol}`);
            });
            process.exit(0);
        }

        const martin = martins[0];
        console.log(`✓ Usuario encontrado: ${martin.nombre_usuario} - ${martin.rol}\n`);

        // 2. Buscar equipo de integracion
        const [integracions] = await connection.execute(
            'SELECT id, nombre_equipo FROM equipos WHERE nombre_equipo LIKE ?',
            ['%integracion%']
        );

        if (!integracions.length) {
            console.log('❌ No se encontró equipo con nombre que contenga "integracion"');
            console.log('\n📋 Equipos disponibles:');
            const [todos] = await connection.execute(
                'SELECT id, nombre_equipo FROM equipos ORDER BY nombre_equipo'
            );
            todos.forEach(e => {
                console.log(`  - ${e.nombre_equipo}`);
            });
            process.exit(0);
        }

        const equipo = integracions[0];
        console.log(`✓ Equipo encontrado: ${equipo.nombre_equipo}\n`);

        // 3. Verificar si Martin está asignado al equipo
        const [asignacion] = await connection.execute(
            'SELECT * FROM equipo_usuarios WHERE usuario_id = ? AND equipo_id = ?',
            [martin.id, equipo.id]
        );

        console.log(`📊 ASIGNACIÓN:\n`);
        if (asignacion.length) {
            console.log(`  ✓ Martin ESTÁ asignado a ${equipo.nombre_equipo}`);
        } else {
            console.log(`  ❌ Martin NO está asignado a ${equipo.nombre_equipo}`);
        }

        // 4. Ver tareas del equipo
        const [tareas] = await connection.execute(
            `SELECT t.id, t.titulo, t.descripcion, t.estado, t.prioridad, 
                    u.nombre_usuario, e.nombre_equipo, t.fecha_creacion
             FROM tareas t
             LEFT JOIN usuarios u ON u.id = t.usuario_id
             LEFT JOIN equipos e ON e.id = t.equipo_id
             WHERE t.equipo_id = ?
             ORDER BY t.id`,
            [equipo.id]
        );

        console.log(`\n📋 TAREAS DEL EQUIPO "${equipo.nombre_equipo}" (${tareas.length} total):\n`);
        if (tareas.length) {
            tareas.forEach((t, idx) => {
                console.log(`  ${idx + 1}. [${t.estado}] "${t.titulo}" (ID: ${t.id})`);
                console.log(`     Creada por: ${t.nombre_usuario || 'N/A'}`);
                console.log(`     Prioridad: ${t.prioridad || 'N/A'}\n`);
            });
        } else {
            console.log(`  No hay tareas en este equipo\n`);
        }

        // 5. Ver qué tareas VE Martin actualmente
        const [tareasDelMartin] = await connection.execute(
            `SELECT DISTINCT t.id, t.titulo, t.estado
             FROM tareas t
             INNER JOIN equipo_usuarios eu ON eu.equipo_id = t.equipo_id
             WHERE eu.usuario_id = ?
             ORDER BY t.id`,
            [martin.id]
        );

        console.log(`👤 TAREAS QUE VE MARTIN (${tareasDelMartin.length} total):\n`);
        if (tareasDelMartin.length) {
            tareasDelMartin.forEach((t, idx) => {
                console.log(`  ${idx + 1}. [${t.estado}] "${t.titulo}" (ID: ${t.id})`);
            });
        } else {
            console.log(`  Martin no ve ninguna tarea`);
        }

        // 6. Ver a qué equipos está asignado Martin
        const [equiposDeMartin] = await connection.execute(
            `SELECT e.id, e.nombre_equipo, COUNT(t.id) as tareas
             FROM equipo_usuarios eu
             LEFT JOIN equipos e ON e.id = eu.equipo_id
             LEFT JOIN tareas t ON t.equipo_id = e.id
             WHERE eu.usuario_id = ?
             GROUP BY e.id, e.nombre_equipo`,
            [martin.id]
        );

        console.log(`\n🎯 EQUIPOS ASIGNADOS A MARTIN:\n`);
        if (equiposDeMartin.length) {
            equiposDeMartin.forEach(eq => {
                console.log(`  - ${eq.nombre_equipo} (${eq.tareas} tareas)`);
            });
        } else {
            console.log(`  Martin no está asignado a ningún equipo`);
        }

        console.log('\n---\n');
        console.log('✅ Debug completado\n');

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

debugMartin();
