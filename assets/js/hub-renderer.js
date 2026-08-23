/**
 * ropevocab - Hub 渲染引擎 (hub-renderer.js) - v6.5.1 响应式防坍塌修复版
 * 1. 彻底解决移动端因 3 列隐藏导致的列宽 42% 坍塌与展开抽屉时的二次重绘错位
 * 2. 引入 Responsive Column Classes 架构，实现桌面端(6列:100%)与移动端(3列:100%)解耦适配
 * 3. 像素级统一 th 与 td 内边距，彻底消除表头与内容的水平错位
 *
 * @version 6.5.1
 * @author Senior Architect (Defense Grade)
 */

(function () {
  'use strict';

  const SUPABASE_URL = "https://gfhgwqjvxyyanumbwibe.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_26_l2bawRKyTELKRlUO4XA_jhhMgAY7";

  function injectCleanThemeStyles() {
    if (document.getElementById('v4r-clean-theme-styles')) return;
    const style = document.createElement('style');
    style.id = 'v4r-clean-theme-styles';
    style.textContent = `
      /* --- 表格布局防重绘抖动基准 --- */
      .locations-table table {
        width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
      }

      /* --- 桌面端 (>768px) 6列黄金宽度比例 (合计 100%) --- */
      th.v4r-col-zh { width: 16% !important; text-align: left !important; padding-left: 16px !important; }
      th.v4r-col-en { width: 24% !important; text-align: left !important; padding-left: 16px !important; }
      th.v4r-col-ja { width: 16% !important; text-align: left !important; padding-left: 16px !important; }
      th.v4r-col-roma { width: 18% !important; text-align: left !important; padding-left: 16px !important; }
      th.v4r-col-notes { width: 13% !important; text-align: center !important; }
      th.v4r-col-type { width: 13% !important; text-align: center !important; }

      .chinese-name, .english-name, .japanese-name, .romaji {
        text-align: left !important; padding-left: 16px !important;
      }
      .v4r-mobile-header { display: none !important; }
      .v4r-desktop-header { display: inline !important; }
      .v4r-mobile-lang-stack { display: none; }

      /* --- 抽屉行样式与平滑动画 --- */
      .v4r-drawer-row { background: #fafafa !important; border-bottom: 1px solid #e9ecef !important; }
      .v4r-drawer-row.d-none { display: none !important; }
      .v4r-drawer-container {
        max-height: 0; opacity: 0; overflow: hidden;
        transition: max-height 0.35s ease, opacity 0.25s ease, padding 0.25s ease;
        padding: 0 16px;
      }
      .v4r-drawer-row.is-active .v4r-drawer-container {
        max-height: 500px; opacity: 1; padding: 10px 16px 14px 16px;
      }
      .v4r-light-note-box {
        background: transparent !important; border: none !important;
        border-left: 4px solid #f59e0b !important; color: #334155 !important;
        padding: 4px 0 4px 14px !important; margin: 4px 0 !important;
        border-radius: 0 !important; box-shadow: none !important;
        font-size: 0.88rem !important; line-height: 1.6 !important;
      }
      .v4r-light-note-box.danger-theme {
        border-left-color: #ef4444 !important; color: #991b1b !important;
      }
      .note-title {
        font-weight: 700; margin-bottom: 4px; font-size: 0.82rem;
        display: flex; align-items: center; gap: 6px; color: #d97706 !important;
      }
      .v4r-light-note-box.danger-theme .note-title { color: #dc2626 !important; }
      .note-content { color: #475569 !important; word-break: break-word !important; }

      /* --- 展开按钮与胶囊标签 --- */
      .btn-v4r-note-toggle {
        background: #f1f5f9; color: #667eea; border: 1px solid #cbd5e1;
        padding: 3px 9px; font-size: 0.78rem; font-weight: 600;
        border-radius: 6px; cursor: pointer; display: inline-flex;
        align-items: center; gap: 4px; white-space: nowrap !important;
        transition: all 0.2s ease;
      }
      .btn-v4r-note-toggle:hover, tr.is-expanded .btn-v4r-note-toggle {
        background: #667eea; color: #ffffff; border-color: #667eea;
      }
      .btn-v4r-note-toggle .toggle-icon { font-size: 0.65rem; transition: transform 0.25s ease; }
      tr.is-expanded .btn-v4r-note-toggle .toggle-icon { transform: rotate(180deg); }

      .chinese-name, .english-name, .japanese-name, .romaji {
        word-break: normal !important; word-wrap: break-word !important;
      }
      .location-type, .v4r-type-badge {
        white-space: nowrap !important; display: inline-block !important;
      }

      /* --- 移动端 (<=768px) 强制 3 列响应式适配重构 (合计 100%) --- */
      @media (max-width: 768px) {
        /* 列宽防塌陷重新分配 */
        th.v4r-col-zh { width: 56% !important; padding-left: 10px !important; }
        th.v4r-col-notes { width: 22% !important; }
        th.v4r-col-type { width: 22% !important; }

        .v4r-desktop-header { display: none !important; }
        .v4r-mobile-header { display: inline !important; }
        .table-responsive { overflow-x: hidden !important; }
        .v4r-desktop-col { display: none !important; }

        .v4r-mobile-lang-stack {
          display: block; margin-top: 4px; font-size: 0.78rem;
          color: #64748b; line-height: 1.4; font-weight: 400;
        }
        .v4r-mobile-lang-stack .en-str { display: block; color: #475569; word-break: break-word; }
        .v4r-mobile-lang-stack .ja-str { display: block; color: #94a3b8; font-size: 0.74rem; word-break: break-word; }

        th, td { padding: 12px 10px !important; }
        .chinese-name {
          text-align: left !important; padding-left: 10px !important;
          font-weight: 700 !important; color: #0f172a !important; font-size: 0.92rem !important;
        }
        .location-type, .v4r-type-badge, .btn-v4r-note-toggle {
          font-size: 0.75rem !important; padding: 3px 8px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const timerRegistry = new Map();

  window.v4rToggleNoteDrawer = function (itemId) {
    const masterRow = document.getElementById(`v4r-master-${itemId}`);
    const drawerRow = document.getElementById(`v4r-drawer-${itemId}`);
    const btnToggle = document.getElementById(`v4r-btn-${itemId}`);

    if (!masterRow || !drawerRow || !btnToggle) return;

    const isExpanded = masterRow.classList.contains('is-expanded');

    if (timerRegistry.has(itemId)) {
      clearTimeout(timerRegistry.get(itemId));
      timerRegistry.delete(itemId);
    }

    if (isExpanded) {
      drawerRow.classList.remove('is-active');
      masterRow.classList.remove('is-expanded');
      btnToggle.setAttribute('aria-expanded', 'false');

      const timer = setTimeout(() => {
        if (!masterRow.classList.contains('is-expanded')) {
          drawerRow.classList.add('d-none');
        }
        timerRegistry.delete(itemId);
      }, 300);
      timerRegistry.set(itemId, timer);

    } else {
      drawerRow.classList.remove('d-none');
      void drawerRow.offsetWidth; // 触发 Reflow 保证 CSS transition 生效

      drawerRow.classList.add('is-active');
      masterRow.classList.add('is-expanded');
      btnToggle.setAttribute('aria-expanded', 'true');
    }
  };

  function buildNativeGroupedTablesHtml(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return `
        <div class="locations-table" style="padding: 30px; text-align: center; color: #666;">
          暂无任何相关词条数据记录
        </div>`;
    }

    const groupMap = new Map();
    data.forEach(item => {
      const gTitle = item.category_group || item.group_name || item.group || '核心词条';
      if (!groupMap.has(gTitle)) {
        groupMap.set(gTitle, []);
      }
      groupMap.get(gTitle).push(item);
    });

    let fullHtml = '';

    groupMap.forEach((items, groupName) => {
      let rowsHtml = '';

      items.forEach(item => {
        const zhName = escapeHtml(item.chinese_name || item.name || '-');
        const enName = escapeHtml(item.english_name || item.en_name || '');
        const jaName = escapeHtml(item.japanese_name || item.ja_name || '');
        const romaji = escapeHtml(item.romaji || '');

        const typeStr = escapeHtml(item.role_type || item.location_type || item.type || '类型');
        const badgeClass = item.badge_style || 'type-support';

        const rawNotes = item.notes || '';
        const hasNotes = Boolean(rawNotes && String(rawNotes).trim() !== '');
        const notesContent = hasNotes ? escapeHtml(rawNotes) : '';
        const isDangerNote = notesContent.includes('高危') || notesContent.includes('注意') || notesContent.includes('⚠️') || notesContent.includes('压迫') || notesContent.includes('风险');

        let jaRomajiCombo = [];
        if (jaName) jaRomajiCombo.push(jaName);
        if (romaji) jaRomajiCombo.push(`(${romaji})`);
        const jaRomajiStr = jaRomajiCombo.join(' ');

        rowsHtml += `
          <tr id="v4r-master-${item.id}">
            <td class="chinese-name">
              <div>${zhName}</div>
              <div class="v4r-mobile-lang-stack">
                ${enName ? `<span class="en-str">${enName}</span>` : ''}
                ${jaRomajiStr ? `<span class="ja-str">${jaRomajiStr}</span>` : ''}
              </div>
            </td>

            <td class="english-name v4r-desktop-col">${enName}</td>
            <td class="japanese-name v4r-desktop-col">${jaName}</td>
            <td class="romaji v4r-desktop-col">${romaji}</td>

            <td class="notes" style="text-align: center;">
              ${hasNotes ? `
                <button class="btn-v4r-note-toggle" onclick="window.v4rToggleNoteDrawer('${item.id}')" aria-expanded="false" id="v4r-btn-${item.id}">
                  <span>备注</span> <span class="toggle-icon">▼</span>
                </button>
              ` : `<span style="color: #bbb;">-</span>`}
            </td>

            <td style="text-align: center;">
              <span class="location-type ${badgeClass}">${typeStr}</span>
            </td>
          </tr>
        `;

        if (hasNotes) {
          rowsHtml += `
            <tr class="v4r-drawer-row d-none" id="v4r-drawer-${item.id}">
              <td colspan="6" style="padding: 0; background: #fafafa; border-bottom: 1px solid #e9ecef;">
                <div class="v4r-drawer-container">
                  <div class="v4r-light-note-box ${isDangerNote ? 'danger-theme' : ''}">
                    <div class="note-title">
                      <i class="fas fa-exclamation-triangle"></i> 安全与操作备注说明
                    </div>
                    <div class="note-content">${notesContent}</div>
                  </div>
                </div>
              </td>
            </tr>
          `;
        }
      });

      let groupIcon = 'fa-user';
      if (groupName.includes('身体')) groupIcon = 'fa-child';
      if (groupName.includes('家居')) groupIcon = 'fa-home';
      if (groupName.includes('建筑')) groupIcon = 'fa-building';
      if (groupName.includes('角色') || groupName.includes('实践者')) groupIcon = 'fa-user-tag';

      // ---【彻底解耦内联 style 宽度，改由 CSS Class 掌控 桌面/移动 响应式比例】---
      fullHtml += `
        <div class="locations-table">
          <div class="table-header">
            <h2><i class="fas ${groupIcon}"></i> ${escapeHtml(groupName)}</h2>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th class="v4r-col-zh">
                    <span class="v4r-desktop-header">中文表述</span>
                    <span class="v4r-mobile-header">名称 (中/英/日)</span>
                  </th>
                  <th class="v4r-col-en v4r-desktop-col">英文表述</th>
                  <th class="v4r-col-ja v4r-desktop-col">日文表述</th>
                  <th class="v4r-col-roma v4r-desktop-col">罗马音</th>
                  <th class="v4r-col-notes th-notes">备注</th>
                  <th class="v4r-col-type th-type">类型</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    return fullHtml;
  }

  function getOrInitSupabaseClient() {
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
      return window.supabaseClient;
    }
    try {
      if (typeof supabaseClient !== 'undefined' && supabaseClient && typeof supabaseClient.from === 'function') {
        window.supabaseClient = supabaseClient;
        return supabaseClient;
      }
    } catch (e) {}

    if (window.supabase && typeof window.supabase.from === 'function') {
      window.supabaseClient = window.supabase;
      return window.supabase;
    }

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return window.supabaseClient;
      } catch (err) {}
    }
    return null;
  }

  function detectPageType() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('roles') || document.title.includes('角色')) return 'roles';
    return 'locations';
  }

  function initEngine() {
    injectCleanThemeStyles();

    const pageType = detectPageType();
    const tableName = pageType === 'locations' ? 'ropevocab_locations' : 'ropevocab_roles';
    const cacheKey = `ropevocab_native_cache_v651_${tableName}`;

    const loadingEl = document.getElementById('table-loading');
    const errorEl = document.getElementById('locations-error') || document.getElementById('roles-error');
    const tableEl = document.getElementById('locations-tables-container') || document.getElementById('roles-tables-container') || document.getElementById('table-container');

    if (!tableEl) return;

    if (typeof window.swrFetch !== 'function') {
      console.error('[v4r-Architect] swrFetch 未发现');
      return;
    }

    const fetcher = async () => {
      const client = getOrInitSupabaseClient();
      if (!client) throw new Error("SUPABASE_SDK_NOT_LOADED");

      let { data, error } = await client
        .from(tableName)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        const fallback = await client.from(tableName).select('*').order('id', { ascending: true });
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;
      return data;
    };

    window.swrFetch(cacheKey, fetcher, (data, isFromCache, error) => {
      if (data && Array.isArray(data)) {
        const html = buildNativeGroupedTablesHtml(data);

        tableEl.innerHTML = html;
        tableEl.style.display = 'block';

        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';

      } else if (error && (!data || !Array.isArray(data))) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
          errorEl.style.display = 'block';
          const msgNode = errorEl.querySelector('.error-message');
          if (msgNode) msgNode.textContent = `无法加载数据：${typeof error === 'string' ? error : error.message}`;
        }
      }
    });
  }

  function bootstrap() {
    let attempts = 0;
    const check = () => {
      const client = getOrInitSupabaseClient();
      if (client && typeof window.swrFetch === 'function') {
        initEngine();
      } else if (attempts < 35) {
        attempts++;
        setTimeout(check, 100);
      } else {
        initEngine();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', check);
    } else {
      check();
    }
  }

  bootstrap();

})();
