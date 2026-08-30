document.addEventListener('DOMContentLoaded', () => {
  const isCategoryPage = Boolean(document.getElementById('hub-loading') || document.getElementById('term-cards-grid'));
  const isDetailPage = Boolean(document.getElementById('detail-loading') || document.getElementById('term-dynamic-sections'));

  if (isCategoryPage) {
    initCategoryPage();
  } else if (isDetailPage) {
    initTermDetailPage();
  }
});

function getSupabaseClient() {
  if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
    return window.supabaseClient;
  }
  if (typeof supabaseClient !== 'undefined' && supabaseClient && typeof supabaseClient.from === 'function') {
    return supabaseClient;
  }
  return null;
}

async function initCategoryPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get('id') || 'techniques';

  const client = getSupabaseClient();
  if (!client) {
    showHubErrorState('Supabase SDK 未正确加载，请刷新页面重试');
    return;
  }

  try {
    const { data: category } = await client
      .from('ropevocab_categories')
      .select('*')
      .eq('id', catId)
      .maybeSingle();

    const catTitle = category ? (category.title || category.name || catId) : catId;
    const catDesc = category ? (category.description || '暂无该分类的详细说明记录。') : '常用绳缚技术与知识汇编分类。';

    renderCategoryHeader(catTitle, catDesc);

    let { data: terms, error: termErr } = await client
      .from('ropevocab_terms')
      .select('*')
      .eq('category_id', catId)
      .order('sort_order', { ascending: true });

    if (termErr) {
      const fallback = await client
        .from('ropevocab_terms')
        .select('*')
        .eq('category_id', catId)
        .order('id', { ascending: true });
      terms = fallback.data;
      termErr = fallback.error;
    }

    if (termErr) {
      showHubErrorState(`无法获取分类词条: ${termErr.message}`);
      return;
    }

    renderTermCardsGrid(terms || []);

    const loadingEl = document.getElementById('hub-loading');
    const mainEl = document.getElementById('hub-main-content');
    if (loadingEl) loadingEl.style.display = 'none';
    if (mainEl) mainEl.style.display = 'block';

  } catch (err) {
    showHubErrorState(`数据加载异常: ${err.message}`);
  }
}

function renderCategoryHeader(title, description) {
  const breadcrumbEl = document.getElementById('breadcrumb-cat-title');
  const titleEl = document.getElementById('hub-title');
  const descEl = document.getElementById('hub-description');
  const navTagEl = document.getElementById('nav-active-cat-tag');

  if (breadcrumbEl) breadcrumbEl.textContent = title;
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = description;
  if (navTagEl) navTagEl.innerHTML = `<i class="fas fa-folder-open"></i> ${escapeHtml(title)}`;
}

function renderTermCardsGrid(terms) {
  const gridContainer = document.getElementById('term-cards-grid');
  if (!gridContainer) return;

  if (!Array.isArray(terms) || terms.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b; background: #f8fafc; border-radius: 12px;">
        <i class="fas fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; color: #cbd5e1;"></i>
        <p>该分类下暂无任何词条数据</p>
      </div>`;
    return;
  }

  let html = '';
  terms.forEach((term) => {
    const titleZh = escapeHtml(term.title || term.chinese_name || term.name || '-');

    let titleEn = term.name_en || term.english_name || '';
    if (!titleEn && term.subtitle_badge && /^[A-Za-z0-9\s\-_/]+$/.test(term.subtitle_badge.trim())) {
      titleEn = term.subtitle_badge.trim();
    }
    if (!titleEn) {
      titleEn = term.romaji || term.id || '';
    }
    const titleEnEscaped = escapeHtml(titleEn);

    const rawEmoji = (term.emoji || '').trim();
    const emojiDisplay = rawEmoji ? escapeHtml(rawEmoji) : '🔖';

    html += `
      <a href="term.html?id=${escapeHtml(term.id)}" class="subcategory-card" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 22px 16px;
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        text-decoration: none;
        transition: all 0.25s ease;
      ">
        <div class="card-icon" style="font-size: 2.2rem; margin-bottom: 10px; line-height: 1;">${emojiDisplay}</div>
        <h3 style="margin: 0 0 6px 0; font-size: 1.12rem; font-weight: 700; color: #0f172a; line-height: 1.3;">${titleZh}</h3>
        <p style="margin: 0; font-size: 0.86rem; color: #64748b; font-weight: 500; line-height: 1.2;">${titleEnEscaped}</p>
      </a>
    `;
  });

  gridContainer.innerHTML = html;
}

function showHubErrorState(msg) {
  const loadingEl = document.getElementById('hub-loading');
  const errorEl = document.getElementById('hub-error');
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) {
    errorEl.style.display = 'block';
    const msgEl = errorEl.querySelector('.error-message');
    if (msgEl) msgEl.textContent = msg;
  }
}

async function initTermDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const termId = urlParams.get('id');

  if (!termId) {
    showDetailErrorState('未提供有效的词条 ID！');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    showDetailErrorState('Supabase SDK 未正确初始化');
    return;
  }

  try {
    const { data: term, error } = await client
      .from('ropevocab_terms')
      .select('*')
      .eq('id', termId)
      .maybeSingle();

    if (error || !term) {
      showDetailErrorState(error ? error.message : '未找到对应的词条数据！');
      return;
    }

    let categoryTitle = '分类列表';
    if (term.category_id) {
      const { data: cat } = await client
        .from('ropevocab_categories')
        .select('title')
        .eq('id', term.category_id)
        .maybeSingle();
      if (cat && cat.title) categoryTitle = cat.title;
    }

    renderBreadcrumb(categoryTitle, term);
    renderTermHeader(term);
    renderMultilingualCards(term);
    renderDynamicSections(term);
    renderImageGallery(term);

    const loadingEl = document.getElementById('detail-loading');
    const mainEl = document.getElementById('detail-main-content');
    if (loadingEl) loadingEl.style.display = 'none';
    if (mainEl) mainEl.style.display = 'block';

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
    showDetailErrorState('数据加载过程发生异常: ' + err.message);
  }
}

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

function renderTermHeader(term) {
  const titleEl = document.getElementById('term-title');
  const badgeEl = document.getElementById('term-subtitle-badge');
  if (titleEl) titleEl.textContent = `${term.emoji || '🪢'} ${term.title}`;
  if (badgeEl) badgeEl.textContent = term.subtitle_badge || term.name_en || term.id;
}

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

function renderDynamicSections(term) {
  const container = document.getElementById('term-dynamic-sections');
  if (!container) return;
  container.innerHTML = '';

  const blocks = parseJsonArray(term.custom_blocks);

  if (blocks && blocks.length > 0) {
    blocks.forEach(block => {
      if (block.type === 'text' && block.content && block.content.trim()) {
        container.appendChild(createTextSectionNode(block.title, block.content));
      } else if (block.type === 'list' && block.items && block.items.length > 0) {
        container.appendChild(createListSectionNode(block.title, block.items));
      }
    });
  } else {
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

function createTextSectionNode(title, content) {
  const div = document.createElement('div');
  div.className = 'content-section';
  div.innerHTML = `
    <h2><i class="fas fa-info-circle"></i> ${escapeHtml(title)}</h2>
    <div style="line-height: 1.8; color: #334155; font-size: 0.98rem; white-space: pre-line;">${escapeHtml(content)}</div>
  `;
  return div;
}

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

function showDetailErrorState(msg) {
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
