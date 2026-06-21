const express = require('express');
const perfilController = require('../controllers/perfilController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(ensureAuthenticated);

// Ver perfil
router.get('/', perfilController.getPerfil);

// Actualizar perfil (nombre y email)
router.post('/update', perfilController.updatePerfil);

// Cambiar contraseña
router.post('/change-password', perfilController.changePassword);

module.exports = router;
