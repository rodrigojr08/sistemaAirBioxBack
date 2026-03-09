const express = require("express");
const router = express.Router();
const pontoController = require("../controllers/ponto.controller");
const authenticateDevice = require("../middlewares/authenticateDevice");

// ✅ rota correta
router.get("/state/today", authenticateDevice, pontoController.stateToday);

module.exports = router;