/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
*/

const express = require('express');
const qfy_ctrl = require('../controllers/qfy_aiChatController');

const qfy_router = express.Router();

// 会话管理
qfy_router.get('/sessions', qfy_ctrl.qfy_listSessions);
qfy_router.post('/sessions', qfy_ctrl.qfy_createSession);
qfy_router.patch('/sessions/:id', qfy_ctrl.qfy_renameSession);
qfy_router.delete('/sessions/:id', qfy_ctrl.qfy_deleteSession);
qfy_router.get('/sessions/:id/messages', qfy_ctrl.qfy_listMessages);

// 问答：非流式 + 流式（SSE）
qfy_router.post('/chat', qfy_ctrl.qfy_chat);
qfy_router.post('/chat/stream', qfy_ctrl.qfy_chatStream);

module.exports = qfy_router;
