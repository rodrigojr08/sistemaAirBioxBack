const express = require("express");
const router = express.Router();
const syncController = require("../controllers/sync.controller");
const authenticateDevice = require("../middlewares/authenticateDevice");

router.get("/funcionarios", authenticateDevice, syncController.syncFuncionarios);
router.post("/pontos/push", authenticateDevice, syncController.pushPontos);

module.exports = router;