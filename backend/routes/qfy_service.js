/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const express = require('express');
const qfy_router = express.Router();
const qfy_serviceController = require('../controllers/qfy_serviceController');

// POST /api/service
qfy_router.post('/', qfy_serviceController.qfy_service);

module.exports = qfy_router;
