const { Movimiento } = require('../models');

module.exports = async function seedMovimientos() {
  await Movimiento.bulkCreate([
    {
      expedienteId: 1,
      tipo: "entrada",
      fecha_movimiento: "2025-07-01",
      unidadDestinoId: 1,
      unidadOrigenId: null,
      usuarioId: 1,
      observaciones: "Ingreso inicial"
    },
    {
      expedienteId: 1,
      tipo: "salida",
      fecha_movimiento: "2025-07-02",
      unidadDestinoId: 2,
      unidadOrigenId: 1,
      usuarioId: 1,
      observaciones: "Enviado a Jurídica"
    },
    {
      expedienteId: 2,
      tipo: "entrada",
      fecha_movimiento: "2025-07-05",
      unidadDestinoId: 1,
      unidadOrigenId: null,
      usuarioId: 2,
      observaciones: "Ingreso por ciudadano"
    }
  ], { ignoreDuplicates: true });
  console.log("✔ Movimientos precargados");
};
