const express = require("express");
const router = express.Router();
const authenticateDevice = require("../middlewares/authenticateDevice");
const rondaController = require("../controllers/ronda.constroller");

router.get("/conexao", authenticateDevice, rondaController.conexao);
router.get("/pontos", authenticateDevice, rondaController.buscarPontos);
router.get("/horarios", authenticateDevice, rondaController.buscarHorarios);

router.post("/jornada", authenticateDevice, rondaController.criarJornada);
router.post("/jornada-slot", authenticateDevice, rondaController.salvarJornadaSlot);
router.put("/jornada/:id/status", authenticateDevice, rondaController.atualizarStatusJornada);

module.exports = router;