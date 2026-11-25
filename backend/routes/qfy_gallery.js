/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const express = require('express');
const qfy_router = express.Router();
const qfy_galleryController = require('../controllers/qfy_galleryController');

// GET /api/gallery
qfy_router.get('/', qfy_galleryController.qfy_getGalleryList);

module.exports = qfy_router;
