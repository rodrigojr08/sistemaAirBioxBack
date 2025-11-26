const express = require("express");
const router = express.Router();
const ContasPagarController = require("../controllers/contas-pagar.controller");

// POST para lançar conta a pagar
router.post("/lancar", ContasPagarController.lancarConta);

module.exports = router;