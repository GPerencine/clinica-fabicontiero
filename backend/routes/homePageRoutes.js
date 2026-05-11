const express = require('express');
const router = express.Router();
const homePageController = require('../controllers/homePageController');
const verificarToken = require('../middleware/authMiddleware');

// GET /api/homepage - Get the home page content
router.get('/', homePageController.getHomePage);

// PUT /api/homepage - Update the home page content (Admin only)
router.put('/', verificarToken, homePageController.updateHomePage);

module.exports = router;
