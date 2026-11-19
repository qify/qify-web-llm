/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
*/

const express = require('express');
const qfy_router = express.Router();
const qfy_healthController = require('../controllers/qfy_healthController');

// GET /api/health
qfy_router.get('/health', qfy_healthController.qfy_getHealth);

module.exports = qfy_router;
