function checkPermission(rota) {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.permissoes)) {
      return res.status(401).json({ error: "Usuário sem permissões carregadas" });
    }

    if (!req.user.permissoes.includes(rota)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    next();
  };
}

module.exports = checkPermission;