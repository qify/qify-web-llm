<!--
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
-->

# qfy_database.md — 数据库变更记录

> 每次建表、改表或插入数据后，按执行顺序追加对应 SQL 语句（含测试数据的 INSERT）。要求仅凭此文件即可在新机器上完整重建数据库。一律追加写入，禁止覆盖已有内容。

---

## 2026-11-19

项目初始化阶段：尚未创建业务数据表。数据库凭据已写入 backend/.env（DB_USER=root、DB_PASSWORD=123456、DB_HOST=localhost、DB_NAME=qfy_course_db），.env 已加入 .gitignore，不会被提交。

待后续业务开发时在此追加建表与测试数据 SQL。
