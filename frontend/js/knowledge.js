/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_kbFile = document.getElementById('qfy_kb_file');
const qfy_kbUploadBtn = document.getElementById('qfy_kb_upload_btn');
const qfy_kbUploadTip = document.getElementById('qfy_kb_upload_tip');
const qfy_kbDocBody = document.getElementById('qfy_kb_doc_body');
const qfy_kbQuestion = document.getElementById('qfy_kb_question');
const qfy_kbAskBtn = document.getElementById('qfy_kb_ask_btn');
const qfy_kbAskTip = document.getElementById('qfy_kb_ask_tip');
const qfy_kbAnswer = document.getElementById('qfy_kb_answer');
const qfy_kbAnswerText = document.getElementById('qfy_kb_answer_text');
const qfy_kbSources = document.getElementById('qfy_kb_sources');

// 文件大小格式化
function qfy_formatSize(qfy_bytes) {
  if (qfy_bytes < 1024) return qfy_bytes + ' B';
  if (qfy_bytes < 1024 * 1024) return (qfy_bytes / 1024).toFixed(1) + ' KB';
  return (qfy_bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// 加载知识库文档列表
async function qfy_loadDocs() {
  try {
    const qfy_resp = await fetch('/api/kb/documents');
    const qfy_data = await qfy_resp.json();
    console.log('接收自后端的数据（文档列表）：', qfy_data);

    if (qfy_data.code !== 0) {
      throw new Error(qfy_data.msg);
    }

    qfy_kbDocBody.innerHTML = '';
    if (qfy_data.data.total === 0) {
      qfy_kbDocBody.innerHTML = '<tr><td colspan="7" class="qfy_kb_empty">知识库为空，请先上传文件</td></tr>';
      return;
    }

    qfy_data.data.list.forEach((qfy_doc) => {
      const qfy_tr = document.createElement('tr');
      const qfy_tds = [
        qfy_doc.id,
        qfy_doc.name,
        qfy_doc.ext,
        qfy_formatSize(qfy_doc.size),
        qfy_doc.chunk_count,
        String(qfy_doc.created_at).replace('T', ' ').slice(0, 19)
      ];
      qfy_tds.forEach((qfy_text) => {
        const qfy_td = document.createElement('td');
        qfy_td.textContent = qfy_text;
        qfy_tr.appendChild(qfy_td);
      });

      const qfy_opTd = document.createElement('td');
      const qfy_delBtn = document.createElement('button');
      qfy_delBtn.className = 'qfy_kb_del';
      qfy_delBtn.type = 'button';
      qfy_delBtn.textContent = '删除';
      qfy_delBtn.addEventListener('click', () => qfy_deleteDoc(qfy_doc.id, qfy_doc.name));
      qfy_opTd.appendChild(qfy_delBtn);
      qfy_tr.appendChild(qfy_opTd);

      qfy_kbDocBody.appendChild(qfy_tr);
    });
  } catch (qfy_err) {
    console.error('知识库列表加载失败：', qfy_err);
    qfy_kbDocBody.innerHTML = '<tr><td colspan="7" class="qfy_kb_empty">加载失败：' + qfy_err.message + '</td></tr>';
  }
}

// 上传文件
async function qfy_uploadFile() {
  const qfy_file = qfy_kbFile.files[0];
  if (!qfy_file) {
    qfy_kbUploadTip.textContent = '请先选择文件';
    return;
  }

  const qfy_form = new FormData();
  qfy_form.append('file', qfy_file);

  qfy_kbUploadBtn.disabled = true;
  qfy_kbUploadTip.textContent = '正在解析并向量化「' + qfy_file.name + '」，请稍候…';
  console.log('发送给后端的数据（上传）：', { fileName: qfy_file.name, size: qfy_file.size });

  try {
    const qfy_resp = await fetch('/api/kb/upload', { method: 'POST', body: qfy_form });
    const qfy_data = await qfy_resp.json();
    console.log('接收自后端的数据（上传）：', qfy_data);

    if (qfy_data.code !== 0) {
      throw new Error(qfy_data.msg);
    }

    qfy_kbUploadTip.textContent = '上传成功：' + qfy_data.data.name
      + '，共 ' + qfy_data.data.chunkCount + ' 个切块';
    qfy_kbFile.value = '';
    qfy_loadDocs();
  } catch (qfy_err) {
    console.error('知识库文件上传失败：', qfy_err);
    qfy_kbUploadTip.textContent = '上传失败：' + qfy_err.message;
  } finally {
    qfy_kbUploadBtn.disabled = false;
  }
}

// 删除文档
async function qfy_deleteDoc(qfy_id, qfy_name) {
  if (!window.confirm('确定删除「' + qfy_name + '」及其全部切块吗？')) {
    return;
  }
  try {
    const qfy_resp = await fetch('/api/kb/documents/' + qfy_id, { method: 'DELETE' });
    const qfy_data = await qfy_resp.json();
    console.log('接收自后端的数据（删除）：', qfy_data);
    if (qfy_data.code !== 0) {
      throw new Error(qfy_data.msg);
    }
    qfy_loadDocs();
  } catch (qfy_err) {
    console.error('删除失败：', qfy_err);
    qfy_kbUploadTip.textContent = '删除失败：' + qfy_err.message;
  }
}

// 基于知识库提问
async function qfy_ask() {
  const qfy_question = qfy_kbQuestion.value.trim();
  if (!qfy_question) {
    qfy_kbAskTip.textContent = '请输入问题';
    return;
  }

  qfy_kbAskBtn.disabled = true;
  qfy_kbAskTip.textContent = '正在检索知识库并生成回答…';

  const qfy_body = { question: qfy_question };
  console.log('发送给后端的数据（问答）：', qfy_body);

  try {
    const qfy_resp = await fetch('/api/kb/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qfy_body)
    });
    const qfy_data = await qfy_resp.json();
    console.log('接收自后端的数据（问答）：', qfy_data);

    if (qfy_data.code !== 0) {
      throw new Error(qfy_data.msg);
    }

    qfy_kbAnswer.hidden = false;
    qfy_kbAnswerText.textContent = qfy_data.data.answer;

    qfy_kbSources.innerHTML = '';
    qfy_data.data.sources.forEach((qfy_src) => {
      const qfy_item = document.createElement('div');
      qfy_item.className = 'qfy_kb_source';
      const qfy_head = document.createElement('p');
      qfy_head.className = 'qfy_kb_source_head';
      qfy_head.textContent = '《' + qfy_src.docName + '》第 ' + (qfy_src.chunkIndex + 1) + ' 块 · 相似度 ' + qfy_src.score;
      const qfy_bodyP = document.createElement('p');
      qfy_bodyP.className = 'qfy_kb_source_text';
      qfy_bodyP.textContent = qfy_src.content;
      qfy_item.appendChild(qfy_head);
      qfy_item.appendChild(qfy_bodyP);
      qfy_kbSources.appendChild(qfy_item);
    });

    qfy_kbAskTip.textContent = '回答完成 · 模型：' + qfy_data.data.model;
  } catch (qfy_err) {
    console.error('知识库问答失败：', qfy_err);
    qfy_kbAskTip.textContent = '问答失败：' + qfy_err.message;
  } finally {
    qfy_kbAskBtn.disabled = false;
  }
}

qfy_kbUploadBtn.addEventListener('click', qfy_uploadFile);
qfy_kbAskBtn.addEventListener('click', qfy_ask);
qfy_kbQuestion.addEventListener('keydown', (qfy_event) => {
  if (qfy_event.key === 'Enter' && !qfy_event.shiftKey) {
    qfy_event.preventDefault();
    qfy_ask();
  }
});

qfy_loadDocs();
