/**
 * ==============================================================================
 * ROPEVOCAB PROJECT - SUPABASE CLIENT & SWR CACHE ENGINE (COMPLETE FIXED)
 * File: v2/assets/js/supabase-config.js
 * ==============================================================================
 */

// 1. Supabase 项目凭证
const SUPABASE_URL = "https://gfhgwqjvxyyanumbwibe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_26_l2bawRKyTELKRlUO4XA_jhhMgAY7";

// 防御性校验
const IS_CONFIGURED = SUPABASE_URL &&
                     !SUPABASE_URL.includes("your-supabase-project-id") &&
                     SUPABASE_ANON_KEY &&
                     !SUPABASE_ANON_KEY.includes("your-supabase-anon-key");

if (!IS_CONFIGURED) {
    console.warn("[Config Warning] Supabase 凭证尚未配置！将仅依赖本地 LocalStorage 缓存运作。");
}

let supabaseClient = null;
try {
    if (typeof supabase !== "undefined" && IS_CONFIGURED) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error("[Init Error] Supabase Client 初始化失败:", e);
}

/**
 * 防死锁 SWR 数据加载引擎 (带 3.5秒 超时熔断)
 */
async function swrFetch(cacheKey, fetcher, onDataReady) {
    let cacheHit = false;

    // A. 尝试读取本地缓存 (0ms 极速响应)
    try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
            const cachedData = JSON.parse(cachedRaw);
            if (cachedData) {
                cacheHit = true;
                onDataReady(cachedData, true, null);
            }
        }
    } catch (e) {
        console.warn(`[SWR Cache Warning] 读取缓存失败 [${cacheKey}]:`, e);
    }

    // B. 若未配置凭证且无缓存，直接抛出未配置警告
    if (!IS_CONFIGURED) {
        if (!cacheHit) {
            onDataReady(null, false, "SUPABASE_UNCONFIGURED");
        }
        return;
    }

    // C. 线上 Fetcher (带 3.5秒 超时熔断)
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("NETWORK_TIMEOUT")), 3500)
    );

    try {
        const freshData = await Promise.race([fetcher(), timeoutPromise]);
        if (freshData !== undefined) {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(freshData));
            } catch (quotaErr) {}
            onDataReady(freshData, false, null);
        }
    } catch (netError) {
        console.error(`[SWR Error] 线上拉取失败 [${cacheKey}]:`, netError);
        if (!cacheHit) {
            onDataReady(null, false, netError.message || "FETCH_FAILED");
        }
    }
}

/**
 * 补全：词条详情专用查询函数 (使用 .maybeSingle() 防崩)
 */
function getTermDetail(termId, callback) {
    if (!termId) {
        callback(null, false, "MISSING_ID");
        return;
    }

    const cacheKey = `ropevocab_term_${termId}`;
    const fetcher = async () => {
        if (!supabaseClient) throw new Error("SUPABASE_UNCONFIGURED");

        const { data, error } = await supabaseClient
            .from("ropevocab_terms")
            .select("*")
            .eq("id", termId)
            .maybeSingle(); // 优化：无记录时返回 null 而不抛出 PGRST116 异常

        if (error) throw error;
        return data;
    };

    swrFetch(cacheKey, fetcher, callback);
}
