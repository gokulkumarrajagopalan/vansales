import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { pool } from './db/pool.js';

const PORT = parseInt(process.env.PORT || '8080', 10);

async function start() {
  try {
    // Verify DB connectivity
    const client = await pool.connect();
    console.log('[PostgreSQL] Connected successfully to TallyDB');
    client.release();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`==========================================================`);
      console.log(`   Talliffy Backend API Gateway running on port ${PORT}   `);
      console.log(` - Tally Contract : http://localhost:${PORT}/TallyIntegration`);
      console.log(` - Mobile/Web API : http://localhost:${PORT}/api/v1       `);
      console.log(`==========================================================`);
    });
  } catch (err: any) {
    console.error('[Fatal Error] Failed to start server:', err);
    process.exit(1);
  }
}

start();
