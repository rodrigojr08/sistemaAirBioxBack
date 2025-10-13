const express = require("express");
const router = express.Router();
const bancoDeHorasController = require("../controllers/banco-de-horas.controller");


router.get("/funcionarios", bancoDeHorasController.buscarFuncionarios);
router.get("/registro-pontos", bancoDeHorasController.buscarRegPontosMesFunc);
module.exports = router;