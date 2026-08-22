/**
 * ==============================================================================
 * ROPEVOCAB PROJECT - ADMIN ENGINE (WITH EXPLICIT BADGE COLOR SELECTOR)
 * File: v2/assets/js/admin-engine.js
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    initAdminEngine();
});

let currentActiveTab = "terms";
let currentTermCategoryFilter = "all";
let currentLocationGroupFilter = "all";
let currentRoleGroupFilter = "all";

let cachedTermsList = [];
let cachedCategoriesList = [];
let cachedLocationsList = [];
let cachedRolesList = [];

// 降级兜底关键字匹配
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

async function initAdminEngine() {
    if (!IS_CONFIGURED || !supabaseClient) {
        showAuthView(false, "请先在 v2/assets/js/supabase-config.js 中配置真实的 SUPABASE_URL 与 ANON_KEY。");
        return;
    }

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            showDashboardView(session.user);
        } else {
            showAuthView(true);
        }
    } catch (e) {
        showAuthView(true);
    }

    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

    // 实时绑定弹窗颜色选择与文本输入的双向预览
    bindLivePreview("loc-field-type", "loc-field-style", "loc-type-badge-preview");
    bindLivePreview("role-field-type", "role-field-style", "role-type-badge-preview");
}

function bindLivePreview(typeInputId, styleSelectId, previewBadgeId) {
    const typeInput = document.getElementById(typeInputId);
    const styleSelect = document.getElementById(styleSelectId);
    const badgeEl = document.getElementById(previewBadgeId);

    if (!typeInput || !styleSelect || !badgeEl) return;

    const update = () => {
        const text = typeInput.value.trim() || "类型预览";
        const style = styleSelect.value || getBadgeClass(text);
        badgeEl.textContent = text;
        badgeEl.className = `location-type ${style}`;
    };

    typeInput.addEventListener("input", update);
    styleSelect.addEventListener("change", update);
}

function syncBadgePreviewManual(typeText, styleValue, previewBadgeId) {
    const badgeEl = document.getElementById(previewBadgeId);
    if (!badgeEl) return;
    const text = (typeText || "").trim() || "类型预览";
    const style = styleValue || getBadgeClass(text);
    badgeEl.textContent = text;
    badgeEl.className = `location-type ${style}`;
}

/* ==============================================================================
   1. 身份认证与视图控制
   ============================================================================== */
function showAuthView(showForm = true, errorMsg = "") {
    document.getElementById("admin-auth-section").style.display = "flex";
    document.getElementById("admin-dashboard-section").style.display = "none";

    const authForm = document.getElementById("admin-login-form");
    const authErr = document.getElementById("auth-error-msg");

    if (authForm) authForm.style.display = showForm ? "block" : "none";
    if (authErr) {
        authErr.style.display = errorMsg ? "block" : "none";
        authErr.textContent = errorMsg;
    }
}

function showDashboardView(user) {
    document.getElementById("admin-auth-section").style.display = "none";
    document.getElementById("admin-dashboard-section").style.display = "block";

    const userEmailEl = document.getElementById("admin-user-email");
    if (userEmailEl) userEmailEl.textContent = user.email || "管理员";

    switchTab("terms");
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const submitBtn = document.getElementById("login-submit-btn");

    if (!email || !password) {
        showAuthView(true, "请输入邮箱与密码。");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "登录验证中...";

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showDashboardView(data.user);
    } catch (err) {
        showAuthView(true, `登录失败: ${err.message || "账号或密码错误"}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "登录后台";
    }
}

async function handleLogout() {
    if (confirm("确定要退出管理后台吗？")) {
        await supabaseClient.auth.signOut();
        showAuthView(true, "已成功安全退出。");
    }
}

/* ==============================================================================
   2. 选项卡与数据看板
   ============================================================================== */
function switchTab(tabName) {
    currentActiveTab = tabName;

    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    document.querySelectorAll(".admin-tab-panel").forEach(panel => {
        panel.style.display = "none";
    });

    const targetPanel = document.getElementById(`panel-${tabName}`);
    if (targetPanel) targetPanel.style.display = "block";

    loadTabData(tabName);
}

function loadTabData(tabName) {
    if (tabName === "terms") loadTermsData();
    else if (tabName === "categories") loadCategoriesData();
    else if (tabName === "locations") loadLocationsData();
    else if (tabName === "roles") loadRolesData();
}

/* ==============================================================================
   3. 词条表管理 (`ropevocab_terms`)
   ============================================================================== */
async function renderTermsCategoryFilterBar() {
    const filterContainer = document.getElementById("terms-category-filter-bar");
    if (!filterContainer) return;

    try {
        const { data: categories } = await supabaseClient
            .from("ropevocab_categories")
            .select("id, title, emoji")
            .order("sort_order", { ascending: true });

        let html = `
            <button class="filter-pill ${currentTermCategoryFilter === 'all' ? 'active' : ''}" onclick="filterTermsByCategory('all')">
                全部词条
            </button>
        `;

        if (categories) {
            categories.forEach(cat => {
                html += `
                    <button class="filter-pill ${currentTermCategoryFilter === cat.id ? 'active' : ''}" onclick="filterTermsByCategory('${escapeHtml(cat.id)}')">
                        ${escapeHtml(cat.emoji || "🏷️")} ${escapeHtml(cat.title)}
                    </button>
                `;
            });
        }
        filterContainer.innerHTML = html;
    } catch (e) {
        console.warn("[Filter Bar Error] 加载分类筛选条失败:", e);
    }
}

function filterTermsByCategory(catId) {
    currentTermCategoryFilter = catId;
    renderTermsCategoryFilterBar();
    loadTermsData();
}

async function loadTermsData() {
    const tableBody = document.getElementById("tbody-terms");
    if (!tableBody) return;

    renderTermsCategoryFilterBar();
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center">正在加载词条数据...</td></tr>`;

    try {
        let query = supabaseClient
            .from("ropevocab_terms")
            .select("id, category_id, title, name_en, emoji, sort_order, updated_at");

        if (currentTermCategoryFilter !== "all") {
            query = query.eq("category_id", currentTermCategoryFilter);
        }

        const { data, error } = await query.order("sort_order", { ascending: true });
        if (error) throw error;

        cachedTermsList = data || [];

        if (cachedTermsList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">该分类下暂无词条数据</td></tr>`;
            return;
        }

        let html = "";
        cachedTermsList.forEach((item, index) => {
            const isFirst = index === 0;
            const isLast = index === cachedTermsList.length - 1;

            html += `
                <tr>
                    <td><code>${escapeHtml(item.id)}</code></td>
                    <td>${escapeHtml(item.emoji || "🏷️")} <strong>${escapeHtml(item.title)}</strong></td>
                    <td>${escapeHtml(item.name_en || "-")}</td>
                    <td><span class="badge-tag">${escapeHtml(item.category_id || "-")}</span></td>
                    <td><span class="badge-position">第 ${index + 1} 位</span></td>
                    <td>
                        <button class="btn-sm btn-reorder" onclick="moveTermOrder(${index}, 'up')" ${isFirst ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⬆️ 上移</button>
                        <button class="btn-sm btn-reorder" onclick="moveTermOrder(${index}, 'down')" ${isLast ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⬇️ 下移</button>
                    </td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="openTermEditModal('${escapeHtml(item.id)}')">编辑</button>
                        <button class="btn-sm btn-danger" onclick="deleteTerm('${escapeHtml(item.id)}')">删除</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">加载失败: ${escapeHtml(err.message)}</td></tr>`;
    }
}

async function moveTermOrder(currentIndex, direction) {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cachedTermsList.length) return;

    const temp = cachedTermsList[currentIndex];
    cachedTermsList[currentIndex] = cachedTermsList[targetIndex];
    cachedTermsList[targetIndex] = temp;

    const updatePromises = cachedTermsList.map((item, idx) => {
        const newSortOrder = (idx + 1) * 10;
        item.sort_order = newSortOrder;
        return supabaseClient
            .from("ropevocab_terms")
            .update({ sort_order: newSortOrder })
            .eq("id", item.id);
    });

    try {
        const results = await Promise.all(updatePromises);
        const hasErr = results.find(r => r.error);
        if (hasErr && hasErr.error) throw hasErr.error;

        clearFrontendCache("ropevocab_all_terms_cache");
        if (temp.category_id) clearFrontendCache(`ropevocab_cat_terms_${temp.category_id}`);

        loadTermsData();
    } catch (err) {
        alert("位置调整失败: " + (err.message || "数据库更新错误"));
    }
}

async function openTermEditModal(termId = null) {
    const modal = document.getElementById("modal-term-form");
    const form = document.getElementById("form-term");
    const titleEl = document.getElementById("modal-term-title");

    modal.style.display = "flex";
    form.reset();

    document.getElementById("container-features-builder").innerHTML = "";
    document.getElementById("container-apps-builder").innerHTML = "";
    document.getElementById("container-images-builder").innerHTML = "";

    await populateCategorySelect("term-field-category");

    if (termId) {
        titleEl.textContent = `编辑词条 [${termId}]`;
        document.getElementById("term-field-id").readOnly = true;

        try {
            const { data, error } = await supabaseClient
                .from("ropevocab_terms")
                .select("*")
                .eq("id", termId)
                .maybeSingle();

            if (error || !data) {
                alert("无法获取词条详情: " + (error ? error.message : "未找到记录"));
                closeAdminModal("modal-term-form");
                return;
            }

            document.getElementById("term-field-id").value = data.id || "";
            document.getElementById("term-field-category").value = data.category_id || "specificties";
            document.getElementById("term-field-title").value = data.title || "";
            document.getElementById("term-field-name-en").value = data.name_en || "";
            document.getElementById("term-field-name-jp").value = data.name_jp || "";
            document.getElementById("term-field-romaji").value = data.romaji || "";
            document.getElementById("term-field-badge").value = data.subtitle_badge || "";
            document.getElementById("term-field-emoji").value = data.emoji || "";
            document.getElementById("term-field-sort").value = data.sort_order || 10;
            document.getElementById("term-field-description").value = data.description || "";
            document.getElementById("term-field-safety").value = data.safety_notes || "";

            parseJsonArray(data.technical_features).forEach(feat => addDynamicInputRow("container-features-builder", feat));
            parseJsonArray(data.applications).forEach(app => addDynamicInputRow("container-apps-builder", app));

            const images = parseJsonArray(data.images);
            const captions = parseJsonArray(data.image_captions);
            images.forEach((img, idx) => addImageRowBuilder(img, captions[idx] || ""));
        } catch (err) {
            alert("读取词条失败: " + err.message);
            closeAdminModal("modal-term-form");
        }
    } else {
        titleEl.textContent = "新增词条";
        document.getElementById("term-field-id").readOnly = false;
        if (currentTermCategoryFilter !== "all") {
            document.getElementById("term-field-category").value = currentTermCategoryFilter;
        }
        document.getElementById("term-field-sort").value = (cachedTermsList.length + 1) * 10;
    }
}

async function saveTermForm(e) {
    e.preventDefault();
    const id = document.getElementById("term-field-id").value.trim();
    const categoryId = document.getElementById("term-field-category").value;

    if (!id) {
        alert("请输入词条唯一标识 ID！");
        return;
    }

    const payload = {
        id: id,
        category_id: categoryId,
        title: document.getElementById("term-field-title").value.trim(),
        name_en: document.getElementById("term-field-name-en").value.trim(),
        name_jp: document.getElementById("term-field-name-jp").value.trim(),
        romaji: document.getElementById("term-field-romaji").value.trim(),
        subtitle_badge: document.getElementById("term-field-badge").value.trim(),
        emoji: document.getElementById("term-field-emoji").value.trim(),
        sort_order: parseInt(document.getElementById("term-field-sort").value) || 10,
        description: document.getElementById("term-field-description").value.trim(),
        safety_notes: document.getElementById("term-field-safety").value.trim(),
        technical_features: collectDynamicInputs("container-features-builder"),
        applications: collectDynamicInputs("container-apps-builder"),
        ...collectImageRows()
    };

    try {
        const { error } = await supabaseClient.from("ropevocab_terms").upsert(payload, { onConflict: "id" });
        if (error) throw error;

        clearFrontendCache(`ropevocab_term_${id}`);
        clearFrontendCache("ropevocab_all_terms_cache");
        if (categoryId) clearFrontendCache(`ropevocab_cat_terms_${categoryId}`);

        alert("词条保存成功！");
        closeAdminModal("modal-term-form");
        loadTermsData();
    } catch (err) {
        alert("保存失败: " + err.message);
    }
}

async function deleteTerm(termId) {
    if (!confirm(`确定要永久删除词条 [${termId}] 吗？`)) return;

    try {
        const { error } = await supabaseClient.from("ropevocab_terms").delete().eq("id", termId);
        if (error) throw error;

        clearFrontendCache(`ropevocab_term_${termId}`);
        clearFrontendCache("ropevocab_all_terms_cache");

        alert("删除成功！");
        loadTermsData();
    } catch (err) {
        alert("删除失败: " + err.message);
    }
}

/* ==============================================================================
   4. 分类 Hub 表管理 (`ropevocab_categories`)
   ============================================================================== */
async function loadCategoriesData() {
    const tableBody = document.getElementById("tbody-categories");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">正在加载 Hub 分类...</td></tr>`;

    try {
        const { data, error } = await supabaseClient
            .from("ropevocab_categories")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) throw error;

        cachedCategoriesList = data || [];

        let html = "";
        cachedCategoriesList.forEach((item, index) => {
            const isFirst = index === 0;
            const isLast = index === cachedCategoriesList.length - 1;

            html += `
                <tr>
                    <td><code>${escapeHtml(item.id)}</code></td>
                    <td>${escapeHtml(item.emoji || "")} <strong>${escapeHtml(item.title)}</strong></td>
                    <td>${escapeHtml(item.name_en || "-")}</td>
                    <td><span class="badge-position">第 ${index + 1} 位</span></td>
                    <td>
                        <button class="btn-sm btn-reorder" onclick="moveCategoryOrder(${index}, 'up')" ${isFirst ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⬆️ 上移</button>
                        <button class="btn-sm btn-reorder" onclick="moveCategoryOrder(${index}, 'down')" ${isLast ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⬇️ 下移</button>
                    </td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="openCategoryEditModal('${escapeHtml(item.id)}')">编辑</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">加载失败: ${escapeHtml(err.message)}</td></tr>`;
    }
}

async function moveCategoryOrder(currentIndex, direction) {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cachedCategoriesList.length) return;

    const temp = cachedCategoriesList[currentIndex];
    cachedCategoriesList[currentIndex] = cachedCategoriesList[targetIndex];
    cachedCategoriesList[targetIndex] = temp;

    const updatePromises = cachedCategoriesList.map((item, idx) => {
        const newSortOrder = (idx + 1) * 10;
        return supabaseClient
            .from("ropevocab_categories")
            .update({ sort_order: newSortOrder })
            .eq("id", item.id);
    });

    try {
        await Promise.all(updatePromises);
        clearFrontendCache(`ropevocab_cat_meta_${temp.id}`);
        loadCategoriesData();
    } catch (err) {
        alert("分类位置调整失败: " + err.message);
    }
}

async function openCategoryEditModal(catId) {
    const modal = document.getElementById("modal-category-form");
    modal.style.display = "flex";

    try {
        const { data, error } = await supabaseClient
            .from("ropevocab_categories")
            .select("*")
            .eq("id", catId)
            .maybeSingle();

        if (error || !data) throw error || new Error("未找到分类记录");

        document.getElementById("cat-field-id").value = data.id || "";
        document.getElementById("cat-field-title").value = data.title || "";
        document.getElementById("cat-field-name-en").value = data.name_en || "";
        document.getElementById("cat-field-emoji").value = data.emoji || "";
        document.getElementById("cat-field-sort").value = data.sort_order || 10;
        document.getElementById("cat-field-description").value = data.description || "";
    } catch (err) {
        alert("读取分类详情失败: " + err.message);
        closeAdminModal("modal-category-form");
    }
}

async function saveCategoryForm(e) {
    e.preventDefault();
    const id = document.getElementById("cat-field-id").value;

    const payload = {
        title: document.getElementById("cat-field-title").value.trim(),
        name_en: document.getElementById("cat-field-name-en").value.trim(),
        emoji: document.getElementById("cat-field-emoji").value.trim(),
        sort_order: parseInt(document.getElementById("cat-field-sort").value) || 10,
        description: document.getElementById("cat-field-description").value.trim()
    };

    try {
        const { error } = await supabaseClient.from("ropevocab_categories").update(payload).eq("id", id);
        if (error) throw error;

        clearFrontendCache(`ropevocab_cat_meta_${id}`);
        alert("分类保存成功！");
        closeAdminModal("modal-category-form");
        loadCategoriesData();
    } catch (err) {
        alert("保存失败: " + err.message);
    }
}

/* ==============================================================================
   5. 常见位置表管理 (`ropevocab_locations` - 支持显式胶囊颜色保存)
   ============================================================================== */

async function renderLocationsGroupFilterBar() {
    const filterContainer = document.getElementById("locations-group-filter-bar");
    if (!filterContainer) return;

    const groups = ["全部分组", "身体部位", "家居装备", "建筑结构", "自然环境"];
    let html = "";
    groups.forEach(grp => {
        const valueKey = grp === "全部分组" ? "all" : grp;
        html += `
            <button class="filter-pill ${currentLocationGroupFilter === valueKey ? 'active' : ''}" onclick="filterLocationsByGroup('${escapeHtml(valueKey)}')">
                ${escapeHtml(grp)}
            </button>
        `;
    });
    filterContainer.innerHTML = html;
}

function filterLocationsByGroup(groupName) {
    currentLocationGroupFilter = groupName;
    renderLocationsGroupFilterBar();
    loadLocationsData();
}

async function loadLocationsData() {
    const tableBody = document.getElementById("tbody-locations");
    if (!tableBody) return;

    renderLocationsGroupFilterBar();
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center">正在加载位置数据...</td></tr>`;

    try {
        let query = supabaseClient.from("ropevocab_locations").select("*");
        if (currentLocationGroupFilter !== "all") {
            query = query.eq("category_group", currentLocationGroupFilter);
        }

        const { data, error } = await query.order("sort_order", { ascending: true });
        if (error) throw error;

        cachedLocationsList = data || [];

        if (cachedLocationsList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center">该分组下暂无位置数据</td></tr>`;
            return;
        }

        let html = "";
        cachedLocationsList.forEach((item, index) => {
            const isFirst = index === 0;
            const isLast = index === cachedLocationsList.length - 1;
            const badgeCls = getBadgeClass(item.location_type, item.badge_style);

            html += `
                <tr>
                    <td><span class="badge-tag">${escapeHtml(item.category_group || "通用")}</span></td>
                    <td><strong>${escapeHtml(item.chinese_name)}</strong></td>
                    <td>${escapeHtml(item.english_name || "-")}</td>
                    <td>${escapeHtml(item.japanese_name || "-")} / <em>${escapeHtml(item.romaji || "-")}</em></td>
                    <td><span class="location-type ${badgeCls}">${escapeHtml(item.location_type || "缚点")}</span></td>
                    <td><span class="badge-position">第 ${index + 1} 位</span></td>
                    <td>
                        <button class="btn-sm btn-reorder" onclick="moveLocationOrder(${index}, 'up')" ${isFirst ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⬆️ 上移</button>
                        <button class="btn-sm btn-reorder" onclick="moveLocationOrder(${index}, 'down')" ${isLast ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⬇️ 下移</button>
                    </td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="openLocationEditModal(${item.id})">编辑</button>
                        <button class="btn-sm btn-danger" onclick="deleteLocation(${item.id})">删除</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">加载失败: ${escapeHtml(err.message)}</td></tr>`;
    }
}

async function moveLocationOrder(currentIndex, direction) {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cachedLocationsList.length) return;

    const temp = cachedLocationsList[currentIndex];
    cachedLocationsList[currentIndex] = cachedLocationsList[targetIndex];
    cachedLocationsList[targetIndex] = temp;

    const updatePromises = cachedLocationsList.map((item, idx) => {
        const newSortOrder = (idx + 1) * 10;
        return supabaseClient
            .from("ropevocab_locations")
            .update({ sort_order: newSortOrder })
            .eq("id", item.id);
    });

    try {
        await Promise.all(updatePromises);
        clearFrontendCache("ropevocab_all_locations");
        loadLocationsData();
    } catch (err) {
        alert("位置调整失败: " + err.message);
    }
}

async function openLocationEditModal(locId = null) {
    editingEntityId = locId;
    const modal = document.getElementById("modal-location-form");
    const titleEl = document.getElementById("modal-location-title");

    modal.style.display = "flex";
    document.getElementById("form-location").reset();

    if (locId) {
        titleEl.textContent = `编辑位置节点 [#${locId}]`;
        try {
            const { data, error } = await supabaseClient
                .from("ropevocab_locations")
                .select("*")
                .eq("id", locId)
                .maybeSingle();

            if (error || !data) throw error || new Error("数据不存在");

            document.getElementById("loc-field-group").value = data.category_group || "身体部位";
            document.getElementById("loc-field-cn").value = data.chinese_name || "";
            document.getElementById("loc-field-en").value = data.english_name || "";
            document.getElementById("loc-field-jp").value = data.japanese_name || "";
            document.getElementById("loc-field-romaji").value = data.romaji || "";
            document.getElementById("loc-field-type").value = data.location_type || "上肢缚点";
            document.getElementById("loc-field-style").value = data.badge_style || getBadgeClass(data.location_type);
            document.getElementById("loc-field-sort").value = data.sort_order || 10;
            document.getElementById("loc-field-notes").value = data.notes || "";

            syncBadgePreviewManual(data.location_type || "上肢缚点", data.badge_style, "loc-type-badge-preview");
        } catch (err) {
            alert("读取位置详情失败: " + err.message);
            closeAdminModal("modal-location-form");
        }
    } else {
        titleEl.textContent = "新增位置节点";
        if (currentLocationGroupFilter !== "all") {
            document.getElementById("loc-field-group").value = currentLocationGroupFilter;
        }
        document.getElementById("loc-field-sort").value = (cachedLocationsList.length + 1) * 10;
        document.getElementById("loc-field-style").value = "type-primary";
        syncBadgePreviewManual("上肢缚点", "type-primary", "loc-type-badge-preview");
    }
}

async function saveLocationForm(e) {
    e.preventDefault();
    const payload = {
        category_group: document.getElementById("loc-field-group").value.trim(),
        chinese_name: document.getElementById("loc-field-cn").value.trim(),
        english_name: document.getElementById("loc-field-en").value.trim(),
        japanese_name: document.getElementById("loc-field-jp").value.trim(),
        romaji: document.getElementById("loc-field-romaji").value.trim(),
        location_type: document.getElementById("loc-field-type").value.trim(),
        badge_style: document.getElementById("loc-field-style").value,
        sort_order: parseInt(document.getElementById("loc-field-sort").value) || 10,
        notes: document.getElementById("loc-field-notes").value.trim()
    };

    try {
        let query;
        if (editingEntityId) {
            query = supabaseClient.from("ropevocab_locations").update(payload).eq("id", editingEntityId);
        } else {
            query = supabaseClient.from("ropevocab_locations").insert([payload]);
        }

        const { error } = await query;
        if (error) throw error;

        clearFrontendCache("ropevocab_all_locations");
        alert("位置数据保存成功！");
        closeAdminModal("modal-location-form");
        loadLocationsData();
    } catch (err) {
        alert("保存失败: " + err.message);
    }
}

async function deleteLocation(locId) {
    if (!confirm(`确定要永久删除位置 [#${locId}] 吗？`)) return;

    try {
        const { error } = await supabaseClient.from("ropevocab_locations").delete().eq("id", locId);
        if (error) throw error;

        clearFrontendCache("ropevocab_all_locations");
        alert("位置已删除！");
        loadLocationsData();
    } catch (err) {
        alert("删除失败: " + err.message);
    }
}

/* ==============================================================================
   6. 角色与活动表管理 (`ropevocab_roles` - 支持显式胶囊颜色保存)
   ============================================================================== */

async function renderRolesGroupFilterBar() {
    const filterContainer = document.getElementById("roles-group-filter-bar");
    if (!filterContainer) return;

    const groups = ["全部分组", "实践者与角色", "活动参与者", "绳缚关系", "实践动态", "绳缚活动", "节庆与赛事", "社区与文化"];
    let html = "";
    groups.forEach(grp => {
        const valueKey = grp === "全部分组" ? "all" : grp;
        html += `
            <button class="filter-pill ${currentRoleGroupFilter === valueKey ? 'active' : ''}" onclick="filterRolesByGroup('${escapeHtml(valueKey)}')">
                ${escapeHtml(grp)}
            </button>
        `;
    });
    filterContainer.innerHTML = html;
}

function filterRolesByGroup(groupName) {
    currentRoleGroupFilter = groupName;
    renderRolesGroupFilterBar();
    loadRolesData();
}

async function loadRolesData() {
    const tableBody = document.getElementById("tbody-roles");
    if (!tableBody) return;

    renderRolesGroupFilterBar();
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center">正在加载角色与活动数据...</td></tr>`;

    try {
        let query = supabaseClient.from("ropevocab_roles").select("*");
        if (currentRoleGroupFilter !== "all") {
            query = query.eq("category_group", currentRoleGroupFilter);
        }

        const { data, error } = await query.order("sort_order", { ascending: true });
        if (error) throw error;

        cachedRolesList = data || [];

        if (cachedRolesList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center">该分组下暂无角色数据</td></tr>`;
            return;
        }

        let html = "";
        cachedRolesList.forEach((item, index) => {
            const isFirst = index === 0;
            const isLast = index === cachedRolesList.length - 1;
            const badgeCls = getBadgeClass(item.role_type, item.badge_style);

            html += `
                <tr>
                    <td><span class="badge-tag">${escapeHtml(item.category_group || "通用")}</span></td>
                    <td><strong>${escapeHtml(item.chinese_name)}</strong></td>
                    <td>${escapeHtml(item.english_name || "-")}</td>
                    <td>${escapeHtml(item.japanese_name || "-")} / <em>${escapeHtml(item.romaji || "-")}</em></td>
                    <td><span class="location-type ${badgeCls}">${escapeHtml(item.role_type || "角色")}</span></td>
                    <td><span class="badge-position">第 ${index + 1} 位</span></td>
                    <td>
                        <button class="btn-sm btn-reorder" onclick="moveRoleOrder(${index}, 'up')" ${isFirst ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⬆️ 上移</button>
                        <button class="btn-sm btn-reorder" onclick="moveRoleOrder(${index}, 'down')" ${isLast ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>⬇️ 下移</button>
                    </td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="openRoleEditModal(${item.id})">编辑</button>
                        <button class="btn-sm btn-danger" onclick="deleteRole(${item.id})">删除</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">加载失败: ${escapeHtml(err.message)}</td></tr>`;
    }
}

async function moveRoleOrder(currentIndex, direction) {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cachedRolesList.length) return;

    const temp = cachedRolesList[currentIndex];
    cachedRolesList[currentIndex] = cachedRolesList[targetIndex];
    cachedRolesList[targetIndex] = temp;

    const updatePromises = cachedRolesList.map((item, idx) => {
        const newSortOrder = (idx + 1) * 10;
        return supabaseClient
            .from("ropevocab_roles")
            .update({ sort_order: newSortOrder })
            .eq("id", item.id);
    });

    try {
        await Promise.all(updatePromises);
        clearFrontendCache("ropevocab_all_roles");
        loadRolesData();
    } catch (err) {
        alert("位置调整失败: " + err.message);
    }
}

async function openRoleEditModal(roleId = null) {
    editingEntityId = roleId;
    const modal = document.getElementById("modal-role-form");
    const titleEl = document.getElementById("modal-role-title");

    modal.style.display = "flex";
    document.getElementById("form-role").reset();

    if (roleId) {
        titleEl.textContent = `编辑角色节点 [#${roleId}]`;
        try {
            const { data, error } = await supabaseClient
                .from("ropevocab_roles")
                .select("*")
                .eq("id", roleId)
                .maybeSingle();

            if (error || !data) throw error || new Error("数据不存在");

            document.getElementById("role-field-group").value = data.category_group || "实践者与角色";
            document.getElementById("role-field-cn").value = data.chinese_name || "";
            document.getElementById("role-field-en").value = data.english_name || "";
            document.getElementById("role-field-jp").value = data.japanese_name || "";
            document.getElementById("role-field-romaji").value = data.romaji || "";
            document.getElementById("role-field-type").value = data.role_type || "实践者";
            document.getElementById("role-field-style").value = data.badge_style || getBadgeClass(data.role_type);
            document.getElementById("role-field-sort").value = data.sort_order || 10;
            document.getElementById("role-field-notes").value = data.notes || "";

            syncBadgePreviewManual(data.role_type || "实践者", data.badge_style, "role-type-badge-preview");
        } catch (err) {
            alert("读取角色详情失败: " + err.message);
            closeAdminModal("modal-role-form");
        }
    } else {
        titleEl.textContent = "新增角色节点";
        if (currentRoleGroupFilter !== "all") {
            document.getElementById("role-field-group").value = currentRoleGroupFilter;
        }
        document.getElementById("role-field-sort").value = (cachedRolesList.length + 1) * 10;
        document.getElementById("role-field-style").value = "type-primary";
        syncBadgePreviewManual("实践者", "type-primary", "role-type-badge-preview");
    }
}

async function saveRoleForm(e) {
    e.preventDefault();
    const payload = {
        category_group: document.getElementById("role-field-group").value.trim(),
        chinese_name: document.getElementById("role-field-cn").value.trim(),
        english_name: document.getElementById("role-field-en").value.trim(),
        japanese_name: document.getElementById("role-field-jp").value.trim(),
        romaji: document.getElementById("role-field-romaji").value.trim(),
        role_type: document.getElementById("role-field-type").value.trim(),
        badge_style: document.getElementById("role-field-style").value,
        sort_order: parseInt(document.getElementById("role-field-sort").value) || 10,
        notes: document.getElementById("role-field-notes").value.trim()
    };

    try {
        let query;
        if (editingEntityId) {
            query = supabaseClient.from("ropevocab_roles").update(payload).eq("id", editingEntityId);
        } else {
            query = supabaseClient.from("ropevocab_roles").insert([payload]);
        }

        const { error } = await query;
        if (error) throw error;

        clearFrontendCache("ropevocab_all_roles");
        alert("角色数据保存成功！");
        closeAdminModal("modal-role-form");
        loadRolesData();
    } catch (err) {
        alert("保存失败: " + err.message);
    }
}

async function deleteRole(roleId) {
    if (!confirm(`确定要永久删除角色 [#${roleId}] 吗？`)) return;

    try {
        const { error } = await supabaseClient.from("ropevocab_roles").delete().eq("id", roleId);
        if (error) throw error;

        clearFrontendCache("ropevocab_all_roles");
        alert("角色已删除！");
        loadRolesData();
    } catch (err) {
        alert("删除失败: " + err.message);
    }
}

/* ==============================================================================
   7. 图片上传与表单工具
   ============================================================================== */
async function uploadImageToStorage(fileInput, targetUrlInputId) {
    const file = fileInput.files[0];
    if (!file) return;

    const urlInput = document.getElementById(targetUrlInputId);
    const labelEl = fileInput.parentElement;

    try {
        if (labelEl) labelEl.textContent = "上传中...";

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error } = await supabaseClient.storage
            .from("ropevocab-images")
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;

        const { data: { publicUrl } } = supabaseClient.storage
            .from("ropevocab-images")
            .getPublicUrl(filePath);

        urlInput.value = publicUrl;
        const cardBox = urlInput.closest(".builder-image-card");
        if (cardBox) {
            const imgEl = cardBox.querySelector("img");
            if (imgEl) imgEl.src = publicUrl;
        }
        alert("图片成功上传至 Supabase 存储桶！");
    } catch (err) {
        alert("上传失败（可直接输入相对路径或外部 URL）: " + err.message);
    } finally {
        if (labelEl) labelEl.textContent = "上传";
    }
}

function addDynamicInputRow(containerId, initialValue = "") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const div = document.createElement("div");
    div.className = "builder-row";
    div.innerHTML = `
        <input type="text" class="input-builder-text" value="${escapeHtml(initialValue)}" placeholder="请输入条目内容..." />
        <button type="button" class="btn-sm btn-danger" onclick="this.parentElement.remove()">删除</button>
    `;
    container.appendChild(div);
}

function collectDynamicInputs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    const inputs = container.querySelectorAll(".input-builder-text");
    const result = [];
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val) result.push(val);
    });
    return result;
}

function addImageRowBuilder(imageUrl = "", caption = "") {
    const container = document.getElementById("container-images-builder");
    if (!container) return;

    const rowId = `img-row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const div = document.createElement("div");
    div.className = "builder-image-card";
    div.innerHTML = `
        <div class="img-preview-box">
            <img src="${escapeHtml(imageUrl) || 'assets/images/placeholder.jpg'}" id="preview-${rowId}" onError="this.src='assets/images/placeholder.jpg';" />
        </div>
        <div class="img-inputs-box">
            <div class="flex-gap">
                <input type="text" id="url-${rowId}" class="input-img-url" value="${escapeHtml(imageUrl)}" placeholder="图片URL或相对路径 (如 assets/images/vocs/Agura_1.jpg)" onchange="document.getElementById('preview-${rowId}').src=this.value;" />
                <label class="btn-sm btn-upload">
                    上传
                    <input type="file" accept="image/*" style="display:none;" onchange="uploadImageToStorage(this, 'url-${rowId}')" />
                </label>
            </div>
            <input type="text" class="input-img-caption" value="${escapeHtml(caption)}" placeholder="图片配图说明/字幕..." />
        </div>
        <button type="button" class="btn-sm btn-danger" onclick="this.parentElement.remove()">删除</button>
    `;
    container.appendChild(div);
}

function collectImageRows() {
    const container = document.getElementById("container-images-builder");
    if (!container) return { images: [], image_captions: [] };

    const urlInputs = container.querySelectorAll(".input-img-url");
    const captionInputs = container.querySelectorAll(".input-img-caption");

    const images = [];
    const image_captions = [];

    urlInputs.forEach((input, idx) => {
        const url = input.value.trim();
        if (url) {
            images.push(url);
            image_captions.push(captionInputs[idx] ? captionInputs[idx].value.trim() : "");
        }
    });

    return { images, image_captions };
}

async function populateCategorySelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
        const { data } = await supabaseClient
            .from("ropevocab_categories")
            .select("id, title")
            .order("sort_order", { ascending: true });

        if (data) {
            select.innerHTML = data.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.title)} (${escapeHtml(c.id)})</option>`).join("");
        }
    } catch (e) {
        console.warn("[Select Warning] 下拉框填充失败:", e);
    }
}

function closeAdminModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

function clearFrontendCache(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {}
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
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
