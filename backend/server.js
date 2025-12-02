const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname',
  ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false
});

// Health check endpoint with database connectivity
app.get('/api/health', async (req, res) => {
  const apiStatus = 'healthy';
  let dbStatus = 'unknown';
  let dbError = null;
  
  // Check database connection
  try {
    const result = await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'disconnected';
    dbError = err.message;
  }
  
  const overallStatus = (apiStatus === 'healthy' && dbStatus === 'connected') ? 'healthy' : 'degraded';
  
  res.json({
    status: overallStatus,
    api: {
      status: apiStatus,
      timestamp: new Date().toISOString(),
      service: 'api'
    },
    database: {
      status: dbStatus,
      error: dbError
    },
    service: 'api'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Test8 API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
