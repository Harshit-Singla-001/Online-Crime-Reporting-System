const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  try {
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27018,
        dbName: 'crs'
      }
    });
    console.log(`Standalone MongoMemoryServer running on: ${mongoServer.getUri()}`);
  } catch (err) {
    console.error('Failed to start memory server:', err);
    process.exit(1);
  }
}

start();
