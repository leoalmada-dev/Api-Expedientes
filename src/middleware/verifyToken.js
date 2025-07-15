const jwt = require('jsonwebtoken');

// Middleware para verificar el JWT y extraer el usuario
module.exports = function verifyToken(req, res, next) {
  // El token debe venir en el header: Authorization: Bearer TOKEN
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no enviado. Acceso denegado.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido.' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // El token debe tener al menos { id, rol, ... }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};
