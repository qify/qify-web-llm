<!--
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：Trae 专有大模型
-->

# qfy_database.md — 数据库变更记录

> 每次建表、改表或插入数据后，按执行顺序追加对应 SQL 语句（含测试数据的 INSERT）。要求仅凭此文件即可在新机器上完整重建数据库。一律追加写入，禁止覆盖已有内容。

---

## 2026-11-19

项目初始化阶段：尚未创建业务数据表。数据库凭据已写入 backend/.env（DB_USER=root、DB_PASSWORD=123456、DB_HOST=localhost、DB_NAME=qfy_course_db），.env 已加入 .gitignore，不会被提交。

待后续业务开发时在此追加建表与测试数据 SQL。

---

## 2026-11-19 14:18:51 新建科技新闻表 qfy_news

```sql
-- 1. 创建数据库（库名对应 backend/.env 的 DB_NAME）
CREATE DATABASE IF NOT EXISTS `qfy_course_db`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `qfy_course_db`;

-- 2. 创建科技新闻表
CREATE TABLE IF NOT EXISTS qfy_news (
  qfy_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻ID',
  qfy_title VARCHAR(200) NOT NULL COMMENT '标题',
  qfy_summary VARCHAR(500) NOT NULL COMMENT '摘要',
  qfy_content TEXT NOT NULL COMMENT '正文内容',
  qfy_source VARCHAR(100) NOT NULL COMMENT '来源',
  qfy_author VARCHAR(50) NOT NULL COMMENT '作者',
  qfy_category VARCHAR(50) NOT NULL COMMENT '分类',
  qfy_publish_time DATETIME NOT NULL COMMENT '发布时间',
  qfy_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
  PRIMARY KEY (qfy_id),
  KEY qfy_idx_publish_time (qfy_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科技新闻表';

-- 3. 插入测试数据（10 条）
INSERT INTO qfy_news (qfy_title, qfy_summary, qfy_content, qfy_source, qfy_author, qfy_category, qfy_publish_time) VALUES
('国内首条 8 英寸硅光芯片产线正式通线', '该产线聚焦硅基光电子芯片，覆盖设计、流片到封装测试全流程，预计年产能 2 万片。', '该产线聚焦硅基光电子芯片，覆盖设计、流片到封装测试全流程，预计年产能 2 万片。', '科技日报', '李明远', '半导体', '2026-11-19 09:20:00'),
('国产开源社区发布千亿参数大模型推理框架', '新框架支持多卡并行与量化推理，同等硬件下吞吐量提升约 40%，已开源全部核心代码。', '新框架支持多卡并行与量化推理，同等硬件下吞吐量提升约 40%，已开源全部核心代码。', '开源前线', '周亦然', '人工智能', '2026-11-18 16:45:00'),
('多家车企获准开展 L3 级自动驾驶道路试点', '首批试点覆盖 6 个城市的指定高速路段，要求车辆配备接管提示与数据记录装置。', '首批试点覆盖 6 个城市的指定高速路段，要求车辆配备接管提示与数据记录装置。', '汽车科技网', '陈思远', '智能汽车', '2026-11-17 11:10:00'),
('国家超算互联网平台新增 12 个算力节点', '平台接入节点总数达到 58 个，可为科研机构提供统一调度的大规模异构算力。', '平台接入节点总数达到 58 个，可为科研机构提供统一调度的大规模异构算力。', '中国科学报', '赵启航', '算力网络', '2026-11-16 14:30:00'),
('量子计算原型机实现 512 比特纠缠操控', '研究团队将比特保真度提升至 99.2%，为可扩展量子处理器提供了新的技术路径。', '研究团队将比特保真度提升至 99.2%，为可扩展量子处理器提供了新的技术路径。', '物理学报', '孙博文', '量子计算', '2026-11-15 10:05:00'),
('6G 通感一体化技术完成外场试验', '试验在毫米波频段实现通信与感知共享波形，单站感知距离超过 800 米。', '试验在毫米波频段实现通信与感知共享波形，单站感知距离超过 800 米。', '通信世界', '吴清和', '通信技术', '2026-11-13 15:40:00'),
('开源鸿蒙设备装机量突破 10 亿台', '生态伙伴超过 3000 家，覆盖智能家居、工业控制与车载终端等多个领域。', '生态伙伴超过 3000 家，覆盖智能家居、工业控制与车载终端等多个领域。', '数字生态观察', '郑雅宁', '操作系统', '2026-11-12 09:15:00'),
('商业航天可重复使用火箭完成垂直回收试验', '一子级在 10 公里高度完成悬停与精准着陆，为后续入轨复用任务奠定基础。', '一子级在 10 公里高度完成悬停与精准着陆，为后续入轨复用任务奠定基础。', '航天视点', '冯启明', '商业航天', '2026-11-11 18:00:00'),
('AI 辅助诊疗系统在多家三甲医院试点落地', '系统覆盖影像筛查与病历质控场景，试点期间影像判读效率提升约 35%。', '系统覆盖影像筛查与病历质控场景，试点期间影像判读效率提升约 35%。', '健康科技报', '许佳琪', '智慧医疗', '2026-11-10 13:25:00'),
('全国算力网络调度平台上线试运行', '平台打通东西部算力供需，首批接入 20 余家云服务商与数据中心。', '平台打通东西部算力供需，首批接入 20 余家云服务商与数据中心。', '数字经济周刊', '黄立诚', '基础设施', '2026-11-09 08:50:00');

-- 4. 执行结果：qfy_news 共 10 条测试数据
```

---

## 2026-11-19 14:20:16 新建科技图文表 qfy_gallery

```sql
-- 1. 创建科技图文表
CREATE TABLE IF NOT EXISTS qfy_gallery (
  qfy_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文ID',
  qfy_title VARCHAR(200) NOT NULL COMMENT '标题',
  qfy_description VARCHAR(500) NOT NULL COMMENT '图文描述',
  qfy_image_url VARCHAR(500) NOT NULL COMMENT '图片地址',
  qfy_category VARCHAR(50) NOT NULL COMMENT '分类',
  qfy_publish_date DATE NOT NULL COMMENT '发布日期',
  qfy_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
  PRIMARY KEY (qfy_id),
  KEY qfy_idx_gallery_date (qfy_publish_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科技图文表';

-- 2. 插入测试数据（10 条，图片为 AI 文生图接口地址）
INSERT INTO qfy_gallery (qfy_title, qfy_description, qfy_category, qfy_publish_date, qfy_image_url) VALUES
('硅光芯片产线正式通线', '国内首条 8 英寸硅光芯片产线投产，覆盖设计、流片到封装测试全流程。', '半导体', '2026-11-19', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=modern%20semiconductor%20cleanroom%20with%20robotic%20wafer%20handling%20blue%20lighting%20photorealistic'),
('大模型推理集群扩容', '新增千卡推理集群，为开源大模型提供稳定的在线推理服务能力。', '人工智能', '2026-11-18', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=data%20center%20hall%20with%20rows%20of%20GPU%20server%20racks%20blue%20LED%20lights%20photorealistic'),
('L3 级自动驾驶道路试点', '首批试点覆盖 6 个城市高速路段，车辆配备接管提示与数据记录装置。', '智能汽车', '2026-11-17', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=white%20autonomous%20car%20driving%20on%20highway%20at%20dusk%20with%20roof%20sensors%20photorealistic'),
('超算互联网新增算力节点', '平台接入节点达到 58 个，可统一调度大规模异构算力资源。', '算力网络', '2026-11-16', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=supercomputer%20hall%20with%20tall%20black%20cabinets%20and%20glowing%20cables%20photorealistic'),
('量子计算原型机新突破', '512 比特纠缠操控实现，比特保真度提升至 99.2%。', '量子计算', '2026-11-15', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=quantum%20computer%20inside%20golden%20dilution%20refrigerator%20laboratory%20photorealistic'),
('6G 通感一体化外场试验', '毫米波频段实现通信与感知共享波形，单站感知距离超过 800 米。', '通信技术', '2026-11-13', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=6G%20telecom%20antenna%20tower%20on%20rooftop%20under%20blue%20sky%20photorealistic'),
('鸿蒙智家生态持续扩张', '开源鸿蒙设备装机量突破 10 亿台，覆盖家居、工业与车载场景。', '智能家居', '2026-11-12', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=smart%20home%20living%20room%20with%20connected%20devices%20and%20ambient%20lighting%20photorealistic'),
('可重复使用火箭回收成功', '一子级在 10 公里高度完成悬停与精准着陆，为入轨复用奠定基础。', '商业航天', '2026-11-11', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=reusable%20rocket%20landing%20vertically%20on%20launch%20pad%20with%20exhaust%20plume%20photorealistic'),
('AI 辅助诊疗试点落地', '系统覆盖影像筛查与病历质控，试点期间判读效率提升约 35%。', '智慧医疗', '2026-11-10', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=doctor%20reviewing%20medical%20images%20on%20screen%20with%20AI%20assistance%20in%20hospital%20photorealistic'),
('全国算力调度平台上线', '打通东西部算力供需，首批接入 20 余家云服务商与数据中心。', '基础设施', '2026-11-09', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=network%20operations%20center%20with%20large%20wall%20screens%20showing%20data%20dashboards%20photorealistic');

-- 3. 执行结果：qfy_gallery 共 10 条测试数据
```

---

## 2026-11-19 14:28:24 全站主题改为「光阴之外」（替换两张表数据）

```sql
USE `qfy_course_db`;

-- 1. 清空并重写科技新闻表数据（主题：动画《光阴之外》）
DELETE FROM qfy_news;

INSERT INTO qfy_news (qfy_title, qfy_summary, qfy_content, qfy_source, qfy_author, qfy_category, qfy_publish_time) VALUES
('动画《光阴之外》定档 12 月，首支正式预告公开', '官方公布定档日期并放出首支正式预告，灰暗天地与少年背影成为讨论焦点。', '官方公布定档日期并放出首支正式预告，灰暗天地与少年背影成为讨论焦点。', '光阴之外动画官微', '林知夏', '动画资讯', '2026-11-19 09:30:00'),
('少年许青角色 PV 发布', '角色 PV 以少年视角展开，展现城墙之内外的巨大反差与压抑氛围。', '角色 PV 以少年视角展开，展现城墙之内外的巨大反差与压抑氛围。', '哔哩哔哩番剧', '顾清和', '角色设定', '2026-11-18 16:20:00'),
('制作团队访谈：如何还原耳根笔下的绝望与希望', '导演与美术监督分享改编思路，强调保留原著的苍凉质感与人物韧性。', '导演与美术监督分享改编思路，强调保留原著的苍凉质感与人物韧性。', '动漫前线', '沈默言', '制作动态', '2026-11-17 11:00:00'),
('动画《光阴之外》公布配音阵容', '主要角色配音演员悉数公开，团队表示配音过程反复打磨情绪层次。', '主要角色配音演员悉数公开，团队表示配音过程反复打磨情绪层次。', '次元周刊', '苏念安', '声优阵容', '2026-11-16 14:10:00'),
('世界观设定集上线：灰暗天地与拾荒者之城', '官方设定集公开城墙、荒野与城邦布局，展现完整的世界观细节。', '官方设定集公开城墙、荒野与城邦布局，展现完整的世界观细节。', '光阴之外动画官微', '林知夏', '世界观', '2026-11-15 10:00:00'),
('片头曲《光阴之外》完整版上线', '片头曲完整版登陆音乐平台，水墨风片头画面同步公开。', '片头曲完整版登陆音乐平台，水墨风片头画面同步公开。', '音浪娱乐', '陆时行', '动画音乐', '2026-11-13 15:30:00'),
('动画首映礼举行，主创分享改编思路', '首映礼放映前三集，主创围绕节奏把控与名场面还原进行分享。', '首映礼放映前三集，主创围绕节奏把控与名场面还原进行分享。', '光影现场', '程一鸣', '线下活动', '2026-11-12 09:40:00'),
('名场面分镜公开：少年走出城墙的那一刻', '官方公开关键分镜，少年跨出城墙的镜头被评价为情绪最高点。', '官方公开关键分镜，少年跨出城墙的镜头被评价为情绪最高点。', '动画制作组', '顾清和', '剧情解析', '2026-11-11 18:20:00'),
('动画《光阴之外》海外播出权售出', '作品将在多个海外平台同步上线，并配备多语种字幕。', '作品将在多个海外平台同步上线，并配备多语种字幕。', '次元周刊', '苏念安', '动画资讯', '2026-11-10 13:00:00'),
('官方周边首批发售，限定版设定集同步开售', '首批周边包含角色立牌与画集，限定版设定集上线即售罄。', '首批周边包含角色立牌与画集，限定版设定集上线即售罄。', '光阴之外动画官微', '程一鸣', '周边商品', '2026-11-09 08:30:00');

-- 2. 清空并重写科技图文表数据（图片为 AI 文生图接口地址）
DELETE FROM qfy_gallery;

INSERT INTO qfy_gallery (qfy_title, qfy_description, qfy_category, qfy_publish_date, qfy_image_url) VALUES
('少年许青立于城墙之上', '灰暗天地间，少年独自站在古老城墙之上，望向墙外的世界。', '人物设定', '2026-11-19', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=anime%20boy%20standing%20on%20ancient%20city%20wall%20at%20dusk%20with%20grey%20sky%20cinematic%20anime%20style'),
('拾荒者之城', '城墙之内的破败城邦，拾荒者在废墟之间讨生活。', '场景设定', '2026-11-18', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=anime%20ruined%20ancient%20city%20street%20with%20poor%20scavengers%20grey%20atmosphere%20cinematic'),
('墙外的荒野', '城外是无边荒野，灰雾笼罩，危机四伏。', '场景设定', '2026-11-17', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=anime%20vast%20wasteland%20outside%20ancient%20city%20walls%20with%20grey%20fog%20cinematic'),
('少年与老者的相遇', '城墙角落，少年遇见改变他命运的老者。', '剧情名场面', '2026-11-16', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=anime%20old%20man%20and%20young%20boy%20talking%20in%20ruined%20alley%20dim%20light%20cinematic'),
('夜色中的修行', '夜色之下，少年以凡人之躯磨砺己身。', '剧情名场面', '2026-11-15', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=anime%20young%20boy%20practicing%20martial%20arts%20alone%20at%20night%20under%20moonlight%20cinematic'),
('人族最后的光', '在灰暗天地间，仍有人执着守护最后的希望。', '主题概念', '2026-11-13', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=anime%20lone%20hero%20facing%20dark%20storm%20with%20faint%20golden%20light%20cinematic'),
('群像主视觉海报', '动画主视觉公开，多位关键角色同框亮相。', '视觉海报', '2026-11-12', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=anime%20key%20visual%20group%20poster%20of%20several%20characters%20dark%20fantasy%20cinematic'),
('名场面：走出城墙', '少年跨出城墙的一刻，故事真正开始。', '剧情名场面', '2026-11-11', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=anime%20boy%20walking%20through%20massive%20ancient%20gate%20into%20foggy%20wasteland%20cinematic'),
('水墨风片头画面', '片头采用水墨风格，勾勒光阴流转的意境。', '视觉海报', '2026-11-10', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=chinese%20ink%20wash%20painting%20style%20anime%20opening%20scene%20mountains%20and%20mist'),
('动画视觉概念图', '官方公开的视觉概念图，呈现光阴之外的世界质感。', '视觉海报', '2026-11-09', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_4_3&prompt=dark%20fantasy%20anime%20concept%20art%20of%20ancient%20world%20with%20floating%20dust%20and%20ruins');

-- 3. 执行结果：qfy_news、qfy_gallery 各 10 条「光阴之外」主题数据
```

---

## 2026-11-19 14:31:33 回滚：数据恢复为科技新闻 / 科技图文

```sql
USE `qfy_course_db`;

-- 1. 清空两张表，随后按时间顺序重新执行本文档前述的原始 INSERT 语句
--    （「新建科技新闻表 qfy_news」节的 10 条 INSERT、
--      「新建科技图文表 qfy_gallery」节的 10 条 INSERT）
DELETE FROM qfy_news;
DELETE FROM qfy_gallery;

-- 2. 执行结果：qfy_news 首条为「国内首条 8 英寸硅光芯片产线正式通线」，
--    qfy_gallery 首条为「硅光芯片产线正式通线」，均为 10 条
```

---

## 新建知识库表（RAG）

-- 执行时间：2026-11-23 14:39:30
-- 执行方式：backend 目录下 node 脚本，读取 .env 凭据后建库建表

```sql
CREATE DATABASE IF NOT EXISTS `qfy_course_db` DEFAULT CHARACTER SET utf8mb4;
USE `qfy_course_db`;

CREATE TABLE IF NOT EXISTS qfy_kb_document (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ext VARCHAR(16) NOT NULL,
  size INT UNSIGNED NOT NULL DEFAULT 0,
  chunk_count INT UNSIGNED NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'ready',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS qfy_kb_chunk (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doc_id INT UNSIGNED NOT NULL,
  chunk_index INT UNSIGNED NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  embedding LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_doc (doc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

-- 测试数据说明：
-- 样例知识库文件位于 backend/seed_kb/（客服FAQ.txt、门店运营手册.md），
-- 通过 POST /api/kb/upload 上传后由接口自动完成「解析 -> 切块 -> 向量化 -> 入库」。
-- 等效的文档记录（切块与向量需重新上传生成，因 embedding 为 1024 维浮点数组）：

```sql
INSERT INTO qfy_kb_document (name, ext, size, chunk_count, status) VALUES
('客服FAQ.txt', 'txt', 950, 2, 'ready'),
('门店运营手册.md', 'md', 2100, 4, 'ready');
```

-- 重建步骤：执行上方建表 SQL -> 启动后端 -> 在 knowledge.html 重新上传 seed_kb 下两个文件即可。

---

## 2026-11-25 新增：AI 聊天会话表与消息表（会话持久化 + 上下文压缩）

-- 设计说明：
-- qfy_chat_session 保存会话标题、上下文摘要（早期消息压缩后写入）与消息数；
-- qfy_chat_message 保存每一轮 user / assistant 消息，用于历史回放与多轮上下文。

```sql
CREATE TABLE IF NOT EXISTS qfy_chat_session (
  qfy_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  qfy_title VARCHAR(120) NOT NULL DEFAULT '新的对话',
  qfy_summary TEXT NULL,
  qfy_summarized_count INT UNSIGNED NOT NULL DEFAULT 0,
  qfy_message_count INT UNSIGNED NOT NULL DEFAULT 0,
  qfy_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  qfy_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS qfy_chat_message (
  qfy_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  qfy_session_id INT UNSIGNED NOT NULL,
  qfy_role ENUM('user', 'assistant', 'system') NOT NULL,
  qfy_content TEXT NOT NULL,
  qfy_tokens INT UNSIGNED NOT NULL DEFAULT 0,
  qfy_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qfy_session (qfy_session_id),
  CONSTRAINT fk_qfy_msg_session FOREIGN KEY (qfy_session_id)
    REFERENCES qfy_chat_session (qfy_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

-- 测试数据（8 条会话 + 16 条消息）：

```sql
INSERT INTO qfy_chat_session (qfy_title, qfy_summary, qfy_message_count) VALUES
('简历项目该怎么写', NULL, 2),
('JavaScript 闭包是什么', NULL, 2),
('帮我解释 MVC 分层', NULL, 2),
('RAG 检索流程梳理', NULL, 2),
('前端页面配色建议', NULL, 2),
('MySQL 索引优化', NULL, 2),
('多轮对话上下文怎么管理', NULL, 2),
('课程作业演示流程', NULL, 2);

INSERT INTO qfy_chat_message (qfy_session_id, qfy_role, qfy_content, qfy_tokens) VALUES
(1, 'user', '我做的项目是 LLM 应用，简历里该怎么描述？', 20),
(1, 'assistant', '建议按「技术栈 + 解决的问题 + 量化结果」写，例如：基于 Node.js + Express 搭建 LLM 中间层，封装密钥管理、上下文压缩与 RAG 检索。', 60),
(2, 'user', 'JavaScript 的闭包是什么？举个简单例子。', 16),
(2, 'assistant', '闭包是函数与其词法作用域的组合。例如 function counter(){ let n = 0; return () => ++n; }，返回的函数仍能访问 n，因此可以持续累加。', 62),
(3, 'user', 'Express 项目里 MVC 怎么分层？', 14),
(3, 'assistant', 'Model 负责数据访问（SQL 与连接池），View 对应前端页面，Controller 处理参数校验与响应组装，Route 只做路径映射。', 55),
(4, 'user', 'RAG 的检索和生成是什么关系？', 14),
(4, 'assistant', '检索负责从知识库找出最相关的片段，生成负责把这些片段作为上下文交给大模型作答，二者串行执行，回答需要标注引用来源。', 58),
(5, 'user', '深色网页怎么配色比较好看？', 13),
(5, 'assistant', '建议深蓝灰底色配一到两个高饱和强调色，文字用低饱和浅色保证对比度，卡片使用半透明背景与细边框区分层级。', 52),
(6, 'user', 'MySQL 索引什么时候会失效？', 14),
(6, 'assistant', '常见的失效场景：对索引列使用函数或运算、隐式类型转换、模糊查询以 % 开头、联合索引未遵循最左前缀原则。', 56),
(7, 'user', '多轮对话历史太长怎么办？', 13),
(7, 'assistant', '可以保留最近若干轮原文，把更早的消息交给模型压缩成一段摘要写入会话表，每轮只发送「摘要 + 最近若干轮」，从而控制 Token 预算。', 60),
(8, 'user', '演示的时候按什么顺序讲比较好？', 15),
(8, 'assistant', '建议按「架构图 -> 普通对话 -> 会话持久化 -> 上下文压缩 -> 异常处理」的顺序演示，先讲清数据流，再逐个功能点当场操作。', 58);
```

---

## 2026-11-27 主题切换：画世界（作品表扩展字段 + 资讯/作品数据替换）

```sql
-- 1. 作品表新增作者与点赞数字段
ALTER TABLE qfy_gallery
  ADD COLUMN qfy_author VARCHAR(40) NOT NULL DEFAULT '画世界' AFTER qfy_category,
  ADD COLUMN qfy_likes INT UNSIGNED NOT NULL DEFAULT 0 AFTER qfy_author;

-- 2. 作品数据（图片为项目内本地素材，路径相对 frontend/）
UPDATE qfy_gallery SET qfy_title='银蓝誓约', qfy_description='白发双人插画，冷调银蓝配色，突出衣料纹理与羽毛元素。', qfy_image_url='images/art/cover1.jpg', qfy_category='二次元', qfy_author='青梧', qfy_likes=8526 WHERE qfy_id=21;
UPDATE qfy_gallery SET qfy_title='白夜骑士', qfy_description='银蓝礼服与长剑的局部特写，注重手部与配饰的细节刻画。', qfy_image_url='images/art/feed1.jpg', qfy_category='二次元', qfy_author='无和芒空', qfy_likes=6218 WHERE qfy_id=22;
UPDATE qfy_gallery SET qfy_title='微光少年', qfy_description='逆光下的少年半身像，用高对比光影塑造轮廓。', qfy_image_url='images/art/1.jpg', qfy_category='人物', qfy_author='山与海', qfy_likes=4870 WHERE qfy_id=23;
UPDATE qfy_gallery SET qfy_title='银发绅士', qfy_description='银白发与米白西装的立绘练习，面料质感是这次的重点。', qfy_image_url='images/art/5.jpg', qfy_category='人物', qfy_author='小鱼干', qfy_likes=5521 WHERE qfy_id=24;
UPDATE qfy_gallery SET qfy_title='山野来信', qfy_description='远山与草地的风景速涂，练习空气透视与色温变化。', qfy_image_url='images/art/cover2.jpg', qfy_category='风景', qfy_author='松浦', qfy_likes=3210 WHERE qfy_id=25;
UPDATE qfy_gallery SET qfy_title='林间清晨', qfy_description='晨雾中的林间小道，以低饱和绿灰铺陈氛围。', qfy_image_url='images/art/cover3.jpg', qfy_category='风景', qfy_author='梓秋', qfy_likes=2744 WHERE qfy_id=26;
UPDATE qfy_gallery SET qfy_title='夏日练习', qfy_description='夏日主题的人物速写，尝试更松弛的线条。', qfy_image_url='images/art/cover4.jpg', qfy_category='人物', qfy_author='星瑞羽笑', qfy_likes=1968 WHERE qfy_id=27;
UPDATE qfy_gallery SET qfy_title='速写手记', qfy_description='日常速写合集，保留草稿线条与修改痕迹。', qfy_image_url='images/art/feed2.jpg', qfy_category='草稿', qfy_author='泠洛', qfy_likes=1420 WHERE qfy_id=28;
UPDATE qfy_gallery SET qfy_title='光影练习', qfy_description='针对侧光与阴影边缘的专项练习。', qfy_image_url='images/art/feed3.jpg', qfy_category='草稿', qfy_author='白露', qfy_likes=987 WHERE qfy_id=29;
UPDATE qfy_gallery SET qfy_title='夜色渐变', qfy_description='夜景配色实验，记录同一场景在不同时间段的色彩变化。', qfy_image_url='images/art/feed4.jpg', qfy_category='色彩', qfy_author='鹤川', qfy_likes=2333 WHERE qfy_id=30;

-- 3. 资讯数据替换为画世界主题（10 条）
UPDATE qfy_news SET qfy_title='画世界 V6.2 发布：笔刷引擎升级，支持压感曲线自定义', qfy_summary='新版重点优化笔刷响应速度，并新增压感曲线调节面板，手绘线条更接近纸笔手感。', qfy_content='本次更新覆盖移动端与桌面端：笔刷引擎重写后延迟降低约 30%，新增压感曲线自定义、图层组混合模式与参考图取色。用户可在设置中心查看完整更新日志。', qfy_source='画世界官方', qfy_author='画世界团队', qfy_category='版本更新', qfy_publish_time='2026-11-27 09:00:00' WHERE qfy_id=21;
UPDATE qfy_news SET qfy_title='冬季绘画大赛「雪落无声」开启征稿', qfy_summary='主题为冬日与静谧，投稿截止 12 月 20 日，设人气奖与评委奖各 10 名。', qfy_content='大赛分为插画与速写两个组别，单账号最多投稿 3 幅。作品需为原创，禁止 AI 直接生成后投稿，评审将从构图、色彩、叙事三方面打分。', qfy_source='画世界官方', qfy_author='活动运营组', qfy_category='活动', qfy_publish_time='2026-11-26 18:30:00' WHERE qfy_id=22;
UPDATE qfy_news SET qfy_title='新人画家访谈：从临摹到原创的三百天', qfy_summary='专访站内创作者「青梧」，聊临摹方法、练习节奏与心态调整。', qfy_content='青梧分享了每日一小时的练习计划：前三个月只做结构临摹，之后开始半原创，最后进入完整创作。她建议新手不要过早追求完成度，先把形和色练稳。', qfy_source='画世界官方', qfy_author='内容编辑部', qfy_category='访谈', qfy_publish_time='2026-11-26 10:20:00' WHERE qfy_id=23;
UPDATE qfy_news SET qfy_title='绘画教程上新：二次元人物衣褶的三种画法', qfy_summary='从圆柱体理解衣褶走向，配合三个可临摹的分解示例。', qfy_content='教程分为基础形、受力点与布料厚度三个部分，附带可下载的线稿练习包。建议先画结构再上色，避免颜色掩盖形体问题。', qfy_source='画世界课堂', qfy_author='白露', qfy_category='教程', qfy_publish_time='2026-11-25 20:00:00' WHERE qfy_id=24;
UPDATE qfy_news SET qfy_title='「每日一画」打卡活动数据公布：连续打卡人数创新高', qfy_summary='本月共有 1.2 万名用户参与打卡，平均连续天数 11 天。', qfy_content='官方表示后续会为连续打卡 30 天的用户发放限定头像框，并在发现页增加按打卡主题聚合的入口。', qfy_source='画世界官方', qfy_author='活动运营组', qfy_category='活动', qfy_publish_time='2026-11-25 14:10:00' WHERE qfy_id=25;
UPDATE qfy_news SET qfy_title='移动端手势操作优化：双指旋转与快速取色', qfy_summary='画布支持双指旋转，长按唤出取色环，减少工具切换次数。', qfy_content='本次手势更新适用于 6.1 及以上版本，可在设置中心的「手势与快捷操作」中查看示意图并自定义灵敏度。', qfy_source='画世界官方', qfy_author='画世界团队', qfy_category='版本更新', qfy_publish_time='2026-11-24 16:45:00' WHERE qfy_id=26;
UPDATE qfy_news SET qfy_title='作品打分功能上线：获得同好反馈更直接', qfy_summary='创作者可开启匿名打分，读者从构图、色彩、完成度三个维度评价。', qfy_content='打分结果仅创作者可见，避免公开排名带来的压力。开启入口位于「我的 - 作品打分」，可随时关闭。', qfy_source='画世界官方', qfy_author='产品团队', qfy_category='功能', qfy_publish_time='2026-11-24 09:30:00' WHERE qfy_id=27;
UPDATE qfy_news SET qfy_title='色彩专题：夜色插画的五种配色思路', qfy_summary='以蓝紫、青橙、低饱和灰调为例，拆解夜景打光逻辑。', qfy_content='文章给出五组可直接套用的色板，并说明主光源、环境光与反射光的关系。建议先用小色块铺大关系，再补细节。', qfy_source='画世界课堂', qfy_author='鹤川', qfy_category='教程', qfy_publish_time='2026-11-23 19:00:00' WHERE qfy_id=28;
UPDATE qfy_news SET qfy_title='创作者版权保护说明：水印与署名规范更新', qfy_summary='作品默认添加可见水印，支持自定义署名位置与透明度。', qfy_content='官方强调转载需获得作者授权，站内举报通道已与人工审核打通，确认侵权后将下架作品并限制账号功能。', qfy_source='画世界官方', qfy_author='社区治理组', qfy_category='公告', qfy_publish_time='2026-11-22 11:00:00' WHERE qfy_id=29;
UPDATE qfy_news SET qfy_title='十二月创作主题预告：光与影', qfy_summary='下月主题聚焦光影关系，配套直播课与点评活动将同步开启。', qfy_content='主题页将提供参考图包与构图模板，直播课安排在每周三晚八点，点评活动面向所有投稿作品开放。', qfy_source='画世界官方', qfy_author='内容编辑部', qfy_category='活动', qfy_publish_time='2026-11-21 15:20:00' WHERE qfy_id=30;
```

> 说明：以上 UPDATE 使用本机实际自增 ID（21~30）。在新机器重建时，若两张表的自增起点不同，可改为按 `ORDER BY qfy_id` 的序号依次执行，效果等同。图片素材位于 `frontend/images/art/`，需随项目一起复制。

