const express = require("express");
const router = express.Router();
const motoristasController = require("../controllers/motoristas.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/buscar-motoristas", authenticateToken, motoristasController.buscarMotoristas);

module.exports = router;