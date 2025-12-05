const express = require("express");
const router = express.Router();
const ProdutoCtrl = require("../controllers/produtos.controller");
const authenticateToken = require("../middlewares/authenticateToken");

console.log("buscarUnidades:", ProdutoCtrl.buscarUnidades);

router.get("/", authenticateToken, ProdutoCtrl.listar);
router.get("/buscar-ncms", authenticateToken, ProdutoCtrl.buscarNCM);
router.get("/buscar-fabricantes", authenticateToken, ProdutoCtrl.buscarFabricantes);
router.get("/buscar-unidades", authenticateToken, ProdutoCtrl.buscarUnidades);
router.get("/buscar-setores", authenticateToken, ProdutoCtrl.buscarSetores);
router.get("/buscar-grupos", authenticateToken, ProdutoCtrl.buscarGrupos);

router.get("/buscar-ncms-codigo/:codigo", authenticateToken, ProdutoCtrl.buscarNCMCodigo);


router.get("/:id", authenticateToken, ProdutoCtrl.buscar);

router.post("/", authenticateToken, ProdutoCtrl.criar);
router.put("/:id", authenticateToken, ProdutoCtrl.atualizar);
router.delete("/:id", authenticateToken, ProdutoCtrl.excluir);

module.exports = router;