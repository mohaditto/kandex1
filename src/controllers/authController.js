const Usuario = require('../models/usuarioModel');
const passport = require('../config/passport');

exports.getLogin = (req, res) => {
    // Usa el layout de auth para mostrar una pantalla limpia sin navbar principal.
    res.render('auth/login', { layout: 'layouts/auth', alert: null, form: {} });
};

exports.postLogin = (req, res, next) => {
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';

    if (!email || !password) {
        return res.status(400).render('auth/login', {
            layout: 'layouts/auth',
            alert: { type: 'danger', message: 'Debes ingresar email y contraseña.' },
            form: { email },
        });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).render('auth/login', {
                layout: 'layouts/auth',
                alert: { type: 'danger', message: info?.message || 'Credenciales inválidas.' },
                form: { email },
            });
        }
        req.logIn(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            return res.redirect('/tareas');
        });
    })(req, res, next);
};

exports.getRegister = (req, res) => {
    res.render('auth/register', { layout: 'layouts/auth', alert: null, form: {} });
};

exports.postRegister = async (req, res) => {
    try {
        const nombre_usuario = (req.body.nombre_usuario || '').trim();
        const email = (req.body.email || '').trim();
        const password = req.body.password || '';

        if (!nombre_usuario || !email || !password) {
            return res.status(400).render('auth/register', {
                layout: 'layouts/auth',
                alert: { type: 'danger', message: 'Todos los campos son obligatorios.' },
                form: { nombre_usuario, email },
            });
        }
        if (password.length < 8) {
            return res.status(400).render('auth/register', {
                layout: 'layouts/auth',
                alert: { type: 'danger', message: 'La contraseña debe tener al menos 8 caracteres.' },
                form: { nombre_usuario, email },
            });
        }

        // El modelo se encarga de hashear el password antes de guardar.
        await Usuario.create({ nombre_usuario, email, password, rol: 'Miembro' });
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(400).render('auth/register', {
            layout: 'layouts/auth',
            alert: { type: 'danger', message: 'No se pudo registrar el usuario. Revisa que el email o nombre no estén repetidos.' },
            form: { nombre_usuario: req.body.nombre_usuario || '', email: req.body.email || '' },
        });
    }
};

exports.logout = (req, res) => {
    req.logout(() => res.redirect('/auth/login'));
};
