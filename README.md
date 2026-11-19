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

## 开发规范

详见项目根目录 [AGENTS.md](./AGENTS.md)。所有 CSS 类名、JS 变量/函数名、数据库表名均以 `qfy_` 开头；接口统一返回 `{ "code": 0, "msg": "...", "data": {...} }` 格式。
