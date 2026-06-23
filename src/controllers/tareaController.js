const Tarea = require('../models/tareaModel');
const Equipo = require('../models/equipoModel');
const { ESTADOS_TAREA, ESTADOS_TAREA_VALIDOS } = require('../config/taskStates');
const { normalizeRole } = require('../middlewares/roleMiddleware');

const PRIORIDADES_VALIDAS = ['Baja', 'Media', 'Alta', 'Urgente'];

function cleanTaskInput(body) {
    return {
        titulo: (body.titulo || '').trim(),
        descripcion: (body.descripcion || '').trim(),
        estado: body.estado || 'Por realizar',
        prioridad: body.prioridad || 'Media',
        equipo_id: body.equipo_id || 1,
        fecha_inicio: body.fecha_inicio || null,
        fecha_limite: body.fecha_limite || null,
    };
}

function validateTaskInput(data, { requireEstado = false } = {}) {
    if (!data.titulo) return 'El título de la tarea no puede estar vacío.';
    if (!data.descripcion) return 'La descripción de la tarea no puede estar vacía.';
    if (data.titulo.length > 200) return 'El título no puede superar los 200 caracteres.';
    if (data.descripcion.length > 1000) return 'La descripción no puede superar los 1000 caracteres.';
    if (requireEstado && !ESTADOS_TAREA_VALIDOS.includes(data.estado)) return 'El estado seleccionado no es válido.';
    if (!PRIORIDADES_VALIDAS.includes(data.prioridad)) return 'La prioridad seleccionada no es válida.';
    if (data.fecha_inicio && data.fecha_limite && data.fecha_limite < data.fecha_inicio) {
        return 'La fecha límite no puede ser anterior a la fecha de inicio.';
    }
    return null;
}

async function tareasVisibles(user) {
    const role = normalizeRole(user.rol);
    if (role === 'Administrador') return Tarea.findAll();
    if (role === 'Líder') return Tarea.findByLeader(user.id);
    return Tarea.findByUser(user.id);
}

async function equiposDisponibles(user) {
    const role = normalizeRole(user.rol);
    if (role === 'Administrador') return Equipo.findAll();
    return Equipo.findByUser(user.id);
}

exports.getTareas = async (req, res) => {
    try {
        const tareas = await tareasVisibles(req.user);
        res.render('tareas/board', { tareas, user: req.user, estadosTarea: ESTADOS_TAREA });
    } catch (err) {
        console.error(err);
        res.render('tareas/board', { tareas: [], user: req.user, estadosTarea: ESTADOS_TAREA });
    }
};

exports.getCreate = async (req, res) => {
    const alert = req.query.error ? { type: 'danger', message: req.query.error } : null;
    try {
        const equipos = await equiposDisponibles(req.user);
        res.render('tareas/create', { equipos, user: req.user, alert, form: {} });
    } catch (err) {
        res.render('tareas/create', { equipos: [], user: req.user, alert, form: {} });
    }
};

exports.postCreate = async (req, res) => {
    try {
        const data = cleanTaskInput(req.body);
        const validationError = validateTaskInput(data);
        const equipos = await equiposDisponibles(req.user).catch(() => []);
        const equipoPermitido = equipos.some(equipo => String(equipo.id) === String(data.equipo_id));

        if (validationError || !equipoPermitido) {
            return res.status(400).render('tareas/create', {
                equipos,
                user: req.user,
                alert: { type: 'danger', message: validationError || 'No tienes permiso para crear tareas en ese equipo.' },
                form: data,
            });
        }

        await Tarea.create({
            usuario_id: req.user.id,
            equipo_id: data.equipo_id,
            titulo: data.titulo,
            descripcion: data.descripcion,
            estado: data.estado,
            prioridad: data.prioridad,
            fecha_inicio: data.fecha_inicio,
            fecha_limite: data.fecha_limite,
        });
        res.redirect('/tareas');
    } catch (err) {
        console.error(err);
        res.redirect('/tareas/create');
    }
};

exports.getEdit = async (req, res) => {
    try {
        const tarea = await Tarea.findById(req.params.id);
        if (!tarea) return res.redirect('/tareas');
        if (!(await Tarea.canAccess(req.params.id, req.user))) {
            req.session.notification = {
                type: 'danger',
                message: 'No tienes permiso para editar esta tarea.'
            };
            return res.redirect('/tareas');
        }
        res.render('tareas/edit', { tarea, user: req.user, alert: null });
    } catch (err) {
        console.error(err);
        res.redirect('/tareas');
    }
};

exports.postEdit = async (req, res) => {
    try {
        if (!(await Tarea.canAccess(req.params.id, req.user))) {
            req.session.notification = {
                type: 'danger',
                message: 'No tienes permiso para editar esta tarea.'
            };
            return res.redirect('/tareas');
        }

        const data = cleanTaskInput(req.body);
        const validationError = validateTaskInput(data, { requireEstado: true });
        if (validationError) {
            return res.status(400).render('tareas/edit', { tarea: { id: req.params.id, ...data }, user: req.user, alert: { type: 'danger', message: validationError } });
        }

        await Tarea.update(req.params.id, data);
        res.redirect('/tareas');
    } catch (err) {
        console.error(err);
        res.redirect(`/tareas/edit/${req.params.id}`);
    }
};

exports.delete = async (req, res) => {
    try {
        if (!(await Tarea.canAccess(req.params.id, req.user))) {
            req.session.notification = {
                type: 'danger',
                message: 'No tienes permiso para eliminar esta tarea.'
            };
            return res.redirect('/tareas');
        }
        await Tarea.delete(req.params.id);
        res.redirect('/tareas');
    } catch (err) {
        console.error(err);
        res.redirect('/tareas');
    }
};

exports.updatePosition = async (req, res) => {
    try {
        const { id, posicion, estado } = req.body;
        if (!Number.isInteger(Number(id)) || !Number.isInteger(Number(posicion)) || !ESTADOS_TAREA_VALIDOS.includes(estado)) {
            return res.status(400).json({ success: false, message: 'Datos inválidos para mover la tarea.' });
        }
        // Usar canView en lugar de canAccess para permitir que miembros del equipo cambien estado
        if (!(await Tarea.canView(id, req.user))) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para mover esta tarea.' });
        }
        await Tarea.updatePosition(id, posicion, estado, req.user.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al mover la tarea.' });
    }
};

exports.updateEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!ESTADOS_TAREA_VALIDOS.includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido.' });
        }

        if (!(await Tarea.canView(id, req.user))) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para actualizar esta tarea.' });
        }

        await Tarea.updateEstado(id, estado, req.user.id);
        res.json({ success: true, message: 'Estado actualizado correctamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al actualizar el estado.' });
    }
};

exports.getUltimoCambio = async (req, res) => {
    try {
        const tareaId = req.params.id;
        const role = normalizeRole(req.user.rol);

        // Solo líderes y administradores pueden ver quién cambió el estado
        if (role !== 'Líder' && role !== 'Administrador') {
            return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta información.' });
        }

        if (!(await Tarea.canAccess(tareaId, req.user))) {
            return res.status(403).json({ success: false, message: 'No tienes acceso a esta tarea.' });
        }

        const cambio = await Tarea.getUltimoCambio(tareaId);
        if (cambio) {
            res.json({ success: true, cambio });
        } else {
            res.json({ success: true, cambio: null });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener la información.' });
    }
};

exports.getComentariosPage = async (req, res) => {
    try {
        const tareaId = req.params.id;

        // Verificar acceso
        if (!(await Tarea.canView(tareaId, req.user))) {
            req.session.notification = {
                type: 'danger',
                message: 'No tienes acceso a esta tarea.'
            };
            return res.redirect('/tareas');
        }

        // Obtener tarea
        const tarea = await Tarea.findById(tareaId);
        if (!tarea) {
            return res.redirect('/tareas');
        }

        res.render('tareas/comentarios', { tarea, user: req.user });
    } catch (err) {
        console.error(err);
        res.redirect('/tareas');
    }
};
