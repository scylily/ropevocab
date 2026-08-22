/**
 * ==============================================================================
 * ROPEVOCAB PROJECT - HUB & TABLE PAGES RENDERER (NAV TAG FIXED)
 * File: v2/assets/js/hub-renderer.js
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const pageType = getPageType();

    if (pageType === "category") {
        initCategoryHubPage();
    } else if (pageType === "locations") {
        initLocationsPage();
    } else if (pageType === "roles") {
        initRolesPage();
    }
});

function getPageType() {
    const path = window.location.pathname;
    if (path.includes("category.html")) return "category";
    if (path.includes("locations.html")) return "locations";
    if (path.includes("roles.html")) return "roles";
    return "unknown";
}

function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getBadgeClass(typeText, explicitStyle) {
    if (explicitStyle && explicitStyle.trim() !== "") {
        return explicitStyle.trim();
    }
    if (!typeText) return "type-primary";
    const text = typeText.trim();

    if (text.includes("躯干") || text.includes("专业") || text.includes("悬吊设备") || text.includes("记录") || text.includes("表演") || text.includes("竞技")) {
        return "type-decorative";
    }
    if (text.includes("下肢") || text.includes("平面") || text.includes("临时") || text.includes("辅助") || text.includes("教学") || text.includes("关怀") || text.includes("社交") || text.includes("文化")) {
        return "type-support";
    }
    return "type-primary";
}

/* ==============================================================================
   A. 通用子分类 Hub 页面 (v2/pages/category.html?id=...)
   ============================================================================== */
function initCategoryHubPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const catId = urlParams.get("id");

    if (!catId) {
        showHubError("未在 URL 中指定分类标识 ID（例如须传入 ?id=specificties）。");
        return;
    }

    const cacheKeyCat = `ropevocab_cat_meta_${catId}`;
    const cacheKeyTerms = `ropevocab_cat_terms_${catId}`;

    swrFetch(cacheKeyCat, async () => {
        const { data, error } = await supabaseClient
            .from("ropevocab_categories")
            .select("*")
            .eq("id", catId)
            .single();
        if (error) throw error;
        return data;
    }, (catMeta) => {
        if (catMeta) {
            document.title = `${escapeHtml(catMeta.title)} - 常用绳缚词汇库`;
            setElText("hub-title", catMeta.title);
            setElText("hub-description", catMeta.description);
            setElText("breadcrumb-cat-title", catMeta.title);

            // 核心修复：更新顶部导航栏高亮激活标签为当前分类名称 (例: 部分绳缚技术名称)
            const navActiveTagEl = document.getElementById("nav-active-cat-tag");
            if (navActiveTagEl) {
                navActiveTagEl.innerHTML = `<i class="fas fa-folder-open"></i> ${escapeHtml(catMeta.title)}`;
            }
        }
    });

    swrFetch(cacheKeyTerms, async () => {
        const { data, error } = await supabaseClient
            .from("ropevocab_terms")
            .select("id, title, name_en, emoji, sort_order")
            .eq("category_id", catId)
            .order("sort_order", { ascending: true });
        if (error) throw error;
        return data;
    }, (terms, isCache, errType) => {
        if (!terms) {
            if (errType === "SUPABASE_UNCONFIGURED") {
                showHubError("Supabase 项目凭证未配置。请在 v2/assets/js/supabase-config.js 中填写 SUPABASE_URL 与 ANON_KEY。");
            } else if (errType === "NETWORK_TIMEOUT") {
                showHubError("连接数据库超时，请检查网络或 Supabase 服务状态。");
            } else {
                showHubError("无法拉取该分类下的词条数据。");
            }
            return;
        }

        hideLoadingAndShowMain("hub-loading", "hub-error", "hub-main-content");
        renderCategoryTermCards("term-cards-grid", terms);
    });
}

function renderCategoryTermCards(containerId, terms) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (terms.length === 0) {
        container.innerHTML = `<div style="text-align:center; grid-column: 1/-1; padding: 40px; color:#888;">该分类下暂无词条</div>`;
        return;
    }

    let cardsHtml = "";
    terms.forEach(term => {
        cardsHtml += `
            <a href="term.html?id=${encodeURIComponent(term.id)}" class="subcategory-card">
                <div>${escapeHtml(term.emoji || "🏷️")}</div>
                <h3>${escapeHtml(term.title || "")}</h3>
                <p>${escapeHtml(term.name_en || "")}</p>
            </a>
        `;
    });
    container.innerHTML = cardsHtml;
}

/* ==============================================================================
   B. 位置表格页面 (v2/pages/locations.html)
   ============================================================================== */
function initLocationsPage() {
    const cacheKey = "ropevocab_all_locations";
    const containerEl = document.getElementById("locations-tables-container");

    swrFetch(cacheKey, async () => {
        const { data, error } = await supabaseClient
            .from("ropevocab_locations")
            .select("*")
            .order("sort_order", { ascending: true });
        if (error) throw error;
        return data;
    }, (locations, isCache, errType) => {
        if (!locations) {
            showTableError("table-loading", "locations-error", errType === "SUPABASE_UNCONFIGURED" ? "请先配置 Supabase 凭证" : "无法加载位置数据。");
            return;
        }

        hideLoadingAndShowMain("table-loading", "locations-error", "locations-tables-container");
        const groups = groupBy(locations, "category_group");
        renderLocationsGroupedTables(containerEl, groups);
    });
}

function renderLocationsGroupedTables(container, groups) {
    let html = "";
    const groupIcons = {
        "身体部位": "fa-user",
        "家居装备": "fa-couch",
        "建筑结构": "fa-archway",
        "自然环境": "fa-tree"
    };

    for (const [groupName, rows] of Object.entries(groups)) {
        const iconClass = groupIcons[groupName] || "fa-map-marker-alt";
        html += `
            <div class="locations-table">
                <div class="table-header">
                    <h2><i class="fas ${iconClass}"></i> ${escapeHtml(groupName)}</h2>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th width="15%">中文表述</th>
                                <th width="15%">英文表述</th>
                                <th width="15%">日文表述</th>
                                <th width="15%">罗马音</th>
                                <th width="30%">备注</th>
                                <th width="10%">类型</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        rows.forEach(row => {
            const badgeClass = getBadgeClass(row.location_type, row.badge_style);
            html += `
                <tr>
                    <td class="chinese-name">${escapeHtml(row.chinese_name || "")}</td>
                    <td class="english-name">${escapeHtml(row.english_name || "")}</td>
                    <td class="japanese-name">${escapeHtml(row.japanese_name || "")}</td>
                    <td class="romaji">${escapeHtml(row.romaji || "")}</td>
                    <td class="notes">${escapeHtml(row.notes || "")}</td>
                    <td><span class="location-type ${badgeClass}">${escapeHtml(row.location_type || "缚点")}</span></td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/* ==============================================================================
   C. 角色与活动页面 (v2/pages/roles.html)
   ============================================================================== */
function initRolesPage() {
    const cacheKey = "ropevocab_all_roles";
    const containerEl = document.getElementById("roles-tables-container");

    swrFetch(cacheKey, async () => {
        const { data, error } = await supabaseClient
            .from("ropevocab_roles")
            .select("*")
            .order("sort_order", { ascending: true });
        if (error) throw error;
        return data;
    }, (roles, isCache, errType) => {
        if (!roles) {
            showTableError("table-loading", "roles-error", errType === "SUPABASE_UNCONFIGURED" ? "请先配置 Supabase 凭证" : "无法加载角色数据。");
            return;
        }

        hideLoadingAndShowMain("table-loading", "roles-error", "roles-tables-container");
        const groups = groupBy(roles, "category_group");
        renderRolesGroupedTables(containerEl, groups);
    });
}

function renderRolesGroupedTables(container, groups) {
    let html = "";
    const groupIcons = {
        "实践者与角色": "fa-user-tie",
        "活动参与者": "fa-users",
        "绳缚关系": "fa-handshake",
        "实践动态": "fa-comments",
        "绳缚活动": "fa-calendar-alt",
        "节庆与赛事": "fa-trophy",
        "社区与文化": "fa-people-group"
    };

    for (const [groupName, rows] of Object.entries(groups)) {
        const iconClass = groupIcons[groupName] || "fa-users";
        html += `
            <div class="locations-table">
                <div class="table-header">
                    <h2><i class="fas ${iconClass}"></i> ${escapeHtml(groupName)}</h2>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th width="15%">中文表述</th>
                                <th width="15%">英文表述</th>
                                <th width="15%">日文表述</th>
                                <th width="15%">罗马音</th>
                                <th width="30%">备注</th>
                                <th width="10%">类型</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        rows.forEach(row => {
            const badgeClass = getBadgeClass(row.role_type, row.badge_style);
            html += `
                <tr>
                    <td class="chinese-name">${escapeHtml(row.chinese_name || "")}</td>
                    <td class="english-name">${escapeHtml(row.english_name || "")}</td>
                    <td class="japanese-name">${escapeHtml(row.japanese_name || "")}</td>
                    <td class="romaji">${escapeHtml(row.romaji || "")}</td>
                    <td class="notes">${escapeHtml(row.notes || "")}</td>
                    <td><span class="location-type ${badgeClass}">${escapeHtml(row.role_type || "角色")}</span></td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function hideLoadingAndShowMain(loadingId, errorId, mainId) {
    const loadingEl = document.getElementById(loadingId);
    const errorEl = document.getElementById(errorId);
    const mainEl = document.getElementById(mainId);

    if (loadingEl) loadingEl.style.display = "none";
    if (errorEl) errorEl.style.display = "none";
    if (mainEl) mainEl.style.display = "block";
}

function showHubError(msg) {
    const loadingEl = document.getElementById("hub-loading");
    const errorEl = document.getElementById("hub-error");
    const mainEl = document.getElementById("hub-main-content");

    if (loadingEl) loadingEl.style.display = "none";
    if (mainEl) mainEl.style.display = "none";
    if (errorEl) {
        errorEl.style.display = "block";
        const msgEl = errorEl.querySelector(".error-message");
        if (msgEl) msgEl.textContent = msg;
    }
}

function showTableError(loadingId, errorId, msg) {
    const loadingEl = document.getElementById(loadingId);
    const errorEl = document.getElementById(errorId);

    if (loadingEl) loadingEl.style.display = "none";
    if (errorEl) {
        errorEl.style.display = "block";
        const msgEl = errorEl.querySelector(".error-message");
        if (msgEl) msgEl.textContent = msg;
    }
}

function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
        const groupKey = currentValue[key] || "未分类";
        (result[groupKey] = result[groupKey] || []).push(currentValue);
        return result;
    }, {});
}

function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}
