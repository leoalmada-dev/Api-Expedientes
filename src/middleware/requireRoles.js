// src/middleware/requireRoles.js
module.exports = (...rolesPermitidos) => (req, res, next) => {
  const rol = req.user?.rol || req.user?.role || null; // por si el token trae 'rol' o 'role'
  if (!rol) return res.status(401).json({ ok:false, mensaje:'Token inválido' });
  if (!rolesPermitidos.includes(rol))
    return res.status(403).json({ ok:false, mensaje:'No autorizado' });
  next();
};
