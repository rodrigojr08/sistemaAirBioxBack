const { Pool } = require('pg');
require('dotenv').config();

// Validação
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error("⚠️ Variáveis de ambiente do banco não estão configuradas corretamente.");
}

const pool2 = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME2, // cuidado: está usando DB_NAME2 aqui
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === "true",
});

module.exports = pool2;