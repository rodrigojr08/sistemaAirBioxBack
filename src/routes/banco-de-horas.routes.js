const express = require("express");
const router = express.Router();
const bancoDeHorasController = require("../controllers/banco-de-horas.controller");
const authenticateToken = require('../middlewares/authenticateToken');

router.get("/funcionarios", authenticateToken,bancoDeHorasController.buscarFuncionarios);
router.get("/registro-pontos", authenticateToken, bancoDeHorasController.buscarRegPontosMesFunc);
router.post("/inserir-horario", authenticateToken, bancoDeHorasController.inserirHorario);
router.put("/atualizar-horario", authenticateToken, bancoDeHorasController.atualizarHorario);
router.post("/salvar-relatorio", authenticateToken, bancoDeHorasController.salvarRelatorio);
router.get("/buscar-relatorio-salvo", authenticateToken, bancoDeHorasController.buscarRelatorioSalvo);
router.put("/atualizar-relatorio", authenticateToken, bancoDeHorasController.atualizarRelatorio);
router.delete("/excluir-horario/:id", bancoDeHorasController.excluirHorario);
module.exports = router;