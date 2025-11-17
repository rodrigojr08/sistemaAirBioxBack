const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const sistemaRoutes = require('./routes/sistemas.routes');
const registrosRoutes = require('./routes/registros.routes');
const authenticateToken = require('./middlewares/authenticateToken');
const bancoDeHorasRoutes = require('./routes/banco-de-horas.routes');
const controleDeHorasRoutes = require('./routes/controle-de-horas.routes');
require('dotenv').config();

const app = express();
app.use(express.json());

// === CORS CONFIGURADO CORRETAMENTE PARA CLOUDFLARE TUNNEL ===
app.use(cors({
  origin: [
    "http://localhost:8100",
    "http://192.168.20.50",
    "http://192.168.20.50:8100",
    "http://sistema.airbiox.com",
    "https://sistema.airbiox.com",
    "https://api.airbiox.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// === PRE-FLIGHT AUTOMÁTICO (EVITA O ERRO DO "*") ===
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(204);
  }
  next();
});

// === ROTAS ===
app.use('/auth', authRoutes);
app.use('/sistemas', authenticateToken, sistemaRoutes);
app.use('/registros', authenticateToken, registrosRoutes);
app.use('/banco-de-horas', authenticateToken, bancoDeHorasRoutes);
app.use('/controle-de-horas', authenticateToken, controleDeHorasRoutes);

app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Usuário autenticado: ${req.userId}` });
});

// === INICIAR SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor disponível em:");
  console.log(`➡ Local: http://localhost:${PORT}`);
  console.log(`➡ Rede:  http://${process.env.SERVER_IP || "192.168.20.30"}:${PORT}`);
});
