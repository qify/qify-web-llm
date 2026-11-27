/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_pool = require('../config/qfy_db');

// 查询全部图文，按发布日期倒序
const qfy_findAllGallery = async () => {
  const [qfy_rows] = await qfy_pool.query(
    `SELECT qfy_id, qfy_title, qfy_description, qfy_image_url, qfy_category,
            qfy_author, qfy_likes,
            DATE_FORMAT(qfy_publish_date, '%Y-%m-%d') AS qfy_publish_date
       FROM qfy_gallery
      ORDER BY qfy_publish_date DESC, qfy_id DESC`
  );
  return qfy_rows;
};

module.exports = { qfy_findAllGallery };
