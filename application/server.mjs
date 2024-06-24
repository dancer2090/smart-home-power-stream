// Import the framework and instantiate it
import appFramework from './app.mjs'

(async () => {
  const app = await appFramework();
  try {
    await app.listen({
      port: process.env.APP_PORT,
      host: process.env.APP_HOST,
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})()
