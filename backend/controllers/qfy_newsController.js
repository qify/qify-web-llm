/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_newsModel = require('../models/qfy_newsModel');

// 获取科技新闻列表
const qfy_getNewsList = async (req, res) => {
  try {
    const qfy_list = await qfy_newsModel.qfy_findAllNews();

    res.json({
      code: 0,
      msg: '查询成功',
      data: {
        total: qfy_list.length,
        list: qfy_list
      }
    });
  } catch (qfy_err) {
    console.error('查询科技新闻失败：', qfy_err.message);
    res.json({
      code: 2001,
      msg: '查询科技新闻失败：' + qfy_err.message,
      data: null
    });
  }
};

module.exports = { qfy_getNewsList };
