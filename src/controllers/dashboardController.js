const Tarea = require('../models/tareaModel');
const { ESTADOS_TAREA } = require('../config/taskStates');
const { normalizeRole } = require('../middlewares/roleMiddleware');

async function tareasVisibles(user) {
    const role = normalizeRole(user.rol);
    if (role === 'Administrador') return Tarea.findAll();
    if (role === 'Líder') return Tarea.findByLeader(user.id);
    return Tarea.findByUser(user.id);
}

exports.index = async (req, res) => {
    try {
        const tareas = await tareasVisibles(req.user);
        res.render('dashboard', { tareas, user: req.user, estadosTarea: ESTADOS_TAREA });
    } catch (err) {
        console.error('Error cargando tareas:', err);
        const tareasEjemplo = [
            { id: 1, titulo: 'Tarea de ejemplo 1', descripcion: 'Descripción 1', estado: 'Por realizar', prioridad: 'Media' },
            { id: 2, titulo: 'Tarea de ejemplo 2', descripcion: 'Descripción 2', estado: 'En proceso', prioridad: 'Alta' },
            { id: 3, titulo: 'Tarea de ejemplo 3', descripcion: 'Descripción 3', estado: 'Realizado', prioridad: 'Baja' }
        ];
        res.render('dashboard', { tareas: tareasEjemplo, user: req.user, estadosTarea: ESTADOS_TAREA });
    }
};
