/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const express = require('express');
const qfy_router = express.Router();
const qfy_dbController = require('../controllers/qfy_dbController');

// POST /api/db/connect
qfy_router.post('/connect', qfy_dbController.qfy_testConnection);

module.exports = qfy_router;
