const MapaModel = require("../models/mapa.model")

exports.inserirMapa = async (req, res) => {
  try {
    const { data, cidade, dados } = req.body;

    if (!data || !cidade || !dados) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    }

    const createdBy = req.userId;

    const id = await MapaModel.inserirMapa(data, cidade, dados, createdBy);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Mapa inserido com sucesso!",
      id
    });
  } catch (error) {
    console.error("Erro ao inserir mapa:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao inserir mapa." });
  }
};

exports.buscarGases = async (req, res) => {
  try {
    const result = await MapaModel.buscarGases();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar gases:", err);
    return res.status(500).json({ error: "Erro ao buscar gases" });
  }

}
exports.buscarMapas = async (req, res) => {
  try {
    const result = await MapaModel.buscarMapas();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar gases:", err);
    return res.status(500).json({ error: "Erro ao buscar gases" });
  }

}

exports.buscarMapa = async (req, res) => {
  try {
    const { id_mapa } = req.params;
    const result = await MapaModel.buscarMapa(id_mapa);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar mapa:", err);
    return res.status(500).json({ error: "Erro ao buscar mapa" });
  }
};

exports.buscarMapasFinalizados = async (req, res) => {
  try {
    const { id_mapa } = req.params;
    const result = await MapaModel.buscarMapasFinalizados(id_mapa);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar mapa:", err);
    return res.status(500).json({ error: "Erro ao buscar mapa" });
  }
};

exports.buscarMapasFiltro = async (req, res) => {
  try {
    const { data, cidade } = req.query;

    if (!data && !cidade) {
      return res.status(400).json({
        erro: "Informe pelo menos data ou cidade"
      });
    }

    const result = await MapaModel.buscarMapasFiltro(data, cidade);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar mapas:", error);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};


exports.buscarMapasFinalizadosFiltro = async (req, res) => {
  try {
    const { data, cidade } = req.query;
 console.log('parametros: ' + data + cidade);
    if (!data && !cidade) {
      return res.status(400).json({
        erro: "Informe pelo menos data ou cidade"
      });
    }
    console.log('parametros: ' + data + cidade);
    const result = await MapaModel.buscarMapasFinalizadosFiltro(data, cidade);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar mapas:", error);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

exports.inserirGas = async (req, res) => {
  try {
    const { tipo, tamanho, unidade_medida, tipo_cilindro } = req.body;

    if (!tipo || !tamanho || !unidade_medida || !tipo_cilindro) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    }

    const result = await MapaModel.inserirGas(
      tipo, tamanho, unidade_medida, tipo_cilindro
    );

    res.status(201).json({
      sucesso: true,
      mensagem: "Gás inserido com sucesso!",
      id: result.id,
    });
  } catch (error) {
    console.error("Erro ao inserir gás:", error);
    res.status(500).json({ error: error.message || "Erro interno ao inserir gás." });
  }


};


exports.atualizarMapa = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, cidade, dados } = req.body;

    if (!id || !data || !cidade || !dados) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    }

    const modifiedBy = req.userId;

    console.log('dados Salvo: ', id);

    const result = await MapaModel.atualizarMapa(
      id,
      data,
      cidade,
      dados,
      modifiedBy
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Mapa atualizado com sucesso!",
      id: result.id
    });

  } catch (error) {
    console.error("Erro ao atualizar mapa:", error);
    return res.status(500).json({ error: "Erro ao atualizar mapa" });
  }

};

exports.finalizarMapa = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    }
    const modifiedBy = req.userId

    const result = await MapaModel.finalizarMapa(id, modifiedBy);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Mapa finalizado com sucesso!",
      id: result.id
    })
  } catch (error) {
    console.error("Erro ao finalizar mapa: ", error);
    return res.status(500).json({error: "Erro ao finalizar mapa"});
  }
}