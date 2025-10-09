const express = require("express");
const router = express.Router();
const bancoDeHorasController = require("../controllers/banco-de-horas.controller");


router.get("/", bancoDeHorasController.buscarFuncionarios);
module.exports = router;