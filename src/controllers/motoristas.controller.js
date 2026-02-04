const MotoristasModal = require("../models/motoristas.model");

exports.buscarMotoristas = async (req, res) => {
  try {
    const result = await MotoristasModal.buscarMotoristas();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar motoristas:", err);
    return res.status(500).json({ error: "Erro ao buscar motoristas" });
  }

}

