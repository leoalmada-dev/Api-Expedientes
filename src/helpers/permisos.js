const puedeGestionar = (rol) => ["admin", "supervisor"].includes(rol);
const puedeCrearMovimiento = (rol) => ["admin", "supervisor", "operador"].includes(rol);
const puedeVerCerrados = (rol) => rol === "supervisor";

module.exports = {
  puedeGestionar,
  puedeCrearMovimiento,
  puedeVerCerrados,
};
