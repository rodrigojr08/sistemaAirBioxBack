const express = require('express');
const router = express.Router();
const { register, login, refreshToken, resetPassword, changePassword, buscarUsuarios } = require('../controllers/auth.controller');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/register', authenticateToken, register);
router.post('/reset-password/:id', authenticateToken, resetPassword);
router.put('/change-password', authenticateToken, changePassword);
router.get('/usuarios', authenticateToken, buscarUsuarios);
router.post('/login', login);
router.post('/token', refreshToken);

module.exports = router;