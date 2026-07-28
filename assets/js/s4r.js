// =============================================================
// 🛠️ 确认页调试模式开关
// 设为 true 时：刷新页面【无需填表，直进确认页】方便实时调 CSS
// 设为 false 时：恢复正常流程（必须填表提交后才看确认页）
// =============================================================
const DEBUG_MODE = false;

// ==================== Supabase 初始化配置 ====================
const SUPABASE_URL = 'https://cpjjmuzrcvgbaekiqkrx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_J_s2HOy7kY8mpmEohAYZkw_4gAiqJf2';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 's4r' }
});

// ==================== 身体部位数据定义 ====================
const bodyParts = [
  { id: '头发', name: '头发', icon: 'fas fa-cut' },
  { id: '面部', name: '面部', icon: 'fas fa-smile' },
  { id: '脖子', name: '脖子', icon: 'fas fa-user' },
  { id: '胸部', name: '胸部', icon: 'fas fa-glasses' },
  { id: '手臂', name: '手臂', icon: 'fas fa-hand-paper' },
  { id: '手指', name: '手指', icon: 'fas fa-hand-point-up' },
  { id: '腰部', name: '腰部', icon: 'fas fa-sort' },
  { id: '臀部', name: '臀部', icon: 'fas fa-heart' },
  { id: '私密部位', name: '私密部位', icon: 'fas fa-chevron-circle-down' },
  { id: '下肢', name: '下肢', icon: 'fas fa-walking' },
  { id: '脚', name: '脚', icon: 'fas fa-shoe-prints' },
  { id: '无', name: '无', icon: 'fas fa-user-secret' }
];

// 全局表达数据缓存
let userFormData = {};

// ==================== 表单交互逻辑 ====================

// 初始化身体部位网格选择
function initBodyPartSelectors() {
  const noTouchContainer = document.getElementById('noTouchAreas');
  const noBondageContainer = document.getElementById('noBondageAreas');

  if (!noTouchContainer || !noBondageContainer) return;

  bodyParts.forEach(part => {
    // 1. 不希望被触碰网格项
    const touchDiv = document.createElement('div');
    touchDiv.className = 'body-part-item';
    touchDiv.dataset.id = part.id;
    touchDiv.dataset.name = part.name;
    touchDiv.innerHTML = `<i class="${part.icon}"></i><span>${part.name}</span>`;
    touchDiv.addEventListener('click', () => {
      touchDiv.classList.toggle('selected');
      updateHiddenInput('no_touch_input', 'noTouchAreas');
    });
    noTouchContainer.appendChild(touchDiv);

    // 2. 不可捆绑网格项
    const bondageDiv = document.createElement('div');
    bondageDiv.className = 'body-part-item';
    bondageDiv.dataset.id = part.id;
    bondageDiv.dataset.name = part.name;
    bondageDiv.innerHTML = `<i class="${part.icon}"></i><span>${part.name}</span>`;
    bondageDiv.addEventListener('click', () => {
      bondageDiv.classList.toggle('selected');
      updateHiddenInput('no_bondage_input', 'noBondageAreas');
    });
    noBondageContainer.appendChild(bondageDiv);
  });
}

// 更新隐藏 input 的逗号分隔字符串
function updateHiddenInput(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;

  const selectedItems = container.querySelectorAll('.selected');
  const values = Array.from(selectedItems).map(item => item.dataset.id);
  input.value = values.join(',');
}

// 收集表单完整数据
function collectFormData() {
  const form = document.getElementById('ropeForm');
  const formData = new FormData(form);
  userFormData = {};

  for (let [key, value] of formData.entries()) {
    if (key === 'accepts') {
      if (!userFormData.accepts) userFormData.accepts = [];
      userFormData.accepts.push(value);
    } else {
      userFormData[key] = value;
    }
  }

  // 收集“其他特定项目”输入框
  userFormData.other_accepts = formData.get('other_accepts') ? formData.get('other_accepts').trim() : '';

  // 收集禁忌部位
  const noTouchItems = document.querySelectorAll('#noTouchAreas .selected');
  userFormData.noTouchItems = Array.from(noTouchItems).map(item => ({
    id: item.dataset.id,
    name: item.dataset.name
  }));

  const noBondageItems = document.querySelectorAll('#noBondageAreas .selected');
  userFormData.noBondageItems = Array.from(noBondageItems).map(item => ({
    id: item.dataset.id,
    name: item.dataset.name
  }));

  // 收集感官体验多选项（分层解析主副标题与描述）
  const feelingItems = document.querySelectorAll('.feeling-option input[type="checkbox"]:checked');
  userFormData.feelingItems = Array.from(feelingItems).map(item => {
    const label = item.nextElementSibling;
    const mainTitleEl = label ? label.querySelector('.title-main') : null;
    const subTitleEl = label ? label.querySelector('.title-sub') : null;
    const descEl = label ? label.querySelector('.option-desc') : null;
    const iconEl = mainTitleEl ? mainTitleEl.querySelector('i') : null;

    const mainText = mainTitleEl ? mainTitleEl.innerText.trim() : "";
    const subText = subTitleEl ? subTitleEl.innerText.trim() : "";
    const fullTitle = subText ? `${mainText} ${subText}` : (mainText || item.value);

    return {
      value: item.value,
      title: fullTitle,
      iconClass: iconEl ? iconEl.className : 'fas fa-star',
      desc: descEl ? descEl.textContent.trim() : ''
    };
  });

  return userFormData;
}

// ==================== 确认页展现与填充逻辑 ====================

// 切换至确认页显示（隐藏主页大 Banner）
function showConfirmation() {
  document.getElementById('successMessage').style.display = 'none';
  const mainHeader = document.querySelector('.header');
  if (mainHeader) mainHeader.style.display = 'none';

  document.getElementById('confirmationPage').style.display = 'block';
  populateConfirmationPage();
}

// 填充确认页数据
function populateConfirmationPage() {
  const nick = userFormData.nickname || "未填写";
  document.getElementById("confDocName").textContent = nick;

  // 1. 安全词 (顶置红框)
  document.getElementById("confSafeword").innerHTML =
    `<strong style="font-size:1.15rem; color:#be123c;">${userFormData.safeword || "未设置"}</strong>`;

  // 2. 基本信息与健康声明
  document.getElementById("confNickname").innerHTML = `<strong>${nick}</strong>`;

  document.getElementById("confAdult").innerHTML =
    userFormData.adult === "yes"
      ? `<span class="badge-pill badge-green">是 (已成年)</span>`
      : `<span class="badge-pill badge-red">否 (未成年)</span>`;

  document.getElementById("confSafety").innerHTML =
    `<span class="badge-pill badge-green"><i class="fas fa-check"></i> 已理解并同意</span>`;

  document.getElementById("confRecording").innerHTML =
    userFormData.recording === "yes"
      ? `<span class="badge-pill badge-green"><i class="fas fa-video"></i> 希望留下记录</span>`
      : `<span class="badge-pill badge-red"><i class="fas fa-video-slash"></i> 拒绝影像记录</span>`;

  document.getElementById("confMedical").innerHTML =
    userFormData.medical_history ? `<strong>${userFormData.medical_history}</strong>` : `<span>无</span>`;

  document.getElementById("confPiercings").innerHTML =
    userFormData.piercings ? `<strong>${userFormData.piercings}</strong>` : `<span>无</span>`;

  // 3. 身体界限与限制设置
  document.getElementById("confTopless").innerHTML =
    userFormData.topless === "accept"
      ? `<span class="badge-pill badge-purple">接受上半身赤裸</span>`
      : `<span class="badge-pill badge-gray">不接受</span>`;

  document.getElementById("confMarks").innerHTML =
    userFormData.marks === "accept"
      ? `<span class="badge-pill badge-green">能接受痕迹</span>`
      : `<span class="badge-pill badge-red">不能接受痕迹</span>`;

  var noMarksAreas = document.getElementById("no_marks_areas").value;
  var confirmationNoMarksAreas = document.getElementById("confirmationNoMarksAreas");
  var noMarksAreasValue = document.getElementById("noMarksAreasValue");
  if (noMarksAreas && noMarksAreas.trim() !== "") {
    noMarksAreasValue.textContent = noMarksAreas;
    confirmationNoMarksAreas.style.display = "block";
  } else {
    confirmationNoMarksAreas.style.display = "none";
  }

  // 不希望触碰部位
  let noTouchHtml = "";
  if (userFormData.noTouchItems && userFormData.noTouchItems.length > 0) {
    userFormData.noTouchItems.forEach((item) => {
      const part = bodyParts.find((p) => p.id === item.id);
      const iconClass = part ? part.icon : "fas fa-hand-paper";
      noTouchHtml += `<span class="badge-pill badge-red"><i class="${iconClass}"></i> ${item.name}</span>`;
    });
  } else {
    noTouchHtml = `<span class="badge-pill badge-gray">无特殊禁忌</span>`;
  }
  document.getElementById("confNoTouch").innerHTML = noTouchHtml;

  // 不可捆绑部位
  let noBondageHtml = "";
  if (userFormData.noBondageItems && userFormData.noBondageItems.length > 0) {
    userFormData.noBondageItems.forEach((item) => {
      const part = bodyParts.find((p) => p.id === item.id);
      const iconClass = part ? part.icon : "fas fa-ban";
      noBondageHtml += `<span class="badge-pill badge-red"><i class="${iconClass}"></i> ${item.name}</span>`;
    });
  } else {
    noBondageHtml = `<span class="badge-pill badge-gray">无特殊禁忌</span>`;
  }
  document.getElementById("confNoBondage").innerHTML = noBondageHtml;

  // 4. 痛感与特定玩法偏好
  document.getElementById("confPainOther").innerHTML =
    userFormData.other_pain === "yes"
      ? `<strong>希望体验除捆绑感外疼痛</strong>`
      : `<strong>不希望体验</strong>`;

  const painToleranceMap = {
    恋痛: "恋痛",
    不怕痛: "不怕痛",
    轻微痛感: "轻微痛感",
    完全不要: "完全不要",
    不怕: "不怕痛",
    轻微: "轻微痛感"
  };
  const userTolerance = userFormData.pain_tolerance;
  document.getElementById("confPainTolerance").innerHTML =
    `<span class="badge-pill badge-purple">${painToleranceMap[userTolerance] || userTolerance || "未选择"}</span>`;

  // 4.9 能接受的特定项目 + “其他”输入框渲染逻辑
  let acceptsHtml = "";
  const checkedAccepts = userFormData.accepts || [];
  const otherAcceptsText = userFormData.other_accepts ? userFormData.other_accepts.trim() : "";

  if (checkedAccepts.length > 0) {
    const acceptMap = { hair_pulling: "拉头发", "拉头发": "拉头发", slapping: "耳光", "耳光": "耳光", spanking: "SP", "SP": "SP", thigh_rope: "股绳", "股绳": "股绳" };
    checkedAccepts.forEach((accept) => {
      acceptsHtml += `<span class="badge-pill badge-purple"><i class="fas fa-check"></i> ${acceptMap[accept] || accept}</span>`;
    });
  }

  if (otherAcceptsText) {
    acceptsHtml += `<span class="badge-pill badge-purple"><i class="fas fa-pen"></i> ${otherAcceptsText}</span>`;
  }

  if (!checkedAccepts.length && !otherAcceptsText) {
    acceptsHtml = `<span class="badge-pill badge-gray">不接受</span>`;
  }
  document.getElementById("confAccepts").innerHTML = acceptsHtml;

  // 5. 互动偏好明细
  document.getElementById("confHug").innerHTML =
    userFormData.hug === "yes"
      ? `<span class="badge-pill badge-green">可以</span>`
      : `<span class="badge-pill badge-red">不可以</span>`;

  document.getElementById("confSensory").innerHTML =
    userFormData.sensory_deprivation === "yes"
      ? `<span class="badge-pill badge-purple">感兴趣</span>`
      : `<span class="badge-pill badge-gray">不感兴趣</span>`;

  const blindfoldMap = { 享受: "享受", 可以接受: "可以接受", 能接受但会不安: "能接受但会不安", "不接受（会不安）": "不接受", 不接受: "不接受" };
  const blindfoldVal = blindfoldMap[userFormData.blindfold] || userFormData.blindfold || "未选择";
  document.getElementById("confBlindfold").innerHTML =
    blindfoldVal === "不接受"
      ? `<span class="badge-pill badge-red">${blindfoldVal}</span>`
      : `<span class="badge-pill badge-purple">${blindfoldVal}</span>`;

  const gagMap = { 享受: "享受", 可以轻度接受: "可以轻度接受", 不接受: "不接受" };
  const gagVal = gagMap[userFormData.gag] || userFormData.gag || "未选择";
  document.getElementById("confGag").innerHTML =
    gagVal === "不接受"
      ? `<span class="badge-pill badge-red">${gagVal}</span>`
      : `<span class="badge-pill badge-purple">${gagVal}</span>`;

  const breathControlMap = { enjoy: "享受", neck: "颈部呼吸控制", light: "轻度呼吸控制", anxious: "能接受但会不安", no: "不接受" };
  const breathVal = breathControlMap[userFormData.breath_control] || userFormData.breath_control || "未选择";
  document.getElementById("confBreathControl").innerHTML =
    breathVal === "不接受"
      ? `<span class="badge-pill badge-red">${breathVal}</span>`
      : `<span class="badge-pill badge-purple">${breathVal}</span>`;

  // 6. 期望的绳缚体验感受（编号前置 + 纯净阶段胶囊）
  let feelingsHtml = "";
  if (userFormData.feelingItems && userFormData.feelingItems.length > 0) {
    userFormData.feelingItems.forEach((item) => {
      let lvlClass = "lvl-1";
      let lvlName = "舒缓接纳";
      let prefixNum = "1-1";
      let iconColor = "#7cb342";

      if (item.value.includes("静心冥想")) {
        lvlClass = "lvl-1"; lvlName = "舒缓接纳"; prefixNum = "1-1"; iconColor = "#7cb342";
      } else if (item.value.includes("安全茧房")) {
        lvlClass = "lvl-1"; lvlName = "舒缓接纳"; prefixNum = "1-2"; iconColor = "#7cb342";
      } else if (item.value.includes("趣味互动")) {
        lvlClass = "lvl-2"; lvlName = "灵蕴交流"; prefixNum = "2-1"; iconColor = "#ffb74d";
      } else if (item.value.includes("身体发现")) {
        lvlClass = "lvl-2"; lvlName = "灵蕴交流"; prefixNum = "2-2"; iconColor = "#ffb74d";
      } else if (item.value.includes("延迟满足")) {
        lvlClass = "lvl-3"; lvlName = "浸漫共鸣"; prefixNum = "3-1"; iconColor = "#ff7043";
      } else if (item.value.includes("心流状态")) {
        lvlClass = "lvl-3"; lvlName = "浸漫共鸣"; prefixNum = "3-2"; iconColor = "#ff7043";
      } else if (item.value.includes("痛感转化")) {
        lvlClass = "lvl-4"; lvlName = "沉淬突破"; prefixNum = "4-1"; iconColor = "#e53935";
      } else if (item.value.includes("完全交付")) {
        lvlClass = "lvl-4"; lvlName = "沉淬突破"; prefixNum = "4-2"; iconColor = "#e53935";
      }

      feelingsHtml += `
        <div class="feeling-rich-card ${lvlClass}">
          <div class="feeling-rich-head">
            <span class="feeling-rich-title">
              <i class="${item.iconClass}" style="color: ${iconColor};"></i>
              ${prefixNum} ${item.title}
            </span>
            <span class="feeling-rich-badge ${lvlClass}">${lvlName}</span>
          </div>
          ${item.desc ? `<div class="feeling-rich-desc">${item.desc}</div>` : ''}
        </div>
      `;
    });
  } else {
    feelingsHtml = `<div class="badge-pill badge-gray">未勾选任何体验程度</div>`;
  }
  document.getElementById("confFeelings").innerHTML = feelingsHtml;
}

// 从确认页返回修改（恢复主页大 Banner）
function goBackToForm() {
  document.getElementById('confirmationPage').style.display = 'none';
  const mainHeader = document.querySelector('.header');
  if (mainHeader) mainHeader.style.display = 'block';

  document.getElementById('formContent').style.display = 'block';
  if (document.querySelector('.status-bar')) {
    document.querySelector('.status-bar').style.display = 'flex';
  }
}

// 打印确认页
function printConfirmation() {
  const printContent = document.getElementById('confirmationPage').innerHTML;
  const originalContent = document.body.innerHTML;

  document.body.innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h1 style="text-align: center; color: #8b5cf6; margin-bottom: 30px;">绳缚体验知情同意与偏好调查表 - 确认页</h1>
      ${printContent}
    </div>
  `;

  window.print();
  document.body.innerHTML = originalContent;
  window.location.reload();
}

// ==================== 表单提交与 Supabase 数据备份 ====================
document.getElementById('ropeForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = collectFormData();

  const submitBtn = e.target.querySelector('.btn-submit');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '提交问卷';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在安全加密提交...';
  }

  try {
    const { error } = await _supabase
      .from('responses')
      .insert([{
        safety_acknowledged: formData.safety_acknowledged,
        nickname: formData.nickname,
        is_adult: formData.adult,
        medical_history: formData.medical_history,
        piercings: formData.piercings,
        safeword: formData.safeword,
        topless: formData.topless,
        marks: formData.marks,
        no_marks_areas: formData.no_marks_areas,
        no_touch: formData.noTouchItems ? formData.noTouchItems.map(item => item.name) : [],
        no_bondage: formData.noBondageItems ? formData.noBondageItems.map(item => item.name) : [],
        other_pain: formData.other_pain,
        pain_tolerance: formData.pain_tolerance,
        accepts: formData.accepts || [],
        other_accepts: formData.other_accepts || '',
        hug: formData.hug,
        sensory_deprivation: formData.sensory_deprivation,
        blindfold: formData.blindfold,
        gag: formData.gag,
        breath_control: formData.breath_control,
        recording: formData.recording,
        feelings: formData.feelingItems || []
      }]);

    if (error) throw error;
    console.log("表单数据已安全备份至云端！");

    document.getElementById('formContent').style.display = 'none';
    if (document.querySelector('.status-bar')) {
      document.querySelector('.status-bar').style.display = 'none';
    }
    document.getElementById('successMessage').style.display = 'block';

  } catch (err) {
    console.error("提交至后台失败:", err);
    alert("表单提交遇到问题，请检查网络或配置！\n错误提示: " + (err.message || "请求受阻"));
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
});

// ==================== 页面加载初始化 ====================
document.addEventListener('DOMContentLoaded', function () {
  initBodyPartSelectors();

  // 🛠️ 调试模式触发逻辑
  if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
    const mainHeader = document.querySelector('.header');
    if (mainHeader) mainHeader.style.display = 'none';

    userFormData = {
      nickname: "u哦iu额万人计划",
      adult: "yes",
      safety_acknowledged: "是，我已理解并同意",
      recording: "yes",
      medical_history: "是的V步打撒快乐就好",
      piercings: "阿瓦尔我去二",
      safeword: "黄灯红了",
      topless: "not_accept",
      marks: "accept",
      no_marks_areas: "脸上不可以",
      noTouchItems: [{ id: "面部", name: "面部" }, { id: "手指", name: "手指" }],
      noBondageItems: [{ id: "胸部", name: "胸部" }, { id: "私密部位", name: "私密部位" }],
      other_pain: "yes",
      pain_tolerance: "不怕痛",
      accepts: ["拉头发", "SP"],
      other_accepts: "",
      hug: "yes",
      sensory_deprivation: "yes",
      blindfold: "能接受但会不安",
      gag: "享受",
      breath_control: "neck",
      feelingItems: []
    };

    document.getElementById('formContent').style.display = 'none';
    if (document.querySelector('.status-bar')) document.querySelector('.status-bar').style.display = 'none';
    document.getElementById('confirmationPage').style.display = 'block';
    populateConfirmationPage();
  }

  // 滚动状态栏 IntersectionObserver 联动
  const sections = document.querySelectorAll('.form-section');
  const statusItems = document.querySelectorAll('.status-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(sections).indexOf(entry.target);
        statusItems.forEach((item, i) => {
          if (i <= index) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => observer.observe(section));
});

// ==================== 长图生成与导出预览 ====================
function downloadS4RImage(id) {
  const element = document.getElementById(id) || document.body;

  let processToast = document.getElementById('image-processing-toast');
  if (!processToast) {
    processToast = document.createElement('div');
    processToast.id = 'image-processing-toast';
    processToast.innerHTML = `
      <div style="background: rgba(0,0,0,0.8); color: white; padding: 15px 25px; border-radius: 8px; text-align: center; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10001;">
        <span id="toast-text">正在生成精致长图，请稍候片刻...</span>
      </div>
    `;
    Object.assign(processToast.style, {
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.1)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: '10000'
    });
    document.body.appendChild(processToast);
  } else {
    document.getElementById('toast-text').innerText = "正在生成精致长图，请稍候片刻...";
    processToast.style.display = 'flex';
  }

  setTimeout(() => {
    html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      ignoreElements: (element) => element.id === 'image-processing-toast'
    }).then(canvas => {
      const imageData = canvas.toDataURL("image/png");

      let overlay = document.getElementById('image-download-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'image-download-overlay';
        overlay.innerHTML = `
          <div class="overlay-content">
            <p style="margin: 0 0 5px; font-weight: bold; color: #333;">温馨提示：图片已生成</p>
            <p style="margin: 0 0 15px; font-size: 0.95rem; color: #666;"><strong>请长按下方图片保存到相册</strong></p>
            <img id="generated-image" src="" style="width: 100%; max-height: 60vh; object-fit: contain; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
            <button onclick="document.getElementById('image-download-overlay').style.display='none'" style="margin-top: 15px; background: #667eea; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer;">关闭预览</button>
          </div>
        `;
        document.body.appendChild(overlay);
      }

      const imgDisplay = document.getElementById('generated-image');
      imgDisplay.src = imageData;

      processToast.style.display = 'none';
      overlay.style.display = 'flex';

      console.log("S4R 长图生成成功");
    }).catch(err => {
      console.error("生成长图失败:", err);
      document.getElementById('toast-text').innerText = "生成失败，请刷新重试";
      setTimeout(() => { processToast.style.display = 'none'; }, 1500);
    });

  }, 1500);
}
