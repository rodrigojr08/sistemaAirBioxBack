const RondaModel = require("../models/ronda.model");


exports.conexao = async (req, res) => {
  try {
    return res.status(200).json({
      ok: true,
      mensagem: "Conectado ao backend",
    });
  } catch (err) {
    console.error("Erro ao conectar:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao conectar",
    });
  }
};

exports.buscarPontos = async (req, res) => {
  try {
    const result = await RondaModel.buscarPontos();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao conectar:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao conectar",
    });
  }
};

exports.criarJornada = async (req, res) => {
  try {
    const { data_operacao, func_id, id_status } = req.body;

    if (!data_operacao || !func_id || !id_status) {
      return res.status(400).json({
        ok: false,
        error: "data_operacao, func_id e id_status são obrigatórios",
      });
    }

    const result = await RondaModel.criarJornada({
      data_operacao,
      func_id,
      id_status,
    });

    return res.status(201).json({
      ok: true,
      mensagem: "Jornada criada com sucesso",
      data: result,
    });
  } catch (err) {
    console.error("Erro ao criar jornada:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao criar jornada",
    });
  }
};

exports.buscarHorarios = async (req, res) => {
  try {
    const result = await RondaModel.buscarHorarios();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar horários:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar horários",
    });
  }
};

exports.salvarJornadaSlot = async (req, res) => {
  try {
    const {
      jornada_id,
      ronda_numero,
      id_status,
      pontos_json,
      horario_inicio,
      horario_fim,
      observacao,
    } = req.body;

    if (!jornada_id || !ronda_numero || !id_status) {
      return res.status(400).json({
        ok: false,
        error: "jornada_id, ronda_numero e id_status são obrigatórios",
      });
    }

    const result = await RondaModel.salvarJornadaSlot({
      jornada_id,
      ronda_numero,
      id_status,
      pontos_json,
      horario_inicio,
      horario_fim,
      observacao,
    });

    return res.status(201).json({
      ok: true,
      mensagem: "Ronda salva com sucesso",
      data: result,
    });
  } catch (err) {
    console.error("Erro ao salvar jornada_slot:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar jornada_slot",
    });
  }
};

exports.atualizarStatusJornada = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_status } = req.body;

    if (!id || !id_status) {
      return res.status(400).json({
        ok: false,
        error: "id e id_status são obrigatórios",
      });
    }

    const result = await RondaModel.atualizarStatusJornada({
      id: Number(id),
      id_status,
    });

    if (!result) {
      return res.status(404).json({
        ok: false,
        error: "Jornada não encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      mensagem: "Status da jornada atualizado com sucesso",
      data: result,
    });
  } catch (err) {
    console.error("Erro ao atualizar status da jornada:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao atualizar status da jornada",
    });
  }
};

