/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_chatMessages = document.getElementById('qfy_chat_messages');
const qfy_chatInput = document.getElementById('qfy_chat_input');
const qfy_chatSend = document.getElementById('qfy_chat_send');
const qfy_chatStop = document.getElementById('qfy_chat_stop');
const qfy_chatStatus = document.getElementById('qfy_chat_status');
const qfy_sessionList = document.getElementById('qfy_session_list');
const qfy_newSession = document.getElementById('qfy_new_session');

const qfy_HINT = '模型：deepseek-ai/DeepSeek-V4-Flash · 流式输出';
const qfy_WELCOME = '你好，我是 AI 助手。可以问我编程、网页设计或大模型应用的任何问题。左侧可以新建、切换、重命名和删除会话。';

let qfy_sessionId = null;
let qfy_busy = false;
let qfy_abort = null;

/* ---------- Markdown 渲染（不依赖第三方库） ---------- */
function qfy_escapeHtml(qfy_str) {
  return String(qfy_str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function qfy_mdToHtml(qfy_src) {
  const qfy_blocks = [];
  let qfy_text = String(qfy_src || '').replace(/```([\w+-]*)\n?([\s\S]*?)```/g, (qfy_m, qfy_lang, qfy_code) => {
    qfy_blocks.push(
      '<pre class="qfy_md_pre"><span class="qfy_md_lang">' + (qfy_lang || 'text') + '</span><code>'
      + qfy_escapeHtml(qfy_code.replace(/\n$/, '')) + '</code></pre>'
    );
    return '\u0000' + (qfy_blocks.length - 1) + '\u0000';
  });

  let qfy_html = qfy_escapeHtml(qfy_text);

  qfy_html = qfy_html
    .replace(/^#### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^## (.*)$/gm, '<h3>$1</h3>')
    .replace(/^# (.*)$/gm, '<h3>$1</h3>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code class="qfy_md_inline">$1</code>');

  qfy_html = qfy_html.replace(/(^|\n)((?:[-*] .*(?:\n|$))+)/g, (qfy_m, qfy_pre, qfy_block) => {
    const qfy_items = qfy_block.trim().split('\n')
      .map((qfy_line) => '<li>' + qfy_line.replace(/^[-*]\s+/, '') + '</li>')
      .join('');
    return qfy_pre + '<ul>' + qfy_items + '</ul>\n';
  });

  const qfy_parts = qfy_html.split(/\n{2,}/).map((qfy_part) => {
    const qfy_trim = qfy_part.trim();
    if (!qfy_trim) return '';
    if (/^<(h3|h4|h5|ul|pre|blockquote)/.test(qfy_trim) || /^\u0000\d+\u0000$/.test(qfy_trim)) return qfy_trim;
    return '<p>' + qfy_trim.replace(/\n/g, '<br>') + '</p>';
  });
  qfy_html = qfy_parts.filter(Boolean).join('\n');

  return qfy_html.replace(/\u0000(\d+)\u0000/g, (qfy_m, qfy_i) => qfy_blocks[Number(qfy_i)] || '');
}

/* ---------- 消息气泡 ---------- */
function qfy_appendMessage(qfy_role, qfy_text) {
  const qfy_msg = document.createElement('div');
  qfy_msg.className = 'qfy_chat_msg ' + (
    qfy_role === 'user' ? 'qfy_chat_msg_user'
      : qfy_role === 'error' ? 'qfy_chat_msg_ai qfy_chat_msg_error'
        : 'qfy_chat_msg_ai'
  );

  const qfy_roleLabel = document.createElement('span');
  qfy_roleLabel.className = 'qfy_chat_role';
  qfy_roleLabel.textContent = qfy_role === 'user' ? '我' : qfy_role === 'error' ? '系统提示' : 'AI 助手';

  const qfy_bubble = document.createElement('div');
  qfy_bubble.className = 'qfy_chat_bubble';
  if (qfy_role === 'user' || qfy_role === 'error') {
    qfy_bubble.textContent = qfy_text;
  } else {
    qfy_bubble.classList.add('qfy_md');
    qfy_bubble.innerHTML = qfy_mdToHtml(qfy_text);
  }

  qfy_msg.appendChild(qfy_roleLabel);
  qfy_msg.appendChild(qfy_bubble);
  qfy_chatMessages.appendChild(qfy_msg);
  qfy_chatMessages.scrollTop = qfy_chatMessages.scrollHeight;
  return qfy_bubble;
}

function qfy_resetMessages() {
  qfy_chatMessages.innerHTML = '';
  qfy_appendMessage('ai', qfy_WELCOME);
}

/* ---------- 会话列表 ---------- */
async function qfy_loadSessions() {
  try {
    const qfy_resp = await fetch('/api/ai/sessions');
    const qfy_data = await qfy_resp.json();
    console.log('会话列表接口返回：', qfy_data);
    if (qfy_data.code !== 0) throw new Error(qfy_data.msg);

    qfy_sessionList.innerHTML = '';
    qfy_data.data.list.forEach((qfy_item) => {
      const qfy_li = document.createElement('li');
      qfy_li.className = 'qfy_session_item' + (Number(qfy_item.qfy_id) === Number(qfy_sessionId) ? ' qfy_session_active' : '');

      const qfy_titleBtn = document.createElement('button');
      qfy_titleBtn.type = 'button';
      qfy_titleBtn.className = 'qfy_session_title';
      qfy_titleBtn.textContent = qfy_item.qfy_title;
      qfy_titleBtn.title = '点击加载会话 · 共 ' + qfy_item.qfy_message_count + ' 条消息';
      qfy_titleBtn.addEventListener('click', () => qfy_openSession(qfy_item.qfy_id));

      const qfy_ops = document.createElement('span');
      qfy_ops.className = 'qfy_session_ops';

      const qfy_renameBtn = document.createElement('button');
      qfy_renameBtn.type = 'button';
      qfy_renameBtn.className = 'qfy_icon_btn';
      qfy_renameBtn.textContent = '✎';
      qfy_renameBtn.title = '重命名';
      qfy_renameBtn.addEventListener('click', (qfy_ev) => {
        qfy_ev.stopPropagation();
        qfy_renameSession(qfy_item.qfy_id, qfy_item.qfy_title);
      });

      const qfy_delBtn = document.createElement('button');
      qfy_delBtn.type = 'button';
      qfy_delBtn.className = 'qfy_icon_btn qfy_icon_danger';
      qfy_delBtn.textContent = '×';
      qfy_delBtn.title = '删除会话';
      qfy_delBtn.addEventListener('click', (qfy_ev) => {
        qfy_ev.stopPropagation();
        qfy_deleteSession(qfy_item.qfy_id);
      });

      qfy_ops.appendChild(qfy_renameBtn);
      qfy_ops.appendChild(qfy_delBtn);
      qfy_li.appendChild(qfy_titleBtn);
      qfy_li.appendChild(qfy_ops);
      qfy_sessionList.appendChild(qfy_li);
    });
  } catch (qfy_err) {
    console.error('加载会话列表失败：', qfy_err);
    qfy_chatStatus.textContent = '会话列表加载失败：' + qfy_err.message;
  }
}

/* ---------- 打开会话（历史回放） ---------- */
async function qfy_openSession(qfy_id) {
  if (qfy_busy) return;
  try {
    const qfy_resp = await fetch('/api/ai/sessions/' + qfy_id + '/messages');
    const qfy_data = await qfy_resp.json();
    console.log('历史消息接口返回：', qfy_data);
    if (qfy_data.code !== 0) throw new Error(qfy_data.msg);

    qfy_sessionId = Number(qfy_id);
    qfy_chatMessages.innerHTML = '';
    if (qfy_data.data.list.length === 0) {
      qfy_appendMessage('ai', qfy_WELCOME);
    } else {
      qfy_data.data.list.forEach((qfy_item) => {
        qfy_appendMessage(qfy_item.role === 'user' ? 'user' : 'ai', qfy_item.content);
      });
    }

    qfy_chatStatus.textContent = '会话 #' + qfy_sessionId + ' · ' + qfy_data.data.session.qfy_title
      + ' · 共 ' + qfy_data.data.total + ' 条消息';
    qfy_loadSessions();
  } catch (qfy_err) {
    console.error('加载历史消息失败：', qfy_err);
    qfy_chatStatus.textContent = '加载历史失败：' + qfy_err.message;
  }
}

/* ---------- 新建 / 重命名 / 删除 ---------- */
async function qfy_createSession() {
  if (qfy_busy) return;
  try {
    const qfy_resp = await fetch('/api/ai/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '新的对话' })
    });
    const qfy_data = await qfy_resp.json();
    console.log('新建会话接口返回：', qfy_data);
    if (qfy_data.code !== 0) throw new Error(qfy_data.msg);

    qfy_sessionId = Number(qfy_data.data.sessionId);
    qfy_resetMessages();
    qfy_chatStatus.textContent = '会话 #' + qfy_sessionId + ' · 新的对话 · 发送后自动生成标题';
    qfy_loadSessions();
    qfy_chatInput.focus();
  } catch (qfy_err) {
    console.error('新建会话失败：', qfy_err);
    qfy_chatStatus.textContent = '新建会话失败：' + qfy_err.message;
  }
}

async function qfy_renameSession(qfy_id, qfy_oldTitle) {
  const qfy_title = prompt('请输入新的会话标题：', qfy_oldTitle);
  if (qfy_title === null) return;
  const qfy_clean = qfy_title.trim();
  if (!qfy_clean) return;

  try {
    const qfy_resp = await fetch('/api/ai/sessions/' + qfy_id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: qfy_clean })
    });
    const qfy_data = await qfy_resp.json();
    console.log('重命名接口返回：', qfy_data);
    if (qfy_data.code !== 0) throw new Error(qfy_data.msg);
    qfy_loadSessions();
  } catch (qfy_err) {
    console.error('重命名失败：', qfy_err);
    qfy_chatStatus.textContent = '重命名失败：' + qfy_err.message;
  }
}

async function qfy_deleteSession(qfy_id) {
  if (!confirm('确定删除该会话及其全部消息吗？删除后不可恢复。')) return;
  try {
    const qfy_resp = await fetch('/api/ai/sessions/' + qfy_id, { method: 'DELETE' });
    const qfy_data = await qfy_resp.json();
    console.log('删除会话接口返回：', qfy_data);
    if (qfy_data.code !== 0) throw new Error(qfy_data.msg);

    if (Number(qfy_id) === Number(qfy_sessionId)) {
      qfy_sessionId = null;
      qfy_resetMessages();
      qfy_chatStatus.textContent = qfy_HINT;
    }
    qfy_loadSessions();
  } catch (qfy_err) {
    console.error('删除会话失败：', qfy_err);
    qfy_chatStatus.textContent = '删除失败：' + qfy_err.message;
  }
}

/* ---------- 发送（流式 + 可中断） ---------- */
function qfy_setBusy(qfy_flag) {
  qfy_busy = qfy_flag;
  qfy_chatSend.disabled = qfy_flag;
  qfy_chatStop.disabled = !qfy_flag;
}

async function qfy_sendMessage() {
  const qfy_text = qfy_chatInput.value.trim();
  if (!qfy_text || qfy_busy) return;

  if (!qfy_sessionId) {
    await qfy_createSession();
    if (!qfy_sessionId) return;
  }

  qfy_appendMessage('user', qfy_text);
  qfy_chatInput.value = '';
  qfy_setBusy(true);
  qfy_chatStatus.textContent = 'AI 正在思考…';

  const qfy_bubble = qfy_appendMessage('ai', '');
  let qfy_reply = '';
  let qfy_aborted = false;
  qfy_abort = new AbortController();

  try {
    const qfy_payload = { sessionId: qfy_sessionId, message: qfy_text };
    console.log('发送给后端的数据：', qfy_payload);

    const qfy_resp = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qfy_payload),
      signal: qfy_abort.signal
    });

    if (!qfy_resp.ok) {
      throw new Error('HTTP ' + qfy_resp.status);
    }

    const qfy_reader = qfy_resp.body.getReader();
    const qfy_decoder = new TextDecoder('utf-8');
    let qfy_buffer = '';

    while (true) {
      const qfy_read = await qfy_reader.read();
      if (qfy_read.done) break;
      qfy_buffer += qfy_decoder.decode(qfy_read.value, { stream: true });

      const qfy_events = qfy_buffer.split('\n\n');
      qfy_buffer = qfy_events.pop() || '';

      for (const qfy_event of qfy_events) {
        const qfy_line = qfy_event.split('\n').find((qfy_l) => qfy_l.startsWith('data:'));
        if (!qfy_line) continue;
        let qfy_json;
        try { qfy_json = JSON.parse(qfy_line.slice(5).trim()); } catch (qfy_e) { continue; }

        if (qfy_json.type === 'start') {
          console.log('流式开始：', qfy_json);
          qfy_chatStatus.textContent = '会话 #' + qfy_json.sessionId + ' · 上下文 ' + qfy_json.contextCount + ' 条'
            + (qfy_json.summary ? ' · 已启用历史摘要' : '');
        } else if (qfy_json.type === 'delta') {
          qfy_reply += qfy_json.content;
          qfy_bubble.innerHTML = qfy_mdToHtml(qfy_reply);
          qfy_chatMessages.scrollTop = qfy_chatMessages.scrollHeight;
        } else if (qfy_json.type === 'done') {
          console.log('流式完成：', qfy_json);
          qfy_reply = qfy_json.reply || qfy_reply;
          qfy_bubble.innerHTML = qfy_mdToHtml(qfy_reply);
        } else if (qfy_json.type === 'error') {
          throw new Error(qfy_json.msg || '大模型调用失败');
        }
      }
    }
  } catch (qfy_err) {
    if (qfy_err.name === 'AbortError') {
      qfy_aborted = true;
      console.warn('用户已中断本次回复');
      if (qfy_reply) {
        qfy_bubble.innerHTML = qfy_mdToHtml(qfy_reply + '\n\n*（已手动停止）*');
      } else {
        qfy_bubble.textContent = '（已停止）';
      }
    } else {
      console.error('AI 聊天请求失败：', qfy_err);
      if (qfy_reply) {
        qfy_bubble.innerHTML = qfy_mdToHtml(qfy_reply);
        qfy_appendMessage('error', '回复中断：' + qfy_err.message);
      } else {
        qfy_bubble.textContent = '';
        qfy_bubble.parentElement.classList.add('qfy_chat_msg_error');
        qfy_bubble.textContent = '请求失败：' + qfy_err.message;
      }
    }
  } finally {
    qfy_abort = null;
    qfy_setBusy(false);
    if (!qfy_aborted) {
      qfy_chatStatus.textContent = qfy_HINT;
    } else {
      qfy_chatStatus.textContent = '已停止 · ' + qfy_HINT;
    }
    qfy_chatInput.focus();
    qfy_loadSessions();
  }
}

qfy_chatSend.addEventListener('click', qfy_sendMessage);
qfy_newSession.addEventListener('click', qfy_createSession);

qfy_chatStop.addEventListener('click', () => {
  if (qfy_abort) {
    qfy_abort.abort();
  }
});

qfy_chatInput.addEventListener('keydown', (qfy_event) => {
  if (qfy_event.key === 'Enter' && !qfy_event.shiftKey) {
    qfy_event.preventDefault();
    qfy_sendMessage();
  }
});

qfy_resetMessages();
qfy_chatStatus.textContent = qfy_HINT;
qfy_loadSessions();
