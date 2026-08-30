/**
 * @version 7.0.2
 * @author Senior Architect (Defense Grade)
 */

(function () {
  'use strict';

  /**
   * @param {string} pageName
   * @returns {string}
   */
  function getPagesUrl(pageName) {
    if (typeof pageName !== 'string' || !pageName.trim()) {
      pageName = 'about.html';
    }

    const cleanPage = pageName.trim().replace(/[^\w\.\-]/g, '');

    try {
      const path = window.location.pathname.toLowerCase();

      if (path.includes('/pages/')) {
        return cleanPage;
      } else if (path.includes('/admin/') || path.includes('/ibti/')) {
        return '../pages/' + cleanPage;
      } else {
        return 'pages/' + cleanPage;
      }
    } catch (e) {
      console.warn('[Footer] Location URL resolve fallback triggered:', e);
      return 'pages/' + cleanPage;
    }
  }

  function injectFooterStyles() {
    const styleId = 'v4r-unified-footer-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html body .site-footer {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: rgba(255, 255, 255, 0.9) !important;
        padding: 18px 0 12px !important;
        margin-top: 25px !important;
        font-size: 0.85rem !important;
        line-height: 1.45 !important;
        border-top: 1px solid rgba(255, 255, 255, 0.25) !important;
        width: 100% !important;
        box-sizing: border-box !important;
        clear: both !important;
        word-break: break-word !important;
      }

      html body .site-footer .footer-container {
        max-width: 1200px !important;
        margin: 0 auto !important;
        padding: 0 16px !important;
        box-sizing: border-box !important;
      }

      html body .site-footer .footer-top {
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        justify-content: space-between !important;
        padding-bottom: 12px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.18) !important;
      }

      @media (min-width: 768px) {
        html body .site-footer .footer-top {
          flex-direction: row !important;
          align-items: flex-start !important;
          gap: 20px !important;
        }
        html body .site-footer .footer-top > .footer-contact {
          text-align: right !important;
          flex-shrink: 0 !important;
        }
      }

      html body .site-footer .footer-brand-title {
        font-size: 1.05rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        margin-bottom: 4px !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      html body .site-footer .footer-brand-title i {
        color: #ffffff !important;
      }

      html body .site-footer .footer-desc {
        color: #e2e8f0 !important;
        font-size: 0.8rem !important;
        max-width: 580px !important;
        margin-bottom: 3px !important;
        text-align: left !important;
        line-height: 1.45 !important;
      }

      html body .site-footer .author-title {
        color: #e2e8f0 !important;
        font-weight: 600 !important;
        font-size: 0.88rem !important;
        margin-bottom: 3px !important;
      }

      html body .site-footer .footer-social-links {
        font-size: 0.8rem !important;
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
        text-decoration: underline !important;
      }

      /* 底部版权区紧凑化 */
      html body .site-footer .footer-bottom {
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding-top: 10px !important;
        font-size: 0.78rem !important;
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
        letter-spacing: 0.5px !important;
      }

      @media (max-width: 767px) {
        html body .site-footer {
          padding: 14px 0 10px !important;
          margin-top: 20px !important;
        }
        html body .site-footer .footer-container {
          padding-left: 12px !important;
          padding-right: 12px !important;
        }
        html body .site-footer .footer-top {
          gap: 10px !important;
          padding-bottom: 10px !important;
        }
        html body .site-footer .footer-desc,
        html body .site-footer .author-title,
        html body .site-footer .footer-social-links {
          text-align: left !important;
        }
        html body .site-footer .footer-bottom {
          padding-top: 8px !important;
          gap: 4px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildFooterHtml() {
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
                <a href="${aboutUrl}">✉️ 联系我们</a>
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

  function renderFooter() {
    try {
      if (!document.body) return;

      injectFooterStyles();

      const existingFooter = document.querySelector('footer, .site-footer');
      if (existingFooter) {
        existingFooter.outerHTML = buildFooterHtml();
      } else {
        document.body.insertAdjacentHTML('beforeend', buildFooterHtml());
      }
    } catch (error) {
      console.error('[Footer] Render failed unexpectedly:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter);
  } else {
    renderFooter();
  }
})();
