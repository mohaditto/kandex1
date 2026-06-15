const Equipo = require('../models/equipoModel');
const { normalizeRole } = require('../middlewares/roleMiddleware');

exports.index = async (req, res) => {
    try {
        const role = normalizeRole(req.user.rol);
        const equipos = role === 'Administrador' ? await Equipo.findAll() : await Equipo.findByUser(req.user.id);
        res.render('equipos/index', { equipos, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener equipos');
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
        if (role !== 'Administrador' && !pertenece) return res.status(403).send('Acceso denegado');

        res.render('equipos/detalle', { equipo, usuarios, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener equipo');
    }
};

exports.delete = async (req, res) => {
    try {
        const role = normalizeRole(req.user.rol);
        if (role !== 'Administrador') {
            const usuarios = await Equipo.getUsersByTeam(req.params.id);
            const pertenece = usuarios.some(usuario => usuario.id === req.user.id);
            if (!pertenece) return res.status(403).send('Acceso denegado');
        }
        await Equipo.delete(req.params.id);
        res.redirect('/equipos');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar equipo');
    }
};
