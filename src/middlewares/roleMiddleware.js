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
        res.status(403).send('Acceso denegado');
    };
}

function requireAnyRole(...roles) {
    return (req, res, next) => {
        if (hasRole(req.user, roles)) {
            return next();
        }
        res.status(403).send('Acceso denegado');
    };
}

module.exports = { requireRole, requireAnyRole, hasRole, normalizeRole };
