<!--
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
-->

# qifangyuan_prompt.md — 开发指令记录

> 每次向 AI 发出开发指令后，追加记录：时间 | 提示词全文 | 大模型名称。一律追加写入，禁止覆盖已有内容。

---

**时间：** 2026-11-19 13:59:01
**大模型：** Trae 专有大模型
**提示词全文：**

在当前项目根目录创建 AGENTS.md，写入以下规则。

## 项目结构与技术栈
- 前端：frontend/ 目录
  - 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
  - 目录结构：frontend/ 下建 css/、js/、fonts/、images/ 子目录；
    fonts/ 存放 iconfont 图标文件（如果有）
- 后端：backend/ 目录，Node.js + Express，RESTful+MVC 风格，
  所有接口以 /api/ 为前缀，端口固定为 8031
- 使用 express.static 托管 frontend/ 静态资源目录。
- 后端通过 cors 中间件开放全部跨域访问，本配置仅用于课程作业。
- 后端依赖安装：预先将 npm 源切换为国内镜像：
  npm config set registry https://registry.npmmirror.com
- 后端依赖安装： npm i 包名
- 数据库：MySQL（用户名 root、密码：123456）
- 数据库凭据写入 backend/.env（变量名：DB_USER、DB_PASSWORD、DB_HOST、DB_NAME），
  不得出现在代码或 AGENTS.md 中；.env 同时加入 .gitignore
- 根据后端的要求自行建立和修改数据库表，每张表建立后，插入至少 8 条有真实业务意义的测试数据

## 命名与注释
- CSS 类名、JS 变量名、JS 函数名、数据库表名（及字段相关命名）
  一律以 qfy_ 开头
- 每个文件头部包含注释块：
  姓名：齐方圆 | 学号：24001011031 |
  时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}

## 记录文件（一律追加写入，禁止覆盖已有内容）
- qifangyuan_prompt.md（项目根目录）：每次向 AI 发出开发指令后，
  追加记录：时间 | 提示词全文 | 大模型名称
- backend/qfy_interface.md：每次创建或修改接口后，追加：
  接口路径 | HTTP 方法 | 请求参数（含示例）|
  响应格式（含 JSON 示例）| 修改时间
- backend/qfy_database.md：每次建表、改表或插入数据后，
  按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），
  要求仅凭此文件即可在新机器上完整重建数据库
- 统一 JSON 响应格式：{ "code": 0, "msg": "提示信息", "data": {...} }，
  code=0 表示成功，非 0 表示失败

## 前端约定
- 服务器返回的数据和错误信息输出到浏览器控制台（console.log / console.error）；
- 新建 HTML 页面后，在 frontend/index.html 中追加超链接入口；
  文件名包含 detail 的页面除外

---

**时间：** 2026-11-19 14:05:33
**大模型：** Trae 专有大模型
**提示词全文：**

请初始化本项目：
1、git init + .gitignore（排除 node_modules、.env）+ 首次提交
2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
3、创建前端首页 index.html，包括姓名齐方圆、学号24001011031、项目名称、项目类别（自选、模仿），所有完成的 html 页面的超链接。有 canvas 背景动画。主体是页面链接导航。页面美观。
4、创建 readme.md，在根目录下，包括学号、姓名。

---

**时间：** 2026-11-19 14:09:30
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

创建运行后台的bat文件，在根目录下。

---

**时间：** 2026-11-19 14:17:04
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

创建 database.html 页面，输入用户名，密码，链接数据库，数据库使用 mysql，成功和错误都有提示，默认用户名 root，密码 123456。

---

**时间：** 2026-11-19 14:18:51
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

完成科技新闻列表页面，新闻的数据存在数据库表里。网页显示后端接口链接和数据内容。

---

**时间：** 2026-11-19 14:20:16
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

完成图文列表，图片可以使用网络图片或创建图片，创建一个新的表，网页显示后端接口链接和数据内容。

---

**时间：** 2026-11-19 14:28:24
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

我想把主题内容改成光阴之外

---

**时间：** 2026-11-19 14:31:33
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

改回去吧

---

**时间：** 2026-11-23 14:00:35
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

使用硅基流动API key创建基本AI应用:AI聊天
Api-key：sk-****（已写入 backend/.env，未在此记录明文）

---

**时间：** 2026-11-23 14:17:40
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

https://spontaneous-valkyrie-4e4229.netlify.app/llm-app-lesson

**完成内容（按该教程第 5 节课堂任务）：**
1. 任务二：AI 聊天改造为「中华美食街在线客服」，system 提示词限定营业时间/招牌菜/配送范围三类问题，其余礼貌引导留言；5 问测试通过（3 答、2 拒）。
2. 任务三：客服页新增服务商下拉框（硅基流动 / 七牛），后端 `/api/service` 按 `provider` 读取对应配置；切换七牛时因 Key 无效返回友好错误提示。
3. 任务一：安全检查通过——`.env` 已在 `.gitignore`，前端源码 / AGENTS.md / README 无 Key 残留，git 已跟踪文件中未发现明文 Key。
4. 发现工作区中在线客服相关文件缺失（回退），已重建页面、脚本、路由与样式。

---

**时间：** 2026-11-23 14:38:09
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

sk-****（七牛新 Key，已写入 backend/.env，未记录明文）
认证成功

**结果：**
1. 新 Key 鉴权通过，未认证时返回 403 `account_identity_verification_required`。
2. 用户完成实名认证后，`provider=qiniu` 实测成功，5 问测试全部符合预期（3 答、2 拒）。
3. 七牛免费模型偶发 429 `free_campaign_global_limit`（全局限流），接口会返回友好错误提示，重试即可。

---

**时间：** 2026-11-23 14:41:22
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理（RAG）：基于本地文件（如 PDF/TXT）上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受自大模型的数据。

**完成内容：**
1. 新建表 qfy_kb_document、qfy_kb_chunk（含 embedding 向量字段）。
2. 新增解析工具 utils/qfy_kbParser.js：txt/md（原生）、pdf（pdf-parse）、docx（mammoth）、doc（word-extractor）、pptx（adm-zip 提取）；旧版 .ppt 提示另存为 .pptx。
3. 新增接口：POST /api/kb/upload、GET /api/kb/documents、DELETE /api/kb/documents/:id、POST /api/kb/ask（bge-m3 向量 + 余弦检索 Top3 + 大模型作答）。
4. 新增页面 knowledge.html + js/knowledge.js，含上传、文档管理、问答与引用来源展示；首页导航加入「知识库问答」。
5. 构建 2 个样例知识库文件：backend/seed_kb/客服FAQ.txt、backend/seed_kb/门店运营手册.md，已通过接口上传入库。
6. 后端控制台输出发送给大模型的数据与接收自大模型的数据；前端控制台输出发送/接收的数据。
7. 实测：上传切块 2 / 4 块；问答 3 组（营业时间、会员储值、越界问题）均符合预期，越界问题回答"知识库中暂未找到相关信息"。
8. 说明：按用户要求只构建 2 个知识库文件；AGENTS.md 中"每表 8 条测试数据"的约定对文档表未严格执行，如需可补充样例文件。

---

**时间：** 2026-11-23 14:45:35
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

完成图像识别功能，上传图片，返回该图片的描述，使用已有的api-key和模型。

**完成内容：**
1. 探测发现原文本模型 deepseek-ai/DeepSeek-V4-Flash 不支持图片输入（400 The model is not a VLM），改用同一 API Key 下的 Qwen/Qwen3-VL-32B-Instruct，新增 `.env` 配置项 `VISION_MODEL`。
2. 新增 POST /api/vision：multer 内存接收图片（≤10MB，jpg/png/webp/gif），转 base64 data URL 调用视觉模型，返回中文描述。
3. 新增页面 vision.html + js/vision.js：点击/选择图片显示预览，识别后展示描述、文件名与模型，错误有提示；首页导航加入「图像识别」。
4. 后端控制台输出发送给视觉大模型的数据（base64 截断显示）与接收自大模型的数据；前端控制台输出上传信息与返回数据。
5. 实测：生成一张"红苹果"测试图上传，返回描述准确（含画面主体、背景、色调、水印）；页面 200、JS 语法通过。
6. 说明：视觉任务无法复用文本模型，若需严格"同一个模型"，需改用支持多模态的模型（如 Qwen3-VL）作为统一模型。

---

**时间：** 2026-11-23 14:48:57
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

实现一个语音识别的功能，使用七牛的Qwen-Audio-3.0-ASR-Flash模型，输入语音，输出文字。

**完成内容：**
1. 探测得七牛 ASR 接口为 `POST https://api.qnaigc.com/v1/audio/transcriptions`，模型 ID 实际须全小写 `qwen-audio-3.0-asr-flash`（大写形式返回 no available channels）。
2. 新增 POST /api/asr：multer 内存接收音频（wav/mp3/m4a/ogg/webm，≤20MB），以 multipart 转发七牛 ASR，返回识别文字。
3. 新增页面 asr.html + js/asr.js：支持上传音频与现场录音（MediaRecorder），带音频预览、录音计时、加载与错误提示；首页导航加入「语音识别」。
4. 后端控制台输出发送给语音识别模型的数据与接收自模型的数据；前端控制台输出上传信息与返回数据。
5. 实测：静音音频返回友好提示"未识别到语音内容"；用 SiliconFlow TTS 合成语音「今天天气不错，我们一起去吃饭吧。」上传后识别成功，返回文字基本一致。
6. `.env` 新增 QINIU_ASR_MODEL=qwen-audio-3.0-asr-flash。

---

**时间：** 2026-11-23 14:49:45
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

在课程实践里面加一个LLM实践操作痕迹展示，里面包含：1、页面支持在"硅基流动 / 七牛"之间切换实现AI客服（后端读取配置即可，前端加一个下拉框）， 并现场演示切换后照常对话。2、完成知识库实现（自己上传文件、验证知识库功能）3、图像识别（上传图片，测试图片识别功能）4、语音识别（测试语音识别功能）

**完成内容：**
1. 新增页面 llm-practice.html：顶部为「操作痕迹与验证结果」表格（4 个模块的操作、实测结果、状态），下方为 4 个 Tab，用 iframe 内嵌对应功能页，可在一个页面内完成全部现场演示。
2. 演示 1：内嵌 customer-service.html，页面已有「服务商」下拉框，后端按 provider 读取 SILICONFLOW_* / QINIU_* 配置，切换后对话照常进行。
3. 演示 2/3/4：内嵌 knowledge.html（上传、列表、删除、问答）、vision.html（图片上传识别）、asr.html（音频上传/录音识别）。
4. 新增 js/practice.js：Tab 切换时更新 iframe 地址与演示提示，并打印日志；样式追加至 style.css；首页导航加入「LLM 实践展示」。
5. 实测：llm-practice.html 与 4 个内嵌页面均返回 200，JS 语法检查通过。
6. 说明：无新增或修改接口（4 个模块复用既有 /api/service、/api/kb/*、/api/vision、/api/asr）。

---

**时间：** 2026-11-23 16:13:22
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

四个模块全返回失败

**排查与修复：**
1. 现象：四个模块均提示「Failed to fetch」。
2. 排查：8031 端口监听正常，/api/health 返回 code=0；/api/kb/documents 返回 2 条文档；/api/service 首次瞬时报 fetch failed，连续重试两次均成功（上游网络抖动）。
3. 结论：页面不是通过 http://localhost:8031 打开（如直接双击 HTML 走 file://，或被其他本地端口托管），相对路径 /api 请求全部失败。
4. 修复：新增 js/origin_guard.js，检测到非 8031 或 file:// 时在页面顶部显示红色提示条并给出正确访问地址；已引入 llm-practice / knowledge / vision / asr / customer-service / ai-chat 六个页面。
5. 验证：浏览器实测 http://localhost:8031/llm-practice.html，无红色提示条，知识库 Tab 正常显示 客服FAQ.txt（2 切块）与 门店运营手册.md（4 切块），无「加载失败」。

---

**时间：** 2026-11-23 17:40:42
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

客服切换七牛还是返回失败

**排查与修复：**
1. 复现：`provider=qiniu` 返回 `code=4002，七牛服务调用失败：Too many requests for this free model`，HTTP 状态为 429，错误码 `free_campaign_global_limit`。
2. 结论：不是 Key 或配置问题，而是七牛免费模型 conatus-free 有全局限流，调用方多了就会被拒。
3. 排查其他七牛免费模型：glm-4.5-air-free、kimi-k3-free 已下线（502），nemotron free 上游 502，conatus-free 瞬时可用，故未更换模型。
4. 修复：qfy_serviceController 增加 429 自动重试，最多 3 次（间隔 2s、4s），最终失败给出中文提示并建议切换硅基流动。
5. 实测：连续 3 次请求全部成功，耗时 32.8s / 7.2s / 0.9s（首次命中两次限流后成功）。

---

**时间：** 2026-11-25 14:48:42
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

本项目提交了吗，规则还生效吗

**执行与自查：**
1. 提交状态：本地 main 与 origin/main 均为 779fb9a，工作区干净；GitHub 用户名改为 qify 后，远程地址更新为 git@github.com:qify/qify-web-llm.git。
2. 规则自查发现：10 个 HTML 页面顶部缺统一文件头注释块（姓名/学号/时间/大模型），现已补齐并单独提交。
3. 其余规则核对通过：源码文件头齐全、命名 qfy_ 前缀、接口统一响应格式、qfy_interface.md 与 qfy_database.md 持续追加、.env 未入库。

---

**时间：** 2026-11-25 16:17:06
**大模型：** DeepSeek-V4.1-Flash
**提示词全文：**

帮我完成项目（附《LLM应用设计-实验指导书.docx》）

**对照指导书补齐的内容：**
1. 数据层：新增 qfy_chat_session、qfy_chat_message 两张表（含 qfy_summarized_count 压缩水位线），写入 8 条会话 + 16 条消息测试数据。
2. 中间层：新增 /api/ai 路由组（会话增删改查、历史回放、非流式问答、SSE 流式问答），密钥仍只存 .env；所有接口保持 {code,msg,data} 统一格式，服务端打印发送给模型的 messages 与模型返回内容。
3. 上下文管理：保留最近 12 条原文，更早消息由模型压缩为摘要写入会话表，实现 Token 预算控制。
4. 前端：AI 聊天页重做为「会话侧栏 + 对话区」，支持新建/切换/重命名/删除会话、历史回放、流式逐字输出、停止中断、自写 Markdown 与代码块渲染（不引第三方库）。
5. 文档：README 增加环境要求、配置项、功能清单与数据库恢复说明；qfy_interface.md 追加 7 个新接口；qfy_database.md 追加建表与测试数据 SQL。
6. 实测：会话列表 8 条、新建/非流式/流式（21 个增量）/历史/重命名/删除全部通过；压缩测试触发摘要生成（contextCount=14，摘要 53 字）。
