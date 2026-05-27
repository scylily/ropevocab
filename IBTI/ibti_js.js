
      function openIntroModal() {
        const modal = document.getElementById("intro-modal");
        if (modal) modal.style.display = "flex";
      }

      function closeIntroModal() {
        const modal = document.getElementById("intro-modal");
        if (modal) modal.style.display = "none";
      }

      let currentQuiz = [];
      let userAnswers = [];

      function initQuiz() {
        // 1. 【配置与核心定义】
        const dimensions = ['MS', 'IR', 'CO', 'GD'];
        const questionsPerDimension = 5; // 每个维度抽 5 题
        let sampledQuestions = [];

        // 给原始题库标上原始题号（originalId），方便结果页核对，并保留所有属性（包括 isCore）
        const poolWithId = rawQuestions.map((item, idx) => ({
          ...item,
          originalId: idx
        }));

        // 2. 【核心优先分层抽样逻辑】
        dimensions.forEach(dim => {
          // 过滤出该维度的所有题目池
          const dimPool = poolWithId.filter(q => q.d === dim);

          // --- 优化后的逻辑开始 ---
          // 1. 直接通过属性挑出核心题
          const coreInDim = dimPool.filter(q => q.isCore === true);
          // 2. 挑出该维度里的非核心题
          const nonCoreInDim = dimPool.filter(q => !q.isCore);

          // 3. 将非核心题洗牌（增加随机性）
          const shuffledNonCore = nonCoreInDim.sort(() => Math.random() - 0.5);

          // 4. 组合：必选该维度的核心题 + 抽取的非核心题（补齐到 5 道）
          const needed = questionsPerDimension - coreInDim.length;
          // 如果核心题不够或刚好，就用非核心题补齐；如果核心题多了，这段逻辑依然稳健
          const selectedForDim = coreInDim.concat(shuffledNonCore.slice(0, Math.max(0, needed)));

          sampledQuestions = sampledQuestions.concat(selectedForDim);
          // --- 优化后的逻辑结束 ---
        });

        // 将抽样出的 20 道题进行最后一次全局乱序，打破维度聚集感（让 MS/IR 等题交替出现）
        currentQuiz = sampledQuestions.sort(() => Math.random() - 0.5);

        // 3. 【UI 渲染逻辑】
        const container = document.getElementById('quiz-container');
        if (!container) return;
        container.innerHTML = '';

        currentQuiz.forEach((q, qIdx) => {
          const div = document.createElement('div');
          const visualNum = qIdx + 1;
          div.className = 'q-item';
          div.id = 'q-' + qIdx;

          // 选项乱序处理：确保每次测试选项顺序不同
          let optIdxs = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);

          let optionsHtml = optIdxs.map(originalWeight => {
            return `
                <label class="option-label" onclick="selectOpt(this, ${qIdx}, ${originalWeight})">
                    <input type="radio" name="q${qIdx}" value="${originalWeight}">
                    ${q.opts[originalWeight]}
                </label>
            `;
          }).join('');

          div.innerHTML = `
            <span class="q-title">${visualNum}. ${q.q}</span>
            <div class="options-list">${optionsHtml}</div>
        `;
          container.appendChild(div);
        });

        console.log("抽样完成，自动识别核心动力题。总题数：" + currentQuiz.length);
      }

      // 选项点击函数保持不变
      function selectOpt(el, qIdx, weightIdx) {
        const parent = el.parentElement;
        parent.querySelectorAll('.option-label').forEach(child => child.classList.remove('selected'));
        el.classList.add('selected');
        // 存储答案，并把题目对象完整带入，方便评分函数判断 isCore
        userAnswers[qIdx] = {
          q: currentQuiz[qIdx].q,
          weight: weightIdx,
          isCore: currentQuiz[qIdx].isCore, // 这里直接存入标记
          data: currentQuiz[qIdx]
        };
      }

      // 确认清单页逻辑（修改版：增加淡红色高亮特效）
      function showReview() {
        // 1. 找出所有未做的题目序号
        let unanswered = [];
        for (let i = 0; i < currentQuiz.length; i++) {
          if (!userAnswers[i]) {
            unanswered.push(i + 1);
          }
        }

        // 2. 如果有未做的题目，弹出具体题号并拦截
        if (unanswered.length > 0) {
          const listStr = unanswered.join('、');
          alert("请完成所有题目后再提交。\n\n未完成题号：" + listStr);

          // 自动滚动到第一道没做的题
          const firstMiss = unanswered[0] - 1;
          const target = document.querySelector(`[data-qidx="${firstMiss}"]`) || document.getElementById(`q-${firstMiss}`);

          if (target) {
            // 【新增高亮效果】
            target.style.transition = "background-color 0.5s"; // 设置颜色变换的过渡时间
            target.style.backgroundColor = "#fff1f0";         // 设置为淡红色

            // 执行滚动
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 2秒后自动恢复原背景色，形成一个“闪烁提醒”的效果
            setTimeout(() => {
              target.style.backgroundColor = "";
            }, 2000);
          }

          return;
          setTimeout(() => {
            window.scrollTo(0, 0); // 强制回到顶部
            // 有时微信需要这一句来重新触发布局计算
            document.body.style.width = '100vw';
          }, 100);
        }

        // 3. 如果全部完成，进入确认清单页
        document.getElementById('quiz-section').classList.remove('active');
        document.getElementById('review-section').classList.add('active');
        window.scrollTo(0, 0);

        // 4. 渲染确认清单（整合分值与核心动力功能）
        const list = document.getElementById('review-list');

        list.innerHTML = currentQuiz.map((qData, i) => {
          // A. 判定是否为核心动力题 (假设你已定义 coreIndices)
          const isCore = qData.isCore === true;
          const multiplier = isCore ? 2.0 : 1.0; // 核心题权重翻倍

          // B. 获取该题对应的属性侧（如 M vs S）
          const sideA = qData.side[0];
          const sideB = qData.side[1];

          // C. 模拟计分逻辑，生成分值标注 [ 仅在 weight 存在时计算 ]
          let scoreLabel = "";
          if (userAnswers[i] && userAnswers[i].weight !== undefined) {
            const w = userAnswers[i].weight;
            if (w === 0) scoreLabel = `${sideA} +${(1.5 * multiplier).toFixed(1)}`;
            else if (w === 1) scoreLabel = `${sideA} +${(0.5 * multiplier).toFixed(1)}`;
            else if (w === 2) scoreLabel = `${sideA}/${sideB} 各+${(0.2 * multiplier).toFixed(1)}`;
            else if (w === 3) scoreLabel = `${sideB} +${(0.5 * multiplier).toFixed(1)}`;
            else if (w === 4) scoreLabel = `${sideB} +${(1.5 * multiplier).toFixed(1)}`;
          }

          // D. 返回 HTML 字符串（保持你的 class：review-item, review-q, review-a）
          return `

<div class="review-item">
        <div class="review-q">
          ${i + 1}. ${qData.q}
          ${isCore ? '<span class="core-tag" style="color:gold; font-weight:bold;">核心动力</span>' : ''}
        </div>
        <div class="review-a">
          你的答案：${qData.opts[userAnswers[i].weight]}
          <span class="score-hint" style="color:#888; font-size:0.8em;"> [ 指向: ${scoreLabel} ]</span>
        </div>
      </div>
    `;
        }).join('');
      }

      function backToQuiz() {
        document.getElementById('review-section').classList.remove('active');
        document.getElementById('quiz-section').classList.add('active');
      }

      // 生成结果报告
      function generateReport() {
        // 1. 初始化数据
        // rawScores 用于存储累加的原始权重分
        let rawScores = { M: 0, S: 0, I: 0, R: 0, C: 0, O: 0, G: 0, D: 0 };
        // dimMaxPotential 用于记录本次测试中每个维度的理论最高分（用于归一化）
        let dimMaxPotential = { MS: 0, IR: 0, CO: 0, GD: 0 };

        // 2. 遍历用户答案进行计分
        userAnswers.forEach((ans, i) => {
          if (!ans) return;

          const q = currentQuiz[i];
          const w = ans.weight;           // 选项权重 (0-4)
          const A = q.side[0];            // 维度 A (如 M)
          const B = q.side[1];            // 维度 B (如 S)
          const dimKey = q.d;             // 维度键 (如 MS)

          // --- 核心动力判定 ---
          const isCore = q.isCore === true || (typeof coreIndices !== 'undefined' && coreIndices.includes(q.originalId));
          const multiplier = isCore ? 2.0 : 1.0;

          // 累加该维度本次随机抽题的理论最高上限 (单题最高 1.5 * 倍率)
          dimMaxPotential[dimKey] += 1.5 * multiplier;

          // 原始加权计分逻辑
          if (w === 0) rawScores[A] += 1.5 * multiplier;
          else if (w === 1) rawScores[A] += 0.5 * multiplier;
          else if (w === 2) {
            rawScores[A] += 0.2 * multiplier;
            rawScores[B] += 0.2 * multiplier;
          }
          else if (w === 3) rawScores[B] += 0.5 * multiplier;
          else if (w === 4) rawScores[B] += 1.5 * multiplier;
        });

        // 3. 动态归一化处理 (将得分统一缩放到 0 - 7.5 之间)
        const TARGET_MAX = 7.5;
        let finalScores = {}; // 最终用于显示和绘图的分数

        ['MS', 'IR', 'CO', 'GD'].forEach(dim => {
          const sideA = dim[0];
          const sideB = dim[1];
          const maxP = dimMaxPotential[dim] || 1; // 防止除以0

          // 公式：(原始得分 / 该维度总上限) * 7.5
          finalScores[sideA] = (rawScores[sideA] / maxP) * TARGET_MAX;
          finalScores[sideB] = (rawScores[sideB] / maxP) * TARGET_MAX;
        });

        // 4. 判定维度代码 (判定 X 的阈值基于归一化后的 7.5 分制)
        // 建议分差小于 1.0 判定为 X（约占总权重的 13.3%）
        const getDim = (a, b) => {
          const net = finalScores[a] - finalScores[b];
          return Math.abs(net) < 1.0 ? 'X' : (net > 0 ? a : b);
        };

        const code = [
          getDim('M', 'S'),
          getDim('I', 'R'),
          getDim('C', 'O'),
          getDim('G', 'D')
        ].join('-');

        // 5. 将数值转化为直观的文字显示 (使用归一化后的 finalScores)
        const scoreSummaryElem = document.getElementById('score-summary');
        if (scoreSummaryElem) {
          const nameMap = {
            M: '掌控感', S: '配合度', I: '主导力', R: '响应度',
            C: '认知博弈', O: '本能驱动', G: '情绪边界', D: '探索深度'
          };

          let summaryText = `<div style="font-size:0.85rem; color:#666; text-align:center; margin-top:10px; line-height:1.8;">`;
          summaryText += `<strong>各维度权重指标参考：</strong><br>`;
          summaryText += `
            ${nameMap.M}(M):${finalScores.M.toFixed(1)} | ${nameMap.S}(S):${finalScores.S.toFixed(1)} <br>
            ${nameMap.I}(I):${finalScores.I.toFixed(1)} | ${nameMap.R}(R):${finalScores.R.toFixed(1)} <br>
            ${nameMap.C}(C):${finalScores.C.toFixed(1)} | ${nameMap.O}(O):${finalScores.O.toFixed(1)} <br>
            ${nameMap.G}(G):${finalScores.G.toFixed(1)} | ${nameMap.D}(D):${finalScores.D.toFixed(1)}
        `;
          summaryText += `</div>`;
          scoreSummaryElem.innerHTML = summaryText;
        }

        // 6. 界面切换与内容渲染
        const allSections = ['quiz-section', 'review-section', 'intro-section'];
        allSections.forEach(id => {
          const sect = document.getElementById(id);
          if (sect) sect.classList.remove('active');
        });

        const resSect = document.getElementById('result-section');
        if (resSect) resSect.classList.add('active');
        window.scrollTo(0, 0);

        // A. 代号显示
        const resCodeElem = document.getElementById('res-code');
        if (resCodeElem) {
          resCodeElem.innerText = code;
          resCodeElem.style.textAlign = 'center';
          resCodeElem.style.display = 'block';
          resCodeElem.style.fontSize = '24px';
          resCodeElem.style.letterSpacing = '3px';
          resCodeElem.style.margin = '20px 0';
        }

        // B. Markdown 文案渲染
        const fullContent = IBTI_DATA[code] || IBTI_DATA["X-X-X-X"];
        const descElem = document.getElementById('res-desc');
        if (fullContent && descElem) {
          const cleanContent = fullContent.split('\n').map(line => line.trim()).join('\n');
          descElem.innerHTML = marked.parse(cleanContent);
        }

        // 7. 绘制雷达图 (使用归一化后的 finalScores)
        setTimeout(() => {
          if (typeof drawRadar === "function") {
            drawRadar(finalScores);
          }
        }, 50);
      }

      function drawRadar(s) {
        const ctx = document.getElementById('radarChart');

        // --- 优化1：销毁旧图表 (关键) ---
        // 如果之前已经生成过图表，先销毁它，否则多次测试时图表会重叠、闪烁
        if (window.myChart) {
          window.myChart.destroy();
        }

        // --- 优化2：配置图表数据与样式 ---
        window.myChart = new Chart(ctx, {
          type: 'radar',
          data: {
            // 维度标签，增加了一些间距感
            labels: ['掌控感(M)', '主导力(I)', '认知博弈(C)', '探索深度(D)', '配合度(S)', '响应度(R)', '本能驱动(O)', '情绪边界(G)'],
            datasets: [{
              label: '倾向值',
              data: [s.M, s.I, s.C, s.D, s.S, s.R, s.O, s.G],
              backgroundColor: 'rgba(197, 160, 89, 0.2)', // 填充颜色（金棕色）
              borderColor: 'rgba(197, 160, 89, 1)',     // 线条颜色
              borderWidth: 1,
              pointBackgroundColor: '#1a1a1a',          // 点的颜色
              pointRadius: 3                            // 点的大小
            }]
          },
          options: {
            responsive: true,           // 开启响应式
            maintainAspectRatio: false,  // 关闭强制比例，使其适配父容器高度
            layout: {
              padding: 5 // 把这个值调小（比如 5 或 10），图形会瞬间胀大
            },
            scales: {
              r: {
                min: 0,
                max: 7.5,            // 根据你的评分标准调整最大值
                beginAtZero: true,
                ticks: {
                  display: false, // 隐藏刻度数字，保持干净
                  stepSize: 2
                },
                grid: {
                  color: '#cccccc', // 网格线颜色
                  lineWidth: 1        // 也可以增加粗细，默认是 1
                },
                angleLines: {
                  color: '#cccccc', // 射线颜色
                  lineWidth: 1        // 也可以增加粗细，默认是 1
                },
                pointLabels: {
                  padding: 10,   // 标签离图形的距离，越小图越大
                  font: {
                    size: 12,           // 缩小标签字体，防止溢出
                    family: 'PingFang SC'
                  },
                  color: '#666'
                }
              }
            },
            plugins: {
              legend: {
                display: false // 隐藏顶部的图例
              },
              tooltip: {
                enabled: true // 开启鼠标悬停显示数值
              }
            }
          }
        });
      }

/**
 * IBTI 专属长图生成与移动端优化预览功能
 * 移除了原生阻断 alert，引入无感延迟跳转，并完美防止截图中包含提示框
 * @param {string} id - 需要截取的页面容器元素 ID
 * @param {string} name - 保存图片的预设名称（虽然后续主要通过长按保存，但保留参数防错）
 */
function downloadImage(id, name) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`未找到ID为 '${id}' 的截取容器`);
    return;
  }

  // 1. 创建或获取一个“正在处理”的轻量化遮罩提示框
  let processToast = document.getElementById('image-processing-toast');
  if (!processToast) {
    processToast = document.createElement('div');
    processToast.id = 'image-processing-toast';
    // 采用优雅的移动端全屏居中黑底透白设计
    processToast.innerHTML = `
      <div style="background: rgba(0,0,0,0.8); color: white; padding: 15px 25px; border-radius: 8px; text-align: center; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10001;">
        <span id="toast-text">正在生成长图，请稍候片刻...</span>
      </div>
    `;
    // 设置全屏遮罩样式，提供轻微磨砂过渡感
    Object.assign(processToast.style, {
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.1)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: '10000'
    });
    document.body.appendChild(processToast);
  } else {
    // 每次多次点击生成时，重新初始化文本和显示状态
    document.getElementById('toast-text').innerText = "正在生成长图，请稍候片刻...";
    processToast.style.display = 'flex';
  }

  // 2. 引入延迟 1.5 秒后再执行长图渲染，给浏览器留出渲染空间并给用户无感过渡期
  setTimeout(() => {

    html2canvas(element, {
      scale: 2,                  // 提升2倍清晰度，防止高清屏下长图文字模糊
      backgroundColor: "#ffffff",// 强制白底，防止暗色模式或透明背景导致黑图
      useCORS: true,              // 开启跨域图片支持，防止雷达图等外部图片丢失
      // 【核心修复】：配置忽略元素，确保“提示框”与“已存在的预览层”绝不参与截图拍照
      ignoreElements: (el) => {
        return el.id === 'image-processing-toast' || el.id === 'image-download-overlay';
      }
    }).then(canvas => {
      const imageData = canvas.toDataURL("image/png");

      // 3. 检查或一次性注入全屏遮罩及长按预览框
      let overlay = document.getElementById('image-download-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'image-download-overlay';
        overlay.innerHTML = `
          <div class="overlay-content">
            <p style="margin: 0 0 5px; font-weight: bold; color: #333;">温馨提示：图片已生成</p>
            <p style="margin: 0 0 15px; font-size: 0.95rem; color: #666;"><strong>请长按下方图片保存到相册</strong></p>
            <img id="generated-image" src="" style="width: 100%; max-height: 60vh; object-fit: contain; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
            <button onclick="document.getElementById('image-download-overlay').style.display='none'" style="margin-top: 15px; background: #667eea; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">关闭预览</button>
          </div>
        `;
        document.body.appendChild(overlay);
      }

      // 4. 将生成的图片数据塞入预览图，并将预览遮罩层显示出来
      const imgDisplay = document.getElementById('generated-image');
      imgDisplay.src = imageData;

      // 5. 丝滑关闭“正在处理”的提示，并拉起“长图预览区”
      processToast.style.display = 'none';
      overlay.style.display = 'flex';

      console.log(` [${name}] 生成成功`);
    }).catch(err => {
      console.error("生成长图失败:", err);
      // 容错处理：若失败则在提示框中反馈，并在 1.5 秒后自动消失
      const toastText = document.getElementById('toast-text');
      if (toastText) toastText.innerText = "生成失败，请刷新页面重试";
      setTimeout(() => { processToast.style.display = 'none'; }, 1500);
    });

  }, 1500); // 1.5 秒等待时间
}

      window.onload = initQuiz;

      // --- 1. 核心弹窗控制函数 ---

      /**
       * 打开指定 ID 的弹窗
       * @param {string} modalId - 弹窗容器的 ID
       */
      function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = "flex";
          // 防止页面背景滚动 (可选优化)
          document.body.style.overflow = 'hidden';
        }
      }

      /**
       * 关闭指定 ID 的弹窗
       * @param {string} modalId - 弹窗容器的 ID
       */
      function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = "none";
          // 恢复页面滚动
          document.body.style.overflow = 'auto';

          // 如果关闭的是联系弹窗，额外重置微信二维码
          if (modalId === 'contact-modal') {
            const qrPopup = document.getElementById('wechat-qr-popup');
            if (qrPopup) qrPopup.classList.remove('active');
          }
        }
      }

      /**
       * 微信二维码切换显示/隐藏
       */
      function toggleWeChatQR() {
        const qr = document.getElementById('wechat-qr-popup');
        if (qr) {
          qr.classList.toggle('active');
        }
      }

      // 为了保持与您旧代码中函数名的兼容性，保留以下别名
      function openIntroModal() { openModal('intro-modal'); }
      function closeIntroModal() { closeModal('intro-modal'); }
      function openContactModal() { openModal('contact-modal'); }
      function closeContactModal() { closeModal('contact-modal'); }


      // --- 2. 事件监听与自动绑定 ---

      document.addEventListener('DOMContentLoaded', function () {

        /**
         * [优化逻辑] 点击遮罩层关闭
         * 虽然 HTML 中已写了 onclick="closeModal(...)"，
         * 但这里的 window.onclick 提供了对动态 ID 的全局支持。
         */
        window.onclick = function (event) {
          // 检查点击的对象是否带有 modal-overlay 类
          if (event.target.classList.contains('modal-overlay')) {
            closeModal(event.target.id);
          }
        };

        /**
         * [键盘支持] 按 ESC 键关闭当前打开的弹窗
         */
        document.addEventListener('keydown', function (event) {
          if (event.key === "Escape") {
            const openModals = document.querySelectorAll('.modal-overlay[style*="display: flex"]');
            openModals.forEach(modal => closeModal(modal.id));
          }
        });

        // 可以在此添加 console 调试，确认脚本加载成功
        console.log("IBTI Modal System Initialized.");
      });
