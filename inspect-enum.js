/**
 * Script para inspeccionar el ENUM de estados
 * Ejecuta: node inspect-enum.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspectEnum() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('🔍 INSPECCIONAR ENUM DE ESTADOS\n');

        // Ver la definición de la tabla
        const [schema] = await connection.execute(
            `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tareas' AND COLUMN_NAME = 'estado'`
        );

        console.log('📋 Definición actual del ENUM:\n');
        console.log(`  ${schema[0].COLUMN_TYPE}\n`);

        // Ver valores en la base de datos
        const [distinct] = await connection.execute(
            'SELECT DISTINCT estado FROM tareas ORDER BY estado'
        );

        console.log('🗄️  Valores actuales en la BD:\n');
        distinct.forEach(row => {
            console.log(`  - "${row.estado}"`);
        });

        console.log('');

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

inspectEnum();
