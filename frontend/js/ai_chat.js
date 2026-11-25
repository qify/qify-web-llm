/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_chatMessages = document.getElementById('qfy_chat_messages');
const qfy_chatInput = document.getElementById('qfy_chat_input');
const qfy_chatSend = document.getElementById('qfy_chat_send');
const qfy_chatClear = document.getElementById('qfy_chat_clear');
const qfy_chatStatus = document.getElementById('qfy_chat_status');

const qfy_HISTORY_MAX = 20;
const qfy_HINT = '模型：Qwen/Qwen2.5-7B-Instruct · 由硅基流动提供';

let qfy_history = [];
let qfy_busy = false;

// 追加一条消息气泡（role：user / ai / error）
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
  qfy_bubble.textContent = qfy_text;

  qfy_msg.appendChild(qfy_roleLabel);
  qfy_msg.appendChild(qfy_bubble);
  qfy_chatMessages.appendChild(qfy_msg);
  qfy_chatMessages.scrollTop = qfy_chatMessages.scrollHeight;
}

// 渲染欢迎语
function qfy_renderWelcome() {
  qfy_chatMessages.innerHTML = '';
  qfy_appendMessage('ai', '你好，我是 AI 助手。可以问我编程、网页设计或任何你感兴趣的问题。');
}

// 发送消息
async function qfy_sendMessage() {
  const qfy_text = qfy_chatInput.value.trim();
  if (!qfy_text || qfy_busy) {
    return;
  }

  qfy_appendMessage('user', qfy_text);
  qfy_history.push({ role: 'user', content: qfy_text });
  while (qfy_history.length > qfy_HISTORY_MAX) {
    qfy_history.shift();
  }

  qfy_chatInput.value = '';
  qfy_busy = true;
  qfy_chatSend.disabled = true;
  qfy_chatStatus.textContent = 'AI 正在思考…';

  try {
    const qfy_resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: qfy_history })
    });
    const qfy_data = await qfy_resp.json();
    console.log('AI 聊天接口返回：', qfy_data);

    if (qfy_data.code !== 0) {
      throw new Error(qfy_data.msg || '请求失败');
    }

    qfy_appendMessage('ai', qfy_data.data.reply);
    qfy_history.push({ role: 'assistant', content: qfy_data.data.reply });
  } catch (qfy_err) {
    console.error('AI 聊天请求失败：', qfy_err);
    qfy_appendMessage('error', '请求失败：' + qfy_err.message);
  } finally {
    qfy_busy = false;
    qfy_chatSend.disabled = false;
    qfy_chatStatus.textContent = qfy_HINT;
    qfy_chatInput.focus();
  }
}

qfy_chatSend.addEventListener('click', qfy_sendMessage);

qfy_chatInput.addEventListener('keydown', (qfy_event) => {
  if (qfy_event.key === 'Enter' && !qfy_event.shiftKey) {
    qfy_event.preventDefault();
    qfy_sendMessage();
  }
});

qfy_chatClear.addEventListener('click', () => {
  qfy_history = [];
  qfy_renderWelcome();
  qfy_chatStatus.textContent = qfy_HINT;
  console.log('对话已清空');
});

qfy_renderWelcome();
