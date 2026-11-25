/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
*/

// 知识库文件解析：txt / md / pdf / docx / doc / pptx（旧版 .ppt 请另存为 .pptx）
const qfy_mammoth = require('mammoth');
const qfy_pdfParse = require('pdf-parse');
const qfy_WordExtractor = require('word-extractor');
const qfy_AdmZip = require('adm-zip');

const qfy_SUPPORTED = ['txt', 'md', 'pdf', 'doc', 'docx', 'ppt', 'pptx'];

// 去掉多余空白，压缩连续空行
function qfy_cleanText(qfy_text) {
  return String(qfy_text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// 从 pptx 中按幻灯片顺序提取文字
function qfy_parsePptx(qfy_buffer) {
  const qfy_zip = new qfy_AdmZip(qfy_buffer);
  const qfy_slides = qfy_zip.getEntries()
    .filter((qfy_entry) => /^ppt\/slides\/slide\d+\.xml$/.test(qfy_entry.entryName))
    .sort((qfy_a, qfy_b) => {
      const qfy_na = parseInt(qfy_a.entryName.match(/slide(\d+)/)[1], 10);
      const qfy_nb = parseInt(qfy_b.entryName.match(/slide(\d+)/)[1], 10);
      return qfy_na - qfy_nb;
    });

  return qfy_slides.map((qfy_entry, qfy_index) => {
    const qfy_xml = qfy_entry.getData().toString('utf8');
    const qfy_texts = [];
    qfy_xml.replace(/<a:t>([\s\S]*?)<\/a:t>/g, (qfy_all, qfy_inner) => {
      qfy_texts.push(qfy_inner
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'"));
      return qfy_all;
    });
    return '【第 ' + (qfy_index + 1) + ' 页】\n' + qfy_texts.join('\n');
  }).join('\n\n');
}

// 统一入口：按扩展名解析文件，返回纯文本
async function qfy_parseFile(qfy_name, qfy_buffer) {
  const qfy_ext = (qfy_name.split('.').pop() || '').toLowerCase();

  if (!qfy_SUPPORTED.includes(qfy_ext)) {
    throw new Error('不支持的文件类型 .' + qfy_ext + '，支持：' + qfy_SUPPORTED.join(' / '));
  }

  if (qfy_ext === 'txt' || qfy_ext === 'md') {
    return qfy_cleanText(qfy_buffer.toString('utf8'));
  }
  if (qfy_ext === 'pdf') {
    const qfy_pdf = await qfy_pdfParse(qfy_buffer);
    return qfy_cleanText(qfy_pdf.text);
  }
  if (qfy_ext === 'docx') {
    const qfy_res = await qfy_mammoth.extractRawText({ buffer: qfy_buffer });
    return qfy_cleanText(qfy_res.value);
  }
  if (qfy_ext === 'doc') {
    const qfy_extractor = new qfy_WordExtractor();
    const qfy_doc = await qfy_extractor.extract(qfy_buffer);
    return qfy_cleanText(qfy_doc.getBody());
  }
  if (qfy_ext === 'pptx') {
    return qfy_cleanText(qfy_parsePptx(qfy_buffer));
  }

  throw new Error('旧版 .ppt 为二进制格式，暂无法解析，请用 PowerPoint 另存为 .pptx 后重新上传');
}

module.exports = { qfy_parseFile, qfy_SUPPORTED };
