require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

        console.log(`Found ${files.length} migration files\n`);

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`Running migration: ${file}`);
            const statements = sql.split(';').filter(stmt => stmt.trim());

            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        await connection.query(statement);
                        console.log(`  ✓ Executed: ${statement.substring(0, 60)}...`);
                    } catch (err) {
                        // Ignorar errores si ya existe la columna
                        if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('Duplicate')) {
                            console.log(`  ℹ Already exists: ${statement.substring(0, 60)}...`);
                        } else {
                            throw err;
                        }
                    }
                }
            }
            console.log(`✓ Migration completed: ${file}\n`);
        }

        console.log('All migrations completed successfully!');
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runMigrations();
