const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const checkPermission = require('../middlewares/checkPermission');
const sistemasController = require("../controllers/sistemas.controller");


// Sistemas pai
router.get("/", authenticateToken, sistemasController.getSistemas);

// Sistemas filhos
router.get("/:parentId/filhos", authenticateToken, sistemasController.getSistemasFilhos);

// Verificar permissão de rota
router.get("/permissao/:rota", authenticateToken, sistemasController.checkPermission);

module.exports = router;