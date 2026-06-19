'use strict';

const http      = require('http');
const app       = require('./app');
const connectDB = require('./config/db');

const PORT   = process.env.PORT || 5000;
const server = http.createServer(app);

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[server] ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('[server] HTTP server closed.');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error('[server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ─── Unhandled Rejections & Exceptions ───────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught Exception:', err.message);
  shutdown('uncaughtException');
});

// ─── Start ────────────────────────────────────────────────────────────────────
const User = require('./models/User');

const start = async () => {
  await connectDB();

  // ── Seed default admin if one doesn't exist ──────────────────────────────────
  // Credentials are loaded from environment variables — never hardcoded.
  // Set ADMIN_EMAIL and ADMIN_PASSWORD in your backend/.env file.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    try {
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        // Use User.create so the pre-save bcrypt hook runs and hashes the password
        await User.create({
          name: process.env.ADMIN_NAME || 'Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin'
        });
        console.log(`[server] Default admin account created for: ${adminEmail}`);
      }
    } catch (err) {
      console.error('[server] Error seeding admin user:', err.message);
    }
  }

  server.listen(PORT, () => {
    console.log(`[server] Running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[server] Listening on http://localhost:${PORT}`);
    console.log(`[server] Health check → http://localhost:${PORT}/health`);
  });
};

start();

module.exports = server;

