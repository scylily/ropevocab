document.addEventListener("DOMContentLoaded", function () {
  const footerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-section">
          <p class="copyright">© 2026 常用绳缚词汇库 | 本网站内容遵循 CC BY-NC-SA 4.0 协议</p>
          <p style="margin-top: 8px; font-size: 0.8rem; color: #95a5a6">| Designed by 绳声蛮&绳声点点 |</p>
          <p style="margin-top: 8px; font-size: 0.8rem; color: #95a5a6">All Rights Reserved.</p>
          <p style="margin-top: 8px; font-size: 0.8rem; color: #95a5a6">Version v1.0.0</p>
        </div>
      </div>
    </footer>
    `;
  document.body.insertAdjacentHTML("beforeend", footerHTML);
});

/* ==========================================
   全站文字与图片防复制安全保护插件 (升级版 - 支持手机端防长按保存)
   ========================================== */
(function() {
    // 1. 动态注入 CSS
    const style = document.createElement('style');
    style.innerHTML = `
        /* 禁用整页文字选中 */
        body {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
        input, textarea, [contenteditable="true"] {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }

        /* 手机端禁用图片长按菜单、保存、拖拽 */
        img {
            -webkit-touch-callout: none !important; /* 核心：禁用 iOS Safari/微信等长按呼出保存/拷贝菜单 */
            -webkit-user-drag: none !important;     /* 禁用图片拖拽 */
            -webkit-user-select: none !important;   /* 禁用图片选中 */
            user-select: none !important;

            /* ==========================================
               【终极防长按选项】
               如果您的图片不需要“点击放大/点击保存”，强烈建议取消下面这一行的注释！
               它会让浏览器无视对图片的触摸，长按时浏览器会误以为你在长按空白背景，从而 100% 无法保存。
               ========================================== */
             pointer-events: none !important;
        }
    `;
    document.head.appendChild(style);

    // 2. 禁用右键菜单 (对 PC 端和部分 Android 浏览器的长按有效)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 3. 手机端针对 img 标签进行双重防长按和防拖拽处理
    // 动态给页面上所有图片（包括后续动态加载的图片）添加 draggable="false"
    const applyImgProtection = () => {
        document.querySelectorAll('img').forEach(img => {
            if (img.getAttribute('draggable') !== 'false') {
                img.setAttribute('draggable', 'false'); // 禁用图片拖拽保存
            }
        });
    };
    applyImgProtection();

    // 监听网页变化，确保新加载的图片也能被处理
    const observer = new MutationObserver(applyImgProtection);
    observer.observe(document.body, { childList: true, subtree: true });

    // 4. 禁用常见快捷键（F12, Ctrl+U, Ctrl+C, Ctrl+S, Ctrl+P, Shift+Ctrl+I）
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey || e.metaKey) {
            const key = e.key.toLowerCase();
            if (key === 'u' || key === 'c' || key === 's' || key === 'p') {
                e.preventDefault();
                return false;
            }
        }
        if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            return false;
        }
    });

    // 5. “软性防线”：复制自动带后缀
    document.addEventListener('copy', function(e) {
        const selection = window.getSelection();
        if (selection.toString().length > 10) {
            const copyrightText = selection + '\n\n【版权声明】本文为《常用绳缚词汇库》原创内容，未经许可禁止转载。\n原文链接：' + window.location.href;
            e.clipboardData.setData('text/plain', copyrightText);
            e.preventDefault();
        }
    });
})();
