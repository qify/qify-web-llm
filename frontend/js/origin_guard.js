/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
说明：统一来源检查。若页面不是通过 http://localhost:8031 打开（例如双击 file:// 或被其他本地服务器托管），
     页面内的 /api 请求会全部失败并提示 "Failed to fetch"，这里直接给出明确提示。
*/
(function qfy_checkOrigin() {
  const qfy_isFile = window.location.protocol === 'file:';
  const qfy_isRightPort = window.location.port === '8031';

  if (!qfy_isFile && qfy_isRightPort) {
    return;
  }

  const qfy_bar = document.createElement('div');
  qfy_bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;padding:10px 16px;'
    + 'background:#7f1d1d;color:#fecaca;font:13px/1.6 system-ui,sans-serif;text-align:center;'
    + 'border-bottom:1px solid #b91c1c';

  qfy_bar.innerHTML = '当前页面不是通过后端地址打开的，接口请求会失败（Failed to fetch）。'
    + '请访问 <a href="http://localhost:8031/' + (window.location.pathname.split('/').pop() || 'index.html')
    + '" style="color:#fca5a5;text-decoration:underline">http://localhost:8031/'
    + (window.location.pathname.split('/').pop() || 'index.html') + '</a>';

  document.body.insertBefore(qfy_bar, document.body.firstChild);
  console.warn('页面来源非 http://localhost:8031，接口请求将失败。');
})();
