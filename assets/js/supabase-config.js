const SUPABASE_URL = "https://supabase.v4rope.com";
const SUPABASE_ANON_KEY = "sb_publishable_26_l2bawRKyTELKRlUO4XA_jhhMgAY7";

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

async function swrFetch(cacheKey, fetcher, onDataReady) {
    let cacheHit = false;

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

    if (!IS_CONFIGURED) {
        if (!cacheHit) {
            onDataReady(null, false, "SUPABASE_UNCONFIGURED");
        }
        return;
    }

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
            .maybeSingle();

        if (error) throw error;
        return data;
    };

    swrFetch(cacheKey, fetcher, callback);
}
