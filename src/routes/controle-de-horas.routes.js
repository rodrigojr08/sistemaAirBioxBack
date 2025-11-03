const express = require("express");
const router = express.Router();
const controleDeHorasController = require("../controllers/controle-de-horas.controller");
const authenticateToken = require("../middlewares/authenticateToken");

// ✅ rota correta
router.get("/geral", authenticateToken, controleDeHorasController.buscarBancoDeHorasGeral);

module.exports = router;