/**
 * Script para arreglar el ENUM de estados en la BD
 * Ejecuta: node fix-states-enum.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixStatesEnum() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('🔧 ARREGLAR ENUM DE ESTADOS\n');

        // 1. Primero migrar datos legacy
        console.log('1️⃣  Migrando valores legacy...\n');

        // "En progreso" -> "En proceso"
        let [result] = await connection.execute(
            `UPDATE tareas SET estado = 'En proceso' WHERE estado = 'En progreso'`
        );
        console.log(`   ✓ Migradas ${result.changedRows} tareas de "En progreso" -> "En proceso"`);

        // "En revisión" -> "En proceso"
        [result] = await connection.execute(
            `UPDATE tareas SET estado = 'En proceso' WHERE estado = 'En revisión'`
        );
        console.log(`   ✓ Migradas ${result.changedRows} tareas de "En revisión" -> "En proceso"`);

        // Tareas con estado vacío -> "Por realizar"
        [result] = await connection.execute(
            `UPDATE tareas SET estado = 'Por realizar' WHERE estado = '' OR estado IS NULL`
        );
        console.log(`   ✓ Corregidas ${result.changedRows} tareas con estado vacío\n`);

        // 2. Alterar la definición del ENUM
        console.log('2️⃣  Alterando definición del ENUM...\n');
        await connection.execute(
            `ALTER TABLE tareas MODIFY COLUMN estado ENUM('Por realizar', 'En proceso', 'Realizado') NOT NULL DEFAULT 'Por realizar'`
        );
        console.log(`   ✓ Columna "estado" actualizada a nuevo ENUM\n`);

        // 3. Verificar
        console.log('3️⃣  Verificando...\n');
        const [schema] = await connection.execute(
            `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tareas' AND COLUMN_NAME = 'estado'`
        );
        console.log(`   Definición: ${schema[0].COLUMN_TYPE}`);

        const [distinct] = await connection.execute(
            'SELECT DISTINCT estado FROM tareas ORDER BY estado'
        );
        console.log(`\n   Valores en BD:`);
        distinct.forEach(row => {
            console.log(`     - "${row.estado}"`);
        });

        console.log('\n✅ ENUM de estados arreglado!\n');

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

fixStatesEnum();
