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

async function saveRefreshToken(userId, token, expiresAt) {
    await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
    );
}

async function findRefreshToken(token) {
    const result = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1',
        [token]
    );
    return result.rows[0];
}

module.exports = {
    findUserByUsername,
    createUser,
    saveRefreshToken,
    findRefreshToken
};