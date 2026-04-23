const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/cliente.controller");

// POST para lançar conta a pagar
router.post("/cadastrar-cliente", ClienteController.cadastrarCliente);

module.exports = router;