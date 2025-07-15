const { Expediente } = require('../models');

module.exports = async function seedExpedientes() {
  await Expediente.bulkCreate([
    {
      tipo_documento: "oficio",
      numero_documento: "N.º 100/2025",
      forma_ingreso: "correo",
      fecha_ingreso: "2025-07-01",
      procedencia: "Juzgado Civil",
      dependencia_origen: "JDO CIVIL 1º",
      referencia: "demanda",
      detalle: "Reclamo de pago expediente 123",
      creadoPorId: 1
    },
    {
      tipo_documento: "fisico",
      numero_documento: "2025-4-1-0000967",
      forma_ingreso: "papel",
      fecha_ingreso: "2025-07-05",
      procedencia: "Particular",
      dependencia_origen: "Ciudadano Juan Pérez",
      referencia: "solicitud",
      detalle: "Solicitud de constancia",
      creadoPorId: 2
    }
  ], { ignoreDuplicates: true });
  console.log("✔ Expedientes precargados");
};
