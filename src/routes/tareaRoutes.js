const express = require('express');
const tareaController = require('../controllers/tareaController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { requireAnyRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas de tareas requieren autenticación
router.get('/', ensureAuthenticated, tareaController.getTareas);

// Cualquier usuario autenticado puede crear tareas
router.get('/create', ensureAuthenticated, tareaController.getCreate);
router.post('/create', ensureAuthenticated, tareaController.postCreate);

// Editar, eliminar y actualizar posición requieren autenticación
router.get('/edit/:id', ensureAuthenticated, tareaController.getEdit);
router.post('/edit/:id', ensureAuthenticated, tareaController.postEdit);
router.get('/delete/:id', ensureAuthenticated, tareaController.delete);

// Endpoint llamado por el JS del Kanban cuando se arrastra una tarjeta.
router.post('/update-position', ensureAuthenticated, tareaController.updatePosition);

// Endpoint para actualizar solo el estado sin requerir permisos de edición completa
router.post('/update-estado/:id', ensureAuthenticated, tareaController.updateEstado);

// Endpoint para obtener información del último cambio de estado
router.get('/:id/ultimo-cambio', ensureAuthenticated, tareaController.getUltimoCambio);

// Página de comentarios
router.get('/:id/comentarios', ensureAuthenticated, tareaController.getComentariosPage);

module.exports = router;
