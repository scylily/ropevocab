(function () {
  'use strict';

  function safeOpenContactModal(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    if (typeof window.openContactModal === 'function') {
      window.openContactModal();
    } else {
      console.warn('[IBTI Footer] openContactModal function is not ready yet.');
      alert('联系方式模块正在加载中，请稍候片刻...');
    }
  }

  window.ibtiSafeOpenContact = safeOpenContactModal;

  function injectIbtiFooterStyles() {
    const styleId = 'ibti-unified-footer-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `

      html body .ibti-site-footer {
        width: 100% !important;
        background: #ffffff !important;
        border-top: 2px solid #1a1a1a !important; /* 呼应 Header 2px 实线边框 */
        padding: 24px 0 18px !important;
        margin-top: 30px !important;
        color: #333333 !important;
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif !important;
        font-size: 0.85rem !important;
        line-height: 1.5 !important;
        box-sizing: border-box !important;
        clear: both !important;
      }

      html body .ibti-site-footer .ibti-footer-container {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 0 16px !important;
        text-align: center !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 14px !important;
        box-sizing: border-box !important;
      }

      html body .ibti-site-footer .ibti-footer-title {
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        color: #1a1a1a !important;
        letter-spacing: 5px !important;
        text-transform: uppercase !important;
        margin: 0 !important;
      }

      html body .ibti-site-footer .ibti-footer-subtitle {
        color: #888888 !important;
        font-size: 0.75rem !important;
        letter-spacing: 1.5px !important;
        margin-top: -10px !important;
      }

      html body .ibti-site-footer .ibti-footer-btn-wrap {
        width: 100% !important;
        max-width: 200px !important;
        margin: 0 auto !important;
      }

      html body .ibti-site-footer .ibti-footer-btn {
        width: 100% !important;
        padding: 6px 14px !important;
        background: #fdfbf7 !important;
        border: 1px solid #c5a059 !important;
        color: #c5a059 !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-size: 0.82rem !important;
        font-weight: 500 !important;
        transition: all 0.25s ease !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        white-space: nowrap !important;
        box-shadow: 0 1px 4px rgba(197, 160, 89, 0.08) !important;
      }

      html body .ibti-site-footer .ibti-footer-btn:hover {
        background: #f7f1e5 !important;
        border-color: #b38f46 !important;
      }

      html body .ibti-site-footer .ibti-disclaimer-inline {
        max-width: 680px !important;
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        text-align: left !important;
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }

      html body .ibti-site-footer .ibti-notice-line {
        font-size: 0.78rem !important;
        line-height: 1.6 !important;
        color: #666666 !important;
        word-break: break-word !important;
      }

      html body .ibti-site-footer .ibti-prefix-wrap {
        white-space: nowrap !important;
        display: inline !important;
      }

      html body .ibti-site-footer .ibti-symbol {
        color: #c5a059 !important;
        font-size: 0.65rem !important;
        margin-right: 4px !important;
        vertical-align: middle !important;
        display: inline-block !important;
      }

      html body .ibti-site-footer .ibti-prefix {
        color: #c5a059 !important;
        font-weight: 600 !important;
        display: inline !important;
      }

      html body .ibti-site-footer .ibti-copyright-group {
        border-top: 1px dashed #eeeeee !important;
        padding-top: 10px !important;
        width: 100% !important;
        max-width: 680px !important;
        font-size: 0.76rem !important;
        color: #888888 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 4px !important;
        align-items: center !important;
        justify-content: center !important;
      }

      @media (min-width: 600px) {
        html body .ibti-site-footer .ibti-copyright-group {
          flex-direction: row !important;
          gap: 15px !important;
        }
      }

      html body .ibti-site-footer .ibti-creator {
        color: #c5a059 !important;
        font-weight: 500 !important;
      }

      @media (max-width: 600px) {
        html body .ibti-site-footer {
          padding: 18px 0 12px !important;
          margin-top: 20px !important;
        }
        html body .ibti-site-footer .ibti-footer-container {
          gap: 10px !important;
          padding: 0 12px !important;
        }
        html body .ibti-site-footer .ibti-footer-title {
          font-size: 0.98rem !important;
          letter-spacing: 3px !important;
        }
        html body .ibti-site-footer .ibti-notice-line {
          font-size: 0.74rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildIbtiFooterHtml() {
    return `
      <footer class="ibti-site-footer">
        <div class="ibti-footer-container">
          <!-- 页脚黑金大标题 -->
          <h2 class="ibti-footer-title">IBTI</h2>
          <div class="ibti-footer-subtitle">潜向行为性格指标测试</div>

          <!-- 精致小按钮区 -->
          <div class="ibti-footer-btn-wrap">
            <button class="ibti-footer-btn" onclick="window.ibtiSafeOpenContact(event)">
              ✉️ 欢迎与我们交流
            </button>
          </div>

          <!-- 极简符号前缀内联排版 -->
          <div class="ibti-disclaimer-inline">
            <div class="ibti-notice-line">
              <span class="ibti-prefix-wrap"><span class="ibti-symbol">◆</span><strong class="ibti-prefix">郑重提示：</strong></span>测试结果仅代表当前心理倾向，仅供自我探索参考，不作为专业心理诊断建议。所有的实践均需建立在知情同意（SSC / RACK）与安全的前提下。
            </div>
            <div class="ibti-notice-line">
              <span class="ibti-prefix-wrap"><span class="ibti-symbol">◆</span><strong class="ibti-prefix">隐私保护：</strong></span>我们尊重并保护您的隐私，答题数据仅用于本地结果生成。
            </div>
          </div>

          <!-- 底部版权信息 -->
          <div class="ibti-copyright-group">
            <span>© 2026 IBTI Project. All Rights Reserved.</span>
            <span class="ibti-creator">Designed by 绳声蛮 & 绳声点点</span>
          </div>
        </div>
      </footer>
    `;
  }

  function renderIbtiFooter() {
    try {
      if (!document.body) return;

      injectIbtiFooterStyles();

      const existingFooter = document.querySelector('footer, .site-footer, .ibti-site-footer');
      if (existingFooter) {
        existingFooter.outerHTML = buildIbtiFooterHtml();
      } else {
        const mainContainer = document.getElementById('main-container') || document.body;
        mainContainer.insertAdjacentHTML('beforeend', buildIbtiFooterHtml());
      }
    } catch (err) {
      console.error('[IBTI Footer] Render failed:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderIbtiFooter);
  } else {
    renderIbtiFooter();
  }
})();
