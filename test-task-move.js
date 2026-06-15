/**
 * Script para probar movimiento de tareas
 * Ejecuta: node test-task-move.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testTaskMove() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('🧪 PRUEBA DE MOVIMIENTO DE TAREAS\n');

        // Obtener una tarea
        const [tareas] = await connection.execute(
            'SELECT id, titulo, estado FROM tareas LIMIT 1'
        );

        if (!tareas.length) {
            console.log('❌ No hay tareas para probar');
            process.exit(0);
        }

        const tarea = tareas[0];
        console.log(`📋 Tarea: ${tarea.titulo}`);
        console.log(`   Estado actual: ${tarea.estado}\n`);

        // Simular movimiento a "En proceso"
        console.log('🔄 Moviendo tarea a "En proceso"...');
        await connection.execute(
            'UPDATE tareas SET estado = ?, posicion = ? WHERE id = ?',
            ['En proceso', 0, tarea.id]
        );

        const [actualizada1] = await connection.execute(
            'SELECT id, titulo, estado FROM tareas WHERE id = ?',
            [tarea.id]
        );

        console.log(`   ✓ Estado guardado: ${actualizada1[0].estado}\n`);

        // Simular movimiento a "Realizado"
        console.log('🔄 Moviendo tarea a "Realizado"...');
        await connection.execute(
            'UPDATE tareas SET estado = ?, posicion = ? WHERE id = ?',
            ['Realizado', 0, tarea.id]
        );

        const [actualizada2] = await connection.execute(
            'SELECT id, titulo, estado FROM tareas WHERE id = ?',
            [tarea.id]
        );

        console.log(`   ✓ Estado guardado: ${actualizada2[0].estado}\n`);

        // Mover de vuelta a "Por realizar"
        console.log('🔄 Moviendo tarea a "Por realizar"...');
        await connection.execute(
            'UPDATE tareas SET estado = ?, posicion = ? WHERE id = ?',
            ['Por realizar', 0, tarea.id]
        );

        const [actualizada3] = await connection.execute(
            'SELECT id, titulo, estado FROM tareas WHERE id = ?',
            [tarea.id]
        );

        console.log(`   ✓ Estado guardado: ${actualizada3[0].estado}\n`);

        console.log('✅ Prueba completada sin errores\n');

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

testTaskMove();
