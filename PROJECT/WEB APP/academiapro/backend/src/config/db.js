'use strict';

const mongoose = require('mongoose');

// ─── Connection Options ───────────────────────────────────────────────────────
const MONGO_OPTIONS = {
  autoIndex    : process.env.NODE_ENV !== 'production', // disable in prod for perf
  serverSelectionTimeoutMS: 5000,   // fail fast if no server found
  socketTimeoutMS         : 45000,  // close sockets after 45s of inactivity
  maxPoolSize             : 10,     // max concurrent connections in pool
};

// ─── Connection Events ────────────────────────────────────────────────────────
mongoose.connection.on('connected', () => {
  console.log('[db] MongoDB connected:', mongoose.connection.host);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('[db] MongoDB connection error:', err.message);
});

// ─── Connect Function ─────────────────────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('[db] MONGO_URI is not defined in environment variables.');
  }

  try {
    await mongoose.connect(uri, MONGO_OPTIONS);
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB:', err.message);
    process.exit(1); // exit — app is unusable without DB
  }
};

module.exports = connectDB;
