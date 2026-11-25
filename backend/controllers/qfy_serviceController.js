/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

// 多平台配置：硅基流动 / 七牛，均为 OpenAI 兼容接口，仅 baseURL、model、apiKey 不同
const qfy_PROVIDERS = {
  siliconflow: {
    label: '硅基流动',
    baseUrl: (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, ''),
    model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
    apiKey: process.env.SILICONFLOW_API_KEY
  },
  qiniu: {
    label: '七牛',
    baseUrl: (process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1').replace(/\/+$/, ''),
    model: process.env.QINIU_MODEL || 'qiniu/conatus-free',
    apiKey: process.env.QINIU_API_KEY
  }
};

const qfy_DEFAULT_PROVIDER = 'siliconflow';
const qfy_SYSTEM_PROMPT = '你是「中华美食街」的在线客服，语气亲切、简洁，每次回答不超过 120 字。'
  + '你只回答以下三类问题：1. 营业时间；2. 招牌菜；3. 配送范围。'
  + '已知信息：营业时间为每天 11:00-22:00，节假日不打烊；'
  + '招牌菜有红油抄手、腊汁肉夹馍、糖油粑粑、老北京炸酱面，均为每日现做、售完即止；'
  + '配送范围为门店周边 5 公里内，起送价 20 元，配送费 5 元。'
  + '遇到这三类以外的任何问题，礼貌说明你只能解答营业时间、招牌菜、配送范围三类问题，'
  + '并引导顾客在留言区留下联系方式，门店会尽快回复。不要编造未提供的门店信息。';
const qfy_MAX_MESSAGES = 20;
const qfy_MAX_CONTENT = 4000;

// 在线客服：接收对话历史与服务商标识，调用对应平台接口并返回回复
const qfy_service = async (req, res) => {
  const qfy_messages = req.body && req.body.messages;
  const qfy_providerKey = (req.body && req.body.provider) || qfy_DEFAULT_PROVIDER;
  const qfy_provider = qfy_PROVIDERS[qfy_providerKey];

  if (!qfy_provider) {
    return res.json({ code: 4001, msg: '参数错误：provider 仅支持 siliconflow / qiniu', data: null });
  }
  if (!Array.isArray(qfy_messages) || qfy_messages.length === 0) {
    return res.json({ code: 4001, msg: '参数错误：messages 必须为非空数组', data: null });
  }
  if (qfy_messages.length > qfy_MAX_MESSAGES) {
    return res.json({ code: 4001, msg: '参数错误：messages 不能超过 ' + qfy_MAX_MESSAGES + ' 条', data: null });
  }
  const qfy_invalid = qfy_messages.some((qfy_item) => {
    const qfy_okRole = qfy_item && (qfy_item.role === 'user' || qfy_item.role === 'assistant');
    const qfy_okContent = qfy_item && typeof qfy_item.content === 'string' && qfy_item.content.trim() !== '';
    return !qfy_okRole || !qfy_okContent || qfy_item.content.length > qfy_MAX_CONTENT;
  });
  if (qfy_invalid) {
    return res.json({ code: 4001, msg: '参数错误：每条消息需包含 role（user/assistant）和 content（1~' + qfy_MAX_CONTENT + ' 字）', data: null });
  }
  if (!qfy_provider.apiKey) {
    return res.json({ code: 4003, msg: '服务未配置：缺少该平台的 API Key', data: null });
  }

  const qfy_body = {
    model: qfy_provider.model,
    messages: [{ role: 'system', content: qfy_SYSTEM_PROMPT }].concat(
      qfy_messages.map((qfy_item) => ({ role: qfy_item.role, content: qfy_item.content }))
    ),
    max_tokens: 1024,
    temperature: 0.6,
    stream: false
  };

  // 七牛免费模型有全局限流，命中时自动重试两次，仍失败则给出明确提示
  const qfy_MAX_TRY = 3;
  try {
    let qfy_resp = null;
    let qfy_data = null;

    for (let qfy_try = 1; qfy_try <= qfy_MAX_TRY; qfy_try++) {
      const qfy_abort = new AbortController();
      const qfy_timer = setTimeout(() => qfy_abort.abort(), 60000);

      qfy_resp = await fetch(qfy_provider.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + qfy_provider.apiKey
        },
        body: JSON.stringify(qfy_body),
        signal: qfy_abort.signal
      });
      clearTimeout(qfy_timer);

      qfy_data = await qfy_resp.json();

      const qfy_upMsg = qfy_data.error && qfy_data.error.message ? qfy_data.error.message : '';
      const qfy_limited = qfy_resp.status === 429 || /too many requests/i.test(qfy_upMsg);

      if (qfy_limited && qfy_try < qfy_MAX_TRY) {
        console.warn('[' + qfy_provider.label + '] 免费模型限流，第 ' + qfy_try + ' 次重试前等待…');
        await new Promise((qfy_resolve) => setTimeout(qfy_resolve, qfy_try * 2000));
        continue;
      }

      if (qfy_limited) {
        return res.json({
          code: 4002,
          msg: '七牛免费模型当前限流（Too many requests），请稍等几秒再试，或在「服务商」中切换到硅基流动',
          data: null
        });
      }

      break;
    }

    if (!qfy_resp.ok) {
      const qfy_upMsg = qfy_data.error && qfy_data.error.message ? qfy_data.error.message : 'HTTP ' + qfy_resp.status;
      console.error('[' + qfy_provider.label + '] 接口返回错误：', qfy_resp.status, JSON.stringify(qfy_data));
      return res.json({ code: 4002, msg: qfy_provider.label + '服务调用失败：' + qfy_upMsg, data: null });
    }

    const qfy_reply = qfy_data.choices && qfy_data.choices[0] && qfy_data.choices[0].message
      ? qfy_data.choices[0].message.content
      : '';

    if (!qfy_reply) {
      return res.json({ code: 4002, msg: '客服服务未返回内容', data: null });
    }

    res.json({
      code: 0,
      msg: '回复成功',
      data: {
        reply: qfy_reply,
        provider: qfy_providerKey,
        providerLabel: qfy_provider.label,
        model: qfy_data.model || qfy_provider.model,
        usage: qfy_data.usage || null
      }
    });
  } catch (qfy_err) {
    console.error('[' + qfy_provider.label + '] 调用接口异常：', qfy_err.message);
    res.json({ code: 4002, msg: qfy_provider.label + '服务请求异常：' + qfy_err.message, data: null });
  }
};

module.exports = { qfy_service };
