/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_ASR_BASE = (process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1').replace(/\/+$/, '');
const qfy_ASR_MODEL = process.env.QINIU_ASR_MODEL || 'qwen-audio-3.0-asr-flash';
const qfy_ALLOWED = ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/webm'];

// 语音识别：接收音频文件 -> 转发七牛 ASR -> 返回文字
const qfy_recognize = async (req, res) => {
  const qfy_file = req.file;
  if (!qfy_file) {
    return res.json({ code: 7001, msg: '请选择要识别的音频文件', data: null });
  }
  if (!qfy_ALLOWED.includes(qfy_file.mimetype)) {
    return res.json({ code: 7001, msg: '不支持的音频格式：' + qfy_file.mimetype, data: null });
  }
  if (!process.env.QINIU_API_KEY) {
    return res.json({ code: 7003, msg: '服务未配置：缺少 QINIU_API_KEY', data: null });
  }

  const qfy_fileName = Buffer.from(qfy_file.originalname, 'latin1').toString('utf8');

  const qfy_form = new FormData();
  qfy_form.append('model', qfy_ASR_MODEL);
  qfy_form.append('file', new Blob([qfy_file.buffer], { type: qfy_file.mimetype }), qfy_fileName);

  console.log('=== 发送给语音识别模型的数据 ===');
  console.log(JSON.stringify({
    url: qfy_ASR_BASE + '/audio/transcriptions',
    model: qfy_ASR_MODEL,
    fileName: qfy_fileName,
    mimeType: qfy_file.mimetype,
    size: qfy_file.size
  }, null, 2));

  try {
    const qfy_abort = new AbortController();
    const qfy_timer = setTimeout(() => qfy_abort.abort(), 90000);

    const qfy_resp = await fetch(qfy_ASR_BASE + '/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.QINIU_API_KEY },
      body: qfy_form,
      signal: qfy_abort.signal
    });
    clearTimeout(qfy_timer);

    const qfy_ct = qfy_resp.headers.get('content-type') || '';
    const qfy_raw = await qfy_resp.text();

    console.log('=== 接自语音识别模型的数据 ===');
    console.log('HTTP ' + qfy_resp.status + ' | ' + qfy_ct);
    console.log(qfy_raw);

    if (!qfy_resp.ok) {
      let qfy_msg = qfy_raw;
      try {
        const qfy_json = JSON.parse(qfy_raw);
        qfy_msg = (qfy_json.error && (qfy_json.error.message || qfy_json.error.code)) || qfy_json.message || qfy_raw;
        if (String(qfy_msg).includes('ASR_RESPONSE_HAVE_NO_WORDS')) {
          qfy_msg = '未识别到语音内容，请确认音频中有清晰的说话声';
        }
      } catch (qfy_e) {
        // 非 JSON 错误响应，直接使用原文
      }
      return res.json({ code: 7002, msg: '语音识别失败：' + qfy_msg, data: null });
    }

    let qfy_text = '';
    try {
      const qfy_json = JSON.parse(qfy_raw);
      qfy_text = qfy_json.text || qfy_json.data || '';
    } catch (qfy_e) {
      qfy_text = qfy_raw;
    }

    if (!qfy_text || !String(qfy_text).trim()) {
      return res.json({ code: 7002, msg: '未识别到文字内容，请确认音频中有清晰的说话声', data: null });
    }

    res.json({
      code: 0,
      msg: '识别成功',
      data: {
        fileName: qfy_fileName,
        size: qfy_file.size,
        text: String(qfy_text).trim(),
        model: qfy_ASR_MODEL
      }
    });
  } catch (qfy_err) {
    console.error('语音识别异常：', qfy_err.message);
    res.json({ code: 7002, msg: '语音识别请求异常：' + qfy_err.message, data: null });
  }
};

module.exports = { qfy_recognize };
