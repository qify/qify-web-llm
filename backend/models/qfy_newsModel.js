/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_pool = require('../config/qfy_db');

// 查询全部科技新闻，按发布时间倒序
const qfy_findAllNews = async () => {
  const [qfy_rows] = await qfy_pool.query(
    `SELECT qfy_id, qfy_title, qfy_summary, qfy_content, qfy_source,
            qfy_author, qfy_category,
            DATE_FORMAT(qfy_publish_time, '%Y-%m-%d %H:%i:%s') AS qfy_publish_time
       FROM qfy_news
      ORDER BY qfy_publish_time DESC, qfy_id DESC`
  );
  return qfy_rows;
};

module.exports = { qfy_findAllNews };
