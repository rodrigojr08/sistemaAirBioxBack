const express = require("express");
const router = express.Router();
const registrosController = require("../controllers/registros.controller");
const authenticateToken = require('../middlewares/authenticateToken');

// rota POST para salvar registros
router.post("/", authenticateToken, registrosController.salvarRegistros);

module.exports = router;