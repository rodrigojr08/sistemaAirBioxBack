const express = require("express");
const router = express.Router();
const tabuleiroController = require("../controllers/tabuleiro.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/buscar-tabuleiros/:status", authenticateToken, tabuleiroController.buscarTabuleiros);
router.post("/inserir-tabuleiro", authenticateToken, tabuleiroController.inserirTabuleiro);
router.get("/buscar-tabuleiro/:id", authenticateToken, tabuleiroController.buscarTabuleiroPorId);
router.get("/buscar-tabuleiro-editar/:id", authenticateToken, tabuleiroController.buscarTabuleiroParaEditar);
router.get("/buscar-tabuleiros-para-editar", authenticateToken, tabuleiroController.buscarTabuleirosParaEditar);
router.get("/buscar-tabuleiros-nao-finalizados", authenticateToken, tabuleiroController.buscarTabuleirosNaoFinalizado);
router.get("/verificar-senha-assinatura/:senha", authenticateToken, tabuleiroController.verificarSenhaAssinatura);
router.get("/selecionar-tabuleiro-para-editar/:idTabuleiro", authenticateToken, tabuleiroController.tabuleiroSelecionadoParaEditar);
router.get("/buscar-todos-tabuleiros", authenticateToken, tabuleiroController.buscarTodosTabuleiros);
router.get("/selecionar-tabuleiro/:idTabuleiro", authenticateToken, tabuleiroController.selecionarTabuleiro);
router.post("/inserir-retorno-carga", authenticateToken, tabuleiroController.inserirRetornoCarga);
router.put("/salvar-alteracao-tabuleiro", authenticateToken, tabuleiroController.salvarAlteracaoTabuleiro);
router.put("/salvar-conferencia-motorista", authenticateToken, tabuleiroController.salvarConferenciaMotorista);
router.put("/atualizar-retorno-carga", authenticateToken, tabuleiroController.atualizarRetornoCarga);

router.get("/buscar-tabuleiros-conferente/:status", authenticateToken, tabuleiroController.buscarTabuleirosDoConfenrete);
router.get("/buscar-tabuleiro-conferente-saida/:id", authenticateToken, tabuleiroController.buscarTabuleiroDoConferentePorIdSaida);
router.get("/buscar-tabuleiro-conferente-retorno/:id", authenticateToken, tabuleiroController.buscarTabuleiroDoConferentePorIdRetorno);
router.get("/buscar-tabuleiro-a-finalizar/:id", authenticateToken, tabuleiroController.buscarTabuleiroAFinalizar);
router.get("/buscar-tabuleiro-finalizado-conferente/:id", authenticateToken, tabuleiroController.buscarTabuleiroFinalizadoConferente);
router.get("/buscar-tabuleiros-finalizados-conferente", authenticateToken, tabuleiroController.buscarTabuleirosFinalizadosConferente);
router.put("/salvar-conferencia-saida-conferente", authenticateToken, tabuleiroController.salvarConferenciaSaidaConferente);
router.put("/salvar-conferencia-retorno-conferente", authenticateToken, tabuleiroController.salvarConferenciaRetornoConferente);
router.post("/finalizar-tabuleiro", authenticateToken, tabuleiroController.finalizarTabuleiro);


module.exports = router;