const Tarea = require('../models/tareaModel');
const { normalizeRole } = require('../middlewares/roleMiddleware');

async function tareasParaReporte(user) {
    const role = normalizeRole(user.rol);
    return role === 'Administrador' ? Tarea.findAll() : Tarea.findByLeader(user.id);
}

exports.index = async (req, res) => {
    try {
        const tareas = await tareasParaReporte(req.user);
        const completadas = tareas.filter(t => t.estado === 'Realizado');
        
        // Calcular tiempos
        let tiempoPromedio = 0;
        if (completadas.length > 0) {
            let sumaHoras = 0;
            completadas.forEach(tarea => {
                const inicio = new Date(tarea.fecha_creacion);
                const fin = new Date(tarea.fecha_finalizacion);
                const horas = (fin - inicio) / (1000 * 60 * 60);
                sumaHoras += horas;
            });
            tiempoPromedio = (sumaHoras / completadas.length).toFixed(2);
        }

        res.render('reportes/index', {
            tareas,
            completadas,
            tiempoPromedio,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al generar reportes');
    }
};

exports.filtrarPorFecha = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        const tareas = await tareasParaReporte(req.user);
        
        const filtradas = tareas.filter(t => {
            if (t.estado === 'Realizado') {
                const fecha = new Date(t.fecha_finalizacion);
                return fecha >= new Date(fecha_inicio) && fecha <= new Date(fecha_fin);
            }
            return false;
        });

        res.json({ tareas: filtradas, total: filtradas.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al filtrar' });
    }
};
