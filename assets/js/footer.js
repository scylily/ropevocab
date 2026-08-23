/**
 * ROPEVOCAB PROJECT - UNIFIED FOOTER COMPONENT
 * File: assets/js/footer.js
 * 功能：全站统一页脚组件（一站式自动注入 原版 1:1 CSS 样式与 HTML 结构）
 * 架构：彻底剥离其他 CSS 文件中的 Footer 代码，实现全站单源控制
 *
 * @version 7.0.0
 * @author Senior Architect (Defense Grade)
 */

(function () {
  'use strict';

  /**
   * 1. 自动注入 index.html 原版 1:1 页脚 CSS 样式
   */
  function injectFooterStyles() {
    if (document.getElementById('v4r-unified-footer-styles')) return;

    const style = document.createElement('style');
    style.id = 'v4r-unified-footer-styles';
    style.textContent = `
      .site-footer {
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

      .site-footer .footer-container {
        max-width: 1200px !important;
        margin: 0 auto !important;
        padding: 0 20px !important;
        box-sizing: border-box !important;
      }

      .site-footer .footer-top {
        display: flex !important;
        flex-direction: column !important;
        gap: 25px !important;
        justify-content: space-between !important;
        padding-bottom: 25px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
      }

      @media (min-width: 768px) {
        .site-footer .footer-top {
          flex-direction: row !important;
          align-items: flex-start !important;
        }
        .site-footer .footer-top > .footer-contact {
          text-align: right !important;
          flex-shrink: 0 !important;
        }
      }

      .site-footer .footer-brand-title {
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        margin-bottom: 10px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .site-footer .footer-brand-title i {
        color: #ffffff !important;
      }

      .site-footer .footer-desc {
        color: #e2e8f0 !important;
        font-size: 0.82rem !important;
        max-width: 580px !important;
        margin-bottom: 6px !important;
        text-align: left !important;
        line-height: 1.6 !important;
      }

      .site-footer .author-title {
        color: #e2e8f0 !important;
        font-weight: 600 !important;
        font-size: 0.92rem !important;
        margin-bottom: 6px !important;
      }

      .site-footer .footer-social-links {
        font-size: 0.82rem !important;
        color: #e2e8f0 !important;
      }

      .site-footer .footer-social-links a {
        color: #90caf9 !important;
        text-decoration: none !important;
        font-weight: 600 !important;
        margin-left: 6px !important;
        transition: color 0.2s !important;
      }

      .site-footer .footer-social-links a:hover {
        color: #ffffff !important;
      }

      .site-footer .footer-bottom {
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
        .site-footer .footer-bottom {
          flex-direction: row !important;
        }
      }

      .site-footer .motto-tag {
        font-weight: 600 !important;
        color: #ffffff !important;
        letter-spacing: 1px !important;
      }

      @media (max-width: 768px) {
        .site-footer .footer-container {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        .site-footer .footer-desc,
        .site-footer .author-title,
        .site-footer .footer-social-links {
          text-align: left !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 2. 构建标准统一的 Footer HTML 结构
   */
  function buildFooterHtml() {
    return `
      <footer class="site-footer">
        <div class="footer-container">
          <div class="footer-top">
            <div class="footer-brand">
              <div class="footer-brand-title">
                常用绳缚词汇库
              </div>
              <p class="footer-desc">本指南致力于为同好提供严谨、理智的安全指引，倡导 SSC（安全、理智、知情同意）与 RACK（风险认知下的知情同意）原则。</p>
              <p class="footer-desc">请时刻谨记：生命安全高于一切，风险只能降低，无法彻底消除。</p>
            </div>
            <div class="footer-contact">
              <div class="author-title">作者：绳声蛮 绳声点点</div>
              <div class="footer-social-links">
                联系 X (Twitter):
                <a href="https://x.com/Ropeart_Emon" target="_blank" rel="noopener">@Ropeart_Emon</a>
                <a href="https://x.com/Rdooprea" target="_blank" rel="noopener">@Rdooprea</a>
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
   * 3. 挂载执行器
   */
  function renderFooter() {
    injectFooterStyles();

    // 优先替换已有节点，避免重复挂载
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
