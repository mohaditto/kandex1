const express = require('express');
const reporteController = require('../controllers/reporteController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { requireAnyRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', ensureAuthenticated, requireAnyRole('Administrador', 'Líder'), reporteController.index);
router.get('/filtrar', ensureAuthenticated, requireAnyRole('Administrador', 'Líder'), reporteController.filtrarPorFecha);

module.exports = router;
