const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// Pantalla resumen protegida.
router.get('/', ensureAuthenticated, dashboardController.index);

module.exports = router;
