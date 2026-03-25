// server/config/db.js
const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠  MONGODB_URI not set — running without database.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'antigravity-seo',
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    // Don't crash — app still works without DB (limited features)
  }
}

module.exports = connectDB;
