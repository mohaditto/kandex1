const express = require('express');
const equipoController = require('../controllers/equipoController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { requireAnyRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', ensureAuthenticated, equipoController.index);
router.get('/create', ensureAuthenticated, requireAnyRole('Administrador', 'Líder'), equipoController.getCreate);
router.post('/create', ensureAuthenticated, requireAnyRole('Administrador', 'Líder'), equipoController.postCreate);
router.get('/delete/:id', ensureAuthenticated, requireAnyRole('Administrador', 'Líder'), equipoController.delete);
router.get('/:id', ensureAuthenticated, equipoController.detail);

module.exports = router;
