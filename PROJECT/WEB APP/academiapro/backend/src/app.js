'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const app = express();

// ─── Security & Parsing Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin : process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Request Logger ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status  : 'ok',
    env     : process.env.NODE_ENV || 'development',
    uptime  : process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const examRoutes      = require('./routes/examRoutes');
const questionRoutes  = require('./routes/questionRoutes');
const resultsRoutes   = require('./routes/resultsRoutes');
const attemptRoutes   = require('./routes/attemptRoutes');
const studentRoutes   = require('./routes/studentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const violationRoutes = require('./routes/violationRoutes');

app.use("/api/auth",      authRoutes);
app.use("/api/exams",     examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results",   resultsRoutes);
app.use("/api/attempts",  attemptRoutes);
app.use("/api/students",  studentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use('/api/violations', violationRoutes);

app.use('/api/v1', (_req, res) => {
  res.status(200).json({ message: 'Exam Platform API v1' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    status : 'error',
    message: 'Route not found',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    status : 'error',
    message: err.message || 'Internal Server Error',
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

module.exports = app;
