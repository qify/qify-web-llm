/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_model = require('../models/qfy_chatSessionModel');

// 硅基流动配置（密钥只存在于后端 .env）
const qfy_BASE_URL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
const qfy_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';
const qfy_API_KEY = process.env.SILICONFLOW_API_KEY;

// 系统提示词：角色、任务、约束、输出格式
const qfy_SYSTEM_PROMPT = [
  '你是「高级网页设计」课程项目中的 AI 助手，服务对象是计算机专业本科生。',
  '任务：回答编程、网页设计、大模型应用相关的问题，帮助用户理解概念与排查错误。',
  '约束：',
  '1. 默认使用简体中文，语气友好、直接，不使用夸张修辞；',
  '2. 不确定的内容要明确说明不确定，不要编造事实、链接或库名；',
  '3. 涉及代码时给出可运行的最小示例，并说明依赖与运行方式；',
  '4. 单次回答控制在 400 字以内，优先给结论，再给必要解释。',
  '输出格式：使用 Markdown，正文用短段落与无序列表，代码放在三反引号代码块中并标注语言。'
].join('\n');

// 上下文压缩参数
const qfy_KEEP_RECENT = 12;        // 保留最近 12 条原文（约 6 轮）
const qfy_MAX_INPUT = 2000;       // 单条用户输入上限
const qfy_TIMEOUT = 90000;        // 单次调用超时

// 粗略估算 Token：中文约 1.5 字 / token
const qfy_estimateTokens = (qfy_text) => Math.ceil((qfy_text || '').length / 1.5);

// 统一调用大模型（非流式）
const qfy_callLLMOnce = async (qfy_messages, qfy_option) => {
  const qfy_opt = qfy_option || {};
  const qfy_abort = new AbortController();
  const qfy_timer = setTimeout(() => qfy_abort.abort(), qfy_opt.timeout || qfy_TIMEOUT);
  try {
    const qfy_resp = await fetch(qfy_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + qfy_API_KEY
      },
      body: JSON.stringify({
        model: qfy_MODEL,
        messages: qfy_messages,
        max_tokens: qfy_opt.maxTokens || 1024,
        temperature: qfy_opt.temperature === undefined ? 0.7 : qfy_opt.temperature,
        stream: false
      }),
      signal: qfy_abort.signal
    });
    const qfy_data = await qfy_resp.json();
    if (!qfy_resp.ok) {
      throw new Error((qfy_data && qfy_data.message) || ('HTTP ' + qfy_resp.status));
    }
    return qfy_data;
  } finally {
    clearTimeout(qfy_timer);
  }
};

// 将早期消息压缩为摘要（合并旧摘要）
const qfy_summarize = async (qfy_prevSummary, qfy_msgs) => {
  const qfy_dialog = qfy_msgs
    .map((qfy_item) => (qfy_item.qfy_role === 'user' ? '用户：' : '助手：') + qfy_item.qfy_content)
    .join('\n');

  const qfy_prompt = [
    {
      role: 'system',
      content: '你是对话摘要器。把给定的历史对话压缩为 200 字以内的中文摘要，保留用户的核心需求、关键结论与未完成事项，不要添加评论。'
    },
    {
      role: 'user',
      content: (qfy_prevSummary ? '已有摘要：' + qfy_prevSummary + '\n\n' : '') + '需要压缩的对话：\n' + qfy_dialog
    }
  ];

  try {
    const qfy_data = await qfy_callLLMOnce(qfy_prompt, { maxTokens: 320, temperature: 0.3, timeout: 45000 });
    const qfy_text = qfy_data.choices && qfy_data.choices[0] && qfy_data.choices[0].message
      ? qfy_data.choices[0].message.content.trim()
      : '';
    return qfy_text.slice(0, 600);
  } catch (qfy_err) {
    console.error('上下文压缩失败，沿用旧摘要：', qfy_err.message);
    return qfy_prevSummary || '';
  }
};

// 组装发送给模型的消息：system + 历史摘要 + 最近若干轮
const qfy_buildContext = async (qfy_session) => {
  const qfy_all = await qfy_model.qfy_listMessages(qfy_session.qfy_id);
  let qfy_summary = qfy_session.qfy_summary || '';
  let qfy_summarized = qfy_session.qfy_summarized_count || 0;

  // 超出保留窗口的早期消息压缩进摘要
  if (qfy_all.length - qfy_summarized > qfy_KEEP_RECENT) {
    const qfy_old = qfy_all.slice(qfy_summarized, qfy_all.length - qfy_KEEP_RECENT);
    qfy_summary = await qfy_summarize(qfy_summary, qfy_old);
    qfy_summarized = qfy_all.length - qfy_KEEP_RECENT;
    await qfy_model.qfy_updateSummary(qfy_session.qfy_id, qfy_summary, qfy_summarized);
  }

  const qfy_recent = qfy_all.slice(-qfy_KEEP_RECENT);
  const qfy_messages = [{ role: 'system', content: qfy_SYSTEM_PROMPT }];
  if (qfy_summary) {
    qfy_messages.push({ role: 'system', content: '【早前对话摘要】' + qfy_summary });
  }
  qfy_recent.forEach((qfy_item) => {
    qfy_messages.push({ role: qfy_item.qfy_role, content: qfy_item.qfy_content });
  });

  return {
    messages: qfy_messages,
    summary: qfy_summary,
    summarizedCount: qfy_summarized,
    totalMessages: qfy_all.length,
    rawMessages: qfy_recent
  };
};

// 自动生成会话标题（取首条消息前 20 字）
const qfy_makeTitle = (qfy_text) => {
  const qfy_clean = qfy_text.replace(/\s+/g, ' ').trim();
  return qfy_clean.length > 20 ? qfy_clean.slice(0, 20) + '…' : qfy_clean;
};

// 参数与配置校验，返回错误信息或 null
const qfy_validate = (qfy_sessionId, qfy_message) => {
  if (!qfy_API_KEY) {
    return { code: 4003, msg: '服务未配置：缺少 SILICONFLOW_API_KEY' };
  }
  if (typeof qfy_message !== 'string' || qfy_message.trim() === '') {
    return { code: 4001, msg: '参数错误：message 不能为空' };
  }
  if (qfy_message.length > qfy_MAX_INPUT) {
    return { code: 4001, msg: '参数错误：message 不能超过 ' + qfy_MAX_INPUT + ' 字' };
  }
  if (qfy_sessionId !== undefined && qfy_sessionId !== null && qfy_sessionId !== '' && isNaN(Number(qfy_sessionId))) {
    return { code: 4001, msg: '参数错误：sessionId 必须为数字' };
  }
  return null;
};

// 准备会话：取已有会话或自动新建，并登记用户消息
const qfy_prepareSession = async (qfy_sessionId, qfy_message) => {
  let qfy_session = null;
  if (qfy_sessionId) {
    qfy_session = await qfy_model.qfy_getSession(Number(qfy_sessionId));
    if (!qfy_session) {
      return { error: { code: 4002, msg: '会话不存在：' + qfy_sessionId } };
    }
  } else {
    const qfy_newId = await qfy_model.qfy_createSession(qfy_makeTitle(qfy_message));
    qfy_session = await qfy_model.qfy_getSession(qfy_newId);
  }

  if (qfy_session.qfy_title === '新的对话' && qfy_session.qfy_message_count === 0) {
    await qfy_model.qfy_renameSession(qfy_session.qfy_id, qfy_makeTitle(qfy_message));
    qfy_session.qfy_title = qfy_makeTitle(qfy_message);
  }

  await qfy_model.qfy_addMessage(qfy_session.qfy_id, 'user', qfy_message, qfy_estimateTokens(qfy_message));
  return { session: qfy_session };
};

// 会话列表
const qfy_listSessions = async (req, res) => {
  try {
    const qfy_rows = await qfy_model.qfy_listSessions();
    res.json({ code: 0, msg: '查询成功', data: { total: qfy_rows.length, list: qfy_rows } });
  } catch (qfy_err) {
    console.error('查询会话列表失败：', qfy_err.message);
    res.json({ code: 5001, msg: '查询会话列表失败：' + qfy_err.message, data: null });
  }
};

// 新建会话
const qfy_createSession = async (req, res) => {
  try {
    const qfy_title = (req.body && req.body.title) || '新的对话';
    const qfy_id = await qfy_model.qfy_createSession(String(qfy_title).slice(0, 120));
    res.json({ code: 0, msg: '创建成功', data: { sessionId: qfy_id } });
  } catch (qfy_err) {
    console.error('创建会话失败：', qfy_err.message);
    res.json({ code: 5002, msg: '创建会话失败：' + qfy_err.message, data: null });
  }
};

// 重命名会话
const qfy_renameSession = async (req, res) => {
  try {
    const qfy_id = Number(req.params.id);
    const qfy_title = req.body && req.body.title ? String(req.body.title).trim() : '';
    if (!qfy_title || qfy_title.length > 120) {
      return res.json({ code: 4001, msg: '参数错误：title 需为 1~120 字', data: null });
    }
    const qfy_rows = await qfy_model.qfy_renameSession(qfy_id, qfy_title);
    if (!qfy_rows) {
      return res.json({ code: 4002, msg: '会话不存在', data: null });
    }
    res.json({ code: 0, msg: '重命名成功', data: { sessionId: qfy_id, title: qfy_title } });
  } catch (qfy_err) {
    console.error('重命名会话失败：', qfy_err.message);
    res.json({ code: 5003, msg: '重命名失败：' + qfy_err.message, data: null });
  }
};

// 删除会话
const qfy_deleteSession = async (req, res) => {
  try {
    const qfy_id = Number(req.params.id);
    const qfy_rows = await qfy_model.qfy_deleteSession(qfy_id);
    if (!qfy_rows) {
      return res.json({ code: 4002, msg: '会话不存在', data: null });
    }
    res.json({ code: 0, msg: '删除成功', data: { sessionId: qfy_id } });
  } catch (qfy_err) {
    console.error('删除会话失败：', qfy_err.message);
    res.json({ code: 5004, msg: '删除失败：' + qfy_err.message, data: null });
  }
};

// 查询会话历史消息
const qfy_listMessages = async (req, res) => {
  try {
    const qfy_id = Number(req.params.id);
    const qfy_session = await qfy_model.qfy_getSession(qfy_id);
    if (!qfy_session) {
      return res.json({ code: 4002, msg: '会话不存在', data: null });
    }
    const qfy_rows = await qfy_model.qfy_listMessages(qfy_id);
    res.json({
      code: 0,
      msg: '查询成功',
      data: {
        session: qfy_session,
        total: qfy_rows.length,
        list: qfy_rows.map((qfy_item) => ({
          id: qfy_item.qfy_id,
          role: qfy_item.qfy_role,
          content: qfy_item.qfy_content,
          createdAt: qfy_item.qfy_created_at
        }))
      }
    });
  } catch (qfy_err) {
    console.error('查询历史消息失败：', qfy_err.message);
    res.json({ code: 5005, msg: '查询历史消息失败：' + qfy_err.message, data: null });
  }
};

// 非流式问答：POST /api/ai/chat
const qfy_chat = async (req, res) => {
  const qfy_body = req.body || {};
  const qfy_invalid = qfy_validate(qfy_body.sessionId, qfy_body.message);
  if (qfy_invalid) {
    return res.json({ code: qfy_invalid.code, msg: qfy_invalid.msg, data: null });
  }

  try {
    const qfy_prepared = await qfy_prepareSession(qfy_body.sessionId, qfy_body.message);
    if (qfy_prepared.error) {
      return res.json({ code: qfy_prepared.error.code, msg: qfy_prepared.error.msg, data: null });
    }
    const qfy_session = qfy_prepared.session;
    const qfy_ctx = await qfy_buildContext(qfy_session);

    console.log('=== 发送给大模型的数据（/api/ai/chat）===');
    console.log(JSON.stringify(qfy_ctx.messages, null, 2));

    const qfy_data = await qfy_callLLMOnce(qfy_ctx.messages);
    const qfy_reply = qfy_data.choices && qfy_data.choices[0] && qfy_data.choices[0].message
      ? qfy_data.choices[0].message.content
      : '';

    console.log('=== 接自大模型的数据（/api/ai/chat）===');
    console.log(qfy_reply);

    if (!qfy_reply) {
      return res.json({ code: 4004, msg: '大模型未返回内容', data: null });
    }

    const qfy_msgId = await qfy_model.qfy_addMessage(
      qfy_session.qfy_id, 'assistant', qfy_reply, qfy_estimateTokens(qfy_reply)
    );

    res.json({
      code: 0,
      msg: '回复成功',
      data: {
        sessionId: qfy_session.qfy_id,
        messageId: qfy_msgId,
        reply: qfy_reply,
        model: qfy_data.model || qfy_MODEL,
        usage: qfy_data.usage || null,
        summary: qfy_ctx.summary || '',
        contextCount: qfy_ctx.messages.length
      }
    });
  } catch (qfy_err) {
    console.error('AI 问答失败：', qfy_err.message);
    res.json({ code: 4004, msg: '大模型调用失败：' + qfy_err.message, data: null });
  }
};

// 流式问答：POST /api/ai/chat/stream（SSE）
const qfy_chatStream = async (req, res) => {
  const qfy_body = req.body || {};
  const qfy_invalid = qfy_validate(qfy_body.sessionId, qfy_body.message);
  if (qfy_invalid) {
    return res.json({ code: qfy_invalid.code, msg: qfy_invalid.msg, data: null });
  }

  let qfy_session;
  let qfy_ctx;
  try {
    const qfy_prepared = await qfy_prepareSession(qfy_body.sessionId, qfy_body.message);
    if (qfy_prepared.error) {
      return res.json({ code: qfy_prepared.error.code, msg: qfy_prepared.error.msg, data: null });
    }
    qfy_session = qfy_prepared.session;
    qfy_ctx = await qfy_buildContext(qfy_session);
  } catch (qfy_err) {
    console.error('流式问答准备失败：', qfy_err.message);
    return res.json({ code: 4004, msg: '准备对话上下文失败：' + qfy_err.message, data: null });
  }

  console.log('=== 发送给大模型的数据（/api/ai/chat/stream）===');
  console.log(JSON.stringify(qfy_ctx.messages, null, 2));

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const qfy_send = (qfy_obj) => {
    res.write('data: ' + JSON.stringify(qfy_obj) + '\n\n');
  };

  qfy_send({
    type: 'start',
    sessionId: qfy_session.qfy_id,
    summary: qfy_ctx.summary || '',
    contextCount: qfy_ctx.messages.length
  });

  const qfy_abort = new AbortController();
  const qfy_timer = setTimeout(() => qfy_abort.abort(), qfy_TIMEOUT);
  let qfy_closed = false;

  // 浏览器点「停止」或关闭页面时中断上游请求
  req.on('close', () => {
    qfy_closed = true;
    qfy_abort.abort();
  });

  try {
    const qfy_resp = await fetch(qfy_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + qfy_API_KEY
      },
      body: JSON.stringify({
        model: qfy_MODEL,
        messages: qfy_ctx.messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: true
      }),
      signal: qfy_abort.signal
    });

    if (!qfy_resp.ok) {
      let qfy_text = '';
      try { qfy_text = await qfy_resp.text(); } catch (qfy_e) { qfy_text = ''; }
      throw new Error('HTTP ' + qfy_resp.status + ' ' + qfy_text.slice(0, 200));
    }

    const qfy_decoder = new TextDecoder('utf-8');
    let qfy_buffer = '';
    let qfy_reply = '';

    for await (const qfy_chunk of qfy_resp.body) {
      qfy_buffer += qfy_decoder.decode(qfy_chunk, { stream: true });
      const qfy_lines = qfy_buffer.split('\n');
      qfy_buffer = qfy_lines.pop() || '';

      for (const qfy_line of qfy_lines) {
        const qfy_trim = qfy_line.trim();
        if (!qfy_trim.startsWith('data:')) continue;
        const qfy_payload = qfy_trim.slice(5).trim();
        if (!qfy_payload || qfy_payload === '[DONE]') continue;

        let qfy_json;
        try { qfy_json = JSON.parse(qfy_payload); } catch (qfy_e) { continue; }
        const qfy_delta = qfy_json.choices && qfy_json.choices[0] && qfy_json.choices[0].delta
          ? qfy_json.choices[0].delta.content
          : '';
        if (qfy_delta) {
          qfy_reply += qfy_delta;
          qfy_send({ type: 'delta', content: qfy_delta });
        }
      }
    }

    clearTimeout(qfy_timer);

    console.log('=== 接自大模型的数据（/api/ai/chat/stream）===');
    console.log(qfy_reply);

    if (qfy_closed) {
      console.log('客户端已中断，未保存 AI 回复');
      return;
    }

    if (!qfy_reply) {
      qfy_send({ type: 'error', msg: '大模型未返回内容' });
      return res.end();
    }

    const qfy_msgId = await qfy_model.qfy_addMessage(
      qfy_session.qfy_id, 'assistant', qfy_reply, qfy_estimateTokens(qfy_reply)
    );

    qfy_send({
      type: 'done',
      sessionId: qfy_session.qfy_id,
      messageId: qfy_msgId,
      model: qfy_MODEL,
      reply: qfy_reply
    });
    res.end();
  } catch (qfy_err) {
    clearTimeout(qfy_timer);
    if (qfy_closed || qfy_err.name === 'AbortError') {
      console.log('流式请求已中断：', qfy_err.message);
      return res.end();
    }
    console.error('流式问答失败：', qfy_err.message);
    qfy_send({ type: 'error', msg: '大模型调用失败：' + qfy_err.message });
    res.end();
  }
};

module.exports = {
  qfy_listSessions,
  qfy_createSession,
  qfy_renameSession,
  qfy_deleteSession,
  qfy_listMessages,
  qfy_chat,
  qfy_chatStream
};
