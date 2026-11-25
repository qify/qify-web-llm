/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const qfy_MODEL = process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const qfy_SYSTEM_PROMPT = '你是网页设计课程作业中的 AI 助手，回答简洁、准确、友好，默认使用中文作答。';
const qfy_MAX_MESSAGES = 20;
const qfy_MAX_CONTENT = 4000;

// AI 聊天：接收对话历史，调用硅基流动接口并返回回复
const qfy_chat = async (req, res) => {
  const qfy_messages = req.body && req.body.messages;

  if (!Array.isArray(qfy_messages) || qfy_messages.length === 0) {
    return res.json({ code: 3001, msg: '参数错误：messages 必须为非空数组', data: null });
  }
  if (qfy_messages.length > qfy_MAX_MESSAGES) {
    return res.json({ code: 3001, msg: '参数错误：messages 不能超过 ' + qfy_MAX_MESSAGES + ' 条', data: null });
  }
  const qfy_invalid = qfy_messages.some((qfy_item) => {
    const qfy_okRole = qfy_item && (qfy_item.role === 'user' || qfy_item.role === 'assistant');
    const qfy_okContent = qfy_item && typeof qfy_item.content === 'string' && qfy_item.content.trim() !== '';
    return !qfy_okRole || !qfy_okContent || qfy_item.content.length > qfy_MAX_CONTENT;
  });
  if (qfy_invalid) {
    return res.json({ code: 3001, msg: '参数错误：每条消息需包含 role（user/assistant）和 content（1~' + qfy_MAX_CONTENT + ' 字）', data: null });
  }

  const qfy_key = process.env.SILICONFLOW_API_KEY;
  if (!qfy_key) {
    return res.json({ code: 3003, msg: '服务未配置：缺少 SILICONFLOW_API_KEY', data: null });
  }

  const qfy_body = {
    model: qfy_MODEL,
    messages: [{ role: 'system', content: qfy_SYSTEM_PROMPT }].concat(
      qfy_messages.map((qfy_item) => ({ role: qfy_item.role, content: qfy_item.content }))
    ),
    max_tokens: 1024,
    temperature: 0.7,
    stream: false
  };

  try {
    const qfy_abort = new AbortController();
    const qfy_timer = setTimeout(() => qfy_abort.abort(), 60000);

    const qfy_resp = await fetch(qfy_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + qfy_key
      },
      body: JSON.stringify(qfy_body),
      signal: qfy_abort.signal
    });
    clearTimeout(qfy_timer);

    const qfy_data = await qfy_resp.json();

    if (!qfy_resp.ok) {
      console.error('硅基流动接口返回错误：', qfy_resp.status, JSON.stringify(qfy_data));
      return res.json({
        code: 3002,
        msg: 'AI 服务调用失败：' + (qfy_data.message || 'HTTP ' + qfy_resp.status),
        data: null
      });
    }

    const qfy_reply = qfy_data.choices && qfy_data.choices[0] && qfy_data.choices[0].message
      ? qfy_data.choices[0].message.content
      : '';

    if (!qfy_reply) {
      return res.json({ code: 3002, msg: 'AI 服务未返回内容', data: null });
    }

    res.json({
      code: 0,
      msg: '回复成功',
      data: {
        reply: qfy_reply,
        model: qfy_data.model || qfy_MODEL,
        usage: qfy_data.usage || null
      }
    });
  } catch (qfy_err) {
    console.error('调用硅基流动接口异常：', qfy_err.message);
    res.json({ code: 3002, msg: 'AI 服务请求异常：' + qfy_err.message, data: null });
  }
};

module.exports = { qfy_chat };
