const express = require("express");
const router = express.Router();
const veiculosController = require("../controllers/veiculos.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/buscar-veiculos", authenticateToken, veiculosController.buscarVeiculos);

module.exports = router;