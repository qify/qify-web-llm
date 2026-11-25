/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_tabs = document.querySelectorAll('.qfy_tab');
const qfy_frame = document.getElementById('qfy_practice_frame');
const qfy_hint = document.getElementById('qfy_practice_hint');

// 每个 tab 对应的演示提示
const qfy_hints = {
  'customer-service.html': '演示 1：在下方页面「服务商」下拉框切换硅基流动 / 七牛，然后继续提问，对话照常进行。',
  'knowledge.html': '演示 2：在下方页面上传自己的知识库文件，等待切块完成，再提问验证；可删除文件观察列表同步变化。',
  'vision.html': '演示 3：在下方页面选择一张图片，点击「识别图片」，查看返回的画面描述。',
  'asr.html': '演示 4：在下方页面上传音频或直接录音，点击识别，查看返回的文字。'
};

qfy_tabs.forEach((qfy_tab) => {
  qfy_tab.addEventListener('click', () => {
    qfy_tabs.forEach((qfy_item) => qfy_item.classList.remove('qfy_tab_active'));
    qfy_tab.classList.add('qfy_tab_active');

    const qfy_url = qfy_tab.dataset.url;
    qfy_frame.src = qfy_url;
    qfy_hint.textContent = qfy_hints[qfy_url] || '';
    console.log('切换到演示模块：', qfy_url);
  });
});

// 页面加载时打印当前演示模块，便于排查
console.log('LLM 实践痕迹展示页已加载，当前演示：', qfy_frame.getAttribute('src'));
