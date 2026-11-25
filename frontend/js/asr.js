/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_asrFile = document.getElementById('qfy_asr_file');
const qfy_asrUploadBtn = document.getElementById('qfy_asr_upload_btn');
const qfy_asrRecordBtn = document.getElementById('qfy_asr_record_btn');
const qfy_asrRecordTip = document.getElementById('qfy_asr_record_tip');
const qfy_asrAudio = document.getElementById('qfy_asr_audio');
const qfy_asrTip = document.getElementById('qfy_asr_tip');
const qfy_asrResult = document.getElementById('qfy_asr_result');
const qfy_asrText = document.getElementById('qfy_asr_text');
const qfy_asrMeta = document.getElementById('qfy_asr_meta');

let qfy_recorder = null;
let qfy_recordChunks = [];
let qfy_recordTimer = null;
let qfy_recordSeconds = 0;

// 选择文件后显示预览
qfy_asrFile.addEventListener('change', () => {
  const qfy_file = qfy_asrFile.files[0];
  if (!qfy_file) {
    return;
  }
  qfy_asrAudio.hidden = false;
  qfy_asrAudio.src = URL.createObjectURL(qfy_file);
  qfy_asrTip.textContent = '已选择：' + qfy_file.name + '（' + (qfy_file.size / 1024).toFixed(1) + ' KB）';
});

// 上传音频并识别
async function qfy_uploadAudio(qfy_blob, qfy_name) {
  const qfy_form = new FormData();
  qfy_form.append('audio', qfy_blob, qfy_name);

  qfy_asrUploadBtn.disabled = true;
  qfy_asrTip.textContent = '正在识别…';
  console.log('发送给后端的数据（语音识别）：', { fileName: qfy_name, size: qfy_blob.size, type: qfy_blob.type });

  try {
    const qfy_resp = await fetch('/api/asr', { method: 'POST', body: qfy_form });
    const qfy_data = await qfy_resp.json();
    console.log('接收自后端的数据（语音识别）：', qfy_data);

    if (qfy_data.code !== 0) {
      throw new Error(qfy_data.msg);
    }

    qfy_asrResult.hidden = false;
    qfy_asrText.textContent = qfy_data.data.text;
    qfy_asrMeta.textContent = '文件：' + qfy_data.data.fileName + ' · 模型：' + qfy_data.data.model;
    qfy_asrTip.textContent = '识别完成';
  } catch (qfy_err) {
    console.error('语音识别失败：', qfy_err);
    qfy_asrResult.hidden = true;
    qfy_asrTip.textContent = '识别失败：' + qfy_err.message;
  } finally {
    qfy_asrUploadBtn.disabled = false;
  }
}

qfy_asrUploadBtn.addEventListener('click', () => {
  const qfy_file = qfy_asrFile.files[0];
  if (!qfy_file) {
    qfy_asrTip.textContent = '请先选择音频文件';
    return;
  }
  qfy_uploadAudio(qfy_file, qfy_file.name);
});

// 现场录音：开始 / 结束
qfy_asrRecordBtn.addEventListener('click', async () => {
  if (qfy_recorder && qfy_recorder.state === 'recording') {
    qfy_recorder.stop();
    return;
  }

  try {
    const qfy_stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    qfy_recordChunks = [];
    qfy_recorder = new MediaRecorder(qfy_stream);

    qfy_recorder.ondataavailable = (qfy_event) => {
      if (qfy_event.data.size > 0) {
        qfy_recordChunks.push(qfy_event.data);
      }
    };

    qfy_recorder.onstop = () => {
      clearInterval(qfy_recordTimer);
      qfy_recordBtn.textContent = '开始录音';
      qfy_recordBtn.classList.remove('qfy_btn_recording');
      qfy_stream.getTracks().forEach((qfy_track) => qfy_track.stop());

      const qfy_blob = new Blob(qfy_recordChunks, { type: qfy_recorder.mimeType || 'audio/webm' });
      qfy_asrAudio.hidden = false;
      qfy_asrAudio.src = URL.createObjectURL(qfy_blob);
      qfy_asrTip.textContent = '录音结束，时长约 ' + qfy_recordSeconds + ' 秒，正在识别…';
      qfy_uploadAudio(qfy_blob, 'record_' + Date.now() + '.webm');
    };

    qfy_recorder.start();
    qfy_recordSeconds = 0;
    qfy_recordBtn.textContent = '结束录音';
    qfy_recordBtn.classList.add('qfy_btn_recording');
    qfy_recordTimer = setInterval(() => {
      qfy_recordSeconds += 1;
      qfy_asrRecordTip.textContent = '录音中… ' + qfy_recordSeconds + ' 秒';
    }, 1000);
    qfy_asrRecordTip.textContent = '录音中… 0 秒';
  } catch (qfy_err) {
    console.error('录音启动失败：', qfy_err);
    qfy_asrRecordTip.textContent = '无法访问麦克风：' + qfy_err.message;
  }
});
