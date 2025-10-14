const express = require("express");
const router = express.Router();
const bancoDeHorasController = require("../controllers/banco-de-horas.controller");
const authenticateToken = require('../middlewares/authenticateToken');

router.get("/funcionarios", authenticateToken,bancoDeHorasController.buscarFuncionarios);
router.get("/registro-pontos", authenticateToken, bancoDeHorasController.buscarRegPontosMesFunc);
router.post("/inserir-horario", authenticateToken, bancoDeHorasController.inserirHorario);
router.put("/atualizar-horario", authenticateToken, bancoDeHorasController.atualizarHorario);
module.exports = router;