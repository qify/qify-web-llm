/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_serviceMessages = document.getElementById('qfy_service_messages');
const qfy_serviceInput = document.getElementById('qfy_service_input');
const qfy_serviceSend = document.getElementById('qfy_service_send');
const qfy_serviceClear = document.getElementById('qfy_service_clear');
const qfy_serviceStatus = document.getElementById('qfy_service_status');
const qfy_serviceQuick = document.getElementById('qfy_service_quick');
const qfy_serviceProvider = document.getElementById('qfy_service_provider');

const qfy_HISTORY_MAX = 20;
const qfy_HINT = '客服在线 · 当前服务商：';
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
  qfy_roleLabel.textContent = qfy_role === 'user' ? '我' : qfy_role === 'error' ? '系统提示' : '客服小助手';

  const qfy_bubble = document.createElement('div');
  qfy_bubble.className = 'qfy_chat_bubble';
  qfy_bubble.textContent = qfy_text;

  qfy_msg.appendChild(qfy_roleLabel);
  qfy_msg.appendChild(qfy_bubble);
  qfy_serviceMessages.appendChild(qfy_msg);
  qfy_serviceMessages.scrollTop = qfy_serviceMessages.scrollHeight;
}

// 渲染欢迎语
function qfy_renderWelcome() {
  qfy_serviceMessages.innerHTML = '';
  qfy_appendMessage('ai', '您好，欢迎来到中华美食街！营业时间、招牌菜、配送范围的问题都可以问我，其他问题请在留言区留下联系方式。');
}

// 更新底部状态提示
function qfy_renderHint() {
  qfy_serviceStatus.textContent = qfy_HINT + qfy_serviceProvider.options[qfy_serviceProvider.selectedIndex].text;
}

// 发送消息
async function qfy_sendMessage(qfy_presetText) {
  const qfy_text = (qfy_presetText || qfy_serviceInput.value).trim();
  if (!qfy_text || qfy_busy) {
    return;
  }

  qfy_appendMessage('user', qfy_text);
  qfy_history.push({ role: 'user', content: qfy_text });
  while (qfy_history.length > qfy_HISTORY_MAX) {
    qfy_history.shift();
  }

  qfy_serviceInput.value = '';
  qfy_busy = true;
  qfy_serviceSend.disabled = true;
  qfy_serviceStatus.textContent = '正在思考…';

  try {
    const qfy_resp = await fetch('/api/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: qfy_serviceProvider.value,
        messages: qfy_history
      })
    });
    const qfy_data = await qfy_resp.json();
    console.log('在线客服接口返回：', qfy_data);

    if (qfy_data.code !== 0) {
      throw new Error(qfy_data.msg || '请求失败');
    }

    qfy_appendMessage('ai', qfy_data.data.reply);
    qfy_history.push({ role: 'assistant', content: qfy_data.data.reply });
  } catch (qfy_err) {
    console.error('在线客服请求失败：', qfy_err);
    qfy_appendMessage('error', '请求失败：' + qfy_err.message);
  } finally {
    qfy_busy = false;
    qfy_serviceSend.disabled = false;
    qfy_renderHint();
    qfy_serviceInput.focus();
  }
}

qfy_serviceSend.addEventListener('click', () => qfy_sendMessage());

qfy_serviceInput.addEventListener('keydown', (qfy_event) => {
  if (qfy_event.key === 'Enter' && !qfy_event.shiftKey) {
    qfy_event.preventDefault();
    qfy_sendMessage();
  }
});

qfy_serviceClear.addEventListener('click', () => {
  qfy_history = [];
  qfy_renderWelcome();
  qfy_renderHint();
  console.log('客服对话已清空');
});

qfy_serviceQuick.addEventListener('click', (qfy_event) => {
  if (qfy_event.target.classList.contains('qfy_service_chip')) {
    qfy_sendMessage(qfy_event.target.textContent);
  }
});

// 切换服务商：清空历史，避免跨平台上下文混淆
qfy_serviceProvider.addEventListener('change', () => {
  qfy_history = [];
  qfy_renderWelcome();
  qfy_renderHint();
  console.log('服务商已切换为：', qfy_serviceProvider.options[qfy_serviceProvider.selectedIndex].text);
});

qfy_renderWelcome();
qfy_renderHint();
