const express = require("express");
const router = express.Router();
const mapaController = require("../controllers/mapa.controller");
const authenticateToken = require("../middlewares/authenticateToken");

// ✅ rota correta
router.post("/inserir-mapa", authenticateToken, mapaController.inserirMapa);
router.get("/gases", authenticateToken, mapaController.buscarGases);
router.post("/inserir-gas", authenticateToken, mapaController.inserirGas);
router.get("/buscar-mapas-finalizados", authenticateToken, mapaController.buscarMapasFinalizados);
router.get("/buscar-mapas-finalizados-filtro", authenticateToken, mapaController.buscarMapasFinalizadosFiltro);
router.get("/buscar-mapas", authenticateToken, mapaController.buscarMapas);
router.get("/buscar-mapa/:id_mapa", authenticateToken, mapaController.buscarMapa);
router.get("/buscar-mapas-filtro", authenticateToken, mapaController.buscarMapasFiltro);
router.put("/atualizar-mapa/:id", authenticateToken, mapaController.atualizarMapa);
router.put("/finalizar-mapa", authenticateToken, mapaController.finalizarMapa);

module.exports = router;