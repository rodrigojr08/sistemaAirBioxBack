const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer(); // armazenamento em memória

const ctrl = require("../controllers/nfe-servico.controller");

router.post("/servico", ctrl.criarServico);

router.post(
    "/servico/documento",
    upload.single("pdf"),
    ctrl.uploadDocumento
);

router.get("/servico/:id_servico/documentos", ctrl.listarDocumentos);

router.delete("/servico/documento/:id", ctrl.deletarDocumento);

module.exports = router;