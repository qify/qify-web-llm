/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const mysql = require('mysql2/promise');

// 测试 MySQL 连接：使用页面传入的用户名、密码
const qfy_testConnection = async (req, res) => {
  const qfy_username = (req.body.username || '').trim();
  const qfy_password = req.body.password == null ? '' : String(req.body.password);

  if (!qfy_username) {
    return res.json({ code: 1001, msg: '用户名不能为空', data: null });
  }

  let qfy_conn = null;
  try {
    qfy_conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: qfy_username,
      password: qfy_password,
      connectTimeout: 5000
    });

    const [qfy_rows] = await qfy_conn.query('SELECT VERSION() AS version, CURRENT_USER() AS currentUser');

    res.json({
      code: 0,
      msg: '数据库连接成功',
      data: {
        username: qfy_username,
        version: qfy_rows[0].version,
        currentUser: qfy_rows[0].currentUser
      }
    });
  } catch (qfy_err) {
    console.error('数据库连接失败：', qfy_err.message);
    res.json({
      code: 1002,
      msg: '数据库连接失败：' + qfy_err.message,
      data: { errorCode: qfy_err.code || 'UNKNOWN' }
    });
  } finally {
    if (qfy_conn) {
      try {
        await qfy_conn.end();
      } catch (qfy_closeErr) {
        console.error('关闭数据库连接出错：', qfy_closeErr.message);
      }
    }
  }
};

module.exports = { qfy_testConnection };
