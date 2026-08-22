/**
 * ==============================================================================
 * ROPEVOCAB PROJECT - TERM DETAIL RENDERER (NAV & BACK LOGIC FIXED)
 * File: v2/assets/js/term-renderer.js
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const termId = urlParams.get("id");

    if (!termId) {
        showError("未在 URL 中指定词条标识 ID（例如须传入 ?id=shibari）。");
        return;
    }

    if (typeof getTermDetail !== "function") {
        showError("加载组件异常：getTermDetail 函数未找到，请检查 supabase-config.js 文件。");
        return;
    }

    getTermDetail(termId, (termData, isFromCache, errType) => {
        if (!termData) {
            if (errType === "SUPABASE_UNCONFIGURED") {
                showError("Supabase 项目凭证未配置。请在 v2/assets/js/supabase-config.js 中填写 SUPABASE_URL 与 ANON_KEY。");
            } else if (errType === "NETWORK_TIMEOUT") {
                showError("连接 Supabase 数据库超时，请检查网络连接。");
            } else {
                showError(`未找到标识为 "${termId}" 的词条数据。`);
            }
            return;
        }

        const loadingEl = document.getElementById("detail-loading");
        const errorEl = document.getElementById("detail-error");
        const mainContentEl = document.getElementById("detail-main-content");

        if (loadingEl) loadingEl.style.display = "none";
        if (errorEl) errorEl.style.display = "none";
        if (mainContentEl) mainContentEl.style.display = "block";

        renderTermDOM(termData);
    });

    function renderTermDOM(data) {
        document.title = `${escapeHtml(data.title || "词条详情")} - 常用绳缚词汇库`;

        setElementText("term-title", `${data.title || ""} ${data.name_en ? `(${data.name_en})` : ""}`);
        setElementText("term-subtitle-badge", data.subtitle_badge || "日式绳缚词汇");

        // 细节 1 修复：顶部导航栏激活标签直接显示当前词条名称 "绳艺 (Shibari)"
        const navActiveTagEl = document.getElementById("nav-active-tag");
        if (navActiveTagEl) {
            const termDisplayName = `${data.title || ''}${data.name_en ? ` (${data.name_en})` : ''}`;
            navActiveTagEl.innerHTML = `<i class="fas fa-bookmark"></i> ${escapeHtml(termDisplayName)}`;
            navActiveTagEl.href = "javascript:void(0)";
        }

        // 联动查询所属分类 Hub，渲染 3 层面包屑 (首页 > 上级分类Hub > 词条标题)
        if (data.category_id) {
            const cacheKeyCat = `ropevocab_cat_meta_${data.category_id}`;
            swrFetch(cacheKeyCat, async () => {
                const { data: catData, error } = await supabaseClient
                    .from("ropevocab_categories")
                    .select("id, title")
                    .eq("id", data.category_id)
                    .maybeSingle();
                if (error) throw error;
                return catData;
            }, (catMeta) => {
                if (catMeta) {
                    const breadcrumbEl = document.getElementById("breadcrumb-container");
                    if (breadcrumbEl) {
                        breadcrumbEl.innerHTML = `
                            <a href="../index.html">首页</a> &gt;
                            <a href="category.html?id=${encodeURIComponent(catMeta.id)}">${escapeHtml(catMeta.title)}</a> &gt;
                            <span>${escapeHtml(data.title)}</span>
                        `;
                    }
                }
            });
        }

        // 细节 2 修复：智能返回上一级按钮（优先返回浏览器上一页历史）
        const backBtn = document.getElementById("btn-back-history");
        if (backBtn) {
            backBtn.onclick = () => {
                if (document.referrer && document.referrer.includes(window.location.host)) {
                    window.history.back();
                } else if (data.category_id) {
                    window.location.href = `category.html?id=${encodeURIComponent(data.category_id)}`;
                } else {
                    window.location.href = "../index.html";
                }
            };
        }

        setElementText("lang-cn", data.title || "-");
        setElementText("lang-en", data.name_en || "-");
        setElementText("lang-jp", data.name_jp || "-");
        setElementText("lang-romaji", data.romaji || "-");

        renderSectionText("sec-description", data.description);
        renderSectionList("sec-features-list", parseJsonArray(data.technical_features));
        renderSectionList("sec-applications-list", parseJsonArray(data.applications));
        renderSectionText("sec-safety-notes", data.safety_notes);

        renderGallery("image-gallery-container", parseJsonArray(data.images), parseJsonArray(data.image_captions));
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

    function setElementText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function renderSectionText(containerId, textContent) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!textContent || textContent.trim() === "") {
            container.closest(".content-section").style.display = "none";
            return;
        }
        container.closest(".content-section").style.display = "block";
        const paragraphs = textContent.split(/\n+/).map(p => `<p>${escapeHtml(p.trim())}</p>`).join("");
        container.innerHTML = paragraphs;
    }

    function renderSectionList(listId, itemsArray) {
        const listEl = document.getElementById(listId);
        if (!listEl) return;
        if (!itemsArray || itemsArray.length === 0) {
            listEl.closest(".content-section").style.display = "none";
            return;
        }
        listEl.closest(".content-section").style.display = "block";
        listEl.innerHTML = itemsArray.map(item => `<li>${escapeHtml(item)}</li>`).join("");
    }

    function renderGallery(galleryId, images, captions) {
        const galleryEl = document.getElementById(galleryId);
        if (!galleryEl) return;

        if (!images || images.length === 0) {
            galleryEl.closest(".content-section").style.display = "none";
            return;
        }

        galleryEl.closest(".content-section").style.display = "block";
        let htmlHtml = "";

        images.forEach((imgUrl, index) => {
            const captionText = (captions && captions[index]) ? captions[index] : "";
            let finalImgUrl = imgUrl;
            if (!finalImgUrl.startsWith("http") && !finalImgUrl.startsWith("../")) {
                finalImgUrl = "../" + finalImgUrl;
            }

            htmlHtml += `
                <div class="image-item">
                    <div class="image-container">
                        <img src="${escapeHtml(finalImgUrl)}" alt="${escapeHtml(captionText)}" loading="lazy" onError="this.src='../assets/images/placeholder.jpg';"/>
                    </div>
                    <div class="image-caption">${escapeHtml(captionText)}</div>
                </div>
            `;
        });

        galleryEl.innerHTML = htmlHtml;
    }

    function showError(msg) {
        const loadingEl = document.getElementById("detail-loading");
        const errorEl = document.getElementById("detail-error");
        const mainContentEl = document.getElementById("detail-main-content");
        if (loadingEl) loadingEl.style.display = "none";
        if (mainContentEl) mainContentEl.style.display = "none";
        if (errorEl) {
            errorEl.style.display = "block";
            const msgEl = errorEl.querySelector(".error-message");
            if (msgEl) msgEl.textContent = msg;
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
});
