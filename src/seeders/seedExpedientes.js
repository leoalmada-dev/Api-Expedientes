const { Expediente } = require('../models');

module.exports = async function seedExpedientes() {
  await Expediente.bulkCreate([
    {
      tipo_documento: "oficio",
      numero_documento: "100/2025",
      forma_ingreso: "correo",
      fecha_ingreso: "2025-07-01",
      referencia: "demanda",
      detalle: "Reclamo de pago expediente 123",
      creadoPorId: 1,
      estado: "abierto",
      cerradoPorId: null,
      fecha_cierre: null,
      eliminado: false
    },
    {
      tipo_documento: "fisico",
      numero_documento: "2025-4-1-0000967",
      forma_ingreso: "papel",
      fecha_ingreso: "2025-07-05",
      referencia: "solicitud",
      detalle: "Solicitud de constancia",
      creadoPorId: 2,
      estado: "abierto",
      cerradoPorId: null,
      fecha_cierre: null,
      eliminado: false
    }
  ], { ignoreDuplicates: true });
  console.log("✔ Expedientes precargados");
};
