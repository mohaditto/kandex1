const mysql = require('mysql2');

// Pool reutilizable: evita abrir una conexion nueva por cada consulta.
const pool = mysql.createPool({
    host:             process.env.DB_HOST,
    port:             parseInt(process.env.DB_PORT) || 3306,
    user:             process.env.DB_USER,
    password:         process.env.DB_PASSWORD,
    database:         process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit:  10,
    connectTimeout:   10000,
});

// Prueba temprana de conexion para mostrar en consola si MySQL esta disponible.
pool.getConnection((err, conn) => {
    if (err) { console.error('MySQL connection error:', err.message); return; }
    console.log('Connected to MySQL');
    conn.release();
});

module.exports = pool;
