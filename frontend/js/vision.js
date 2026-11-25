/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_visionFile = document.getElementById('qfy_vision_file');
const qfy_visionPreview = document.getElementById('qfy_vision_preview');
const qfy_visionDropText = document.getElementById('qfy_vision_drop_text');
const qfy_visionBtn = document.getElementById('qfy_vision_btn');
const qfy_visionTip = document.getElementById('qfy_vision_tip');
const qfy_visionResult = document.getElementById('qfy_vision_result');
const qfy_visionDesc = document.getElementById('qfy_vision_desc');
const qfy_visionMeta = document.getElementById('qfy_vision_meta');

// 选择图片后显示预览
qfy_visionFile.addEventListener('change', () => {
  const qfy_file = qfy_visionFile.files[0];
  if (!qfy_file) {
    return;
  }
  qfy_visionDropText.hidden = true;
  qfy_visionPreview.hidden = false;
  qfy_visionPreview.src = URL.createObjectURL(qfy_file);
  qfy_visionTip.textContent = '已选择：' + qfy_file.name + '（' + (qfy_file.size / 1024).toFixed(1) + ' KB）';
});

// 上传并识别
async function qfy_recognize() {
  const qfy_file = qfy_visionFile.files[0];
  if (!qfy_file) {
    qfy_visionTip.textContent = '请先选择一张图片';
    return;
  }

  const qfy_form = new FormData();
  qfy_form.append('image', qfy_file);

  qfy_visionBtn.disabled = true;
  qfy_visionTip.textContent = '正在识别，请稍候…';
  console.log('发送给后端的数据（图片识别）：', { fileName: qfy_file.name, type: qfy_file.type, size: qfy_file.size });

  try {
    const qfy_resp = await fetch('/api/vision', { method: 'POST', body: qfy_form });
    const qfy_data = await qfy_resp.json();
    console.log('接收自后端的数据（图片识别）：', qfy_data);

    if (qfy_data.code !== 0) {
      throw new Error(qfy_data.msg);
    }

    qfy_visionResult.hidden = false;
    qfy_visionDesc.textContent = qfy_data.data.description;
    qfy_visionMeta.textContent = '文件：' + qfy_data.data.fileName + ' · 模型：' + qfy_data.data.model;
    qfy_visionTip.textContent = '识别完成';
  } catch (qfy_err) {
    console.error('图片识别失败：', qfy_err);
    qfy_visionResult.hidden = true;
    qfy_visionTip.textContent = '识别失败：' + qfy_err.message;
  } finally {
    qfy_visionBtn.disabled = false;
  }
}

qfy_visionBtn.addEventListener('click', qfy_recognize);
