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
   全站文字防复制与安全保护插件 (追加到 footer.js)
   ========================================== */
(function() {
    // 1. 动态注入 CSS，阻止用户通过鼠标选中文字
    // 排除 input 和 textarea，保证正常的输入框可以正常使用
    const style = document.createElement('style');
    style.innerHTML = `
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
    `;
    document.head.appendChild(style);

    // 2. 禁用右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 3. 禁用常见快捷键（F12, Ctrl+U, Ctrl+C, Ctrl+S, Ctrl+P, Shift+Ctrl+I）
    document.addEventListener('keydown', function(e) {
        // 禁用 F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // 禁用 Ctrl 组合键 (Mac 上为 Cmd/Meta 键)
        if (e.ctrlKey || e.metaKey) {
            const key = e.key.toLowerCase();
            if (key === 'u' || key === 'c' || key === 's' || key === 'p') {
                e.preventDefault();
                return false;
            }
        }
        // 禁用 Shift+Ctrl+I / Shift+Cmd+I (打开开发者工具)
        if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            return false;
        }
    });

    // 4. “软性防线”：即使被强行复制（比如通过其他途径），在剪贴板后加上版权声明
    document.addEventListener('copy', function(e) {
        const selection = window.getSelection();
        if (selection.toString().length > 10) { // 复制超过 10 个字才触发
            const copyrightText = selection + '\n\n【版权声明】本文为《常用绳缚词汇库》原创内容，未经许可禁止转载。\n原文链接：' + window.location.href;
            e.clipboardData.setData('text/plain', copyrightText);
            e.preventDefault();
        }
    });
})();
