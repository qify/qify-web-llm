/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_dbForm = document.getElementById('qfy_db_form');
const qfy_usernameInput = document.getElementById('qfy_username');
const qfy_passwordInput = document.getElementById('qfy_password');
const qfy_connBtn = document.getElementById('qfy_conn_btn');
const qfy_dbMsg = document.getElementById('qfy_db_msg');

// 在页面提示区域显示结果
function qfy_showMsg(qfy_type, qfy_text) {
  qfy_dbMsg.textContent = qfy_text;
  qfy_dbMsg.className = 'qfy_msg qfy_msg_' + qfy_type;
}

// 提交表单：请求后端连接 MySQL
function qfy_handleSubmit(qfy_event) {
  qfy_event.preventDefault();

  const qfy_username = qfy_usernameInput.value.trim();
  const qfy_password = qfy_passwordInput.value;

  if (!qfy_username) {
    qfy_showMsg('error', '请输入用户名');
    return;
  }

  qfy_connBtn.disabled = true;
  qfy_connBtn.textContent = '连接中…';
  qfy_showMsg('loading', '正在连接数据库…');

  fetch('/api/db/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: qfy_username, password: qfy_password })
  })
    .then(function (qfy_res) {
      return qfy_res.json();
    })
    .then(function (qfy_result) {
      console.log('数据库连接接口返回：', qfy_result);

      if (qfy_result.code === 0) {
        const qfy_d = qfy_result.data || {};
        qfy_showMsg(
          'success',
          '连接成功！MySQL 版本：' + qfy_d.version + '，当前用户：' + qfy_d.currentUser
        );
      } else {
        qfy_showMsg('error', qfy_result.msg || '连接失败');
      }
    })
    .catch(function (qfy_err) {
      console.error('数据库连接请求失败：', qfy_err);
      qfy_showMsg('error', '请求失败：' + qfy_err.message);
    })
    .finally(function () {
      qfy_connBtn.disabled = false;
      qfy_connBtn.textContent = '连接数据库';
    });
}

qfy_dbForm.addEventListener('submit', qfy_handleSubmit);
