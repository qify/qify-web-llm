/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const express = require('express');
const qfy_router = express.Router();
const qfy_chatController = require('../controllers/qfy_chatController');

// POST /api/chat
qfy_router.post('/', qfy_chatController.qfy_chat);

module.exports = qfy_router;
