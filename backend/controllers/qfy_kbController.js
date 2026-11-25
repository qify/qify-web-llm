/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_pool = require('../config/qfy_db');
const { qfy_parseFile } = require('../utils/qfy_kbParser');

const qfy_EMBED_MODEL = 'BAAI/bge-m3';
const qfy_EMBED_BASE = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, '');
const qfy_CHAT_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';
const qfy_CHUNK_SIZE = 400;
const qfy_CHUNK_OVERLAP = 60;
const qfy_TOP_K = 3;

// 按段落切块：单块约 400 字，块间重叠 60 字，保留上下文连续性
function qfy_splitChunks(qfy_text) {
  const qfy_paras = qfy_text.split(/\n+/).map((qfy_p) => qfy_p.trim()).filter(Boolean);
  const qfy_chunks = [];
  let qfy_buf = '';

  const qfy_push = () => {
    const qfy_content = qfy_buf.trim();
    if (qfy_content) {
      qfy_chunks.push(qfy_content);
      qfy_buf = qfy_content.slice(-qfy_CHUNK_OVERLAP);
    }
  };

  qfy_paras.forEach((qfy_para) => {
    if (qfy_buf.length + qfy_para.length + 1 > qfy_CHUNK_SIZE && qfy_buf.length > 0) {
      qfy_push();
    }
    qfy_buf += (qfy_buf ? '\n' : '') + qfy_para;
    while (qfy_buf.length > qfy_CHUNK_SIZE * 2) {
      qfy_chunks.push(qfy_buf.slice(0, qfy_CHUNK_SIZE));
      qfy_buf = qfy_buf.slice(qfy_CHUNK_SIZE - qfy_CHUNK_OVERLAP);
    }
  });
  qfy_push();

  return qfy_chunks;
}

// 调用向量模型，批量把文本转为向量（每批最多 10 条）
async function qfy_embed(qfy_texts) {
  const qfy_vectors = [];
  for (let qfy_i = 0; qfy_i < qfy_texts.length; qfy_i += 10) {
    const qfy_batch = qfy_texts.slice(qfy_i, qfy_i + 10);
    const qfy_resp = await fetch(qfy_EMBED_BASE + '/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.SILICONFLOW_API_KEY
      },
      body: JSON.stringify({ model: qfy_EMBED_MODEL, input: qfy_batch })
    });
    const qfy_data = await qfy_resp.json();
    if (!qfy_resp.ok) {
      throw new Error('向量化失败：' + (qfy_data.error ? qfy_data.error.message : 'HTTP ' + qfy_resp.status));
    }
    qfy_data.data
      .sort((qfy_a, qfy_b) => qfy_a.index - qfy_b.index)
      .forEach((qfy_item) => qfy_vectors.push(qfy_item.embedding));
  }
  return qfy_vectors;
}

// 余弦相似度
function qfy_cosine(qfy_a, qfy_b) {
  let qfy_dot = 0;
  let qfy_na = 0;
  let qfy_nb = 0;
  for (let qfy_i = 0; qfy_i < qfy_a.length; qfy_i++) {
    qfy_dot += qfy_a[qfy_i] * qfy_b[qfy_i];
    qfy_na += qfy_a[qfy_i] * qfy_a[qfy_i];
    qfy_nb += qfy_b[qfy_i] * qfy_b[qfy_i];
  }
  return qfy_dot / (Math.sqrt(qfy_na) * Math.sqrt(qfy_nb) || 1);
}

// 上传并解析知识库文件：解析 -> 切块 -> 向量化 -> 入库
const qfy_upload = async (req, res) => {
  const qfy_file = req.file;
  if (!qfy_file) {
    return res.json({ code: 5001, msg: '请选择要上传的知识库文件', data: null });
  }

  const qfy_originalName = Buffer.from(qfy_file.originalname, 'latin1').toString('utf8');
  const qfy_ext = (qfy_originalName.split('.').pop() || '').toLowerCase();

  try {
    const qfy_text = await qfy_parseFile(qfy_originalName, qfy_file.buffer);
    if (!qfy_text || qfy_text.length < 10) {
      return res.json({ code: 5002, msg: '文件内容为空或无法提取文字', data: null });
    }

    const qfy_chunks = qfy_splitChunks(qfy_text);
    const qfy_vectors = await qfy_embed(qfy_chunks);

    const [qfy_docRes] = await qfy_pool.query(
      'INSERT INTO qfy_kb_document (name, ext, size, chunk_count, status) VALUES (?, ?, ?, ?, ?)',
      [qfy_originalName, qfy_ext, qfy_file.size, qfy_chunks.length, 'ready']
    );
    const qfy_docId = qfy_docRes.insertId;

    for (let qfy_i = 0; qfy_i < qfy_chunks.length; qfy_i++) {
      await qfy_pool.query(
        'INSERT INTO qfy_kb_chunk (doc_id, chunk_index, content, embedding) VALUES (?, ?, ?, ?)',
        [qfy_docId, qfy_i, qfy_chunks[qfy_i], JSON.stringify(qfy_vectors[qfy_i])]
      );
    }

    console.log('知识库文件入库成功：', qfy_originalName, '| 字符数：', qfy_text.length, '| 切块数：', qfy_chunks.length);

    res.json({
      code: 0,
      msg: '上传成功',
      data: {
        id: qfy_docId,
        name: qfy_originalName,
        ext: qfy_ext,
        size: qfy_file.size,
        chunkCount: qfy_chunks.length,
        charCount: qfy_text.length
      }
    });
  } catch (qfy_err) {
    console.error('知识库文件解析失败：', qfy_err.message);
    res.json({ code: 5002, msg: '解析失败：' + qfy_err.message, data: null });
  }
};

// 知识库文档列表
const qfy_list = async (req, res) => {
  try {
    const [qfy_rows] = await qfy_pool.query(
      'SELECT id, name, ext, size, chunk_count, status, created_at FROM qfy_kb_document ORDER BY id DESC'
    );
    res.json({ code: 0, msg: '查询成功', data: { total: qfy_rows.length, list: qfy_rows } });
  } catch (qfy_err) {
    console.error('知识库列表查询失败：', qfy_err.message);
    res.json({ code: 5003, msg: '查询失败：' + qfy_err.message, data: null });
  }
};

// 删除知识库文档（连同切块）
const qfy_remove = async (req, res) => {
  const qfy_id = parseInt(req.params.id, 10);
  if (!qfy_id) {
    return res.json({ code: 5001, msg: '参数错误：无效的文档 id', data: null });
  }
  try {
    await qfy_pool.query('DELETE FROM qfy_kb_chunk WHERE doc_id = ?', [qfy_id]);
    const [qfy_del] = await qfy_pool.query('DELETE FROM qfy_kb_document WHERE id = ?', [qfy_id]);
    if (qfy_del.affectedRows === 0) {
      return res.json({ code: 5004, msg: '文档不存在', data: null });
    }
    res.json({ code: 0, msg: '删除成功', data: { id: qfy_id } });
  } catch (qfy_err) {
    console.error('知识库文档删除失败：', qfy_err.message);
    res.json({ code: 5003, msg: '删除失败：' + qfy_err.message, data: null });
  }
};

// 基于知识库的问答：问题向量化 -> 检索 Top3 切块 -> 拼装提示词 -> 调用大模型
const qfy_ask = async (req, res) => {
  const qfy_question = req.body && typeof req.body.question === 'string' ? req.body.question.trim() : '';
  if (!qfy_question) {
    return res.json({ code: 5001, msg: '参数错误：question 不能为空', data: null });
  }
  if (qfy_question.length > 500) {
    return res.json({ code: 5001, msg: '参数错误：question 不能超过 500 字', data: null });
  }

  try {
    const [qfy_rows] = await qfy_pool.query(
      'SELECT c.id, c.doc_id, c.chunk_index, c.content, c.embedding, d.name AS doc_name '
        + 'FROM qfy_kb_chunk c JOIN qfy_kb_document d ON c.doc_id = d.id'
    );
    if (qfy_rows.length === 0) {
      return res.json({ code: 5005, msg: '知识库为空，请先上传文件', data: null });
    }

    const [qfy_qVec] = await qfy_embed([qfy_question]);
    const qfy_scored = qfy_rows
      .map((qfy_row) => ({
        id: qfy_row.id,
        docId: qfy_row.doc_id,
        docName: qfy_row.doc_name,
        chunkIndex: qfy_row.chunk_index,
        content: qfy_row.content,
        score: qfy_cosine(qfy_qVec, JSON.parse(qfy_row.embedding || '[]'))
      }))
      .sort((qfy_a, qfy_b) => qfy_b.score - qfy_a.score);

    const qfy_top = qfy_scored.slice(0, qfy_TOP_K);
    const qfy_context = qfy_top
      .map((qfy_item, qfy_i) => '【资料' + (qfy_i + 1) + '｜' + qfy_item.docName + '】\n' + qfy_item.content)
      .join('\n\n');

    const qfy_payload = {
      model: qfy_CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是知识库问答助手。只能依据【参考资料】回答问题，资料中没有的信息就回答"知识库中暂未找到相关信息"，不要编造。回答简洁，并在末尾标注引用的资料编号。'
        },
        {
          role: 'user',
          content: qfy_context + '\n\n【问题】\n' + qfy_question
        }
      ],
      max_tokens: 800,
      temperature: 0.2,
      stream: false
    };

    console.log('=== 发送给大模型的数据 ===');
    console.log(JSON.stringify(qfy_payload, null, 2));

    const qfy_resp = await fetch((process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.SILICONFLOW_API_KEY
      },
      body: JSON.stringify(qfy_payload)
    });
    const qfy_data = await qfy_resp.json();

    console.log('=== 接自大模型的数据 ===');
    console.log(JSON.stringify(qfy_data, null, 2));

    if (!qfy_resp.ok) {
      return res.json({
        code: 5002,
        msg: '大模型调用失败：' + (qfy_data.error ? qfy_data.error.message : 'HTTP ' + qfy_resp.status),
        data: null
      });
    }

    const qfy_answer = qfy_data.choices && qfy_data.choices[0] ? qfy_data.choices[0].message.content : '';

    res.json({
      code: 0,
      msg: '回答成功',
      data: {
        question: qfy_question,
        answer: qfy_answer,
        model: qfy_data.model || qfy_CHAT_MODEL,
        sources: qfy_top.map((qfy_item) => ({
          docName: qfy_item.docName,
          chunkIndex: qfy_item.chunkIndex,
          score: Number(qfy_item.score.toFixed(4)),
          content: qfy_item.content
        })),
        usage: qfy_data.usage || null
      }
    });
  } catch (qfy_err) {
    console.error('知识库问答失败：', qfy_err.message);
    res.json({ code: 5002, msg: '问答失败：' + qfy_err.message, data: null });
  }
};

module.exports = { qfy_upload, qfy_list, qfy_remove, qfy_ask };
