// 当页面 DOM 结构加载完毕后执行
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
  // 2. 将页脚动态插入到当前页面的 body 标签的最末尾
  document.body.insertAdjacentHTML("beforeend", footerHTML);
});
