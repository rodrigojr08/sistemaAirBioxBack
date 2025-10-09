const BancoDeHoras = require("../models/banco-de-horas.model");

exports.buscarFuncionarios = async (req, res) => {
    try {
        
        const funcionarios = await BancoDeHoras.buscarFuncionarios();
        res.json(funcionarios);
    } 
    catch (err) {
        console.error("Erro ao buscar funcionarios: ", err);
        res.status(500).json({ error: "Erro ao buscar funcionarios"});
    }
}