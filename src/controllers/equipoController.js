const Equipo = require('../models/equipoModel');
const Usuario = require('../models/usuarioModel');
const { normalizeRole } = require('../middlewares/roleMiddleware');

exports.index = async (req, res) => {
    try {
        const role = normalizeRole(req.user.rol);
        const equipos = role === 'Administrador' ? await Equipo.findAll() : await Equipo.findByUser(req.user.id);
        res.render('equipos/index', { equipos, user: req.user });
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'Error al obtener equipos. Por favor intenta de nuevo.' };
        res.redirect('/tareas');
    }
};

exports.getCreate = (req, res) => {
    res.render('equipos/create', { user: req.user });
};

exports.postCreate = async (req, res) => {
    try {
        const nombre_equipo = (req.body.nombre_equipo || '').trim();
        const descripcion = (req.body.descripcion || '').trim();
        if (!nombre_equipo) return res.redirect('/equipos/create');

        const equipoId = await Equipo.create({ nombre_equipo, descripcion });
        await Equipo.addUser(equipoId, req.user.id);
        res.redirect('/equipos');
    } catch (err) {
        console.error(err);
        res.redirect('/equipos/create');
    }
};

exports.detail = async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        if (!equipo) return res.redirect('/equipos');

        const usuarios = await Equipo.getUsersByTeam(req.params.id);
        const role = normalizeRole(req.user.rol);
        const pertenece = usuarios.some(usuario => usuario.id === req.user.id);
        
        // Admin ve todos los equipos, líder solo ve su equipo, otros solo ven si pertenecen
        if (role === 'Administrador') {
            // Admin puede ver cualquier equipo
        } else if (role === 'Líder' || (role === 'Miembro' && !pertenece)) {
            // Líder puede ver su equipo, miembro solo si pertenece
            if (!pertenece) {
                req.session.notification = { type: 'danger', message: 'Acceso denegado: No tienes permiso para ver este equipo.' };
                return res.redirect('/equipos');
            }
        }

        // Obtener lista de usuarios disponibles para agregar (todos excepto los ya en el equipo)
        const usuariosEnEquipo = new Set(usuarios.map(u => u.id));
        let usuariosDisponibles = [];
        if (role === 'Administrador' || (role === 'Líder' && pertenece)) {
            const todosLosUsuarios = await Usuario.findAll();
            usuariosDisponibles = todosLosUsuarios.filter(u => !usuariosEnEquipo.has(u.id));
        }

        res.render('equipos/detalle', { equipo, usuarios, usuariosDisponibles, user: req.user });
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'Error al obtener el equipo. Por favor intenta de nuevo.' };
        res.redirect('/equipos');
    }
};

// Agregar usuario al equipo (solo para líder de ese equipo)
exports.addUser = async (req, res) => {
    try {
        const equipoId = req.params.id;
        const usuarioId = req.body.usuario_id;
        const role = normalizeRole(req.user.rol);

        // Verificar si el usuario actual es líder de este equipo
        if (role !== 'Administrador') {
            const usuarios = await Equipo.getUsersByTeam(equipoId);
            const esLider = usuarios.some(usuario => usuario.id === req.user.id && normalizeRole(usuario.rol) === 'Líder');
            if (!esLider) {
                req.session.notification = { type: 'danger', message: 'Acceso denegado: Solo el líder puede agregar usuarios a este equipo.' };
                return res.redirect(`/equipos/${equipoId}`);
            }
        }

        if (!usuarioId) {
            return res.redirect(`/equipos/${equipoId}?error=Debes seleccionar un usuario`);
        }

        await Equipo.addUser(equipoId, usuarioId);
        res.redirect(`/equipos/${equipoId}`);
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'Error al agregar el usuario. Por favor intenta de nuevo.' };
        res.redirect(`/equipos/${equipoId}`);
    }
};

// Eliminar usuario del equipo (solo para líder de ese equipo)
exports.removeUser = async (req, res) => {
    try {
        const equipoId = req.params.id;
        const usuarioId = req.params.usuarioId;
        const role = normalizeRole(req.user.rol);

        // Verificar si el usuario actual es líder de este equipo
        if (role !== 'Administrador') {
            const usuarios = await Equipo.getUsersByTeam(equipoId);
            const esLider = usuarios.some(usuario => usuario.id === req.user.id && normalizeRole(usuario.rol) === 'Líder');
            if (!esLider) {
                req.session.notification = { type: 'danger', message: 'Acceso denegado: Solo el líder puede eliminar usuarios de este equipo.' };
                return res.redirect(`/equipos/${equipoId}`);
            }
        }

        await Equipo.removeUser(equipoId, usuarioId);
        res.redirect(`/equipos/${equipoId}`);
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'Error al eliminar el usuario. Por favor intenta de nuevo.' };
        res.redirect(`/equipos/${equipoId}`);
    }
};

exports.delete = async (req, res) => {
    try {
        const role = normalizeRole(req.user.rol);
        if (role !== 'Administrador') {
            const usuarios = await Equipo.getUsersByTeam(req.params.id);
            const pertenece = usuarios.some(usuario => usuario.id === req.user.id);
            if (!pertenece) {
                req.session.notification = { type: 'danger', message: 'Acceso denegado: No tienes permiso para eliminar este equipo.' };
                return res.redirect('/equipos');
            }
        }
        await Equipo.delete(req.params.id);
        res.redirect('/equipos');
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'Error al eliminar el equipo. Por favor intenta de nuevo.' };
        res.redirect('/equipos');
    }
};
