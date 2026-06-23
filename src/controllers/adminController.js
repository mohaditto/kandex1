const Usuario = require('../models/usuarioModel');
const Equipo = require('../models/equipoModel');
const Tarea = require('../models/tareaModel');
const { normalizeRole } = require('../middlewares/roleMiddleware');

const ROLES_VALIDOS = ['Administrador', 'Líder', 'Miembro'];

function buildAlert(query) {
    if (query.error) return { type: 'danger', message: query.error };
    if (query.ok) return { type: 'success', message: query.ok };
    return null;
}

exports.usuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.render('admin/usuarios', { usuarios, alert: buildAlert(req.query) });
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'Error al obtener usuarios. Por favor intenta de nuevo.' };
        res.redirect('/tareas');
    }
};

exports.editUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            req.session.notification = { type: 'danger', message: 'Usuario no encontrado.' };
            return res.redirect('/admin/usuarios');
        }
        usuario.rol = normalizeRole(usuario.rol);

        const equipos = await Equipo.findAll();
        const equiposUsuario = await Equipo.getTeamsByUser(req.params.id);
        const equiposUsuarioIds = new Set(equiposUsuario.map(equipo => equipo.id));

        res.render('admin/usuario-edit', {
            usuario,
            equipos,
            equiposUsuario,
            equiposUsuarioIds,
            roles: ROLES_VALIDOS,
            alert: buildAlert(req.query),
        });
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'Error al cargar el usuario. Por favor intenta de nuevo.' };
        res.redirect('/admin/usuarios');
    }
};

exports.updateUsuario = async (req, res) => {
    const id = req.params.id;
    const nombre_usuario = (req.body.nombre_usuario || '').trim();
    const email = (req.body.email || '').trim();
    const rol = normalizeRole(req.body.rol);

    if (!nombre_usuario || !email || !ROLES_VALIDOS.includes(rol)) {
        req.session.notification = { type: 'danger', message: 'Datos inválidos para actualizar el usuario.' };
        return res.redirect(`/admin/usuarios/${id}/edit`);
    }

    try {
        await Usuario.update(id, { nombre_usuario, email, rol });

        if (String(req.user.id) === String(id)) {
            req.user.nombre_usuario = nombre_usuario;
            req.user.email = email;
            req.user.rol = rol;
        }

        req.session.notification = { type: 'success', message: 'Usuario actualizado correctamente.' };
        res.redirect(`/admin/usuarios/${id}/edit`);
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'No se pudo actualizar el usuario.' };
        res.redirect(`/admin/usuarios/${id}/edit`);
    }
};

exports.addEquipo = async (req, res) => {
    const usuarioId = req.params.id;
    const equipoId = req.body.equipo_id;

    if (!equipoId) {
        req.session.notification = { type: 'danger', message: 'Por favor selecciona un equipo.' };
        return res.redirect(`/admin/usuarios/${usuarioId}/edit`);
    }

    try {
        await Equipo.addUser(equipoId, usuarioId);
        req.session.notification = { type: 'success', message: 'Usuario agregado al equipo correctamente.' };
        res.redirect(`/admin/usuarios/${usuarioId}/edit`);
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'No se pudo agregar el usuario al equipo.' };
        res.redirect(`/admin/usuarios/${usuarioId}/edit`);
    }
};

exports.removeEquipo = async (req, res) => {
    const usuarioId = req.params.id;
    const equipoId = req.params.equipoId;

    try {
        await Equipo.removeUser(equipoId, usuarioId);
        req.session.notification = { type: 'success', message: 'Usuario quitado del equipo correctamente.' };
        res.redirect(`/admin/usuarios/${usuarioId}/edit`);
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'No se pudo quitar el usuario del equipo.' };
        res.redirect(`/admin/usuarios/${usuarioId}/edit`);
    }
};

exports.tareas = async (req, res) => {
    try {
        const tareas = await Tarea.findAll();
        res.render('admin/tareas', { tareas, alert: buildAlert(req.query) });
    } catch (err) {
        console.error(err);
        req.session.notification = { type: 'danger', message: 'Error al obtener tareas del administrador. Por favor intenta de nuevo.' };
        res.redirect('/tareas');
    }
};
