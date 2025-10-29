const express = require('express');
const router = express.Router();
const pool = require('../db/dbConfig');

// Endpoint de health check para verificar se a aplicação está funcionando
router.get('/health', async (req, res) => {
    try {
        // Testar conexão com o banco de dados
        await pool.query('SELECT 1');
        
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'connected',
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

module.exports = router;