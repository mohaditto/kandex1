const express = require('express');
const adminController = require('../controllers/adminController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(ensureAuthenticated);
router.use(requireRole('Administrador'));

router.get('/', (req, res) => res.redirect('/admin/usuarios'));
router.get('/usuarios', adminController.usuarios);
router.get('/usuarios/:id/edit', adminController.editUsuario);
router.post('/usuarios/:id/edit', adminController.updateUsuario);
router.post('/usuarios/:id/equipos', adminController.addEquipo);
router.post('/usuarios/:id/equipos/:equipoId/delete', adminController.removeEquipo);
router.get('/tareas', adminController.tareas);

module.exports = router;
