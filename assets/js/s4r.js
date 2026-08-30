const SUPABASE_URL = "https://s4rstudy.v4rope.com";
const SUPABASE_ANON_KEY = "sb_publishable_J_s2HOy7kY8mpmEohAYZkw_4gAiqJf2";

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: "s4r" },
});

const bodyParts = [
  { id: "头发", name: "头发", icon: "fas fa-cut" },
  { id: "面部", name: "面部", icon: "fas fa-smile" },
  { id: "脖子", name: "脖子", icon: "fas fa-user" },
  { id: "胸部", name: "胸部", icon: "fas fa-glasses" },
  { id: "手臂", name: "手臂", icon: "fas fa-hand-paper" },
  { id: "手指", name: "手指", icon: "fas fa-hand-point-up" },
  { id: "腰部", name: "腰部", icon: "fas fa-sort" },
  { id: "臀部", name: "臀部", icon: "fas fa-heart" },
  { id: "私密部位", name: "私密部位", icon: "fas fa-chevron-circle-down" },
  { id: "下肢", name: "下肢", icon: "fas fa-walking" },
  { id: "脚", name: "脚", icon: "fas fa-shoe-prints" },
  { id: "无", name: "无", icon: "fas fa-user-secret" },
];

let userFormData = {};

function initBodyPartSelectors() {
  const noTouchContainer = document.getElementById("noTouchAreas");
  const noBondageContainer = document.getElementById("noBondageAreas");

  if (!noTouchContainer || !noBondageContainer) return;

  bodyParts.forEach((part) => {
    const touchDiv = document.createElement("div");
    touchDiv.className = "body-part-item";
    touchDiv.dataset.id = part.id;
    touchDiv.dataset.name = part.name;
    touchDiv.innerHTML = `<i class="${part.icon}"></i><span>${part.name}</span>`;
    touchDiv.addEventListener("click", () => {
      touchDiv.classList.toggle("selected");
      updateHiddenInput("no_touch_input", "noTouchAreas");
      saveDraft();
    });
    noTouchContainer.appendChild(touchDiv);

    const bondageDiv = document.createElement("div");
    bondageDiv.className = "body-part-item";
    bondageDiv.dataset.id = part.id;
    bondageDiv.dataset.name = part.name;
    bondageDiv.innerHTML = `<i class="${part.icon}"></i><span>${part.name}</span>`;
    bondageDiv.addEventListener("click", () => {
      bondageDiv.classList.toggle("selected");
      updateHiddenInput("no_bondage_input", "noBondageAreas");
      saveDraft();
    });
    noBondageContainer.appendChild(bondageDiv);
  });
}

function updateHiddenInput(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;

  const selectedItems = container.querySelectorAll(".selected");
  const values = Array.from(selectedItems).map((item) => item.dataset.id);
  input.value = values.join(",");
}

function collectFormData() {
  const form = document.getElementById("ropeForm");
  const formData = new FormData(form);
  userFormData = {};

  for (let [key, value] of formData.entries()) {
    if (key === "accepts") {
      if (!userFormData.accepts) userFormData.accepts = [];
      userFormData.accepts.push(value);
    } else {
      userFormData[key] = value;
    }
  }

  userFormData.other_accepts = formData.get("other_accepts")
    ? formData.get("other_accepts").trim()
    : "";

  const noTouchItems = document.querySelectorAll("#noTouchAreas .selected");
  userFormData.noTouchItems = Array.from(noTouchItems).map((item) => ({
    id: item.dataset.id,
    name: item.dataset.name,
  }));

  const noBondageItems = document.querySelectorAll("#noBondageAreas .selected");
  userFormData.noBondageItems = Array.from(noBondageItems).map((item) => ({
    id: item.dataset.id,
    name: item.dataset.name,
  }));

  const feelingItems = document.querySelectorAll(
    '.feeling-option input[type="checkbox"]:checked',
  );
  userFormData.feelingItems = Array.from(feelingItems).map((item) => {
    const label = item.nextElementSibling;
    const mainTitleEl = label ? label.querySelector(".title-main") : null;
    const subTitleEl = label ? label.querySelector(".title-sub") : null;
    const descEl = label ? label.querySelector(".option-desc") : null;
    const iconEl = mainTitleEl ? mainTitleEl.querySelector("i") : null;

    const mainText = mainTitleEl ? mainTitleEl.innerText.trim() : "";
    const subText = subTitleEl ? subTitleEl.innerText.trim() : "";
    const fullTitle = subText
      ? `${mainText} ${subText}`
      : mainText || item.value;

    return {
      value: item.value,
      title: fullTitle,
      iconClass: iconEl ? iconEl.className : "fas fa-star",
      desc: descEl ? descEl.textContent.trim() : "",
    };
  });

  return userFormData;
}

const DRAFT_KEY = "s4r_form_draft_v1";

function saveDraft() {
  try {
    const data = collectFormData();

    if (
      !data.nickname &&
      !data.safeword &&
      (!data.accepts || data.accepts.length === 0) &&
      (!data.feelingItems || data.feelingItems.length === 0)
    ) {
      return;
    }
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        data: data,
      }),
    );
  } catch (e) {
    console.warn("草稿保存失败:", e);
  }
}

let draftSaveTimer = null;
function saveDraftDebounced() {
  clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(saveDraft, 300);
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {}
}

function resetFormAndDraft() {
  if (confirm("确定要清空当前已填写的所有内容并重新填写吗？")) {
    clearDraft();
    window.location.reload();
  }
}

const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;

function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft || !draft.data) return;

    if (draft.savedAt && Date.now() - draft.savedAt > DRAFT_TTL) {
      console.log("草稿已超过 7 天有效期，已自动清空");
      clearDraft();
      return;
    }

    const data = draft.data;
    const form = document.getElementById("ropeForm");
    if (!form) return;

    form
      .querySelectorAll('input[type="radio"], input[type="checkbox"]')
      .forEach((input) => {
        const name = input.name;
        const val = input.value;

        if (input.type === "radio" && data[name] === val) {
          input.checked = true;
        } else if (input.type === "checkbox") {
          if (
            name === "accepts" &&
            Array.isArray(data.accepts) &&
            data.accepts.includes(val)
          ) {
            input.checked = true;
          } else if (name === "feelings" && Array.isArray(data.feelingItems)) {
            if (data.feelingItems.some((item) => item.value === val)) {
              input.checked = true;
            }
          }
        }
      });

    form.querySelectorAll('input[type="text"], textarea').forEach((input) => {
      const name = input.name;
      if (data[name] !== undefined) {
        input.value = data[name];
      }
    });

    if (Array.isArray(data.noTouchItems)) {
      const touchContainer = document.getElementById("noTouchAreas");
      if (touchContainer) {
        data.noTouchItems.forEach((item) => {
          const el = touchContainer.querySelector(`[data-id="${item.id}"]`);
          if (el) el.classList.add("selected");
        });
        updateHiddenInput("no_touch_input", "noTouchAreas");
      }
    }

    if (Array.isArray(data.noBondageItems)) {
      const bondageContainer = document.getElementById("noBondageAreas");
      if (bondageContainer) {
        data.noBondageItems.forEach((item) => {
          const el = bondageContainer.querySelector(`[data-id="${item.id}"]`);
          if (el) el.classList.add("selected");
        });
        updateHiddenInput("no_bondage_input", "noBondageAreas");
      }
    }

    console.log("💡 已自动恢复未提交的草稿记录！");
  } catch (e) {
    console.warn("恢复草稿失败:", e);
  }
}

function showConfirmation() {
  document.getElementById("successMessage").style.display = "none";
  const mainHeader = document.querySelector(".header");
  if (mainHeader) mainHeader.style.display = "none";

  document.getElementById("confirmationPage").style.display = "block";
  populateConfirmationPage();
}

function populateConfirmationPage() {
  const nick = userFormData.nickname || "未填写";
  document.getElementById("confDocName").textContent = nick;

  document.getElementById("confSafeword").innerHTML =
    `<strong style="font-size:1.15rem; color:#be123c;">${userFormData.safeword || "未设置"}</strong>`;

  document.getElementById("confNickname").innerHTML =
    `<strong>${nick}</strong>`;

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
    userFormData.medical_history
      ? `<strong>${userFormData.medical_history}</strong>`
      : `<span>无</span>`;

  document.getElementById("confPiercings").innerHTML = userFormData.piercings
    ? `<strong>${userFormData.piercings}</strong>`
    : `<span>无</span>`;

  document.getElementById("confTopless").innerHTML =
    userFormData.topless === "accept"
      ? `<span class="badge-pill badge-purple">接受上半身赤裸</span>`
      : `<span class="badge-pill badge-gray">不接受</span>`;

  document.getElementById("confMarks").innerHTML =
    userFormData.marks === "accept"
      ? `<span class="badge-pill badge-green">能接受痕迹</span>`
      : `<span class="badge-pill badge-red">不能接受痕迹</span>`;

  var noMarksAreas = document.getElementById("no_marks_areas").value;
  var confirmationNoMarksAreas = document.getElementById(
    "confirmationNoMarksAreas",
  );
  var noMarksAreasValue = document.getElementById("noMarksAreasValue");
  if (noMarksAreas && noMarksAreas.trim() !== "") {
    noMarksAreasValue.textContent = noMarksAreas;
    confirmationNoMarksAreas.style.display = "block";
  } else {
    confirmationNoMarksAreas.style.display = "none";
  }

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
    轻微: "轻微痛感",
  };
  const userTolerance = userFormData.pain_tolerance;
  document.getElementById("confPainTolerance").innerHTML =
    `<span class="badge-pill badge-purple">${painToleranceMap[userTolerance] || userTolerance || "未选择"}</span>`;

  let acceptsHtml = "";
  const checkedAccepts = userFormData.accepts || [];
  const otherAcceptsText = userFormData.other_accepts
    ? userFormData.other_accepts.trim()
    : "";

  if (checkedAccepts.length > 0) {
    const acceptMap = {
      hair_pulling: "拉头发",
      拉头发: "拉头发",
      slapping: "耳光",
      耳光: "耳光",
      spanking: "SP",
      SP: "SP",
      thigh_rope: "股绳",
      股绳: "股绳",
    };
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

  document.getElementById("confHug").innerHTML =
    userFormData.hug === "yes"
      ? `<span class="badge-pill badge-green">可以</span>`
      : `<span class="badge-pill badge-red">不可以</span>`;

  document.getElementById("confSensory").innerHTML =
    userFormData.sensory_deprivation === "yes"
      ? `<span class="badge-pill badge-purple">感兴趣</span>`
      : `<span class="badge-pill badge-gray">不感兴趣</span>`;

  const blindfoldMap = {
    享受: "享受",
    可以接受: "可以接受",
    能接受但会不安: "能接受但会不安",
    "不接受（会不安）": "不接受",
    不接受: "不接受",
  };
  const blindfoldVal =
    blindfoldMap[userFormData.blindfold] || userFormData.blindfold || "未选择";
  document.getElementById("confBlindfold").innerHTML =
    blindfoldVal === "不接受"
      ? `<span class="badge-pill badge-red">${blindfoldVal}</span>`
      : `<span class="badge-pill badge-purple">${blindfoldVal}</span>`;

  const gagMap = {
    享受: "享受",
    可以轻度接受: "可以轻度接受",
    不接受: "不接受",
  };
  const gagVal = gagMap[userFormData.gag] || userFormData.gag || "未选择";
  document.getElementById("confGag").innerHTML =
    gagVal === "不接受"
      ? `<span class="badge-pill badge-red">${gagVal}</span>`
      : `<span class="badge-pill badge-purple">${gagVal}</span>`;

  const breathControlMap = {
    enjoy: "享受",
    neck: "颈部呼吸控制",
    light: "轻度呼吸控制",
    anxious: "能接受但会不安",
    no: "不接受",
  };
  const breathVal =
    breathControlMap[userFormData.breath_control] ||
    userFormData.breath_control ||
    "未选择";
  document.getElementById("confBreathControl").innerHTML =
    breathVal === "不接受"
      ? `<span class="badge-pill badge-red">${breathVal}</span>`
      : `<span class="badge-pill badge-purple">${breathVal}</span>`;

  let feelingsHtml = "";
  if (userFormData.feelingItems && userFormData.feelingItems.length > 0) {
    userFormData.feelingItems.forEach((item) => {
      let lvlClass = "lvl-1";
      let lvlName = "舒缓接纳";
      let prefixNum = "1-1";
      let iconColor = "#7cb342";

      if (item.value.includes("静心冥想")) {
        lvlClass = "lvl-1";
        lvlName = "舒缓接纳";
        prefixNum = "1-1";
        iconColor = "#7cb342";
      } else if (item.value.includes("安全茧房")) {
        lvlClass = "lvl-1";
        lvlName = "舒缓接纳";
        prefixNum = "1-2";
        iconColor = "#7cb342";
      } else if (item.value.includes("趣味互动")) {
        lvlClass = "lvl-2";
        lvlName = "灵蕴交流";
        prefixNum = "2-1";
        iconColor = "#ffb74d";
      } else if (item.value.includes("身体发现")) {
        lvlClass = "lvl-2";
        lvlName = "灵蕴交流";
        prefixNum = "2-2";
        iconColor = "#ffb74d";
      } else if (item.value.includes("延迟满足")) {
        lvlClass = "lvl-3";
        lvlName = "浸漫共鸣";
        prefixNum = "3-1";
        iconColor = "#ff7043";
      } else if (item.value.includes("心流状态")) {
        lvlClass = "lvl-3";
        lvlName = "浸漫共鸣";
        prefixNum = "3-2";
        iconColor = "#ff7043";
      } else if (item.value.includes("痛感转化")) {
        lvlClass = "lvl-4";
        lvlName = "沉淬突破";
        prefixNum = "4-1";
        iconColor = "#e53935";
      } else if (item.value.includes("完全交付")) {
        lvlClass = "lvl-4";
        lvlName = "沉淬突破";
        prefixNum = "4-2";
        iconColor = "#e53935";
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
          ${item.desc ? `<div class="feeling-rich-desc">${item.desc}</div>` : ""}
        </div>
      `;
    });
  } else {
    feelingsHtml = `<div class="badge-pill badge-gray">未勾选任何体验程度</div>`;
  }
  document.getElementById("confFeelings").innerHTML = feelingsHtml;
}

function goBackToForm() {
  document.getElementById("confirmationPage").style.display = "none";
  const mainHeader = document.querySelector(".header");
  if (mainHeader) mainHeader.style.display = "block";

  document.getElementById("formContent").style.display = "block";
  if (document.querySelector(".status-bar")) {
    document.querySelector(".status-bar").style.display = "flex";
  }
}

function printConfirmation() {
  const printContent = document.getElementById("confirmationPage").innerHTML;
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

document
  .getElementById("ropeForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = collectFormData();

    const submitBtn = e.target.querySelector(".btn-submit");
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "提交问卷";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> 正在安全加密提交...';
    }

    try {
      const { error } = await _supabase.from("responses").insert([
        {
          safety_acknowledged: formData.safety_acknowledged,
          nickname: formData.nickname,
          is_adult: formData.adult,
          medical_history: formData.medical_history,
          piercings: formData.piercings,
          safeword: formData.safeword,
          topless: formData.topless,
          marks: formData.marks,
          no_marks_areas: formData.no_marks_areas,
          no_touch: formData.noTouchItems
            ? formData.noTouchItems.map((item) => item.name)
            : [],
          no_bondage: formData.noBondageItems
            ? formData.noBondageItems.map((item) => item.name)
            : [],
          other_pain: formData.other_pain,
          pain_tolerance: formData.pain_tolerance,
          accepts: formData.accepts || [],
          other_accepts: formData.other_accepts || "",
          hug: formData.hug,
          sensory_deprivation: formData.sensory_deprivation,
          blindfold: formData.blindfold,
          gag: formData.gag,
          breath_control: formData.breath_control,
          recording: formData.recording,
          feelings: formData.feelingItems || [],
        },
      ]);

      if (error) throw error;
      console.log("表单数据已安全备份至云端！");

      clearDraft();

      document.getElementById("formContent").style.display = "none";
      if (document.querySelector(".status-bar")) {
        document.querySelector(".status-bar").style.display = "none";
      }
      document.getElementById("successMessage").style.display = "block";
    } catch (err) {
      console.error("提交至后台失败:", err);
      alert(
        "表单提交遇到问题，请检查网络或配置！\n错误提示: " +
          (err.message || "请求受阻"),
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  initBodyPartSelectors();

  const ropeForm = document.getElementById("ropeForm");
  if (ropeForm) {
    ropeForm.addEventListener("input", saveDraftDebounced);
    ropeForm.addEventListener("change", saveDraft);
  }
  restoreDraft();
});

function downloadS4RImage(id) {
  const element = document.getElementById(id) || document.body;

  const nick =
    userFormData && userFormData.nickname
      ? userFormData.nickname.trim()
      : "未命名";
  const now = new Date();
  const dateStr =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const fileName = `绳缚体验知情同意书_${nick}_${dateStr}.png`;

  let processToast = document.getElementById("image-processing-toast");
  if (!processToast) {
    processToast = document.createElement("div");
    processToast.id = "image-processing-toast";
    processToast.innerHTML = `
      <div style="background: rgba(0,0,0,0.8); color: white; padding: 15px 25px; border-radius: 8px; text-align: center; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10001;">
        <span id="toast-text">正在生成精致长图，请稍候片刻...</span>
      </div>
    `;
    Object.assign(processToast.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(255,255,255,0.1)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "10000",
    });
    document.body.appendChild(processToast);
  } else {
    document.getElementById("toast-text").innerText =
      "正在生成精致长图，请稍候片刻...";
    processToast.style.display = "flex";
  }

  setTimeout(() => {
    html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      ignoreElements: (element) => element.id === "image-processing-toast",
    })
      .then((canvas) => {
        const imageData = canvas.toDataURL("image/png");

        let overlay = document.getElementById("image-download-overlay");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "image-download-overlay";
          overlay.innerHTML = `
          <div class="overlay-content">
            <p style="margin: 0 0 5px; font-weight: bold; color: #333;">温馨提示：长图已生成</p>
            <p style="margin: 0 0 12px; font-size: 0.9rem; color: #6366f1; font-weight: bold;">
              长按下方图片保存到相册（电脑端请右键另存为）
            </p>
            <img id="generated-image" src="" style="width: 100%; max-height: 55vh; object-fit: contain; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
            <button onclick="document.getElementById('image-download-overlay').style.display='none'" style="margin-top: 15px; background: #8b5cf6; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">关闭预览</button>
          </div>
        `;
          document.body.appendChild(overlay);
        }

        const imgDisplay = document.getElementById("generated-image");
        imgDisplay.src = imageData;
        imgDisplay.alt = fileName;
        imgDisplay.title = fileName;

        processToast.style.display = "none";
        overlay.style.display = "flex";

        console.log("S4R 长图生成成功，标识文件名：" + fileName);
      })
      .catch((err) => {
        console.error("生成长图失败:", err);
        document.getElementById("toast-text").innerText =
          "生成失败，请刷新重试";
        setTimeout(() => {
          processToast.style.display = "none";
        }, 1500);
      });
  }, 1500);
}
