const express = require('express');
const equipoController = require('../controllers/equipoController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// CRUD basico de equipos protegido por autenticacion.
router.get('/', ensureAuthenticated, equipoController.index);
router.get('/create', ensureAuthenticated, equipoController.getCreate);
router.post('/create', ensureAuthenticated, equipoController.postCreate);
router.get('/:id', ensureAuthenticated, equipoController.detail);
router.get('/delete/:id', ensureAuthenticated, equipoController.delete);

module.exports = router;
