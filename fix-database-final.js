/**
 * Script para verificar y corregir los roles en la BD
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndFixRoles() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kandex',
        });

        console.log('📊 Verificando estado actual de roles...\n');

        // Ver qué roles hay actualmente
        const [usuarios] = await connection.execute('SELECT id, nombre_usuario, email, rol FROM usuarios');
        
        console.log('Usuarios actuales:');
        usuarios.forEach((user, i) => {
            console.log(`  ${i + 1}. ${user.nombre_usuario.padEnd(20)} - Rol: "${user.rol}" (vacío: ${user.rol === '' || user.rol === null})`);
        });

        // Contar usuarios por rol
        const [rolesCount] = await connection.execute(
            "SELECT rol, COUNT(*) as count FROM usuarios GROUP BY rol"
        );
        
        console.log('\nDistribución de roles:');
        rolesCount.forEach(r => {
            console.log(`  "${r.rol}": ${r.count} usuario(s)`);
        });

        // Restaurar roles basado en nombres de usuario
        console.log('\n🔧 Corrigiendo roles...');
        
        const roleUpdates = [
            { id: 1, rol: 'Administrador', reason: 'admin_user' },
            { id: 2, rol: 'Miembro', reason: 'juan_perez' },
            { id: 3, rol: 'Miembro', reason: 'maria_garcia' },
            { id: 4, rol: 'Miembro', reason: 'carlos_lopez' },
            { id: 5, rol: 'Miembro', reason: 'nestor' },
            { id: 6, rol: 'Miembro', reason: 'Martin' },
        ];

        for (const update of roleUpdates) {
            await connection.execute(
                'UPDATE usuarios SET rol = ? WHERE id = ?',
                [update.rol, update.id]
            );
            console.log(`  ✓ Usuario ${update.id} (${update.reason}) -> ${update.rol}`);
        }

        // Verificación final
        console.log('\n✅ Verificación final:');
        const [usuariosFinales] = await connection.execute(
            'SELECT nombre_usuario, rol FROM usuarios ORDER BY id'
        );
        
        usuariosFinales.forEach(user => {
            console.log(`  - ${user.nombre_usuario.padEnd(20)} (${user.rol})`);
        });

        console.log('\n✅ Base de datos corregida exitosamente!');
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

checkAndFixRoles();
