/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_galleryModel = require('../models/qfy_galleryModel');

// 获取科技图文列表
const qfy_getGalleryList = async (req, res) => {
  try {
    const qfy_list = await qfy_galleryModel.qfy_findAllGallery();

    res.json({
      code: 0,
      msg: '查询成功',
      data: {
        total: qfy_list.length,
        list: qfy_list
      }
    });
  } catch (qfy_err) {
    console.error('查询科技图文失败：', qfy_err.message);
    res.json({
      code: 3001,
      msg: '查询科技图文失败：' + qfy_err.message,
      data: null
    });
  }
};

module.exports = { qfy_getGalleryList };
