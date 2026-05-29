const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./db');

// Estrategia local: el formulario envia email/password y Passport decide si son validos.
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return done(null, false, { message: 'Usuario no encontrado' });
        }
        const user = rows[0];
        // Los passwords se comparan contra el hash guardado; nunca se guarda texto plano.
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return done(null, false, { message: 'Contraseña incorrecta' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Guarda solo el id en la sesion para mantener la cookie liviana.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Reconstruye req.user en cada request autenticado usando el id guardado.
passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE id = ?', [id]);
        done(null, rows[0]);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
