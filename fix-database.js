/**
 * Script de migración para corregir los roles en la base de datos
 * Ejecuta: node fix-database.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDatabase() {
    let connection;
    try {
        // Conectar a la BD
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('✓ Conectado a la base de datos');

        // 1. Convertir 'admin' a 'Administrador'
        console.log('Actualizando roles "admin" a "Administrador"...');
        let [result] = await connection.execute(
            `UPDATE usuarios SET rol = 'Administrador' WHERE LOWER(rol) IN ('admin', 'administrador')`
        );
        console.log(`✓ ${result.affectedRows} usuarios actualizados`);

        // 2. Convertir 'usuario' a 'Miembro'
        console.log('Actualizando roles "usuario" a "Miembro"...');
        [result] = await connection.execute(
            `UPDATE usuarios SET rol = 'Miembro' WHERE LOWER(rol) IN ('usuario', 'miembro')`
        );
        console.log(`✓ ${result.affectedRows} usuarios actualizados`);

        // 3. Convertir 'Lider' a 'Líder'
        console.log('Actualizando roles "Lider" a "Líder"...');
        [result] = await connection.execute(
            `UPDATE usuarios SET rol = 'Líder' WHERE rol IN ('Lider', 'LÃ­der')`
        );
        console.log(`✓ ${result.affectedRows} usuarios actualizados`);

        // 4. Modificar la definición del ENUM
        console.log('Actualizando definición del ENUM en la tabla...');
        await connection.execute(
            `ALTER TABLE usuarios MODIFY COLUMN rol ENUM('Administrador', 'Líder', 'Miembro') NOT NULL DEFAULT 'Miembro'`
        );
        console.log('✓ Tipo de dato actualizado');

        // 5. Verificación
        console.log('\n📊 Estado actual de los usuarios:');
        const [usuarios] = await connection.execute('SELECT id, nombre_usuario, email, rol FROM usuarios ORDER BY rol');
        
        const rolesCount = {};
        usuarios.forEach(user => {
            rolesCount[user.rol] = (rolesCount[user.rol] || 0) + 1;
            console.log(`  - ${user.nombre_usuario.padEnd(20)} (${user.rol})`);
        });

        console.log('\n📈 Resumen:');
        Object.entries(rolesCount).forEach(([rol, count]) => {
            console.log(`  ${rol}: ${count} usuario(s)`);
        });

        console.log('\n✅ Migración completada exitosamente!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error durante la migración:', err.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Ejecutar migración
console.log('🔄 Iniciando migración de roles...\n');
migrateDatabase();
