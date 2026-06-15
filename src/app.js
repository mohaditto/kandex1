require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const { ESTADOS_TAREA } = require('./config/taskStates');
const path = require('path');
const ejs = require('ejs');

const app = express();
const VIEWS = path.join(__dirname, 'views');

app.set('view engine', 'ejs');
app.set('views', VIEWS);

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.estadosTarea = ESTADOS_TAREA;
    next();
});

app.use((req, res, next) => {
    res.render = function (view, locals, cb) {
        if (typeof locals === 'function') { cb = locals; locals = {}; }
        const opts = Object.assign({}, res.locals, locals || {});
        const layoutName = ('layout' in opts) ? opts.layout : 'layouts/main';
        const viewPath = path.join(VIEWS, view + '.ejs');

        ejs.renderFile(viewPath, opts, (err, body) => {
            if (err) return next(err);
            if (!layoutName) return cb ? cb(null, body) : res.send(body);

            const layoutPath = path.join(VIEWS, layoutName + '.ejs');
            ejs.renderFile(layoutPath, Object.assign({}, opts, { body }), (err, html) => {
                if (err) return next(err);
                return cb ? cb(null, html) : res.send(html);
            });
        });
    };
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'kandex_secret',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.estadosTarea = ESTADOS_TAREA;
    next();
});

const authRoutes      = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tareaRoutes     = require('./routes/tareaRoutes');
const equipoRoutes    = require('./routes/equipoRoutes');
const reporteRoutes   = require('./routes/reporteRoutes');
const adminRoutes     = require('./routes/adminRoutes');

app.use('/auth',      authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/tareas',    tareaRoutes);
app.use('/equipos',   equipoRoutes);
app.use('/reportes',  reporteRoutes);
app.use('/admin',     adminRoutes);

app.get('/', (req, res) => {
    res.redirect(req.isAuthenticated() ? '/tareas' : '/auth/login');
});

app.use((req, res) => {
    res.status(404).send(`
        <body style="font-family:monospace;padding:40px;background:#faf8f4;color:#1a1a1a">
        <h2 style="color:#b07f2b">404 - Página no encontrada</h2>
        <p>${req.method} ${req.path}</p>
        <a href="/" style="color:#3a6e9c">Volver al inicio</a>
        </body>`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <body style="font-family:monospace;padding:40px;background:#faf8f4;color:#1a1a1a">
        <h2 style="color:#c25e58">500 - Error del servidor</h2>
        <pre style="background:#f5d9d6;padding:16px;border-radius:8px;font-size:13px;overflow:auto">${err.message}\n\n${err.stack}</pre>
        <a href="/" style="color:#3a6e9c">Volver al inicio</a>
        </body>`);
});

module.exports = app;
