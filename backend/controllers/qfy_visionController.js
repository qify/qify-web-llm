/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_BASE = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, '');
const qfy_VISION_MODEL = process.env.VISION_MODEL || 'Qwen/Qwen3-VL-32B-Instruct';
const qfy_PROMPT = '请详细描述这张图片：画面主体、场景、颜色、风格、文字内容（如有）。用中文回答，150 字以内。';
const qfy_MIME = { 'image/jpeg': 'image/jpeg', 'image/png': 'image/png', 'image/webp': 'image/webp', 'image/gif': 'image/gif' };

// 图片识别：接收上传图片 -> 转 base64 data URL -> 调用视觉大模型 -> 返回描述
const qfy_recognize = async (req, res) => {
  const qfy_file = req.file;
  if (!qfy_file) {
    return res.json({ code: 6001, msg: '请选择要识别的图片', data: null });
  }
  if (!qfy_MIME[qfy_file.mimetype]) {
    return res.json({ code: 6001, msg: '仅支持 jpg / png / webp / gif 图片', data: null });
  }
  if (!process.env.SILICONFLOW_API_KEY) {
    return res.json({ code: 6003, msg: '服务未配置：缺少 SILICONFLOW_API_KEY', data: null });
  }

  const qfy_dataUrl = 'data:' + qfy_file.mimetype + ';base64,' + qfy_file.buffer.toString('base64');

  const qfy_payload = {
    model: qfy_VISION_MODEL,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: qfy_PROMPT },
        { type: 'image_url', image_url: { url: qfy_dataUrl } }
      ]
    }],
    max_tokens: 500,
    temperature: 0.3,
    stream: false
  };

  // 控制台输出发送数据（base64 过长，截断显示）
  const qfy_logPayload = JSON.parse(JSON.stringify(qfy_payload));
  qfy_logPayload.messages[0].content[1].image_url.url = qfy_dataUrl.slice(0, 80) + '...(base64 共 ' + qfy_dataUrl.length + ' 字符)';
  console.log('=== 发送给视觉大模型的数据 ===');
  console.log(JSON.stringify(qfy_logPayload, null, 2));

  try {
    const qfy_abort = new AbortController();
    const qfy_timer = setTimeout(() => qfy_abort.abort(), 60000);

    const qfy_resp = await fetch(qfy_BASE + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.SILICONFLOW_API_KEY
      },
      body: JSON.stringify(qfy_payload),
      signal: qfy_abort.signal
    });
    clearTimeout(qfy_timer);

    const qfy_data = await qfy_resp.json();

    console.log('=== 接自视觉大模型的数据 ===');
    console.log(JSON.stringify(qfy_data, null, 2));

    if (!qfy_resp.ok) {
      const qfy_msg = qfy_data.message || (qfy_data.error && qfy_data.error.message) || 'HTTP ' + qfy_resp.status;
      return res.json({ code: 6002, msg: '图片识别失败：' + qfy_msg, data: null });
    }

    const qfy_desc = qfy_data.choices && qfy_data.choices[0] ? qfy_data.choices[0].message.content : '';
    if (!qfy_desc) {
      return res.json({ code: 6002, msg: '模型未返回描述内容', data: null });
    }

    res.json({
      code: 0,
      msg: '识别成功',
      data: {
        fileName: Buffer.from(qfy_file.originalname, 'latin1').toString('utf8'),
        size: qfy_file.size,
        description: qfy_desc,
        model: qfy_data.model || qfy_VISION_MODEL,
        usage: qfy_data.usage || null
      }
    });
  } catch (qfy_err) {
    console.error('图片识别异常：', qfy_err.message);
    res.json({ code: 6002, msg: '图片识别请求异常：' + qfy_err.message, data: null });
  }
};

module.exports = { qfy_recognize };
