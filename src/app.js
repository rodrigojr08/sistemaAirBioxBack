const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const sistemaRoutes = require("./routes/sistemas.routes");
const registrosRoutes = require("./routes/registros.routes");
const authenticateToken = require("./middlewares/authenticateToken");
const bancoDeHorasRoutes = require("./routes/banco-de-horas.routes");
const controleDeHorasRoutes = require("./routes/controle-de-horas.routes");
const estoqueRoutes = require("./routes/estoque.routes");

const app = express();
app.use(express.json());

// === CORS CONFIGURADO CORRETAMENTE PARA CLOUDFLARE ===
app.use(
  cors({
    origin: [
      "http://localhost:8100",
      "http://192.168.20.50",
      "http://192.168.20.50:8100",
      "http://sistema.airbiox.com",
      "https://sistema.airbiox.com",
      "https://api.airbiox.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// === RATE LIMIT APENAS PARA O LOGIN ===
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,             // máximo 10 tentativas por minuto
  message: {
    error: "Muitas tentativas de login. Aguarde 1 minuto.",
  },
});
app.use("/auth/login", loginLimiter);

// === ROTAS PRINCIPAIS ===
app.use("/auth", authRoutes);
app.use("/sistemas", authenticateToken, sistemaRoutes);
app.use("/registros", authenticateToken, registrosRoutes);
app.use("/banco-de-horas", authenticateToken, bancoDeHorasRoutes);
app.use("/controle-de-horas", authenticateToken, controleDeHorasRoutes);
app.use("/estoque", authenticateToken, estoqueRoutes);

// === TESTE DE TOKEN (opcional) ===
app.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: `Usuário autenticado: ${req.userId}` });
});

// === SUBIR SERVIDOR ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor disponível em:");
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Rede:  http://${process.env.SERVER_IP || "192.168.20.30"}:${PORT}`);
});