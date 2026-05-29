const demoUser = {
    id: 0,
    nombre_usuario: 'Demo User',
    email: 'demo@kandex.com',
    rol: 'Administrador',
};

const demoTareas = [
    { id: 1, titulo: 'Diseñar wireframes',  descripcion: 'Prototipos de las pantallas principales.', estado: 'Por realizar', prioridad: 'Alta',    fecha_limite: '2026-05-20' },
    { id: 2, titulo: 'Configurar CI/CD',    descripcion: 'Pipeline con GitHub Actions.',             estado: 'Por realizar', prioridad: 'Media',   fecha_limite: null },
    { id: 3, titulo: 'API de autenticación', descripcion: 'Login con sesiones seguras.',              estado: 'En proceso',   prioridad: 'Urgente', fecha_limite: '2026-05-12' },
    { id: 4, titulo: 'Módulo de reportes',  descripcion: 'Gráficas de progreso por equipo.',         estado: 'En proceso',   prioridad: 'Media',   fecha_limite: '2026-05-18' },
    { id: 5, titulo: 'Setup del proyecto',  descripcion: 'Express, EJS y estructura MVC inicial.',   estado: 'Realizado',    prioridad: 'Baja',    fecha_limite: '2026-04-30' },
    { id: 6, titulo: 'Schema MySQL',        descripcion: 'Diseño del esquema y migraciones.',        estado: 'Realizado',    prioridad: 'Alta',    fecha_limite: '2026-04-28' },
];

const demoEquipos = [
    { id: 1, nombre_equipo: 'Equipo Frontend', descripcion: 'Desarrollo de la interfaz de usuario' },
    { id: 2, nombre_equipo: 'Equipo Backend',  descripcion: 'APIs y lógica del servidor' },
];

module.exports = { demoUser, demoTareas, demoEquipos };
