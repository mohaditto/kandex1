const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Rutas publicas de autenticacion y cierre de sesion.
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

module.exports = router;
