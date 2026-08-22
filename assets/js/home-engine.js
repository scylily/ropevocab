/**
 * ==============================================================================
 * ROPEVOCAB PROJECT - HOMEPAGE SEARCH & STATS ENGINE
 * File: v2/assets/js/home-engine.js
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    initHomePageEngine();
});

function initHomePageEngine() {
    const searchInput = document.getElementById("home-search-input");
    const resultsSection = document.getElementById("search-results-section");
    const resultsGrid = document.getElementById("search-results-grid");
    const categoriesSection = document.getElementById("categories");

    let allTermsData = [];

    const cacheKeyAllTerms = "ropevocab_all_terms_cache";
    swrFetch(cacheKeyAllTerms, async () => {
        const { data, error } = await supabaseClient
            .from("ropevocab_terms")
            .select("id, title, name_en, name_jp, romaji, subtitle_badge, emoji, description")
            .order("sort_order", { ascending: true });
        if (error) throw error;
        return data;
    }, (terms, isCache) => {
        if (terms) {
            allTermsData = terms;
            updateHomeStats(terms.length);
        }
    });

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();

            if (query === "") {
                if (resultsSection) resultsSection.style.display = "none";
                if (categoriesSection) categoriesSection.style.display = "block";
                return;
            }

            const matchedTerms = allTermsData.filter(term => {
                return (
                    (term.title && term.title.toLowerCase().includes(query)) ||
                    (term.name_en && term.name_en.toLowerCase().includes(query)) ||
                    (term.name_jp && term.name_jp.toLowerCase().includes(query)) ||
                    (term.romaji && term.romaji.toLowerCase().includes(query)) ||
                    (term.subtitle_badge && term.subtitle_badge.toLowerCase().includes(query)) ||
                    (term.description && term.description.toLowerCase().includes(query))
                );
            });

            if (resultsSection) resultsSection.style.display = "block";
            if (categoriesSection) categoriesSection.style.display = "none";
            renderSearchResults(resultsGrid, matchedTerms, query);
        });
    }
}

function updateHomeStats(totalTerms) {
    const statTermsEl = document.getElementById("stat-total-terms");
    if (statTermsEl) {
        statTermsEl.textContent = `${totalTerms}+`;
    }
}

function renderSearchResults(container, terms, query) {
    if (!container) return;

    if (terms.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 10px; color: #888;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; color: #ccc;"></i>
                <p>未找到与 "${escapeHtml(query)}" 相关的词条</p>
            </div>
        `;
        return;
    }

    let html = "";
    terms.forEach(term => {
        html += `
            <div class="term-card">
                <h3>${escapeHtml(term.emoji || "🏷️")} ${escapeHtml(term.title || "")} <span style="font-size: 0.85rem; color: #888; font-weight: normal;">(${escapeHtml(term.name_en || "")})</span></h3>
                <p><strong>日文/罗马音：</strong>${escapeHtml(term.name_jp || "-")} / ${escapeHtml(term.romaji || "-")}</p>
                <p style="color: #666; font-size: 0.85rem; margin-bottom: 15px;">${escapeHtml(term.subtitle_badge || "")}</p>
                <a href="pages/term.html?id=${encodeURIComponent(term.id)}" class="tag" style="text-decoration: none; display: inline-block; padding: 5px 12px;">查看详情 <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
    });
    container.innerHTML = html;
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
