// Punto de entrada de la función serverless en Vercel.
// Vercel ejecuta `yarn vercel-build` (prisma generate + nest build) y luego empaqueta este archivo.
const { createNestApp } = require('../dist/src/bootstrap');

let server;

module.exports = async (req, res) => {
  // La app se crea una sola vez por instancia y se reutiliza entre peticiones
  if (!server) {
    const app = await createNestApp();
    await app.init();
    server = app.getHttpAdapter().getInstance();
  }
  return server(req, res);
};
