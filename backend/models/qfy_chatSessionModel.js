/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_pool = require('../config/qfy_db');

// 查询会话列表，按更新时间倒序
const qfy_listSessions = async () => {
  const [qfy_rows] = await qfy_pool.query(
    `SELECT qfy_id, qfy_title, qfy_summary, qfy_summarized_count, qfy_message_count,
            DATE_FORMAT(qfy_created_at, '%Y-%m-%d %H:%i:%s') AS qfy_created_at,
            DATE_FORMAT(qfy_updated_at, '%Y-%m-%d %H:%i:%s') AS qfy_updated_at
       FROM qfy_chat_session
      ORDER BY qfy_updated_at DESC, qfy_id DESC`
  );
  return qfy_rows;
};

// 查询单个会话
const qfy_getSession = async (qfy_id) => {
  const [qfy_rows] = await qfy_pool.query(
    `SELECT qfy_id, qfy_title, qfy_summary, qfy_summarized_count, qfy_message_count
       FROM qfy_chat_session WHERE qfy_id = ?`,
    [qfy_id]
  );
  return qfy_rows[0] || null;
};

// 新建会话
const qfy_createSession = async (qfy_title) => {
  const [qfy_result] = await qfy_pool.query(
    'INSERT INTO qfy_chat_session (qfy_title) VALUES (?)',
    [qfy_title || '新的对话']
  );
  return qfy_result.insertId;
};

// 重命名会话
const qfy_renameSession = async (qfy_id, qfy_title) => {
  const [qfy_result] = await qfy_pool.query(
    'UPDATE qfy_chat_session SET qfy_title = ? WHERE qfy_id = ?',
    [qfy_title, qfy_id]
  );
  return qfy_result.affectedRows;
};

// 删除会话（消息由外键级联删除）
const qfy_deleteSession = async (qfy_id) => {
  const [qfy_result] = await qfy_pool.query(
    'DELETE FROM qfy_chat_session WHERE qfy_id = ?',
    [qfy_id]
  );
  return qfy_result.affectedRows;
};

// 查询会话内全部消息（按时间正序）
const qfy_listMessages = async (qfy_id) => {
  const [qfy_rows] = await qfy_pool.query(
    `SELECT qfy_id, qfy_role, qfy_content, qfy_tokens,
            DATE_FORMAT(qfy_created_at, '%Y-%m-%d %H:%i:%s') AS qfy_created_at
       FROM qfy_chat_message
      WHERE qfy_session_id = ?
      ORDER BY qfy_id ASC`,
    [qfy_id]
  );
  return qfy_rows;
};

// 写入一条消息
const qfy_addMessage = async (qfy_sessionId, qfy_role, qfy_content, qfy_tokens) => {
  const [qfy_result] = await qfy_pool.query(
    'INSERT INTO qfy_chat_message (qfy_session_id, qfy_role, qfy_content, qfy_tokens) VALUES (?, ?, ?, ?)',
    [qfy_sessionId, qfy_role, qfy_content, qfy_tokens || 0]
  );
  await qfy_pool.query(
    `UPDATE qfy_chat_session
        SET qfy_message_count = (SELECT COUNT(*) FROM qfy_chat_message WHERE qfy_session_id = ?),
            qfy_updated_at = NOW()
      WHERE qfy_id = ?`,
    [qfy_sessionId, qfy_sessionId]
  );
  return qfy_result.insertId;
};

// 更新会话摘要与已压缩消息数
const qfy_updateSummary = async (qfy_id, qfy_summary, qfy_summarizedCount) => {
  await qfy_pool.query(
    'UPDATE qfy_chat_session SET qfy_summary = ?, qfy_summarized_count = ? WHERE qfy_id = ?',
    [qfy_summary, qfy_summarizedCount, qfy_id]
  );
};

module.exports = {
  qfy_listSessions,
  qfy_getSession,
  qfy_createSession,
  qfy_renameSession,
  qfy_deleteSession,
  qfy_listMessages,
  qfy_addMessage,
  qfy_updateSummary
};
