const express = require('express');
const comentarioController = require('../controllers/comentarioController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /comentarios/:tareaId - Crear comentario en una tarea
router.post('/:tareaId', ensureAuthenticated, comentarioController.crear);

// GET /comentarios/:tareaId - Obtener comentarios de una tarea
router.get('/:tareaId', ensureAuthenticated, comentarioController.obtenerPorTarea);

// DELETE /comentarios/:id - Eliminar comentario
router.delete('/:id', ensureAuthenticated, comentarioController.eliminar);

module.exports = router;
