/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const express = require('express');
const multer = require('multer');
const qfy_router = express.Router();
const qfy_visionController = require('../controllers/qfy_visionController');

// 图片暂存内存，转 base64 后直接请求模型，不落盘
const qfy_upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      return cb(new Error('仅支持 jpg / png / webp / gif 图片'));
    }
    cb(null, true);
  }
});

// POST /api/vision  上传图片返回描述
qfy_router.post('/', qfy_upload.single('image'), qfy_visionController.qfy_recognize);

module.exports = qfy_router;
