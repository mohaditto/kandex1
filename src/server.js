require('dotenv').config();

try {
    // Carga la aplicacion Express ya configurada en app.js.
    const app = require('./app');

    // Si no se define PORT en .env, el proyecto usa 2608 por defecto.
    const PORT = process.env.PORT || 2608;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
}
