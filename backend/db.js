const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️  MONGO_URI not set — running in file-only mode (no DB features)');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected:', uri.replace(/\/\/.*@/, '//***@'));

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
      isConnected = false;
    });
    mongoose.connection.on('disconnected', () => { isConnected = false; });
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed — running in file-only mode:', err.message);
  }
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected };
