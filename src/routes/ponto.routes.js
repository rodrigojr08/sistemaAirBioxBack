const express = require("express");
const router = express.Router();

const PontoDeviceController = require("../controllers/ponto-device.controller");
const authenticateDevice = require("../middlewares/authenticateDevice");
const PontoRegistroController = require("../controllers/registro-ponto.controllers");

router.post("/device/enroll", PontoDeviceController.enrollDevice);
router.post("/registrar", authenticateDevice, PontoRegistroController.registrar);


module.exports = router;