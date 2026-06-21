const Usuario = require('../models/usuarioModel');

exports.getPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id);
        res.render('perfil/index', { usuario, alert: null });
    } catch (err) {
        console.error(err);
        req.session.notification = { 
            type: 'danger', 
            message: 'Error al cargar tu perfil. Intenta nuevamente.' 
        };
        res.redirect('/tareas');
    }
};

exports.updatePerfil = async (req, res) => {
    try {
        const nombre_usuario = (req.body.nombre_usuario || '').trim();
        const email = (req.body.email || '').trim();

        if (!nombre_usuario || !email) {
            return res.status(400).render('perfil/index', {
                usuario: req.user,
                alert: { type: 'danger', message: 'El nombre de usuario y email son obligatorios.' }
            });
        }

        if (email.length > 100 || nombre_usuario.length > 100) {
            return res.status(400).render('perfil/index', {
                usuario: req.user,
                alert: { type: 'danger', message: 'Los campos no pueden exceder 100 caracteres.' }
            });
        }

        await Usuario.updateProfile(req.user.id, { nombre_usuario, email });
        
        // Actualizar la sesión del usuario
        req.user.nombre_usuario = nombre_usuario;
        req.user.email = email;

        req.session.notification = {
            type: 'success',
            message: 'Tu perfil ha sido actualizado correctamente.'
        };
        res.redirect('/perfil');
    } catch (err) {
        console.error(err);
        res.status(400).render('perfil/index', {
            usuario: req.user,
            alert: { type: 'danger', message: 'No se pudo actualizar el perfil. El email podría estar duplicado.' }
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const passwordActual = req.body.password_actual || '';
        const passwordNueva = req.body.password_nueva || '';
        const passwordConfirm = req.body.password_confirmar || '';

        if (!passwordActual || !passwordNueva || !passwordConfirm) {
            return res.status(400).render('perfil/index', {
                usuario: req.user,
                alert: { type: 'danger', message: 'Todos los campos de contraseña son obligatorios.' }
            });
        }

        if (passwordNueva.length < 8) {
            return res.status(400).render('perfil/index', {
                usuario: req.user,
                alert: { type: 'danger', message: 'La nueva contraseña debe tener al menos 8 caracteres.' }
            });
        }

        if (passwordNueva !== passwordConfirm) {
            return res.status(400).render('perfil/index', {
                usuario: req.user,
                alert: { type: 'danger', message: 'Las contraseñas nuevas no coinciden.' }
            });
        }

        const isValid = await Usuario.verifyPassword(req.user.id, passwordActual);
        if (!isValid) {
            return res.status(401).render('perfil/index', {
                usuario: req.user,
                alert: { type: 'danger', message: 'La contraseña actual es incorrecta.' }
            });
        }

        await Usuario.changePassword(req.user.id, passwordNueva);

        req.session.notification = {
            type: 'success',
            message: 'Tu contraseña ha sido cambiada correctamente.'
        };
        res.redirect('/perfil');
    } catch (err) {
        console.error(err);
        res.status(500).render('perfil/index', {
            usuario: req.user,
            alert: { type: 'danger', message: 'Error al cambiar la contraseña. Intenta nuevamente.' }
        });
    }
};
