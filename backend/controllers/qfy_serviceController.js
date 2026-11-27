/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-27 | 大模型：DeepSeek-V4.1-Flash
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
const qfy_SYSTEM_PROMPT = '你是「画世界」绘画社区的在线客服，语气亲切、简洁，每次回答不超过 120 字。'
  + '你只回答以下五类问题：1. 账号（注册、登录、实名）；2. 作品投稿与审核；3. 版权与举报；'
  + '4. 会员与画币；5. 活动与挑战赛。'
  + '已知信息：账号支持手机号/第三方登录，忘记密码可通过手机号验证重置，实名认证 1 个工作日内完成；'
  + '作品投稿支持 JPG/PNG，单图不超过 20MB，审核一般在 2 小时内完成，未通过会在消息页说明原因；'
  + '原创作品可在发布时勾选「原创声明」，发现盗图可在作品详情页点「举报-侵权」并附原始草稿或工程文件，'
  + '平台 3 个工作日内处理；会员分月卡 18 元、季卡 48 元、年卡 168 元，可在「我的-会员中心」关闭自动续费，'
  + '画币 1 元 = 10 画币，用于打赏与购买素材，充值后不支持退款；'
  + '活动挑战赛每月 1 日开赛，作品需带话题标签参与，榜单每周一更新。'
  + '遇到这五类以外的任何问题，礼貌说明你只能解答账号、投稿审核、版权举报、会员画币、活动挑战五类问题，'
  + '并引导用户到「我的-意见反馈」留下联系方式，客服会尽快回复。不要编造未提供的平台信息。';
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
