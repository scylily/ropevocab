// ============================================================
// 🔑 Supabase 配置凭证
// ============================================================
const SUPABASE_URL = "https://supabase.v4rope.com";
const SUPABASE_ANON_KEY = "sb_publishable_26_l2bawRKyTELKRlUO4XA_jhhMgAY7";

// 💾【新增】草稿机制配置：7 天自动过期 (7 * 24小时 * 60分 * 60秒 * 1000毫秒)
const DRAFT_KEY = "ibti_quiz_draft_v1";
const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;

let currentQuiz = [];
let userAnswers = [];
window.cachedIntro = ""; // 缓存测试说明文档

// 显示/隐藏加载动画
function showLoading(text = "加载中...") {
  const overlay = document.getElementById("loading-overlay");
  const textElem = document.getElementById("loading-text");
  if (textElem) textElem.innerText = text;
  if (overlay) overlay.style.display = "flex";
}

function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "none";
}

// 1. 初始化抽取题目 (有答题记录才恢复草稿，无记录则每次刷新重新抽题)
async function initQuiz() {
  // 💾 第一步：优先检查本地是否有【包含答题记录】的草稿
  const rawDraft = localStorage.getItem(DRAFT_KEY);
  if (rawDraft) {
    try {
      const draft = JSON.parse(rawDraft);
      // 🎯【核心修改】：判断 answersMap 是否存在且至少选过 1 道题
      const hasAnswers = draft && draft.answersMap && Object.keys(draft.answersMap).length > 0;

      // 只有【有答题记录】且未超过 7 天时，才锁题恢复
      if (hasAnswers && draft.questions && draft.questions.length > 0 && draft.savedAt && (Date.now() - draft.savedAt <= DRAFT_TTL)) {
        console.log("💡 检出包含答题记录的草稿，锁定加载上次抽取的 20 道题目");
        currentQuiz = draft.questions;

        if (draft.intro) {
          window.cachedIntro = draft.intro;
          const modalBody = document.getElementById("intro-modal-body");
          if (modalBody) modalBody.innerHTML = marked.parse(draft.intro);
        }

        renderQuiz(); // 渲染题目并还原答案
        hideLoading();
        return; // 🎯 恢复草稿成功，直接结束
      }
    } catch (e) {
      console.warn("读取本地草稿题目异常，将重新向云端抽取", e);
    }
  }

  // 第二步：如果没有答题记录，则每次刷新都向云端重新抽取全新 20 题
  showLoading("正在为您生成测试题目...");
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) throw new Error("获取题库失败");

    const data = await response.json();

    currentQuiz = data.questions;

    const modalBody = document.getElementById("intro-modal-body");
    if (data.intro) {
      window.cachedIntro = data.intro;
      if (modalBody) modalBody.innerHTML = marked.parse(data.intro);
    }

    renderQuiz();
    // 🎯【核心修改】：删除了这里的 saveDraft()！纯新打开不答题时，绝不留草稿！
  } catch (error) {
    console.error(error);
    alert("题库加载失败，请检查网络后刷新重试！");
  } finally {
    hideLoading();
  }
}

// 渲染题目列表 (选项随机化)
function renderQuiz() {
  const container = document.getElementById("quiz-container");
  if (!container) return;
  container.innerHTML = "";

  currentQuiz.forEach((q, qIdx) => {
    const div = document.createElement("div");
    const visualNum = qIdx + 1;
    div.className = "q-item";
    div.id = "q-" + qIdx;

    // 生成 0-4 的随机索引数组，实现选项乱序
    let optIdxs = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);

    let optionsHtml = optIdxs
      .map((originalWeight) => {
        return `
          <label class="option-label" onclick="selectOpt(this, ${qIdx}, ${originalWeight})">
              <input type="radio" name="q${qIdx}" value="${originalWeight}">
              ${q.options[originalWeight]}
          </label>
        `;
      })
      .join("");

    div.innerHTML = `
      <span class="q-title">${visualNum}. ${q.question}</span>
      <div class="options-list">${optionsHtml}</div>
    `;
    container.appendChild(div);
  });

  // 💾 DOM 渲染完毕后，触发自动恢复答案
  restoreDraft();
}

// 记录选中的选项
function selectOpt(el, qIdx, weightIdx) {
  const parent = el.parentElement;
  parent.querySelectorAll(".option-label").forEach((child) => child.classList.remove("selected"));
  el.classList.add("selected");

  userAnswers[qIdx] = {
    id: currentQuiz[qIdx].id,
    weight: weightIdx,
    optText: currentQuiz[qIdx].options[weightIdx]
  };

  // 💾 每次点击选项时，实时静默保存草稿
  saveDraft();
}

// ==================== 💾 IBTI 本地草稿四大核心逻辑 ====================

// 1. 保存当前已选答案与题目列表到本地
function saveDraft() {
  try {
    const answersMap = {};
    let count = 0;
    userAnswers.forEach(ans => {
      if (ans && ans.id !== undefined && ans.weight !== undefined) {
        answersMap[ans.id] = ans.weight;
        count++;
      }
    });

    // 🎯【核心修改】：只有当用户【至少答了 1 道题】(count > 0) 时，才保存草稿！
    if (count > 0 && currentQuiz && currentQuiz.length > 0) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        savedAt: Date.now(),
        questions: currentQuiz, // 锁定这 20 道题目列表
        answersMap: answersMap,
        intro: window.cachedIntro || ""
      }));
    } else if (count === 0) {
      // 如果用户没有选择任何选项，确保清除本地旧草稿
      clearDraft();
    }
  } catch (e) {
    console.warn("草稿保存失败:", e);
  }
}

// 2. 清除本地草稿
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {}
}

// 3. 页面渲染后自动恢复上次选中的答案
function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft || !draft.answersMap) return;

    // ⏱️ 检查是否超过 7 天有效期
    if (draft.savedAt && (Date.now() - draft.savedAt > DRAFT_TTL)) {
      console.log("草稿已超过 7 天，自动清除");
      clearDraft();
      return;
    }

    const answersMap = draft.answersMap;
    let restoredCount = 0;

    currentQuiz.forEach((q, qIdx) => {
      const savedWeight = answersMap[q.id];
      if (savedWeight !== undefined) {
        const qElem = document.getElementById("q-" + qIdx);
        if (qElem) {
          // 哪怕选项打乱了，通过 input[value=weight] 依然精确还原
          const inputElem = qElem.querySelector(`input[value="${savedWeight}"]`);
          if (inputElem) {
            const labelElem = inputElem.closest(".option-label");
            if (labelElem) {
              labelElem.classList.add("selected");
              inputElem.checked = true;

              userAnswers[qIdx] = {
                id: q.id,
                weight: savedWeight,
                optText: q.options[savedWeight]
              };
              restoredCount++;
            }
          }
        }
      }
    });

    if (restoredCount > 0) {
      console.log(`💡 已自动为您恢复上次未完成的 ${restoredCount} 道题的答案！`);
    }
  } catch (e) {
    console.warn("恢复草稿失败:", e);
  }
}

// 4. 手动清空草稿并重置测试
function resetQuizAndDraft() {
  if (confirm("确定要清空已选择的所有答案并重新测试吗？")) {
    clearDraft();
    location.reload();
  }
}

// 确认清单展示
function showReview() {
  let unanswered = [];
  for (let i = 0; i < currentQuiz.length; i++) {
    if (!userAnswers[i]) {
      unanswered.push(i + 1);
    }
  }

  if (unanswered.length > 0) {
    alert("请完成所有题目后再提交。\n\n未完成题号：" + unanswered.join("、"));
    const firstMiss = unanswered[0] - 1;
    const target = document.getElementById(`q-${firstMiss}`);
    if (target) {
      target.style.transition = "background-color 0.5s";
      target.style.backgroundColor = "#fff1f0";
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => { target.style.backgroundColor = ""; }, 2000);
    }
    return;
  }

  document.getElementById("quiz-section").classList.remove("active");
  document.getElementById("review-section").classList.add("active");
  window.scrollTo(0, 0);

  const sideNameMap = {
    'M': '寻求掌控',
    'S': '听从安排',
    'I': '主导引领',
    'R': '愿意顺从',
    'C': '讲道理',
    'O': '看感觉',
    'G': '需要安全感',
    'D': '喜欢寻求刺激'
  };

  const list = document.getElementById("review-list");
  list.innerHTML = currentQuiz
    .map((qData, i) => {
      const isCore = qData.is_core === true;
      const sideA = sideNameMap[qData.side_a] || qData.side_a;
      const sideB = sideNameMap[qData.side_b] || qData.side_b;
      const w = userAnswers[i].weight;

      let scoreLabel = "";
      if (w === 0) scoreLabel = `强偏向于【${sideA}】`;
      else if (w === 1) scoreLabel = `偏向于【${sideA}】`;
      else if (w === 2) scoreLabel = `双向平衡【${sideA} / ${sideB}】`;
      else if (w === 3) scoreLabel = `偏向于【${sideB}】`;
      else if (w === 4) scoreLabel = `强偏向于【${sideB}】`;

      return `
        <div class="review-item">
          <div class="review-q">
            ${i + 1}. ${qData.question}
            ${isCore ? '<span class="core-tag">核心动力</span>' : ''}
          </div>
          <div class="review-a">
            你的选择：${userAnswers[i].optText}
            <span class="score-hint">[ ${scoreLabel} ]</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function backToQuiz() {
  document.getElementById("review-section").classList.remove("active");
  document.getElementById("quiz-section").classList.add("active");
}

async function generateReport() {
  showLoading("云端正在分析算分并生成报告...");
  const payload = userAnswers.map(ans => ({
    id: ans.id,
    weight: ans.weight
  }));

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ p_answers: payload })
    });

    if (!response.ok) throw new Error("算分服务响应失败");

    const result = await response.json();
    renderResultView(result);
    clearDraft(); // 💾 成功生成报告后，擦除本地草稿
  } catch (error) {
    console.error(error);
    alert("报告生成失败，请重试！");
  } finally {
    hideLoading();
  }
}

function renderResultView(result) {
  document.getElementById("review-section").classList.remove("active");
  const resSect = document.getElementById("result-section");
  if (resSect) resSect.classList.add("active");
  window.scrollTo(0, 0);

  const resCodeElem = document.getElementById("res-code");
  if (resCodeElem) {
    resCodeElem.innerText = result.code;
    resCodeElem.style.textAlign = "center";
    resCodeElem.style.display = "block";
    resCodeElem.style.fontSize = "24px";
    resCodeElem.style.letterSpacing = "3px";
    resCodeElem.style.margin = "20px 0";
  }

  const scoreSummaryElem = document.getElementById("score-summary");
  if (scoreSummaryElem && result.scores) {
    const s = result.scores;
    let summaryText = `<div style="font-size:0.85rem; color:#666; text-align:center; margin-top:10px; line-height:1.8;">`;
    summaryText += `<strong>各维度权重指标参考：</strong><br>`;
    summaryText += `
        寻求掌控(M):${s.M.toFixed(1)} | 听从安排(S):${s.S.toFixed(1)} <br>
        主导引领(I):${s.I.toFixed(1)} | 愿意顺从(R):${s.R.toFixed(1)} <br>
        理智分析:${s.C.toFixed(1)} | 身体感受:${s.O.toFixed(1)} <br>
        需要安全感(G):${s.G.toFixed(1)} | 喜欢寻求刺激(D):${s.D.toFixed(1)}
    `;
    summaryText += `</div>`;
    scoreSummaryElem.innerHTML = summaryText;
  }

  const descElem = document.getElementById("res-desc");
  if (descElem && result.content) {
    descElem.innerHTML = marked.parse(result.content);
  }

  setTimeout(() => {
    drawRadar(result.scores);
  }, 50);
}

function drawRadar(s) {
  const ctx = document.getElementById("radarChart");
  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: [
        "寻求掌控(M)", "主导引领(I)", "理智分析(C)", "喜欢寻求刺激(D)",
        "听从安排(S)", "愿意顺从(R)", "身体感受(O)", "需要安全感(G)"
      ],
      datasets: [
        {
          label: "倾向值",
          data: [s.M, s.I, s.C, s.D, s.S, s.R, s.O, s.G],
          backgroundColor: "rgba(197, 160, 89, 0.2)",
          borderColor: "rgba(197, 160, 89, 1)",
          borderWidth: 1,
          pointBackgroundColor: "#1a1a1a",
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 5 },
      scales: {
        r: {
          min: 0,
          max: 7.5,
          beginAtZero: true,
          ticks: { display: false, stepSize: 2 },
          grid: { color: "#cccccc", lineWidth: 1 },
          angleLines: { color: "#cccccc", lineWidth: 1 },
          pointLabels: {
            padding: 10,
            font: { size: 12, family: "PingFang SC" },
            color: "#666"
          }
        }
      },
      plugins: { legend: { display: false }, tooltip: { enabled: true } }
    }
  });
}

function downloadImage(id, name) {
  const element = document.getElementById(id);
  if (!element) return;

  let processToast = document.getElementById("image-processing-toast");
  if (!processToast) {
    processToast = document.createElement("div");
    processToast.id = "image-processing-toast";
    processToast.innerHTML = `
      <div style="background: rgba(0,0,0,0.8); color: white; padding: 15px 25px; border-radius: 8px; text-align: center; font-size: 0.95rem; z-index: 10001;">
        <span id="toast-text">正在生成长图，请稍候片刻...</span>
      </div>
    `;
    Object.assign(processToast.style, {
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: "10000"
    });
    document.body.appendChild(processToast);
  } else {
    processToast.style.display = "flex";
  }

  setTimeout(() => {
    html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      ignoreElements: (el) => el.id === "image-processing-toast" || el.id === "image-download-overlay" || el.classList.contains("btn-group"),
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(id);
        if (clonedElement) {
          clonedElement.style.paddingLeft = "20px";
          clonedElement.style.paddingRight = "20px";
          clonedElement.style.boxSizing = "border-box";
          const qrFooter = clonedElement.querySelector('.share-qr-footer');
          if (qrFooter) qrFooter.style.display = 'block';
        }
      }
    }).then((canvas) => {
      const imageData = canvas.toDataURL("image/png");
      let overlay = document.getElementById("image-download-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "image-download-overlay";
        overlay.innerHTML = `
          <div class="overlay-content">
            <p style="margin: 0 0 5px; font-weight: bold; color: #333;">温馨提示：图片已生成</p>
            <p style="margin: 0 0 15px; font-size: 0.95rem; color: #666;"><strong>请长按下方图片保存到相册</strong></p>
            <img id="generated-image" src="" style="width: 100%; max-height: 60vh; object-fit: contain; border-radius: 4px;" />
            <button onclick="document.getElementById('image-download-overlay').style.display='none'" style="margin-top: 15px; background: #c5a059; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer;">关闭预览</button>
          </div>
        `;
        document.body.appendChild(overlay);
      }
      document.getElementById("generated-image").src = imageData;
      processToast.style.display = "none";
      overlay.style.display = "flex";
    });
  }, 1000);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}
function toggleWeChatQR() {
  const qr = document.getElementById("wechat-qr-popup");
  if (qr) qr.classList.toggle("active");
}
function openIntroModal() { openModal("intro-modal"); }
function openContactModal() {
  openModal("contact-modal");
  loadContactData();
}

window.onload = initQuiz;

async function loadContactData() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/site_contacts?is_active=eq.true&order=sort_order.asc`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) throw new Error("获取联系方式失败");

    const contacts = await response.json();
    renderContactModal(contacts);
  } catch (error) {
    console.error("加载联系方式异常:", error);
  }
}

function renderContactModal(contacts) {
  const modalBody = document.querySelector("#contact-modal .modal-body");
  if (!modalBody) return;

  let buttonsHtml = '<div class="social-buttons">';
  let qrHtml = '';

  contacts.forEach(item => {
    const key = (item.platform_key || '').toLowerCase();

    if (key.includes('wechat')) {
      buttonsHtml += `
        <div class="social-btn wechat" onclick="toggleWeChatQR()">
          <i class="${item.icon_class}"></i><span>${item.platform_name}</span>
        </div>
      `;

      qrHtml = `
        <div id="wechat-qr-popup" class="qr-popup">
          <img src="${item.url}" alt="${item.platform_name}" class="qr-code" />
          <p class="qr-tip">请使用微信扫描二维码加入群聊</p>
          ${item.extra_text ? `<p class="qr-tip-small">或添加微信号: <code>${item.extra_text}</code></p>` : ''}
        </div>
      `;
    } else {
      buttonsHtml += `
        <a href="${item.url}" target="_blank" class="social-btn ${key}">
          <i class="${item.icon_class}"></i><span>${item.platform_name}</span>
        </a>
      `;
    }
  });

  buttonsHtml += '</div>';
  modalBody.innerHTML = buttonsHtml + qrHtml;
}
