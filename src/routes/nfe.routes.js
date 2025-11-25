const express = require("express");
const router = express.Router();

const NFeImport = require("../controllers/nfe-import.controller");
const authenticateToken = require("../middlewares/authenticateToken");

router.post("/importar-xml", authenticateToken, NFeImport.importarXML);

module.exports = router;