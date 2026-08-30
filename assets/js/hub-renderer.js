/**
 * @version 6.6.1
 * @author Senior Architect (Defense Grade)
 */

(function () {
  'use strict';

  const SUPABASE_URL = "https://gfhgwqjvxyyanumbwibe.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_26_l2bawRKyTELKRlUO4XA_jhhMgAY7";

  function detectPageType() {
    const path = window.location.pathname.toLowerCase();
    const title = (document.title || '').toLowerCase();

    const isRoles = path.includes('roles') || title.includes('角色');
    const isLocations = path.includes('locations') || title.includes('场地') || title.includes('部位');

    if (isRoles) return 'roles';
    if (isLocations) return 'locations';

    return null;
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
      void drawerRow.offsetWidth;

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
                  <div class="v4r-light-note-box">
                    <div class="note-title">
                      <i class="fas fa-info-circle"></i> 备注说明
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
      if (groupName.includes('自然')) groupIcon = 'fa-tree';
      if (groupName.includes('实践者')) groupIcon = 'fa-user-tag';
      if (groupName.includes('参与者')) groupIcon = 'fa-user-check';
      if (groupName.includes('关系')) groupIcon = 'fa-user-friends';
      if (groupName.includes('动态')) groupIcon = 'fa-user-clock';
      if (groupName.includes('活动')) groupIcon = 'fa-user-edit';
      if (groupName.includes('节庆')) groupIcon = 'fa-calendar-alt';
      if (groupName.includes('社区')) groupIcon = 'fa-city';

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

  function initEngine() {
    const pageType = detectPageType();
    if (!pageType) return;

    const tableName = pageType === 'locations' ? 'ropevocab_locations' : 'ropevocab_roles';
    const cacheKey = `ropevocab_native_cache_v661_${tableName}`;

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
    if (!detectPageType()) return;

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
