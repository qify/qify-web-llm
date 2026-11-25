/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const qfy_app = express();
const qfy_PORT = 8031;

// 开放全部跨域访问（仅用于课程作业）
qfy_app.use(cors());
qfy_app.use(express.json());
qfy_app.use(express.urlencoded({ extended: true }));

// 托管前端静态资源目录
qfy_app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 接口路由：统一 /api 前缀
qfy_app.use('/api', require('./routes/qfy_health'));
qfy_app.use('/api/db', require('./routes/qfy_db'));
qfy_app.use('/api/news', require('./routes/qfy_news'));
qfy_app.use('/api/gallery', require('./routes/qfy_gallery'));
qfy_app.use('/api/chat', require('./routes/qfy_chat'));
qfy_app.use('/api/ai', require('./routes/qfy_ai'));
qfy_app.use('/api/service', require('./routes/qfy_service'));
qfy_app.use('/api/kb', require('./routes/qfy_kb'));
qfy_app.use('/api/vision', require('./routes/qfy_vision'));
qfy_app.use('/api/asr', require('./routes/qfy_asr'));

qfy_app.listen(qfy_PORT, () => {
  console.log(`qfy server running at http://localhost:${qfy_PORT}`);
});
