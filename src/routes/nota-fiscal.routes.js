const express = require("express");
const router = express.Router();
const NotaFiscal = require("../controllers/notaFiscal.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.post("/cancelar", authenticateToken, NotaFiscal.cancelarNFeEntrada);

module.exports = router;