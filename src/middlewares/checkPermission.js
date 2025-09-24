function checkPermission(rota) {
  return (req, res, next) => {
    if (!req.user.permissoes.includes(rota)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    next();
  };
}

module.exports = checkPermission;