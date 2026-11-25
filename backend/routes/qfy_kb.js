/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const express = require('express');
const multer = require('multer');
const qfy_router = express.Router();
const qfy_kbController = require('../controllers/qfy_kbController');
const { qfy_SUPPORTED } = require('../utils/qfy_kbParser');

// 文件暂存内存，解析后直接入库，不落盘
const qfy_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const qfy_ext = (file.originalname.split('.').pop() || '').toLowerCase();
    if (!qfy_SUPPORTED.includes(qfy_ext)) {
      return cb(new Error('不支持的文件类型 .' + qfy_ext + '，支持：' + qfy_SUPPORTED.join(' / ')));
    }
    cb(null, true);
  }
});

// POST /api/kb/upload  上传并解析知识库文件
qfy_router.post('/upload', qfy_upload.single('file'), qfy_kbController.qfy_upload);

// GET /api/kb/documents  知识库文档列表
qfy_router.get('/documents', qfy_kbController.qfy_list);

// DELETE /api/kb/documents/:id  删除知识库文档
qfy_router.delete('/documents/:id', qfy_kbController.qfy_remove);

// POST /api/kb/ask  基于知识库的问答
qfy_router.post('/ask', qfy_kbController.qfy_ask);

module.exports = qfy_router;
