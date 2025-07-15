const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, (req, res) => {
  res.json({ message: `Ruta protegida accedida por usuario con rol: ${req.user.rol}` });
});

module.exports = router;
