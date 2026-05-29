const Usuario = require('../models/usuarioModel');
const passport = require('../config/passport');

exports.getLogin = (req, res) => {
    // Usa el layout de auth para mostrar una pantalla limpia sin navbar principal.
    res.render('auth/login', { layout: 'layouts/auth' });
};

// Passport maneja todo el flujo: valida credenciales, crea sesion y redirige.
exports.postLogin = passport.authenticate('local', {
    successRedirect: '/tareas',
    failureRedirect: '/auth/login',
});

exports.getRegister = (req, res) => {
    res.render('auth/register', { layout: 'layouts/auth' });
};

exports.postRegister = async (req, res) => {
    try {
        const { nombre_usuario, email, password } = req.body;
        // El modelo se encarga de hashear el password antes de guardar.
        await Usuario.create({ nombre_usuario, email, password, rol: 'Miembro' });
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.redirect('/auth/register');
    }
};

exports.logout = (req, res) => {
    req.logout(() => res.redirect('/auth/login'));
};
