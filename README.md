<!--
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
-->

# 网页设计课程作业

- **学号：** 24001011031
- **姓名：** 齐方圆
- **项目类别：** 模仿

## 项目简介

《高级网页设计》课程作业项目，采用前后端分离架构：前端使用原生 HTML / CSS / JavaScript，后端使用 Node.js + Express，数据库使用 MySQL。

## 目录结构

```
vibe coding/
├── frontend/              # 前端（原生 HTML/CSS/JS）
│   ├── index.html         # 首页
│   ├── css/               # 样式
│   ├── js/                # 脚本
│   ├── fonts/             # iconfont 图标文件
│   └── images/            # 图片资源
├── backend/               # 后端（Node.js + Express + MySQL）
│   ├── app.js             # 服务入口（端口 8031）
│   ├── controllers/       # 控制器
│   ├── models/            # 数据模型
│   ├── routes/            # 路由
│   ├── .env               # 数据库凭据（不提交）
│   ├── qfy_interface.md   # 接口变更记录
│   └── qfy_database.md    # 数据库变更记录
├── AGENTS.md              # 项目开发规范
├── qifangyuan_prompt.md   # 开发指令记录
└── README.md
```

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
npm config set registry https://registry.npmmirror.com
npm install
```

### 2. 配置数据库

编辑 `backend/.env`，确认数据库凭据（默认 root / 123456），并在 MySQL 中创建对应的数据库（库名见 .env 的 DB_NAME）。

### 3. 启动服务

```bash
cd backend
npm start
```

启动后访问：<http://localhost:8031>

健康检查接口：<http://localhost:8031/api/health>

## 功能清单

| 页面 | 地址 | 说明 |
|---|---|---|
| 首页 | `/` | 项目信息与全部页面入口 |
| 数据库连接 | `/database.html` | 输入用户名密码测试 MySQL 连接 |
| 科技新闻 | `/news.html` | 数据库新闻列表 + 接口链接 |
| 科技图文 | `/gallery.html` | 图文卡片列表（图片地址存库） |
| AI 聊天 | `/ai-chat.html` | 多轮对话、会话持久化、流式输出、上下文压缩、Markdown 渲染 |
| 在线客服 | `/customer-service.html` | 客服人设 + 硅基流动/七牛热切换 |
| 知识库问答 | `/knowledge.html` | 文件上传解析、切块向量化、RAG 检索问答 |
| 图像识别 | `/vision.html` | 上传图片，视觉模型输出描述 |
| 语音识别 | `/asr.html` | 上传音频或现场录音转文字 |
| LLM 实践展示 | `/llm-practice.html` | 四项 AI 能力的操作痕迹与现场演示 |

### AI 聊天（本实验选题：基础 AI 聊天 + RAG）

- 会话管理：新建、切换、重命名、删除，历史消息从 MySQL 回放
- 多轮上下文：每轮携带最近 12 条原文；更早消息由模型压缩为摘要写入会话表（Token 预算控制）
- 流式输出：`SSE` 逐字返回，页面支持「停止」中断
- 提示词工程：system 中固定角色、任务、约束与 Markdown 输出格式
- 控制台留证：后端打印发送给模型的完整 messages 与模型返回内容；前端打印请求与流式事件

## 环境要求

- Node.js 24 及以上（使用内置 fetch）
- MySQL 8.0
- 浏览器：Chrome / Edge（语音识别需麦克风权限）

## 配置项（backend/.env）

| 变量 | 说明 |
|---|---|
| `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_NAME` | MySQL 连接信息 |
| `SILICONFLOW_API_KEY` / `SILICONFLOW_BASE_URL` / `SILICONFLOW_MODEL` | 硅基流动文本模型 |
| `VISION_MODEL` | 图像识别模型 |
| `QINIU_API_KEY` / `QINIU_BASE_URL` / `QINIU_MODEL` | 七牛文本模型（在线客服切换） |
| `QINIU_ASR_MODEL` | 七牛语音识别模型 |

> `.env` 已加入 `.gitignore`，不会提交到仓库；新机器需自行创建并填写。

## 数据库恢复

新建数据库后，按 `backend/qfy_database.md` 中的 SQL 顺序执行即可重建全部表与测试数据；知识库向量数据需在 `knowledge.html` 重新上传 `backend/seed_kb/` 下的样例文件生成。

## 开发规范

详见项目根目录 [AGENTS.md](./AGENTS.md)。所有 CSS 类名、JS 变量/函数名、数据库表名均以 `qfy_` 开头；接口统一返回 `{ "code": 0, "msg": "...", "data": {...} }` 格式。
