const express = require("express");
const router = express.Router();
const registrosController = require("../controllers/registros.controller");

// rota POST para salvar registros
router.post("/", registrosController.salvarRegistros);

module.exports = router;