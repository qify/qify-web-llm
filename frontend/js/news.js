/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_newsList = document.getElementById('qfy_news_list');
const qfy_newsStatus = document.getElementById('qfy_news_status');
const qfy_apiLink = document.getElementById('qfy_api_link');

// 接口完整地址（页面展示用）
const qfy_API_URL = window.location.origin + '/api/news';
qfy_apiLink.href = qfy_API_URL;
qfy_apiLink.textContent = qfy_API_URL;

// 时间格式化：2026-11-19T01:20:00.000Z -> 2026-11-19 09:20
function qfy_formatTime(qfy_value) {
  const qfy_date = new Date(qfy_value);
  if (isNaN(qfy_date.getTime())) return String(qfy_value);
  const qfy_pad = function (qfy_n) { return qfy_n < 10 ? '0' + qfy_n : String(qfy_n); };
  return qfy_date.getFullYear() + '-' + qfy_pad(qfy_date.getMonth() + 1) + '-' + qfy_pad(qfy_date.getDate()) +
    ' ' + qfy_pad(qfy_date.getHours()) + ':' + qfy_pad(qfy_date.getMinutes());
}

// 渲染单条新闻
function qfy_renderItem(qfy_item) {
  const qfy_li = document.createElement('li');
  qfy_li.className = 'qfy_news_item';

  const qfy_head = document.createElement('div');
  qfy_head.className = 'qfy_news_head';

  const qfy_title = document.createElement('h2');
  qfy_title.className = 'qfy_news_title';
  qfy_title.textContent = qfy_item.qfy_title;

  const qfy_tag = document.createElement('span');
  qfy_tag.className = 'qfy_tag';
  qfy_tag.textContent = qfy_item.qfy_category;

  qfy_head.appendChild(qfy_title);
  qfy_head.appendChild(qfy_tag);

  const qfy_summary = document.createElement('p');
  qfy_summary.className = 'qfy_news_summary';
  qfy_summary.textContent = qfy_item.qfy_summary;

  const qfy_meta = document.createElement('p');
  qfy_meta.className = 'qfy_news_meta';
  qfy_meta.textContent = '来源：' + qfy_item.qfy_source +
    '　作者：' + qfy_item.qfy_author +
    '　发布时间：' + qfy_formatTime(qfy_item.qfy_publish_time);

  qfy_li.appendChild(qfy_head);
  qfy_li.appendChild(qfy_summary);
  qfy_li.appendChild(qfy_meta);
  return qfy_li;
}

// 加载新闻数据
function qfy_loadNews() {
  fetch('/api/news')
    .then(function (qfy_res) {
      return qfy_res.json();
    })
    .then(function (qfy_result) {
      console.log('科技新闻接口返回：', qfy_result);

      if (qfy_result.code !== 0) {
        qfy_newsStatus.textContent = '加载失败：' + (qfy_result.msg || '未知错误');
        qfy_newsStatus.className = 'qfy_status qfy_status_error';
        return;
      }

      const qfy_data = qfy_result.data || {};
      const qfy_rows = qfy_data.list || [];

      qfy_newsList.innerHTML = '';
      qfy_rows.forEach(function (qfy_item) {
        qfy_newsList.appendChild(qfy_renderItem(qfy_item));
      });

      qfy_newsStatus.textContent = '共 ' + qfy_data.total + ' 条新闻';
      qfy_newsStatus.className = 'qfy_status';
    })
    .catch(function (qfy_err) {
      console.error('科技新闻请求失败：', qfy_err);
      qfy_newsStatus.textContent = '请求失败：' + qfy_err.message;
      qfy_newsStatus.className = 'qfy_status qfy_status_error';
    });
}

qfy_loadNews();
