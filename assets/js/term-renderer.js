/**
 * ==============================================================================
 * ROPEVOCAB PROJECT - TERM DETAIL RENDERER ENGINE
 * File: v2/assets/js/term-renderer.js
 * 功能：前台词条详情页渲染引擎（支持平假名 + 无限动态 custom_blocks 区块）
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initTermDetailPage();
});

async function initTermDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const termId = urlParams.get('id');

  if (!termId) {
    showErrorState('未提供有效的词条 ID！');
    return;
  }

  try {
    // 1. 从 Supabase 查询词条详情数据
    const { data: term, error } = await supabaseClient
      .from('ropevocab_terms')
      .select('*')
      .eq('id', termId)
      .maybeSingle();

    if (error || !term) {
      showErrorState(error ? error.message : '未找到对应的词条数据！');
      return;
    }

    // 2. 查询所属分类标题（用于 3 层面包屑）
    let categoryTitle = '分类列表';
    if (term.category_id) {
      const { data: cat } = await supabaseClient
        .from('ropevocab_categories')
        .select('title')
        .eq('id', term.category_id)
        .maybeSingle();
      if (cat && cat.title) categoryTitle = cat.title;
    }

    // 3. 渲染页面各个模块
    renderBreadcrumb(categoryTitle, term);
    renderTermHeader(term);
    renderMultilingualCards(term);
    renderDynamicSections(term);
    renderImageGallery(term);

    // 4. 显示主界面
    document.getElementById('detail-loading').style.display = 'none';
    document.getElementById('detail-main-content').style.display = 'block';

    // 5. 绑定智能返回按钮
    const backBtn = document.getElementById('btn-back-history');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (document.referrer && document.referrer.includes(window.location.host)) {
          window.history.back();
        } else {
          window.location.href = `category.html?id=${term.category_id || 'techniques'}`;
        }
      });
    }

  } catch (err) {
    showErrorState('数据加载过程发生异常: ' + err.message);
  }
}

// 渲染 3 层面包屑导航 (首页 > 分类 Hub > 词条标题)
function renderBreadcrumb(categoryTitle, term) {
  const container = document.getElementById('breadcrumb-container');
  if (!container) return;
  const catId = term.category_id || 'techniques';
  container.innerHTML = `
    <a href="../index.html">首页</a> &gt;
    <a href="category.html?id=${escapeHtml(catId)}">${escapeHtml(categoryTitle)}</a> &gt;
    <span>${escapeHtml(term.title)}</span>
  `;
}

// 渲染页头标头
function renderTermHeader(term) {
  const titleEl = document.getElementById('term-title');
  const badgeEl = document.getElementById('term-subtitle-badge');
  if (titleEl) titleEl.textContent = `${term.emoji || '🪢'} ${term.title}`;
  if (badgeEl) badgeEl.textContent = term.subtitle_badge || term.name_en || term.id;
}

// 渲染多语言表述（含平假名与罗马音组合）
function renderMultilingualCards(term) {
  const cnEl = document.getElementById('lang-cn');
  const enEl = document.getElementById('lang-en');
  const jpCard = document.getElementById('lang-jp-box');

  if (cnEl) cnEl.textContent = term.title || '-';
  if (enEl) enEl.textContent = term.name_en || '-';

  if (jpCard) {
    const kanji = term.name_jp || '-';
    const hiragana = term.hiragana || '';
    const romaji = term.romaji || '';

    let subHtml = '';
    if (hiragana && romaji) {
      subHtml = `<span class="hiragana-badge">${escapeHtml(hiragana)}</span><span class="romaji-text">${escapeHtml(romaji)}</span>`;
    } else if (hiragana) {
      subHtml = `<span class="hiragana-badge">${escapeHtml(hiragana)}</span>`;
    } else if (romaji) {
      subHtml = `<span class="romaji-text">${escapeHtml(romaji)}</span>`;
    } else {
      subHtml = `<span class="romaji-text">-</span>`;
    }

    jpCard.innerHTML = `
      <h3><i class="fas fa-language"></i> 日文表述</h3>
      <div class="expression">${escapeHtml(kanji)}</div>
      <div class="pronunciation-box">${subHtml}</div>
    `;
  }
}

// 核心升级：遍历渲染自定义内容区块 (custom_blocks)
function renderDynamicSections(term) {
  const container = document.getElementById('term-dynamic-sections');
  if (!container) return;
  container.innerHTML = '';

  const blocks = parseJsonArray(term.custom_blocks);

  if (blocks && blocks.length > 0) {
    // 优先按 Blocks 数组顺序渲染（完全动态）
    blocks.forEach(block => {
      if (block.type === 'text' && block.content && block.content.trim()) {
        container.appendChild(createTextSectionNode(block.title, block.content));
      } else if (block.type === 'list' && block.items && block.items.length > 0) {
        container.appendChild(createListSectionNode(block.title, block.items));
      }
    });
  } else {
    // 降级回退支持老数据
    if (term.description) {
      container.appendChild(createTextSectionNode('定义与概述', term.description));
    }
    const features = parseJsonArray(term.technical_features);
    if (features.length > 0) {
      container.appendChild(createListSectionNode('技术特征', features));
    }
    const apps = parseJsonArray(term.applications);
    if (apps.length > 0) {
      container.appendChild(createListSectionNode('主要应用场景', apps));
    }
    if (term.safety_notes) {
      container.appendChild(createTextSectionNode('安全注意事项', term.safety_notes));
    }
  }
}

// 创建长文本段落 DOM 节点
function createTextSectionNode(title, content) {
  const div = document.createElement('div');
  div.className = 'content-section';
  div.innerHTML = `
    <h2><i class="fas fa-info-circle"></i> ${escapeHtml(title)}</h2>
    <div style="line-height: 1.8; color: #334155; font-size: 0.98rem; white-space: pre-line;">${escapeHtml(content)}</div>
  `;
  return div;
}

// 创建列表清单 DOM 节点
function createListSectionNode(title, items) {
  const div = document.createElement('div');
  div.className = 'content-section';
  const listHtml = items.map((item, idx) => `
    <li style="margin-bottom: 8px; font-size: 0.95rem; color: #334155; line-height: 1.6;">
      <strong style="color: #667eea; margin-right: 6px;">${idx + 1}.</strong>${escapeHtml(item)}
    </li>
  `).join('');

  div.innerHTML = `
    <h2><i class="fas fa-list-check"></i> ${escapeHtml(title)}</h2>
    <ul style="list-style: none; padding-left: 0; margin-top: 12px;">${listHtml}</ul>
  `;
  return div;
}

// 渲染图片画廊
function renderImageGallery(term) {
  const galleryContainer = document.getElementById('image-gallery-container');
  const gallerySection = document.getElementById('section-gallery');
  if (!galleryContainer) return;

  const images = parseJsonArray(term.images);
  const captions = parseJsonArray(term.image_captions);

  if (!images || images.length === 0) {
    if (gallerySection) gallerySection.style.display = 'none';
    return;
  }

  if (gallerySection) gallerySection.style.display = 'block';

  let html = '';
  images.forEach((imgUrl, idx) => {
    const caption = captions[idx] || term.title;
    html += `
      <div class="image-item">
        <div class="image-container">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(caption)}" onError="this.src='../assets/images/placeholder.jpg';" />
        </div>
        <div class="image-caption">${escapeHtml(caption)}</div>
      </div>
    `;
  });
  galleryContainer.innerHTML = html;
}

function showErrorState(msg) {
  const loadingEl = document.getElementById('detail-loading');
  const errorEl = document.getElementById('detail-error');
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) {
    errorEl.style.display = 'block';
    const msgEl = errorEl.querySelector('.error-message');
    if (msgEl) msgEl.textContent = msg;
  }
}

function parseJsonArray(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  try {
    return JSON.parse(input);
  } catch (e) {
    return [];
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
