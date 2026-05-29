const Tarea = require('../models/tareaModel');
const Equipo = require('../models/equipoModel');
const { demoTareas, demoEquipos } = require('../config/demoData');
const { ESTADOS_TAREA } = require('../config/taskStates');

// Centraliza la condicion para que las acciones demo no escriban en MySQL.
const isDemo = (req) => req.session && req.session.demoMode;

exports.getTareas = async (req, res) => {
    // En demo se renderizan datos en memoria; en modo normal se consulta MySQL.
    if (isDemo(req)) return res.render('tareas/board', { tareas: demoTareas, user: req.user, estadosTarea: ESTADOS_TAREA });
    try {
        const tareas = await Tarea.findByUser(req.user.id);
        res.render('tareas/board', { tareas, user: req.user, estadosTarea: ESTADOS_TAREA });
    } catch (err) {
        console.error(err);
        res.render('tareas/board', { tareas: [], user: req.user, estadosTarea: ESTADOS_TAREA });
    }
};

exports.getCreate = async (req, res) => {
    if (isDemo(req)) return res.render('tareas/create', { equipos: demoEquipos, user: req.user });
    try {
        const equipos = await Equipo.findAll();
        res.render('tareas/create', { equipos, user: req.user });
    } catch (err) {
        res.render('tareas/create', { equipos: [], user: req.user });
    }
};

exports.postCreate = async (req, res) => {
    if (isDemo(req)) return res.redirect('/tareas');
    try {
        const { titulo, descripcion, estado, prioridad, equipo_id, fecha_inicio, fecha_limite } = req.body;
        // La tarea queda asociada al usuario logueado y al equipo elegido en el formulario.
        await Tarea.create({
            usuario_id: req.user.id,
            equipo_id: equipo_id || 1,
            titulo, descripcion,
            estado: estado || 'Por realizar',
            prioridad: prioridad || 'Media',
            fecha_inicio: fecha_inicio || null,
            fecha_limite: fecha_limite || null,
        });
        res.redirect('/tareas');
    } catch (err) {
        console.error(err);
        res.redirect('/tareas/create');
    }
};

exports.getEdit = async (req, res) => {
    if (isDemo(req)) {
        const tarea = demoTareas.find(t => t.id === parseInt(req.params.id)) || demoTareas[0];
        return res.render('tareas/edit', { tarea, user: req.user });
    }
    try {
        const tarea = await Tarea.findById(req.params.id);
        if (!tarea) return res.redirect('/tareas');
        res.render('tareas/edit', { tarea, user: req.user });
    } catch (err) {
        console.error(err);
        res.redirect('/tareas');
    }
};

exports.postEdit = async (req, res) => {
    if (isDemo(req)) return res.redirect('/tareas');
    try {
        const { titulo, descripcion, estado, prioridad, fecha_inicio, fecha_limite } = req.body;
        await Tarea.update(req.params.id, { titulo, descripcion, estado, prioridad, fecha_inicio, fecha_limite });
        res.redirect('/tareas');
    } catch (err) {
        console.error(err);
        res.redirect(`/tareas/edit/${req.params.id}`);
    }
};

exports.delete = async (req, res) => {
    if (isDemo(req)) return res.redirect('/tareas');
    try {
        await Tarea.delete(req.params.id);
        res.redirect('/tareas');
    } catch (err) {
        console.error(err);
        res.redirect('/tareas');
    }
};

exports.updatePosition = async (req, res) => {
    if (isDemo(req)) return res.json({ success: true });
    try {
        const { id, posicion, estado } = req.body;
        // Esta accion la usa el tablero Kanban al mover tarjetas entre columnas.
        await Tarea.updatePosition(id, posicion, estado);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};
