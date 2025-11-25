const express = require("express");
const router = express.Router();
const ProdutoCtrl = require("../controllers/produtos.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/", authenticateToken, ProdutoCtrl.listar);
router.get("/:id", authenticateToken, ProdutoCtrl.buscar);
router.post("/", authenticateToken, ProdutoCtrl.criar);
router.put("/:id", authenticateToken, ProdutoCtrl.atualizar);
router.delete("/:id", authenticateToken, ProdutoCtrl.excluir);

module.exports = router;