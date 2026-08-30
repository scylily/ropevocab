document.addEventListener("DOMContentLoaded", () => {
    initHomeEngine();
});

let searchDebounceTimer = null;

async function initHomeEngine() {
    const searchInput = document.getElementById("home-search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                handleHomeSearch(e.target.value.trim());
            }, 300);
        });
    }

    loadHomeStats();
}

async function loadHomeStats() {
    const totalTermsEl = document.getElementById("stat-total-terms");
    if (!totalTermsEl || typeof supabaseClient === 'undefined') return;

    try {
        const { count, error } = await supabaseClient
            .from("ropevocab_terms")
            .select("*", { count: "exact", head: true });

        if (!error && count !== null) {
            totalTermsEl.textContent = `${count}+`;
        }
    } catch (e) {
        console.warn("加载统计数据异常:", e);
    }
}

async function handleHomeSearch(keyword) {
    const resultsSection = document.getElementById("search-results-section");
    const resultsGrid = document.getElementById("search-results-grid");
    const categoriesSection = document.getElementById("categories");

    if (!resultsSection || !resultsGrid) return;

    if (!keyword) {
        resultsSection.style.display = "none";
        resultsGrid.innerHTML = "";
        if (categoriesSection) categoriesSection.style.display = "block";
        return;
    }

    resultsSection.style.display = "block";
    if (categoriesSection) categoriesSection.style.display = "none";
    resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #667eea;">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top: 10px;">正在为您检索匹配词条...</p>
        </div>
    `;

    try {
        const cleanKey = keyword.replace(/[%_]/g, "\\$&");

        const orCondition = [
            `title.ilike.%${cleanKey}%`,
            `name_en.ilike.%${cleanKey}%`,
            `name_jp.ilike.%${cleanKey}%`,
            `hiragana.ilike.%${cleanKey}%`,
            `romaji.ilike.%${cleanKey}%`,
            `id.ilike.%${cleanKey}%`,
            `subtitle_badge.ilike.%${cleanKey}%`
        ].join(",");

        const { data, error } = await supabaseClient
            .from("ropevocab_terms")
            .select("id, title, name_en, name_jp, hiragana, romaji, emoji, subtitle_badge, category_id")
            .or(orCondition)
            .order("sort_order", { ascending: true })
            .limit(20);

        if (error) throw error;

        if (!data || data.length === 0) {
            resultsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <i class="fas fa-search-minus" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 12px;"></i>
                    <p style="color: #64748b; font-size: 1rem;">未找到与 "<strong style="color: #6366f1;">${escapeHtml(keyword)}</strong>" 相关的词条</p>
                    <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px;">您可以尝试搜索中文名、英文名、日文汉字、平假名或罗马音</p>
                </div>
            `;
            return;
        }

        let html = "";
        data.forEach(item => {
            const title = item.title || item.id;
            const emoji = item.emoji || "🪢";
            const badge = item.subtitle_badge || item.name_en || "";

            // 构建日文汉字 + 平假名 + 罗马音综合标注预览
            let langPreview = "";
            if (item.name_jp || item.hiragana || item.romaji) {
                const jpText = item.name_jp || "";
                const hiraText = item.hiragana ? `（${item.hiragana}）` : "";
                const romaText = item.romaji ? ` [${item.romaji}]` : "";
                langPreview = `${jpText}${hiraText}${romaText}`;
            }

            html += `
                <a href="pages/term.html?id=${encodeURIComponent(item.id)}" class="term-card-link" style="text-decoration: none; color: inherit;">
                    <div class="term-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s; border: 1px solid #f1f5f9;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <h3 style="font-size: 1.25rem; color: #1e293b; margin: 0; font-weight: 700;">
                                ${escapeHtml(emoji)} ${escapeHtml(title)}
                            </h3>
                            <span class="tag" style="background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                                ${escapeHtml(item.category_id || "词条")}
                            </span>
                        </div>

                        ${badge ? `<p style="color: #6366f1; font-size: 0.88rem; margin-bottom: 8px; font-weight: 500;"><i class="fas fa-bookmark" style="font-size: 0.75rem;"></i> ${escapeHtml(badge)}</p>` : ''}

                        ${langPreview ? `<p style="color: #64748b; font-size: 0.85rem; margin: 0; line-height: 1.4;"><i class="fas fa-language" style="color: #94a3b8;"></i> ${escapeHtml(langPreview)}</p>` : ''}
                    </div>
                </a>
            `;
        });

        resultsGrid.innerHTML = html;

    } catch (err) {
        console.error("搜索逻辑异常:", err);
        resultsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #ef4444;">
                搜索失败: ${escapeHtml(err.message)}
            </div>
        `;
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
