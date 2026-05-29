function ensureAuthenticated(req, res, next) {
    // Permite acceso a usuarios logueados y tambien al modo demo controlado por sesion.
    if (req.isAuthenticated() || (req.session && req.session.demoMode && req.user)) {
        return next();
    }
    res.redirect('/auth/login');
}

module.exports = { ensureAuthenticated };
