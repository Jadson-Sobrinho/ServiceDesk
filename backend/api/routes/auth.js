const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth");

router.post('/login', authController.login);

router.get('/me', authController.verifyToken, authController.getProfile);

module.exports = router;