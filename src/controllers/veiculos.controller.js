const VeiculoModal = require("../models/veiculos.model");

exports.buscarVeiculos = async (req, res) => {
  try {
    const result = await VeiculoModal.buscarVeiculos();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar veículos:", err);
    return res.status(500).json({ error: "Erro ao buscar veículos" });
  }

}

