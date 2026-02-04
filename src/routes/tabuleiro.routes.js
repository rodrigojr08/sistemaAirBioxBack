const express = require("express");
const router = express.Router();
const tabuleiroController = require("../controllers/tabuleiro.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/buscar-tabuleiros/:status", authenticateToken, tabuleiroController.buscarTabuleiros);
router.post("/inserir-tabuleiro", authenticateToken, tabuleiroController.inserirTabuleiro);
router.get("/buscar-tabuleiro/:id", authenticateToken, tabuleiroController.buscarTabuleiroPorId);
router.get("/verificar-senha-assinatura/:senha", authenticateToken, tabuleiroController.verificarSenhaAssinatura);
router.post("/inserir-retorno-carga", authenticateToken, tabuleiroController.inserirRetornoCarga);
router.put("/salvar-conferencia-motorista", authenticateToken, tabuleiroController.salvarConferenciaMotorista);

router.get("/buscar-tabuleiros-conferente/:status", authenticateToken, tabuleiroController.buscarTabuleirosDoConfenrete);
router.get("/buscar-tabuleiro-conferente-saida/:id", authenticateToken, tabuleiroController.buscarTabuleiroDoConferentePorIdSaida);
router.get("/buscar-tabuleiro-conferente-retorno/:id", authenticateToken, tabuleiroController.buscarTabuleiroDoConferentePorIdRetorno);
router.get("/buscar-tabuleiro-a-finalizar/:id", authenticateToken, tabuleiroController.buscarTabuleiroAFinalizar);
router.put("/salvar-conferencia-saida-conferente", authenticateToken, tabuleiroController.salvarConferenciaSaidaConferente);
router.put("/salvar-conferencia-retorno-conferente", authenticateToken, tabuleiroController.salvarConferenciaRetornoConferente);
router.post("/finalizar-tabuleiro", authenticateToken, tabuleiroController.finalizarTabuleiro);


module.exports = router;