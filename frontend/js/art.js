/*
姓名：齐方圆 | 学号：24001011031 | 时间：2026-11-27 | 大模型：DeepSeek-V4.1-Flash
*/

const qfy_state = { list: [], category: '全部' };
const qfy_heights = [200, 160, 220, 180, 150, 240, 190, 170];

// 加载作品数据（来自数据库 qfy_gallery）
async function qfy_loadGallery() {
  try {
    const qfy_resp = await fetch('/api/gallery');
    const qfy_data = await qfy_resp.json();
    console.log('画世界作品接口返回：', qfy_data);
    if (qfy_data.code !== 0) throw new Error(qfy_data.msg);
    qfy_state.list = qfy_data.data.list || [];
    qfy_renderWaterfall();
    qfy_renderFeed();
    qfy_renderSearchResult();
  } catch (qfy_err) {
    console.error('加载作品失败：', qfy_err);
    const qfy_hint = document.getElementById('qfy_art_hint');
    if (qfy_hint) qfy_hint.textContent = '作品加载失败：' + qfy_err.message + '（请通过 http://localhost:8031 访问）';
  }
}

// 首页瀑布流
function qfy_renderWaterfall() {
  const qfy_wrap = document.getElementById('qfy_waterfall');
  if (!qfy_wrap) return;

  const qfy_list = qfy_state.category === '全部'
    ? qfy_state.list
    : qfy_state.list.filter((qfy_item) => qfy_item.qfy_category === qfy_state.category);

  const qfy_cols = [document.createElement('div'), document.createElement('div')];
  qfy_cols.forEach((qfy_col) => {
    qfy_col.className = 'qfy_waterfall_col';
    qfy_col.innerHTML = '';
  });

  qfy_list.forEach((qfy_item, qfy_i) => {
    const qfy_card = document.createElement('article');
    qfy_card.className = 'qfy_work_card';

    const qfy_cover = document.createElement('div');
    qfy_cover.className = 'qfy_work_cover';
    qfy_cover.style.height = qfy_heights[qfy_i % qfy_heights.length] + 'px';
    qfy_cover.style.backgroundImage = 'url(' + qfy_item.qfy_image_url + ')';

    const qfy_info = document.createElement('div');
    qfy_info.className = 'qfy_work_info';
    qfy_info.innerHTML =
      '<p class="qfy_work_title"></p>'
      + '<div class="qfy_work_foot">'
      + '<span class="qfy_work_avatar"></span>'
      + '<span class="qfy_work_author"></span>'
      + '<span class="qfy_work_like"></span>'
      + '</div>';
    qfy_info.querySelector('.qfy_work_title').textContent = qfy_item.qfy_title;
    qfy_info.querySelector('.qfy_work_author').textContent = qfy_item.qfy_author || '画世界';
    qfy_info.querySelector('.qfy_work_like').textContent = '♡ ' + (qfy_item.qfy_likes || 0);

    qfy_card.appendChild(qfy_cover);
    qfy_card.appendChild(qfy_info);
    qfy_cols[qfy_i % 2].appendChild(qfy_card);
  });

  qfy_wrap.innerHTML = '';
  qfy_cols.forEach((qfy_col) => qfy_wrap.appendChild(qfy_col));
}

// 发现页动态
function qfy_renderFeed() {
  const qfy_wrap = document.getElementById('qfy_feed_posts');
  if (!qfy_wrap) return;

  const qfy_times = ['2 小时前', '昨天 23:41', '昨天 20:18', '10-12', '10-08', '09-28'];
  qfy_wrap.innerHTML = '';

  qfy_state.list.slice(0, 5).forEach((qfy_item, qfy_i) => {
    const qfy_post = document.createElement('article');
    qfy_post.className = 'qfy_post';
    qfy_post.innerHTML =
      '<div class="qfy_post_user">'
      + '<span class="qfy_post_avatar"></span>'
      + '<span class="qfy_post_name"></span>'
      + '<span class="qfy_post_time"></span>'
      + '</div>'
      + '<div class="qfy_post_body">'
      + '<p class="qfy_post_title"></p>'
      + '<p class="qfy_post_desc"></p>'
      + '</div>'
      + '<div class="qfy_post_imgs"><div class="qfy_post_img"></div></div>'
      + '<div class="qfy_post_foot">'
      + '<span class="qfy_post_like"></span>'
      + '<span>💬 12</span>'
      + '<span>☆ 收藏</span>'
      + '</div>';

    qfy_post.querySelector('.qfy_post_name').textContent = qfy_item.qfy_author || '画世界';
    qfy_post.querySelector('.qfy_post_time').textContent = qfy_times[qfy_i % qfy_times.length];
    qfy_post.querySelector('.qfy_post_title').textContent = '「' + qfy_item.qfy_title + '」';
    qfy_post.querySelector('.qfy_post_desc').textContent = qfy_item.qfy_description || '';
    const qfy_img = qfy_post.querySelector('.qfy_post_img');
    qfy_img.style.height = (qfy_i % 2 === 0 ? 300 : 250) + 'px';
    qfy_img.style.backgroundImage = 'url(' + qfy_item.qfy_image_url + ')';
    const qfy_like = qfy_post.querySelector('.qfy_post_like');
    qfy_like.textContent = '♡ ' + (qfy_item.qfy_likes || 0);
    if (qfy_i === 2) qfy_like.classList.add('qfy_post_liked');

    qfy_wrap.appendChild(qfy_post);
  });
}

// 搜索页
function qfy_renderSearchResult() {
  const qfy_wrap = document.getElementById('qfy_search_result');
  if (!qfy_wrap) return;

  const qfy_input = document.getElementById('qfy_search_input');
  const qfy_keyword = (qfy_input ? qfy_input.value : '').trim().toLowerCase();

  let qfy_list = qfy_state.list;
  if (qfy_keyword) {
    qfy_list = qfy_list.filter((qfy_item) =>
      (qfy_item.qfy_title + qfy_item.qfy_category + (qfy_item.qfy_author || '')).toLowerCase().includes(qfy_keyword)
    );
  }

  if (qfy_list.length === 0) {
    qfy_wrap.innerHTML = '<p class="qfy_search_empty">没有找到相关作品，换个关键词试试</p>';
    return;
  }

  qfy_wrap.innerHTML = '';
  qfy_list.forEach((qfy_item) => {
    const qfy_row = document.createElement('a');
    qfy_row.className = 'qfy_work_card';
    qfy_row.style.display = 'flex';
    qfy_row.style.marginBottom = '10px';
    qfy_row.style.overflow = 'hidden';
    qfy_row.innerHTML =
      '<div style="width:96px;height:96px;flex-shrink:0;background-size:cover;background-position:center"></div>'
      + '<div class="qfy_work_info">'
      + '<p class="qfy_work_title"></p>'
      + '<div class="qfy_work_foot"><span class="qfy_work_author"></span><span class="qfy_work_like"></span></div>'
      + '</div>';
    qfy_row.querySelector('div').style.backgroundImage = 'url(' + qfy_item.qfy_image_url + ')';
    qfy_row.querySelector('.qfy_work_title').textContent = qfy_item.qfy_title;
    qfy_row.querySelector('.qfy_work_author').textContent = (qfy_item.qfy_author || '画世界') + ' · ' + qfy_item.qfy_category;
    qfy_row.querySelector('.qfy_work_like').textContent = '♡ ' + (qfy_item.qfy_likes || 0);
    qfy_wrap.appendChild(qfy_row);
  });
}

// 首页分类切换
document.querySelectorAll('.qfy_top_tab[data-cat]').forEach((qfy_btn) => {
  qfy_btn.addEventListener('click', () => {
    document.querySelectorAll('.qfy_top_tab[data-cat]').forEach((qfy_other) => qfy_other.classList.remove('qfy_active'));
    qfy_btn.classList.add('qfy_active');
    qfy_state.category = qfy_btn.dataset.cat;
    qfy_renderWaterfall();
  });
});

// 搜索绑定
const qfy_searchInput = document.getElementById('qfy_search_input');
if (qfy_searchInput) {
  const qfy_doSearch = () => {
    console.log('搜索关键词：', qfy_searchInput.value.trim());
    qfy_renderSearchResult();
  };
  document.getElementById('qfy_search_btn').addEventListener('click', qfy_doSearch);
  qfy_searchInput.addEventListener('keydown', (qfy_event) => {
    if (qfy_event.key === 'Enter') qfy_doSearch();
  });
  document.querySelectorAll('.qfy_hot_tag').forEach((qfy_tag) => {
    qfy_tag.addEventListener('click', () => {
      qfy_searchInput.value = qfy_tag.textContent;
      qfy_doSearch();
    });
  });
}

qfy_loadGallery();
