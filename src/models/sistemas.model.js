// models/sistema.model.js
const pool = require("../config/database"); // sua conexão com o postgres



async function getSistemasPaiByUser(userId) {
  const query = `
    SELECT DISTINCT s.*
    FROM sistema s
    INNER JOIN sistema_permissao sp ON s.id = sp.id_sistema
    INNER JOIN perfil p ON sp.id_perfil = p.id
    INNER JOIN usuario_perfil up on p.id= up.id_perfil
	INNER JOIN users u on up.id_usuario = u.id
    WHERE u.id = $1
      AND s.parent_id IS NULL
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * Busca sistemas filhos de um sistema pai para o usuário
 */
async function getSistemasFilhosByUser(userId, parentId) {
  const query = `
    SELECT DISTINCT s.*
    FROM sistema s
    INNER JOIN sistema_permissao sp ON s.id = sp.id_sistema
    INNER JOIN perfil p ON sp.id_perfil = p.id
    INNER JOIN usuario_perfil up on p.id= up.id_perfil
	INNER JOIN users u on up.id_usuario = u.id
    WHERE u.id = $1
      AND s.parent_id = $2
  `;
  const result = await pool.query(query, [userId, parentId]);
  return result.rows;
}

/**
 * Verifica se usuário tem permissão em uma rota específica
 */
async function hasPermission(userId, rota) {
  const query = `
    SELECT COUNT(*) > 0 AS permitido
    FROM sistema s
    INNER JOIN sistema_permissao sp ON s.id = sp.id_sistema
    INNER JOIN perfil p ON sp.id_perfil = p.id
    INNER JOIN usuario_perfil up ON up.id_perfil = p.id
	INNER JOIN users u ON up.id_usuario = u.id
    WHERE u.id = $1
      AND s.rota = $2
  `;
  const result = await pool.query(query, [userId, rota]);
  return result.rows[0].permitido;
}

module.exports = {
  getSistemasPaiByUser,
  getSistemasFilhosByUser,
  hasPermission,
};