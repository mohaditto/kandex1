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
        res.status(500).send('Error al obtener usuarios');
    }
};

exports.editUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.redirect('/admin/usuarios?error=Usuario no encontrado');
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
        res.status(500).send('Error al cargar usuario');
    }
};

exports.updateUsuario = async (req, res) => {
    const id = req.params.id;
    const nombre_usuario = (req.body.nombre_usuario || '').trim();
    const email = (req.body.email || '').trim();
    const rol = normalizeRole(req.body.rol);

    if (!nombre_usuario || !email || !ROLES_VALIDOS.includes(rol)) {
        return res.redirect(`/admin/usuarios/${id}/edit?error=Datos inválidos para actualizar el usuario`);
    }

    try {
        await Usuario.update(id, { nombre_usuario, email, rol });

        if (String(req.user.id) === String(id)) {
            req.user.nombre_usuario = nombre_usuario;
            req.user.email = email;
            req.user.rol = rol;
        }

        res.redirect(`/admin/usuarios/${id}/edit?ok=Usuario actualizado correctamente`);
    } catch (err) {
        console.error(err);
        res.redirect(`/admin/usuarios/${id}/edit?error=No se pudo actualizar el usuario`);
    }
};

exports.addEquipo = async (req, res) => {
    const usuarioId = req.params.id;
    const equipoId = req.body.equipo_id;

    if (!equipoId) return res.redirect(`/admin/usuarios/${usuarioId}/edit?error=Selecciona un equipo`);

    try {
        await Equipo.addUser(equipoId, usuarioId);
        res.redirect(`/admin/usuarios/${usuarioId}/edit?ok=Usuario agregado al equipo`);
    } catch (err) {
        console.error(err);
        res.redirect(`/admin/usuarios/${usuarioId}/edit?error=No se pudo agregar el usuario al equipo`);
    }
};

exports.removeEquipo = async (req, res) => {
    const usuarioId = req.params.id;
    const equipoId = req.params.equipoId;

    try {
        await Equipo.removeUser(equipoId, usuarioId);
        res.redirect(`/admin/usuarios/${usuarioId}/edit?ok=Usuario quitado del equipo`);
    } catch (err) {
        console.error(err);
        res.redirect(`/admin/usuarios/${usuarioId}/edit?error=No se pudo quitar el usuario del equipo`);
    }
};

exports.tareas = async (req, res) => {
    try {
        const tareas = await Tarea.findAll();
        res.render('admin/tareas', { tareas, alert: buildAlert(req.query) });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener tareas');
    }
};
