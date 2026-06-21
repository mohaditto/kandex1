function normalizeRole(role) {
    if (role === 'admin') return 'Administrador';
    if (role === 'usuario') return 'Miembro';
    if (role === 'Lider') return 'Líder';
    if (role === 'LÃ­der') return 'Líder';
    if (typeof role === 'string' && role.startsWith('L') && role.includes('der')) return 'Líder';
    return role;
}

function hasRole(user, roles) {
    return Boolean(user && roles.includes(normalizeRole(user.rol)));
}

function requireRole(role) {
    return (req, res, next) => {
        if (hasRole(req.user, [role])) {
            return next();
        }
        req.session.notification = {
            type: 'danger',
            message: 'Acceso denegado: No tienes permiso para acceder a esta sección.'
        };
        res.redirect('/tareas');
    };
}

function requireAnyRole(...roles) {
    return (req, res, next) => {
        if (hasRole(req.user, roles)) {
            return next();
        }
        req.session.notification = {
            type: 'danger',
            message: 'Acceso denegado: No tienes permiso para acceder a esta sección.'
        };
        res.redirect('/tareas');
    };
}

module.exports = { requireRole, requireAnyRole, hasRole, normalizeRole };
