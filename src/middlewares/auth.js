const pool = require("../db");

async function authorize(permissaoRota) {
  return async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT 1 
         FROM sistema s
         JOIN sistema_permissao sp ON sp.id_sistema = s.id
         JOIN usuario_perfil up ON up.id_perfil = sp.id_perfil
         WHERE up.id_usuario = $1 AND s.rota = $2`,
        [req.userId, permissaoRota]
      );

      if (result.rowCount === 0) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: "Erro ao verificar permissões" });
    }
  };
}

module.exports = authorize;