(async () => {
  await require('./seedRoles')();
  await require('./seedUnidades')();
  await require('./seedUsuarios')();
  await require('./seedExpedientes')();
  await require('./seedMovimientos')();
  console.log('✔ Todos los seeders ejecutados con éxito');
  process.exit();
})();
