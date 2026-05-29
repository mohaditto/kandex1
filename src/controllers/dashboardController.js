const Tarea = require('../models/tareaModel');
const { ESTADOS_TAREA } = require('../config/taskStates');

exports.index = async (req, res) => {
    try {
        const tareas = await Tarea.findByUser(req.user.id);
        res.render('dashboard', { tareas, user: req.user, estadosTarea: ESTADOS_TAREA });
    } catch (err) {
        console.error('Error cargando tareas:', err);
        // Tareas de ejemplo si no hay DB
        const tareasEjemplo = [
            { id: 1, titulo: 'Tarea de ejemplo 1', descripcion: 'Descripción 1', estado: 'Por realizar', prioridad: 'Media' },
            { id: 2, titulo: 'Tarea de ejemplo 2', descripcion: 'Descripción 2', estado: 'En proceso', prioridad: 'Alta' },
            { id: 3, titulo: 'Tarea de ejemplo 3', descripcion: 'Descripción 3', estado: 'Realizado', prioridad: 'Baja' }
        ];
        res.render('dashboard', { tareas: tareasEjemplo, user: req.user, estadosTarea: ESTADOS_TAREA });
    }
};
