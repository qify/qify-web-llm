<!--
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
-->

# qfy_interface.md — 接口变更记录

> 每次创建或修改接口后，按执行顺序追加：接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间。一律追加写入，禁止覆盖已有内容。

---

## 2026-11-19

- **接口路径：** /api/health
- **HTTP 方法：** GET
- **请求参数：** 无
- **响应格式：**
  ```json
  {
    "code": 0,
    "msg": "服务运行正常",
    "data": {
      "status": "ok",
      "time": "2026-11-19T00:00:00.000Z"
    }
  }
  ```
- **修改时间：** 2026-11-19

---

## 2026-11-19 14:17:04 新增：测试 MySQL 连接

- **接口路径：** /api/db/connect
- **HTTP 方法：** POST
- **请求参数：** Content-Type: application/json
  ```json
  {
    "username": "root",
    "password": "123456"
  }
  ```
  说明：host 取 backend/.env 的 DB_HOST（默认 localhost），连接时不指定数据库名。
- **响应格式（成功）：**
  ```json
  {
    "code": 0,
    "msg": "数据库连接成功",
    "data": {
      "username": "root",
      "version": "8.0.30",
      "currentUser": "root@localhost"
    }
  }
  ```
- **响应格式（失败）：**
  ```json
  {
    "code": 1002,
    "msg": "数据库连接失败：Access denied for user 'root'@'localhost' (using password: YES)",
    "data": { "errorCode": "ER_ACCESS_DENIED_ERROR" }
  }
  ```
  说明：用户名为空时返回 code=1001、msg="用户名不能为空"。
- **修改时间：** 2026-11-19 14:17:04

---

## 2026-11-19 14:18:51 新增：科技新闻列表

- **接口路径：** /api/news
- **HTTP 方法：** GET
- **请求参数：** 无
- **响应格式（成功）：**
  ```json
  {
    "code": 0,
    "msg": "查询成功",
    "data": {
      "total": 10,
      "list": [
        {
          "qfy_id": 1,
          "qfy_title": "国内首条 8 英寸硅光芯片产线正式通线",
          "qfy_summary": "该产线聚焦硅基光电子芯片，覆盖设计、流片到封装测试全流程，预计年产能 2 万片。",
          "qfy_content": "该产线聚焦硅基光电子芯片，覆盖设计、流片到封装测试全流程，预计年产能 2 万片。",
          "qfy_source": "科技日报",
          "qfy_author": "李明远",
          "qfy_category": "半导体",
          "qfy_publish_time": "2026-11-19 09:20:00"
        }
      ]
    }
  }
  ```
- **响应格式（失败）：**
  ```json
  {
    "code": 2001,
    "msg": "查询科技新闻失败：<错误信息>",
    "data": null
  }
  ```
  说明：按 qfy_publish_time 倒序返回，时间由 DATE_FORMAT 格式化为 "YYYY-MM-DD HH:mm:ss"。
- **修改时间：** 2026-11-19 14:18:51

---

## 2026-11-19 14:20:16 新增：科技图文列表

- **接口路径：** /api/gallery
- **HTTP 方法：** GET
- **请求参数：** 无
- **响应格式（成功）：**
  ```json
  {
    "code": 0,
    "msg": "查询成功",
    "data": {
      "total": 10,
      "list": [
        {
          "qfy_id": 1,
          "qfy_title": "硅光芯片产线正式通线",
          "qfy_description": "国内首条 8 英寸硅光芯片产线投产，覆盖设计、流片到封装测试全流程。",
          "qfy_image_url": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=...",
          "qfy_category": "半导体",
          "qfy_publish_date": "2026-11-19"
        }
      ]
    }
  }
  ```
- **响应格式（失败）：**
  ```json
  {
    "code": 3001,
    "msg": "查询科技图文失败：<错误信息>",
    "data": null
  }
  ```
  说明：按 qfy_publish_date 倒序返回，发布日期由 DATE_FORMAT 格式化为 "YYYY-MM-DD"。
- **修改时间：** 2026-11-19 14:20:16

---

## POST /api/chat

- **接口路径：** `/api/chat`
- **HTTP 方法：** POST
- **请求参数（JSON）：**

  ```json
  {
    "messages": [
      { "role": "user", "content": "用一句话介绍你自己" }
    ]
  }
  ```

  说明：`messages` 为对话历史数组（最多 20 条），`role` 取值 `user` / `assistant`，`content` 长度 1~4000 字；服务端自动追加 system 提示词。
- **响应格式（成功）：**

  ```json
  {
    "code": 0,
    "msg": "回复成功",
    "data": {
      "reply": "我是你的网页设计课程作业 AI 助手，乐意帮助解答问题和提供建议。",
      "model": "Qwen/Qwen2.5-7B-Instruct",
      "usage": { "prompt_tokens": 45, "completion_tokens": 21, "total_tokens": 66 }
    }
  }
  ```

- **响应格式（失败）：**

  ```json
  {
    "code": 3001,
    "msg": "参数错误：messages 必须为非空数组",
    "data": null
  }
  ```

  错误码：3001 参数错误；3002 AI 服务调用失败/异常；3003 缺少 SILICONFLOW_API_KEY 配置。
- **修改时间：** 2026-11-23 14:00:35

---

## POST /api/service（中华美食街在线客服，支持多平台切换）

- **接口路径：** `/api/service`
- **HTTP 方法：** POST
- **请求参数（JSON）：**

  ```json
  {
    "provider": "siliconflow",
    "messages": [
      { "role": "user", "content": "你们几点营业？" }
    ]
  }
  ```

  说明：`provider` 可选 `siliconflow`（默认）/ `qiniu`，后端据此读取 `SILICONFLOW_*` 或 `QINIU_*` 的 baseURL、model、apiKey；`messages` 规则同 `/api/chat`（最多 20 条、单条 1~4000 字）。
- **system 人设：** 中华美食街客服，只回答营业时间（11:00-22:00，节假日不打烊）、招牌菜（红油抄手、腊汁肉夹馍、糖油粑粑、老北京炸酱面）、配送范围（周边 5 公里，起送 20 元，配送费 5 元）三类问题，其余问题礼貌引导留言。
- **响应格式（成功）：**

  ```json
  {
    "code": 0,
    "msg": "回复成功",
    "data": {
      "reply": "您好呀！我们每天 11:00 到 22:00 营业，节假日也不打烊哦～",
      "provider": "siliconflow",
      "providerLabel": "硅基流动",
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "usage": { "prompt_tokens": 120, "completion_tokens": 30, "total_tokens": 150 }
    }
  }
  ```

- **响应格式（失败）：**

  ```json
  { "code": 4001, "msg": "参数错误：provider 仅支持 siliconflow / qiniu", "data": null }
  { "code": 4002, "msg": "七牛服务调用失败：Invalid API key", "data": null }
  { "code": 4003, "msg": "服务未配置：缺少该平台的 API Key", "data": null }
  ```

- **修改时间：** 2026-11-23 14:17:40

### 变更记录（2026-11-23 14:38:09）

- `.env` 的 `QINIU_API_KEY` 更换为新 Key（明文不入库，仅存 `.env`）。
- 新 Key 鉴权通过，但需账号完成实名认证（403 `account_identity_verification_required`）；认证后实测 `provider=qiniu` 调用成功。
- 七牛免费模型存在全局限流（429 `free_campaign_global_limit`），偶发时接口返回 `4002` 友好错误提示，稍后重试即可。

---

## 知识库（RAG）接口

统一 JSON 格式：`{ "code": 0, "msg": "提示信息", "data": {...} }`，code=0 成功。

### POST /api/kb/upload

- **请求：** `multipart/form-data`，字段名 `file`，单文件 ≤ 20MB，支持 txt / md / pdf / doc / docx / pptx（旧版 .ppt 提示转存为 .pptx）
- **处理流程：** 解析文本 -> 按 400 字切块（重叠 60 字）-> 调用 `BAAI/bge-m3` 向量化 -> 写入 `qfy_kb_document` / `qfy_kb_chunk`
- **响应示例：**

  ```json
  { "code": 0, "msg": "上传成功",
    "data": { "id": 1, "name": "客服FAQ.txt", "ext": "txt", "size": 950, "chunkCount": 2, "charCount": 862 } }
  ```

- **错误码：** 5001 未选择文件；5002 解析失败（含格式不支持、内容为空）；5003 数据库异常

### GET /api/kb/documents

- **响应示例：**

  ```json
  { "code": 0, "msg": "查询成功",
    "data": { "total": 2, "list": [
      { "id": 2, "name": "门店运营手册.md", "ext": "md", "size": 2100, "chunk_count": 4, "status": "ready", "created_at": "2026-11-23T14:40:12.000Z" }
    ] } }
  ```

### DELETE /api/kb/documents/:id

- **响应示例：** `{ "code": 0, "msg": "删除成功", "data": { "id": 1 } }`
- **错误码：** 5001 无效 id；5004 文档不存在

### POST /api/kb/ask

- **请求参数：**

  ```json
  { "question": "会员储值有什么优惠？" }
  ```

- **处理流程：** 问题向量化 -> 余弦相似度检索 Top3 切块 -> 拼装提示词调用 `SILICONFLOW_MODEL` -> 返回答案与引用来源；后端控制台打印「发送给大模型的数据 / 接自大模型的数据」
- **响应示例：**

  ```json
  { "code": 0, "msg": "回答成功",
    "data": {
      "question": "会员储值有什么优惠？",
      "answer": "储值200元送20元，储值500元送60元，储值1000元送150元。【资料1】【资料3】",
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "sources": [ { "docName": "门店运营手册.md", "chunkIndex": 3, "score": 0.6439, "content": "..." } ],
      "usage": { "prompt_tokens": 900, "completion_tokens": 40, "total_tokens": 940 } } }
  ```

- **错误码：** 5001 参数错误；5002 大模型调用失败；5005 知识库为空
- **修改时间：** 2026-11-23 14:41:22

---

## POST /api/vision（图像识别）

- **请求：** `multipart/form-data`，字段名 `image`，支持 jpg / png / webp / gif，单文件 ≤ 10MB
- **处理流程：** 图片转 base64 data URL -> 调用视觉模型 `VISION_MODEL`（默认 `Qwen/Qwen3-VL-32B-Instruct`，与文本模型共用 `SILICONFLOW_API_KEY`）-> 返回中文画面描述
- **响应示例：**

  ```json
  { "code": 0, "msg": "识别成功",
    "data": {
      "fileName": "red_apple.jpg",
      "size": 176626,
      "description": "画面主体为一颗鲜红饱满的苹果，置于粗糙的木质桌面上……右下角有“AI生成”水印。",
      "model": "Qwen/Qwen3-VL-32B-Instruct",
      "usage": { "prompt_tokens": 1200, "completion_tokens": 180, "total_tokens": 1380 } } }
  ```

- **错误码：** 6001 未选择图片/类型不支持；6002 识别失败（上游报错、超时）；6003 缺少 API Key
- **备注：** 文本模型 `deepseek-ai/DeepSeek-V4-Flash` 不支持图片输入（返回 400 `The model is not a VLM`），故视觉任务使用同一 Key 下的视觉模型，配置项为 `.env` 的 `VISION_MODEL`
- **修改时间：** 2026-11-23 14:45:35

---

## POST /api/asr（语音识别）

- **请求：** `multipart/form-data`，字段名 `audio`，支持 wav / mp3 / m4a / ogg / webm，单文件 ≤ 20MB
- **上游：** 七牛 AI `POST https://api.qnaigc.com/v1/audio/transcriptions`，`model=qwen-audio-3.0-asr-flash`（配置项 `QINIU_ASR_MODEL`），使用 `QINIU_API_KEY`
- **响应示例：**

  ```json
  { "code": 0, "msg": "识别成功",
    "data": { "fileName": "speech.wav", "size": 234414,
              "text": "今天天气不错，我们一起去吃饭吧。",
              "model": "qwen-audio-3.0-asr-flash" } }
  ```

- **错误码：** 7001 未选择音频/格式不支持；7002 识别失败（含静音音频 `ASR_RESPONSE_HAVE_NO_WORDS` 已转为中文提示、超时）；7003 缺少 API Key
- **备注：** 模型 ID 实际为全小写 `qwen-audio-3.0-asr-flash`，写成 `Qwen-Audio-3.0-ASR-Flash` 会返回 `no available channels for model`
- **修改时间：** 2026-11-23 14:48:57

> 追加（2026-11-23 17:40:42）：`POST /api/service` 增加限流自动重试。七牛免费模型 `qiniu/conatus-free` 存在全局限流（429 `free_campaign_global_limit`），现命中限流后自动重试最多 3 次（间隔 2s、4s），仍失败则返回中文提示「七牛免费模型当前限流，请稍等几秒再试或切换到硅基流动」。实测连发 3 次均成功，耗时约 32.8s / 7.2s / 0.9s。

---

## 2026-11-25 新增：AI 聊天会话管理 + 流式问答（/api/ai）

### 1. 查询会话列表
- **接口路径：** `/api/ai/sessions`
- **HTTP 方法：** GET
- **请求参数：** 无
- **响应示例：**
  ```json
  { "code": 0, "msg": "查询成功",
    "data": { "total": 1,
              "list": [{ "qfy_id": 1, "qfy_title": "简历项目该怎么写", "qfy_summary": null,
                         "qfy_summarized_count": 0, "qfy_message_count": 2,
                         "qfy_created_at": "2026-11-25 16:10:00", "qfy_updated_at": "2026-11-25 16:10:00" }] } }
  ```
- **修改时间：** 2026-11-25 16:17:06

### 2. 新建会话
- **接口路径：** `/api/ai/sessions`
- **HTTP 方法：** POST
- **请求参数：** `{ "title": "新的对话" }`（可省略，默认「新的对话」）
- **响应示例：** `{ "code": 0, "msg": "创建成功", "data": { "sessionId": 9 } }`
- **修改时间：** 2026-11-25 16:17:06

### 3. 重命名会话
- **接口路径：** `/api/ai/sessions/:id`
- **HTTP 方法：** PATCH
- **请求参数：** `{ "title": "新标题" }`（1~120 字）
- **响应示例：** `{ "code": 0, "msg": "重命名成功", "data": { "sessionId": 9, "title": "新标题" } }`
- **错误码：** 4001 标题非法；4002 会话不存在
- **修改时间：** 2026-11-25 16:17:06

### 4. 删除会话
- **接口路径：** `/api/ai/sessions/:id`
- **HTTP 方法：** DELETE
- **请求参数：** 无（路径参数 id）
- **响应示例：** `{ "code": 0, "msg": "删除成功", "data": { "sessionId": 9 } }`
- **备注：** 消息由外键 `ON DELETE CASCADE` 级联删除
- **修改时间：** 2026-11-25 16:17:06

### 5. 查询会话历史消息
- **接口路径：** `/api/ai/sessions/:id/messages`
- **HTTP 方法：** GET
- **请求参数：** 无（路径参数 id）
- **响应示例：**
  ```json
  { "code": 0, "msg": "查询成功",
    "data": { "session": { "qfy_id": 9, "qfy_title": "接口测试会话", "qfy_message_count": 4 },
              "total": 4,
              "list": [{ "id": 17, "role": "user", "content": "用一句话解释 JavaScript 闭包",
                         "createdAt": "2026-11-25 16:16:00" }] } }
  ```
- **修改时间：** 2026-11-25 16:17:06

### 6. 问答（非流式）
- **接口路径：** `/api/ai/chat`
- **HTTP 方法：** POST
- **请求参数：** `{ "sessionId": 9, "message": "用一句话解释闭包" }`（sessionId 可省略，自动新建会话）
- **响应示例：**
  ```json
  { "code": 0, "msg": "回复成功",
    "data": { "sessionId": 9, "messageId": 18,
              "reply": "闭包是函数与其定义时所在词法作用域的组合……",
              "model": "deepseek-ai/DeepSeek-V4-Flash",
              "usage": { "prompt_tokens": 161, "completion_tokens": 46, "total_tokens": 207 },
              "summary": "", "contextCount": 2 } }
  ```
- **备注：** 消息自动落库；上下文超过 12 条时，早期消息压缩进 `qfy_chat_summary` 并只发送「摘要 + 最近 12 条」
- **错误码：** 4001 参数错误；4002 会话不存在；4003 缺少 API Key；4004 模型调用失败
- **修改时间：** 2026-11-25 16:17:06

### 7. 问答（流式 SSE）
- **接口路径：** `/api/ai/chat/stream`
- **HTTP 方法：** POST
- **请求参数：** 同 `/api/ai/chat`
- **响应格式：** `text/event-stream`，每条事件为 `data: {JSON}\n\n`
  ```
  data: {"type":"start","sessionId":9,"summary":"","contextCount":2}
  data: {"type":"delta","content":"闭包"}
  data: {"type":"done","sessionId":9,"messageId":18,"model":"deepseek-ai/DeepSeek-V4-Flash","reply":"..."}
  data: {"type":"error","msg":"大模型调用失败：..."}
  ```
- **备注：** 前端用 `AbortController` 中断时，后端 `req.on('close')` 会同步中断上游请求，被中断的回复不落库
- **修改时间：** 2026-11-25 16:17:06

### 8. 兼容接口（原有）
- `POST /api/chat` 保留不变：接收 `{ messages: [{role, content}] }`，不落库，返回 `data.reply`。新页面已统一使用 `/api/ai/*`。

---

## 2026-11-27 23:00:17 变更：/api/gallery 增加作者与点赞字段

- **接口路径：** `/api/gallery`
- **HTTP 方法：** GET
- **变更说明：** 响应 `data.list` 中每条新增 `qfy_author`（作者）与 `qfy_likes`（点赞数），图片地址 `qfy_image_url` 改为项目内本地路径（如 `images/art/cover1.jpg`），供画世界首页瀑布流、发现页动态与搜索页使用。
- **响应示例（节选）：**
  ```json
  { "code": 0, "msg": "查询成功",
    "data": { "total": 10,
              "list": [{ "qfy_id": 21, "qfy_title": "银蓝誓约",
                         "qfy_description": "白发双人插画，冷调银蓝配色……",
                         "qfy_image_url": "images/art/cover1.jpg",
                         "qfy_category": "二次元", "qfy_author": "青梧",
                         "qfy_likes": 8526, "qfy_publish_date": "2026-11-19" }] } }
  ```
- **修改时间：** 2026-11-27 23:00:17
