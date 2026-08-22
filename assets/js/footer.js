/**
 * ==============================================================================
 * ROPEVOCAB PROJECT - GLOBAL FOOTER COMPONENT
 * File: v2/assets/js/footer.js
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    renderGlobalFooter();
});

function renderGlobalFooter() {
    // 1. 防止重复挂载
    if (document.querySelector(".site-footer")) return;

    // 2. 识别路径深度 (如果在 pages/ 或 admin/ 子目录下，相对路径补全 ../)
    const isSubFolder = window.location.pathname.includes("/pages/") ||
                        window.location.pathname.includes("/admin/") ||
                        window.location.pathname.includes("/IBTI/");
    const basePath = isSubFolder ? "../" : "";

    // 3. 构建页脚 DOM 节点
    const footerEl = document.createElement("footer");
    footerEl.className = "site-footer";

    footerEl.innerHTML = `
        <div class="footer-container">
            <!-- 1. 上层：品牌宣言与作者社交 -->
            <div class="footer-top">
                <div class="footer-brand-box">
                    <div class="footer-brand-title">
                        常用绳缚词汇库
                    </div>
                    <p class="footer-desc">
                        本指南致力于为同好提供严谨、理智的安全指引，倡导 SSC（安全、理智、知情同意）与 RACK（风险认知下的知情同意）原则。
                    </p>
                    <p class="footer-desc">
                        请时刻谨记：生命安全高于一切，风险只能降低，无法彻底消除。
                    </p>
                </div>

                <div class="footer-meta-box">
                    <p class="author-title">作者：绳声蛮 绳声点点</p>
                    <p class="footer-social-links">
                        联系 X (Twitter)：
                        <a href="https://x.com/Ropeart_Emon" target="_blank" rel="noopener noreferrer">@Ropeart_Emon</a>
                        <a href="https://x.com/Rdooprea" target="_blank" rel="noopener noreferrer">@Rdooprea</a>
                    </p>
                </div>
            </div>

            <!-- 2. 下层：版权与协议 -->
            <div class="footer-bottom">
                <p class="copyright-text">
                    © 2026 v4rope • 本网站内容遵循 CC BY-NC-SA 4.0 协议
                </p>
                <p class="motto-tag">安全第一 • 理智探索 • 互相尊重</p>
            </div>
        </div>
    `;

    // 4. 挂载至 <body> 最底部
    document.body.appendChild(footerEl);
}
