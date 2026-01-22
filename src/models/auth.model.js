const pool = require('../config/database');

async function findUserByUsername(username) {
    const result = await pool.query(
        'SELECT id, username, email, hashed_password FROM users WHERE username = $1',
        [username]
    );
    return result.rows[0];
}

async function createUser(username, email, password) {
    const result = await pool.query(
        "INSERT INTO users (username, email, hashed_password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, password]
    );
    return result.rows[0];
}

async function buscarUsuariosModel(page = 1, limit = 10){
    const offset = (page - 1) * limit;

    // busca paginada
    const query = `
      SELECT * FROM users 
      ORDER BY id
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);

    // conta total de registros ativos
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users
    `;
    const countResult = await pool.query(countQuery);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      data: result.rows,
      total,
      totalPages,
      page,
      limit
    };
}

async function resetUserPassword(userId, hashedPassword) {
    const result = await pool.query(
        'UPDATE users SET hashed_password = $1 WHERE id = $2 RETURNING id, username, email',
        [hashedPassword, userId]
    );
    return result.rows[0];
}

async function getUserPasswordHash(userId) {
    const result = await pool.query(
        'SELECT hashed_password FROM users WHERE id = $1',
        [userId]
    );

    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0].hashed_password;
}

async function updateUserPassword(userId, newHashedPassword) {
    const result = await pool.query(
        'UPDATE users SET hashed_password = $1 WHERE id = $2 RETURNING id',
        [newHashedPassword, userId]
    );

    return result.rowCount > 0;
}

async function saveRefreshToken(userId, token, expiresAt) {
    await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
    );
}

async function findRefreshToken(token) {
  const result = await pool.query(
    `
    SELECT *
    FROM refresh_tokens
    WHERE token = $1
      AND expires_at > NOW()
      AND revoked = false
    LIMIT 1
    `,
    [token]
  );

  return result.rows[0];
}

async function revokeRefreshToken(token) {
  await pool.query(
    'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
    [token]
  );
}

module.exports = {
    findUserByUsername,
    createUser,
    saveRefreshToken,
    findRefreshToken,
    resetUserPassword,
    getUserPasswordHash,
    updateUserPassword,
    buscarUsuariosModel
};