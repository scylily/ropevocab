/**
 * ROPEVOCAB PROJECT - UNIFIED FOOTER COMPONENT
 * File: assets/js/footer.js
 * 功能：全站统一页脚组件（包含自动智能计算关于我们等页面的跳转路径）
 *
 * @version 7.0.2
 * @author Senior Architect (Defense Grade)
 */

(function () {
  'use strict';

  /**
   * 1. 智能计算 pages/ 目录下页面的跳转相对路径
   * 无论在 index.html、pages/*.html 还是 admin/*.html 均能精准定位
   */
  function getPagesUrl(pageName) {
    const path = window.location.pathname.toLowerCase();

    if (path.includes('/pages/')) {
      // 当前就在 pages/ 文件夹内部（如 locations.html）
      return pageName;
    } else if (path.includes('/admin/') || path.includes('/ibti/')) {
      // 在 admin/ 或 IBTI/ 子目录下
      return '../pages/' + pageName;
    } else {
      // 在外层根目录（如 index.html）
      return 'pages/' + pageName;
    }
  }

  /**
   * 2. 自动注入页脚 CSS 样式（html body 提权）
   */
  function injectFooterStyles() {
    if (document.getElementById('v4r-unified-footer-styles')) return;

    const style = document.createElement('style');
    style.id = 'v4r-unified-footer-styles';
    style.textContent = `
      html body .site-footer {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: rgba(255, 255, 255, 0.9) !important;
        padding: 40px 0 25px !important;
        margin-top: 60px !important;
        font-size: 0.88rem !important;
        line-height: 1.6 !important;
        border-top: 1px solid rgba(255, 255, 255, 0.25) !important;
        width: 100% !important;
        box-sizing: border-box !important;
        clear: both !important;
      }

      html body .site-footer .footer-container {
        max-width: 1200px !important;
        margin: 0 auto !important;
        padding: 0 20px !important;
        box-sizing: border-box !important;
      }

      html body .site-footer .footer-top {
        display: flex !important;
        flex-direction: column !important;
        gap: 25px !important;
        justify-content: space-between !important;
        padding-bottom: 25px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
      }

      @media (min-width: 768px) {
        html body .site-footer .footer-top {
          flex-direction: row !important;
          align-items: flex-start !important;
        }
        html body .site-footer .footer-top > .footer-contact {
          text-align: right !important;
          flex-shrink: 0 !important;
        }
      }

      html body .site-footer .footer-brand-title {
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        margin-bottom: 10px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      html body .site-footer .footer-brand-title i {
        color: #ffffff !important;
      }

      html body .site-footer .footer-desc {
        color: #e2e8f0 !important;
        font-size: 0.82rem !important;
        max-width: 580px !important;
        margin-bottom: 6px !important;
        text-align: left !important;
        line-height: 1.6 !important;
      }

      html body .site-footer .author-title {
        color: #e2e8f0 !important;
        font-weight: 600 !important;
        font-size: 0.92rem !important;
        margin-bottom: 6px !important;
      }

      html body .site-footer .footer-social-links {
        font-size: 0.82rem !important;
        color: #e2e8f0 !important;
      }

      html body .site-footer .footer-social-links a {
        color: #90caf9 !important;
        text-decoration: none !important;
        font-weight: 600 !important;
        transition: color 0.2s !important;
      }

      html body .site-footer .footer-social-links a:hover {
        color: #ffffff !important;
        text-decoration: none !important;
      }

      html body .site-footer .footer-bottom {
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding-top: 20px !important;
        font-size: 0.8rem !important;
        color: #e2e8f0 !important;
      }

      @media (min-width: 640px) {
        html body .site-footer .footer-bottom {
          flex-direction: row !important;
        }
      }

      html body .site-footer .motto-tag {
        font-weight: 600 !important;
        color: #ffffff !important;
        letter-spacing: 1px !important;
      }

      @media (max-width: 768px) {
        html body .site-footer .footer-container {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        html body .site-footer .footer-desc,
        html body .site-footer .author-title,
        html body .site-footer .footer-social-links {
          text-align: left !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 3. 构建标准统一的 Footer HTML 结构（使用 getPagesUrl 动态嵌入关于我们链接）
   */
  function buildFooterHtml() {
    // 动态算出来的“关于我们”跳转链接
    const aboutUrl = getPagesUrl('about.html');

    return `
      <footer class="site-footer">
        <div class="footer-container">
          <div class="footer-top">
            <div class="footer-brand">
              <div class="footer-brand-title">
                常用绳缚词汇库
              </div>
              <p class="footer-desc">致力于整理与分享专业实用的绳缚知识，探索绳缚艺术与文化。</p>
              <p class="footer-desc">支持中、英、日多语对照，助力理性沟通与安全实践。</p>
            </div>
            <div class="footer-contact">
              <div class="author-title">作者：绳声蛮 绳声点点</div>
              <div class="footer-social-links">
                <!-- 动态安全的关于我们跳转链接 -->
                <a href="${aboutUrl}" style="margin-right: 0px;">📧 联系我们</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <div class="copyright">© 2026 v4rope · 本网站内容遵循 CC BY-NC-SA 4.0 协议</div>
            <div class="motto-tag">安全第一 · 理性探索 · 互相尊重</div>
          </div>
        </div>
      </footer>
    `;
  }

  /**
   * 4. 挂载执行器
   */
  function renderFooter() {
    injectFooterStyles();

    const existingFooter = document.querySelector('footer, .site-footer');
    if (existingFooter) {
      existingFooter.outerHTML = buildFooterHtml();
    } else {
      document.body.insertAdjacentHTML('beforeend', buildFooterHtml());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter);
  } else {
    renderFooter();
  }
})();
