/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const express = require('express');
const multer = require('multer');
const qfy_router = express.Router();
const qfy_asrController = require('../controllers/qfy_asrController');

// 音频暂存内存，直接转发给七牛 ASR，不落盘
const qfy_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^audio\//.test(file.mimetype)) {
      return cb(new Error('仅支持音频文件（wav / mp3 / m4a / ogg / webm）'));
    }
    cb(null, true);
  }
});

// POST /api/asr  上传音频返回识别文字
qfy_router.post('/', qfy_upload.single('audio'), qfy_asrController.qfy_recognize);

module.exports = qfy_router;
