const express = require("express");
const router = express.Router();
const Estoque = require("../controllers/estoque.controller");
const EstoqueMov = require("../controllers/estoque-mov.controller");
const EstoqueDesfazer = require("../controllers/estoque-desfazer.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.post("/", authenticateToken, Estoque.registrarMovManual);
router.post("/movimentar", authenticateToken, EstoqueMov.movimentarEstoque);
router.post("/desfazer-movimentacao", authenticateToken, EstoqueDesfazer.desfazerMovimentacao);

module.exports = router;