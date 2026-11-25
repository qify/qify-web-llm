/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_galleryBox = document.getElementById('qfy_gallery_list');
const qfy_galleryStatus = document.getElementById('qfy_gallery_status');
const qfy_apiLink = document.getElementById('qfy_api_link');

// 接口完整地址（页面展示用）
const qfy_API_URL = window.location.origin + '/api/gallery';
qfy_apiLink.href = qfy_API_URL;
qfy_apiLink.textContent = qfy_API_URL;

// 渲染单条图文
function qfy_renderCard(qfy_item) {
  const qfy_card = document.createElement('article');
  qfy_card.className = 'qfy_gallery_item';

  const qfy_media = document.createElement('div');
  qfy_media.className = 'qfy_gallery_media';

  const qfy_img = document.createElement('img');
  qfy_img.className = 'qfy_gallery_img';
  qfy_img.src = qfy_item.qfy_image_url;
  qfy_img.alt = qfy_item.qfy_title;
  qfy_img.loading = 'lazy';
  // 图片加载失败时用渐变色块兜底
  qfy_img.addEventListener('error', function () {
    console.error('图片加载失败：', qfy_item.qfy_image_url);
    qfy_media.classList.add('qfy_gallery_media_fallback');
    qfy_img.remove();
  });

  qfy_media.appendChild(qfy_img);

  const qfy_body = document.createElement('div');
  qfy_body.className = 'qfy_gallery_body';

  const qfy_head = document.createElement('div');
  qfy_head.className = 'qfy_news_head';

  const qfy_title = document.createElement('h2');
  qfy_title.className = 'qfy_news_title';
  qfy_title.textContent = qfy_item.qfy_title;

  const qfy_tag = document.createElement('span');
  qfy_tag.className = 'qfy_tag';
  qfy_tag.textContent = qfy_item.qfy_category;

  const qfy_desc = document.createElement('p');
  qfy_desc.className = 'qfy_news_summary';
  qfy_desc.textContent = qfy_item.qfy_description;

  const qfy_meta = document.createElement('p');
  qfy_meta.className = 'qfy_news_meta';
  qfy_meta.textContent = '发布日期：' + qfy_item.qfy_publish_date;

  qfy_head.appendChild(qfy_title);
  qfy_head.appendChild(qfy_tag);
  qfy_body.appendChild(qfy_head);
  qfy_body.appendChild(qfy_desc);
  qfy_body.appendChild(qfy_meta);

  qfy_card.appendChild(qfy_media);
  qfy_card.appendChild(qfy_body);
  return qfy_card;
}

// 加载图文数据
function qfy_loadGallery() {
  fetch('/api/gallery')
    .then(function (qfy_res) {
      return qfy_res.json();
    })
    .then(function (qfy_result) {
      console.log('科技图文接口返回：', qfy_result);

      if (qfy_result.code !== 0) {
        qfy_galleryStatus.textContent = '加载失败：' + (qfy_result.msg || '未知错误');
        qfy_galleryStatus.className = 'qfy_status qfy_status_error';
        return;
      }

      const qfy_data = qfy_result.data || {};
      const qfy_rows = qfy_data.list || [];

      qfy_galleryBox.innerHTML = '';
      qfy_rows.forEach(function (qfy_item) {
        qfy_galleryBox.appendChild(qfy_renderCard(qfy_item));
      });

      qfy_galleryStatus.textContent = '共 ' + qfy_data.total + ' 条图文';
      qfy_galleryStatus.className = 'qfy_status';
    })
    .catch(function (qfy_err) {
      console.error('科技图文请求失败：', qfy_err);
      qfy_galleryStatus.textContent = '请求失败：' + qfy_err.message;
      qfy_galleryStatus.className = 'qfy_status qfy_status_error';
    });
}

qfy_loadGallery();
