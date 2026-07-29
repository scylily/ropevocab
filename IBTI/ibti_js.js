const SUPABASE_URL = "https://gfhgwqjvxyyanumbwibe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_26_l2bawRKyTELKRlUO4XA_jhhMgAY7";
let currentQuiz = [];
let userAnswers = [];
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
async function initQuiz() {
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
renderQuiz();
const modalBody = document.getElementById("intro-modal-body");
if (modalBody && data.intro) {
modalBody.innerHTML = marked.parse(data.intro);
}
} catch (error) {
console.error(error);
alert("题库加载失败，请检查网络后刷新重试！");
} finally {
hideLoading();
}
}
function renderQuiz() {
const container = document.getElementById("quiz-container");
if (!container) return;
container.innerHTML = "";
currentQuiz.forEach((q, qIdx) => {
const div = document.createElement("div");
const visualNum = qIdx + 1;
div.className = "q-item";
div.id = "q-" + qIdx;
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
}
function selectOpt(el, qIdx, weightIdx) {
const parent = el.parentElement;
parent.querySelectorAll(".option-label").forEach((child) => child.classList.remove("selected"));
el.classList.add("selected");
userAnswers[qIdx] = {
id: currentQuiz[qIdx].id,
weight: weightIdx,
optText: currentQuiz[qIdx].options[weightIdx]
};
}
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
function openContactModal() { openModal("contact-modal"); }
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
function openContactModal() {
openModal("contact-modal");
loadContactData();
}
