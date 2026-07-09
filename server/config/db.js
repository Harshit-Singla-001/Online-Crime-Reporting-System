const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to Atlas MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Atlas Database Connection Failed: ${error.message}`);
    console.log('Attempting connection to local MongoDB default instance (mongodb://127.0.0.1:27017/crs)...');
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/crs', {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
    } catch (localErr) {
      console.warn(`Local default MongoDB Connection Failed: ${localErr.message}`);
      console.log('Attempting connection to standalone dev MongoDB (mongodb://127.0.0.1:27018/crs)...');
      try {
        const conn = await mongoose.connect('mongodb://127.0.0.1:27018/crs', {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`Standalone Dev MongoDB Connected: ${conn.connection.host}`);
      } catch (devErr) {
        console.warn(`Standalone Dev MongoDB Connection Failed: ${devErr.message}`);
        console.log('Spinning up fallback MongoDB Memory Server...');
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongoServer = await MongoMemoryServer.create({
            binary: {
              version: process.env.MONGOMS_VERSION || '7.0.12'
            }
          });
          const uri = mongoServer.getUri();
          const conn = await mongoose.connect(uri);
          console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
          console.log(`Uri: ${uri}`);
        } catch (memErr) {
          console.error(`In-Memory MongoDB Boot Failed: ${memErr.message}`);
          console.error('Database connection could not be established. Exiting...');
          process.exit(1);
        }
      }
    }
  }
};

module.exports = connectDB;
