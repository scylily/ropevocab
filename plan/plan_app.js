/**
 * 绳缚专业教学与教案管理系统 - 前端交互核心 (纯正工作坊实战版 · 彻底杜绝AI胡编)
 */

// 系统出厂提示词（已深度注入：针对学员短板纠偏 + 针对当前模特身体弱点的专属口令）
var DEFAULT_PROMPTS = {
  p1:
    "【角色定义与绝对行话准则】\n" +
    "你是一位在线下工作坊有数千小时实操经验的日本绳缚（Shibari/Kinbaku）硬核工作坊师范，精通流派传统技法与外周神经解剖安全。\n" +
    "你的受众是真实的绳手与学员。你的教案是现场拿在手里带练实操的“硬核手感说明书”，严禁任何假大空！\n\n" +
    "【四项铁律禁区 (违者即为失败交付)】：\n" +
    "1. 【严禁编造伪科学公式】：绝对严禁出现任何张力计算公式（如张力=0.7x...）、严禁编造分贝值或无意义的角度度数；\n" +
    "2. 【严禁文艺煽情与悬浮比喻】：绝对严禁出现“天鹅系丝巾”、“捕蝶网”、“乐章”、“灵魂画卷”等虚浮网文修辞！口令必须干脆、直指骨架发力、肌肉松紧与身体重心控制；\n" +
    "3. 【严禁解剖名词胡乱命名走线】：步骤必须使用真实绳缚行话（如：起手双圈锁定、大臂第一道圈、背部引绳、胸线过闩 Kannuki、折返自锁扣、梯形收尾等），严禁自创“菱形肌环”、“滑车系统”等假名词；\n" +
    "4. 【严禁玄学与无关医学】：严禁扯中医穴位（如阳池穴等）；生理解剖必须落地为真实的桡神经沟避让、腕横纹不压单绳、掐甲测试与晕厥急救黄金四步。",

  p2:
    "【教案核心章节与硬核结构】\n" +
    "直接以 # 教案大标题起笔，严禁输出 ``` 编程代码块围栏。教案必须遵循真实的工作坊教学结构：\n" +
    "1. 【课前 10 分钟：前置技能摸底与认知诊断】：\n" +
    "   - 必须设立讲师现场提问摸底口令；\n" +
    "   - 检查学员最基础平结是否会滑脱、手腕是否悬空、起手是用蛮力拔河还是用身体自重收绳；\n" +
    "   - 【模特身体状态确认】：开工前针对本次模特的关节活动度、既往伤病、神经耐受进行触诊核对；\n" +
    "2. 【走线技术与结构拆解】：\n" +
    "   - 必须按照真实的走绳逻辑写明：定位圈 ➔ 锁扣建立 ➔ 导向引绳 ➔ 关键受力圈 ➔ 打闩(Kannuki)固定 ➔ 绳尾自锁；\n" +
    "   - 涉及绑法必须给出母卷标准三语（如：高手小手缚 TK / Box Tie / 高手小手縛り - Takatekote-shibari）；\n" +
    "   - 真实的对比矩阵（如：骨架自锁型 vs 肌肉顺应型走绳的绳圈咬合点差异）；\n" +
    "3. 【现场实操带练口令流 (Verbal Cues)】：必须是讲师在现场针对“学员发力短板”与“当前模特生理特点”大声喝止或纠错的真实口语；\n" +
    "4. 【生理解剖与巡场必查清单】：标准 - [ ] checklist 格式，必须量身包含当前模特专属避坑项；\n" +
    "5. 【解绳程序与 Aftercare 退潮】：逆向拆除高张力辅助绳、关节被动放松、保暖补糖，以及当前模特的退潮偏好。",

  p3:
    "【真实的工作坊带练话术 (Verbal Cues) 规范】\n" +
    "带练口令必须纯正地道，且【必须结合当前模特的生理特点与当日状态】进行个性化现场喝止，例如：\n" +
    "- 针对模特关节受限/超伸：“学员手停住！注意模特的肘关节天然超伸，大臂收绳时绝对不能锁死角度，留出半拳余量，你想把她韧带拉伤吗？！”\n" +
    "- 针对模特特定神经敏感：“手摸一下模特桡神经三角区！这名模特的桡神经浅表敏感，你的下绳圈压得太低了，往上移两指，避开三角区！”\n" +
    "- 针对学员蛮力习惯：“手腕松开！别用二头肌跟模特拔河！退后半步，把你的身体重心沉下去，用你的体重把绳子带直，不是用手死拽！”\n" +
    "- 呼吸连带：“别急着走下一圈。手掌贴住模特背部，等她呼气、两肩自然沉下去的那个瞬间，顺着那个空隙走绳！”",

  p4:
    "【生理解剖与危机干预落地】\n" +
    "必须精准引用母卷真实医学事实，并结合搭档模特特点：\n" +
    "1. 外周神经卡压三字经：【桡管虎口，腕管中指尖，肘管小指环】；\n" +
    "2. 针对搭档模特身心档案中的【关节超伸/伤病史/神经循环弱点】，在教案第 Ⅳ、Ⅴ 节中列出针对该模特的专项巡场排查项；\n" +
    "3. 鉴别诊断：整肢发紫发冷是血液循环问题；特定皮节刺痛且解绳后不退是神经损伤；\n" +
    "4. 出现垂腕（桡神经）、猿手（正中神经）、爪状手（尺神经）必须立刻卸绳微调；麻木超2小时建议手外科就诊（做 EMG/NCV 肌电图）；\n" +
    "5. 晕厥黄金四步骤：立即水平放平 ➔ 解除束缚 ➔ 垫高下肢20~30度 ➔ 通气降温补糖（严禁立刻站立）。",
};

// 全局状态管理
var sbClient = null;
var currentUser = null;
var currentStudent = null;
var currentModel = null;
var cachedStudents = [];
var cachedModels = [];
var cachedMasterKnowledge = null;

var courseStore = {
  topic: "",
  schedule: "",
  profile: "",
  goals: "",
  prereq: "",
  saved: false,
};
var modelStore = {
  relation: "",
  joints: "",
  nerve: "",
  injury: "",
  psychology: "",
  todayNotes: "",
  hasFilled: false,
};
var currentLectureText = "";
var isStageModeOn = false;
var isRawEditorOn = false;

var aiTimerInterval = null;
var aiSecondsElapsed = 0;
var activePromptTab = 1;

// 初始化生命周期
window.addEventListener("DOMContentLoaded", async function () {
  autoSyncPrompts();
  initMarkdownEngine();
  initSupabaseClient();
  restoreLocalCache();
  refreshIndicators();

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.setAttribute("data-theme", "dark");
    updateThemeSvg(true);
  }
});

// 初始化 Marked 解析引擎
function initMarkdownEngine() {
  if (window.marked && window.markedKatex) {
    marked.use(
      markedKatex({
        throwOnError: false,
        nonStandard: true,
      })
    );
  }
  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      pedantic: false,
    });
  }
}

// 自动感知提示词修改
function autoSyncPrompts() {
  var currentHash = getPromptHash();
  var savedHash = localStorage.getItem("kb_prompt_auto_hash");

  if (savedHash !== currentHash) {
    for (var i = 1; i <= 4; i++) {
      localStorage.removeItem("kinbaku_prompt_p" + i);
    }
    localStorage.removeItem("kb_prompt_version");
    localStorage.setItem("kb_prompt_auto_hash", currentHash);
    console.log("⚡ 检测到代码提示词有更新，已自动适应最新修改！");
  }
}

function getPromptHash() {
  var str =
    DEFAULT_PROMPTS.p1 +
    DEFAULT_PROMPTS.p2 +
    DEFAULT_PROMPTS.p3 +
    DEFAULT_PROMPTS.p4;
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash.toString();
}

async function loadMasterKnowledge() {
  if (cachedMasterKnowledge) return cachedMasterKnowledge;
  try {
    var res = await fetch("knowledge.md");
    if (res.ok) {
      cachedMasterKnowledge = await res.text();
      console.log("✅ 已成功挂载《全景知识体系母卷》全文知识库！");
      return cachedMasterKnowledge;
    }
  } catch (e) {
    console.warn("未读取到外部 knowledge.md，将采用内置精炼工作坊准则", e);
  }
  return null;
}

/* ================= 1. Supabase 初始化与登录鉴权 ================= */
var DEFAULT_SB_URL = "https://owenzbyonahuzattostk.supabase.co";
var DEFAULT_SB_KEY = "sb_publishable_LZ8WvFjXLwWVjHaQ8gYr2A_ZJ3yAvgd";

function initSupabaseClient() {
  var url = localStorage.getItem("kb_supabase_url") || DEFAULT_SB_URL;
  var key = localStorage.getItem("kb_supabase_anon") || DEFAULT_SB_KEY;

  if (url && key && window.supabase) {
    try {
      sbClient = window.supabase.createClient(url, key);
      checkUserSession();
    } catch (e) {
      console.warn("Supabase 初始化异常", e);
    }
  } else {
    updateAuthUI(null);
  }
}

async function checkUserSession() {
  if (!sbClient) return;
  var { data } = await sbClient.auth.getSession();
  if (data && data.session) {
    currentUser = data.session.user;
    updateAuthUI(currentUser);
    await syncCloudSecrets();
    await refreshSupabaseData();
  } else {
    updateAuthUI(null);
  }
}

function updateAuthUI(user) {
  var indicator = document.getElementById("authIndicator");
  var text = document.getElementById("authStatusText");
  var pill = document.getElementById("btnAuthPill");

  if (user) {
    if (indicator) indicator.className = "dot-indicator ready";
    if (text) text.innerText = user.email.split("@")[0];
    if (pill) pill.title = "讲师已连接: " + user.email + " (点击退出登录)";
  } else {
    if (indicator) indicator.className = "dot-indicator";
    if (text) text.innerText = "讲师登录";
    if (pill) pill.title = "讲师未登录 (点击登录解锁云端)";
  }
}

function openAuthModal() {
  if (currentUser) {
    if (
      confirm(
        "当前已登录讲师账号：" + currentUser.email + "\n确定要退出登录吗？",
      )
    ) {
      sbClient.auth.signOut().then(function () {
        currentUser = null;
        updateAuthUI(null);
        alert("已成功登出");
      });
    }
  } else {
    openDialog("dialogAuth");
  }
}

async function executeLecturerLogin() {
  if (!sbClient) {
    alert(
      "请先在右上角【工具箱 ➜ AI 引擎与数据库配置】中填入您的 Supabase Project URL 与 Anon Key！",
    );
    closeDialog("dialogAuth");
    openUnifiedSettingsModal();
    return;
  }
  var email = document.getElementById("inpAuthEmail").value.trim();
  var password = document.getElementById("inpAuthPassword").value.trim();

  if (!email || !password) return alert("请完整输入邮箱和密码");

  var btn = document.getElementById("btnExecuteLogin");
  btn.innerText = "正在验证...";
  btn.disabled = true;

  try {
    var { data, error } = await sbClient.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
    currentUser = data.user;
    updateAuthUI(currentUser);
    closeDialog("dialogAuth");
    alert("讲师登录成功！已解锁受众档案库并载入云端配置。");
    await syncCloudSecrets();
    await refreshSupabaseData();
  } catch (err) {
    alert("登录失败: " + (err.message || "账号或密码不正确"));
  } finally {
    btn.innerText = "登录并连接";
    btn.disabled = false;
  }
}

async function syncCloudSecrets() {
  if (!sbClient || !currentUser) return;
  try {
    var { data, error } = await sbClient
      .from("system_secrets")
      .select("config_key, config_value");
    if (!error && data) {
      data.forEach(function (item) {
        if (item.config_key === "llm_api_key" && item.config_value) {
          localStorage.setItem(
            "kinbaku_cloud_api_key",
            item.config_value.trim(),
          );
        }
        if (item.config_key === "llm_endpoint" && item.config_value) {
          localStorage.setItem(
            "kinbaku_api_endpoint",
            item.config_value.trim(),
          );
        }
        if (item.config_key === "llm_model" && item.config_value) {
          localStorage.setItem("kinbaku_api_model", item.config_value.trim());
        }
      });
    }
  } catch (e) {
    console.warn("拉取云端机密失败", e);
  }
}

/* ================= 2. 备课三步流 ================= */
function openPrepDrawer() {
  populateAudiencePicker();
  populateModelPicker();
  openDialog("dialogPrep");
}

function populateAudiencePicker() {
  var picker = document.getElementById("selAudiencePicker");
  if (!picker) return;
  picker.innerHTML =
    '<option value="">-- 选择已有学员 / 工作坊群像 --</option>' +
    cachedStudents
      .map(function (s) {
        var isCur = currentStudent && currentStudent.id === s.id;
        return (
          '<option value="' +
          s.id +
          '" ' +
          (isCur ? "selected" : "") +
          ">" +
          s.name +
          " (" +
          (s.level_stage || "在学") +
          ")</option>"
        );
      })
      .join("");
  updateAudienceSummaryCard();
}

function onAudienceSelectChanged() {
  var picker = document.getElementById("selAudiencePicker");
  var sId = picker.value;
  if (!sId) {
    currentStudent = null;
    var label = document.getElementById("labelCurrentStudent");
    if (label) label.innerText = "学员档案库";
  } else {
    currentStudent = cachedStudents.find(function (x) {
      return x.id === sId;
    });
    var label = document.getElementById("labelCurrentStudent");
    if (label && currentStudent) label.innerText = currentStudent.name;
  }
  updateAudienceSummaryCard();
}

function updateAudienceSummaryCard() {
  var card = document.getElementById("audienceSummaryCard");
  if (!card) return;
  if (currentStudent) {
    card.innerHTML =
      "<strong>" +
      currentStudent.name +
      "</strong> (" +
      (currentStudent.level_stage || "阶段未标") +
      ")<br>" +
      "<strong>发力短板/通病：</strong>" +
      (currentStudent.habits_bottlenecks || "暂未录入短板") +
      "<br>" +
      '<span style="color: var(--muted); font-size: 0.72rem;">长期目标：' +
      (currentStudent.learning_goals || "无") +
      "</span>";
  } else {
    card.innerHTML =
      '<span style="color: var(--muted);">💡 请在上方选择或新建学员。AI 将调取该画像的发力习惯与短板，输出针对性带练口令。</span>';
  }
}

function populateModelPicker() {
  var picker = document.getElementById("selModelPicker");
  if (!picker) return;
  picker.innerHTML =
    '<option value="">-- 通用生理安全防护 (未指定特定模特) --</option>' +
    cachedModels
      .map(function (m) {
        var isCur = currentModel && currentModel.id === m.id;
        return (
          '<option value="' +
          m.id +
          '" ' +
          (isCur ? "selected" : "") +
          ">模特: " +
          m.name +
          " (" +
          (m.relation_type || "搭档") +
          ")</option>"
        );
      })
      .join("");
  updateModelSummaryCard();
}

function onModelSelectChanged() {
  var picker = document.getElementById("selModelPicker");
  var mId = picker.value;
  if (!mId) {
    currentModel = null;
  } else {
    currentModel = cachedModels.find(function (x) {
      return x.id === mId;
    });
  }
  updateModelSummaryCard();
}

function updateModelSummaryCard() {
  var card = document.getElementById("modelSummaryCard");
  if (!card) return;
  if (currentModel) {
    card.innerHTML =
      "<strong>搭档模特：" +
      currentModel.name +
      "</strong> (" +
      (currentModel.relation_type || "练习搭档") +
      ")<br>" +
      "• <strong>关节超伸/受限：</strong>" +
      (currentModel.joints_mobility || "正常") +
      "<br>" +
      "• <strong>神经循环/禁忌：</strong>" +
      (currentModel.nerve_circulation || "正常") +
      "<br>" +
      "• <strong>安全词/退潮偏好：</strong>" +
      (currentModel.psychology_aftercare || "常规交流");
  } else {
    card.innerHTML =
      '<span style="color: var(--muted);">🛡️ 当前启用《通用生理安全基准准则》：上臂桡神经三角区净空、掐甲充血测试 &lt; 2 秒。</span>';
  }
}

function commitPrepData() {
  courseStore.topic = document.getElementById("inpTopic").value.trim();
  courseStore.schedule = document.getElementById("inpSchedule").value.trim();
  courseStore.goals = document.getElementById("inpGoals").value.trim();
  courseStore.prereq = document.getElementById("inpPrereq").value.trim();
  courseStore.saved = !!courseStore.topic;

  modelStore.todayNotes = document
    .getElementById("inpModelTodayNotes")
    .value.trim();

  localStorage.setItem("kinbaku_prep_course", JSON.stringify(courseStore));
  refreshIndicators();
  closeDialog("dialogPrep");
}

function clearPrepData() {
  if (confirm("确定要清空当前的授课筹备信息吗？")) {
    courseStore = {
      topic: "",
      schedule: "",
      profile: "",
      goals: "",
      prereq: "",
      saved: false,
    };
    document.getElementById("inpTopic").value = "";
    document.getElementById("inpSchedule").value = "";
    document.getElementById("inpGoals").value = "";
    document.getElementById("inpPrereq").value = "";
    document.getElementById("inpModelTodayNotes").value = "";
    localStorage.removeItem("kinbaku_prep_course");
    refreshIndicators();
  }
}

/* ================= 3. 学员与模特档案库 ================= */
function openStudentHub() {
  if (!currentUser) {
    if (
      confirm("学员档案库需要讲师登录以保障学员与模特隐私。\n是否立即登录？")
    ) {
      openAuthModal();
    }
    return;
  }
  openDialog("dialogStudentHub");
  renderStudentList();
  renderModelList();
}

async function refreshSupabaseData() {
  if (!sbClient || !currentUser) return;
  try {
    var [resS, resM] = await Promise.all([
      sbClient
        .from("students")
        .select("*")
        .order("created_at", { ascending: false }),
      sbClient
        .from("models")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    if (resS.data) cachedStudents = resS.data;
    if (resM.data) cachedModels = resM.data;
    renderStudentList();
    renderModelList();
    populateAudiencePicker();
    populateModelPicker();
    if (currentStudent) {
      loadStudentPlans(currentStudent.id);
    }
  } catch (err) {
    console.error("刷新云端数据失败", err);
  }
}

function switchHubTab(tabIdx) {
  for (var i = 1; i <= 3; i++) {
    document.getElementById("tabHubContent" + i).style.display =
      i === tabIdx ? "flex" : "none";
    document.getElementById("tabHubBtn" + i).className =
      i === tabIdx ? "tab-btn active" : "tab-btn";
  }
}

function renderStudentList() {
  var box = document.getElementById("studentListContainer");
  if (!cachedStudents.length) {
    box.innerHTML =
      '<div style="text-align: center; color: var(--muted); padding: 2rem 0;">暂无学员档案，点击右上角【+ 录入新学员画像】创建</div>';
    return;
  }
  box.innerHTML = cachedStudents
    .map(function (s) {
      var isSelected = currentStudent && currentStudent.id === s.id;
      return (
        '<div class="item-card ' +
        (isSelected ? "active" : "") +
        '" onclick="selectStudentById(\'' +
        s.id +
        "')\">" +
        '<div class="item-card-header">' +
        '<span class="item-card-title"><svg class="svg-icon" style="width: 1em; height: 1em;" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        s.name +
        "</span>" +
        '<span class="item-card-badge">' +
        (s.level_stage || "学员画像") +
        "</span>" +
        "</div>" +
        '<div class="item-card-desc"><strong>发力习惯/短板：</strong>' +
        (s.habits_bottlenecks || "暂未录入") +
        "</div>" +
        '<div class="item-card-actions" onclick="event.stopPropagation()">' +
        '<span class="action-link" onclick="openStudentFormModal(\'' +
        s.id +
        "')\">编辑画像</span>" +
        '<span class="action-link" onclick="selectStudentById(\'' +
        s.id +
        "')\">查看该学员教案史 ➔</span>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

function selectStudentById(id) {
  var s = cachedStudents.find(function (x) {
    return x.id === id;
  });
  if (!s) return;
  currentStudent = s;

  var label = document.getElementById("labelCurrentStudent");
  if (label) label.innerText = s.name;

  populateAudiencePicker();

  var sumBox = document.getElementById("selectedStudentSummary");
  sumBox.innerHTML =
    '<div style="text-align: left; font-size: 0.85rem;">' +
    '学员：<strong style="font-size: 1rem; color: var(--accent);">' + s.name + '</strong>' +
    '</div>';

  switchHubTab(2);
  loadStudentPlans(s.id);
  renderStudentList();
}

function formatPlanDateTime(isoStr) {
  if (!isoStr) return "";
  var d = new Date(isoStr);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  var hh = String(d.getHours()).padStart(2, "0");
  var mm = String(d.getMinutes()).padStart(2, "0");
  return y + "/" + m + "/" + day + " " + hh + ":" + mm;
}

async function loadStudentPlans(studentId) {
  var box = document.getElementById("planListContainer");
  box.innerHTML =
    '<div style="text-align: center; color: var(--muted); padding: 2rem 0;">正在读取教案史...</div>';
  try {
    var { data, error } = await sbClient
      .from("teaching_plans")
      .select("*, models(name)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || !data.length) {
      box.innerHTML =
        '<div style="text-align: center; color: var(--muted); padding: 2rem 0;">该学员尚无教案记录，点击右上角【+ 制定新教案】开始备课</div>';
      return;
    }
    box.innerHTML = data
      .map(function (p) {
        var dateStr = formatPlanDateTime(p.created_at);
        var modelName = p.models ? p.models.name : "通用生理防护";
        var goalsText = p.learning_goals
          ? p.learning_goals
          : "未单独录入突破目标";

        return (
          '<div class="item-card" onclick="loadHistoricalPlan(\'' +
          p.id +
          "')\">" +
          '<div class="item-card-header">' +
          '<span class="item-card-title">' +
          p.topic +
          "</span>" +
          '<span class="item-card-badge">' +
          dateStr +
          "</span>" +
          "</div>" +
          '<div class="item-card-desc"><strong>搭档模特：</strong>' +
          modelName +
          " | <strong>课时排期：</strong>" +
          (p.schedule || "常规课时") +
          "</div>" +
          '<div class="item-card-goals">' +
          "<strong>设定突破目标：</strong>" +
          goalsText +
          "</div>" +
          '<div class="item-card-actions" onclick="event.stopPropagation()">' +
          '<span class="action-link action-link-danger" onclick="deleteTeachingPlan(\'' +
          p.id +
          "', '" +
          encodeURIComponent(p.topic) +
          "')\">删除当前教案</span>" +
          '<span class="action-link" style="color: var(--accent);" onclick="loadHistoricalPlan(\'' +
          p.id +
          "')\">载入教案台阅读 ➔</span>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  } catch (err) {
    box.innerHTML =
      '<div style="color: red; padding: 1rem 0;">读取失败: ' +
      err.message +
      "</div>";
  }
}

async function deleteTeachingPlan(planId, topicEncoded) {
  var topic = decodeURIComponent(topicEncoded || "此教案");
  if (
    !confirm("确定要在云端彻底删除教案【" + topic + "】吗？\n删除后不可恢复。")
  ) {
    return;
  }
  try {
    var { error } = await sbClient
      .from("teaching_plans")
      .delete()
      .eq("id", planId);
    if (error) throw error;
    alert("教案已成功从云端删除！");
    if (currentStudent) {
      loadStudentPlans(currentStudent.id);
    }
  } catch (err) {
    alert("删除教案失败: " + err.message);
  }
}

async function loadHistoricalPlan(planId) {
  try {
    var { data, error } = await sbClient
      .from("teaching_plans")
      .select("*")
      .eq("id", planId)
      .single();
    if (error) throw error;
    if (data) {
      document.getElementById("inpTopic").value = data.topic;
      document.getElementById("inpSchedule").value = data.schedule || "";
      if (document.getElementById("inpGoals")) {
        document.getElementById("inpGoals").value = data.learning_goals || "";
      }
      courseStore.topic = data.topic;
      courseStore.schedule = data.schedule || "";
      courseStore.goals = data.learning_goals || "";
      renderMarkdownToScreen(data.plan_content);
      closeDialog("dialogStudentHub");
      alert("已成功载入教案：" + data.topic);
    }
  } catch (e) {
    alert("载入教案失败: " + e.message);
  }
}

function renderModelList() {
  var box = document.getElementById("modelListContainer");
  if (!cachedModels.length) {
    box.innerHTML =
      '<div style="text-align: center; color: var(--muted); padding: 2rem 0;">暂无模特档案，点击【+ 录入新模特档案】创建</div>';
    return;
  }
  box.innerHTML = cachedModels
    .map(function (m) {
      return (
        '<div class="item-card">' +
        '<div class="item-card-header">' +
        '<span class="item-card-title">' +
        m.name +
        "</span>" +
        '<span class="item-card-badge">' +
        (m.relation_type || "练习搭档") +
        "</span>" +
        "</div>" +
        '<div class="item-card-desc"><strong>关节活动/超伸：</strong>' +
        (m.joints_mobility || "正常") +
        "</div>" +
        '<div class="item-card-desc"><strong>神经循环/禁忌：</strong>' +
        (m.nerve_circulation || "正常") +
        "</div>" +
        '<div class="item-card-actions">' +
        '<span class="action-link" onclick="openModelFormModal(\'' +
        m.id +
        "')\">编辑此档案</span>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

function startNewPlanForCurrentStudent() {
  if (!currentStudent) return alert("请先选择一位学员");
  document.getElementById("inpTopic").value = "";
  document.getElementById("inpGoals").value = "";
  document.getElementById("inpPrereq").value = "";
  closeDialog("dialogStudentHub");
  openPrepDrawer();
}

/* ================= 4. 受众与模特表单 CRUD ================= */
function openStudentFormModal(studentId) {
  var title = document.getElementById("lblStudentFormTitle");
  var idInp = document.getElementById("editStudentId");
  if (studentId) {
    title.innerText = "修改学员画像档案";
    var s = cachedStudents.find(function (x) {
      return x.id === studentId;
    });
    idInp.value = s.id;
    document.getElementById("formStudentName").value = s.name;
    document.getElementById("formStudentLevel").value = s.level_stage || "";
    document.getElementById("formStudentBottlenecks").value =
      s.habits_bottlenecks || "";
    document.getElementById("formStudentGoals").value = s.learning_goals || "";
    document.getElementById("formStudentContact").value = s.contact_notes || "";
  } else {
    title.innerText = "录入学员画像档案";
    idInp.value = "";
    document.getElementById("formStudentName").value = "";
    document.getElementById("formStudentLevel").value = "";
    document.getElementById("formStudentBottlenecks").value = "";
    document.getElementById("formStudentGoals").value = "";
    document.getElementById("formStudentContact").value = "";
  }
  openDialog("dialogStudentForm");
}

async function submitStudentForm() {
  var id = document.getElementById("editStudentId").value;
  var name = document.getElementById("formStudentName").value.trim();
  if (!name) return alert("请输入学员或群像名称");

  var payload = {
    name: name,
    level_stage: document.getElementById("formStudentLevel").value.trim(),
    habits_bottlenecks: document
      .getElementById("formStudentBottlenecks")
      .value.trim(),
    learning_goals: document.getElementById("formStudentGoals").value.trim(),
    contact_notes: document.getElementById("formStudentContact").value.trim(),
  };

  try {
    if (id) {
      await sbClient.from("students").update(payload).eq("id", id);
    } else {
      await sbClient.from("students").insert([payload]);
    }
    closeDialog("dialogStudentForm");
    await refreshSupabaseData();
    alert("学员档案保存成功！");
  } catch (e) {
    alert("保存失败: " + e.message);
  }
}

function openModelFormModal(modelId) {
  var title = document.getElementById("lblModelFormTitle");
  var idInp = document.getElementById("editModelId");
  if (modelId) {
    title.innerText = "修改模特身心档案";
    var m = cachedModels.find(function (x) {
      return x.id === modelId;
    });
    idInp.value = m.id;
    document.getElementById("formModelName").value = m.name;
    document.getElementById("formModelRelation").value = m.relation_type || "";
    document.getElementById("formModelJoints").value = m.joints_mobility || "";
    document.getElementById("formModelNerve").value = m.nerve_circulation || "";
    document.getElementById("formModelInjury").value = m.injury_history || "";
    document.getElementById("formModelPsychology").value =
      m.psychology_aftercare || "";
  } else {
    title.innerText = "录入新模特档案";
    idInp.value = "";
    document.getElementById("formModelName").value = "";
    document.getElementById("formModelRelation").value = "";
    document.getElementById("formModelJoints").value = "";
    document.getElementById("formModelNerve").value = "";
    document.getElementById("formModelInjury").value = "";
    document.getElementById("formModelPsychology").value = "";
  }
  openDialog("dialogModelForm");
}

async function submitModelForm() {
  var id = document.getElementById("editModelId").value;
  var name = document.getElementById("formModelName").value.trim();
  if (!name) return alert("请输入模特姓名/代号");

  var payload = {
    name: name,
    relation_type: document.getElementById("formModelRelation").value.trim(),
    joints_mobility: document.getElementById("formModelJoints").value.trim(),
    nerve_circulation: document.getElementById("formModelNerve").value.trim(),
    injury_history: document.getElementById("formModelInjury").value.trim(),
    psychology_aftercare: document
      .getElementById("formModelPsychology")
      .value.trim(),
  };

  try {
    if (id) {
      await sbClient.from("models").update(payload).eq("id", id);
    } else {
      await sbClient.from("models").insert([payload]);
    }
    closeDialog("dialogModelForm");
    await refreshSupabaseData();
    alert("模特档案保存成功！");
  } catch (e) {
    alert("保存失败: " + e.message);
  }
}

/* ================= 5. 一键归档当前教案至云端 ================= */
async function saveCurrentPlanToSupabase() {
  if (!sbClient || !currentUser) {
    alert("请先登录讲师账号后方可将教案存入云端！");
    openAuthModal();
    return;
  }
  if (!currentLectureText.trim()) {
    return alert("当前暂无生成的教案正文");
  }
  if (!currentStudent) {
    var pick = prompt(
      "请指定本篇教案所属的学员名称 (或在【学员档案库】中选定)：",
    );
    if (!pick) return;
    var found = cachedStudents.find(function (s) {
      return s.name === pick.trim();
    });
    if (found) {
      currentStudent = found;
    } else {
      alert("未找到名为【" + pick + "】的学员，请先在档案库中建档。");
      return;
    }
  }

  var topic =
    courseStore.topic ||
    document.getElementById("inpTopic").value.trim() ||
    "专业绳缚综合进阶实操";
  var schedule =
    courseStore.schedule ||
    document.getElementById("inpSchedule").value.trim() ||
    "1对1私教";
  var goals =
    courseStore.goals ||
    (document.getElementById("inpGoals")
      ? document.getElementById("inpGoals").value.trim()
      : "");
  var modelPickerVal = document.getElementById("selModelPicker")
    ? document.getElementById("selModelPicker").value
    : null;

  var planPayload = {
    student_id: currentStudent.id,
    model_id: modelPickerVal || null,
    topic: topic,
    schedule: schedule,
    learning_goals: goals,
    plan_content: currentLectureText,
    quick_notes: "",
  };

  try {
    var { error } = await sbClient.from("teaching_plans").insert([planPayload]);

    if (error) {
      if (error.message && error.message.indexOf("learning_goals") !== -1) {
        delete planPayload.learning_goals;
        var retry = await sbClient.from("teaching_plans").insert([planPayload]);
        if (retry.error) throw retry.error;
        alert(
          "教案已保存！\n（注意：检测到云端 teaching_plans 表未添加 learning_goals 列，教学目标未能单独留存，请在 Supabase SQL 执行升级指令）",
        );
        return;
      }
      throw error;
    }
    alert("教案已成功归档到学员【" + currentStudent.name + "】的云端档案库！");
  } catch (err) {
    alert("保存至云端失败: " + err.message);
  }
}

/* ================= 6. 弹窗与设置控制 ================= */
function openDialog(id) {
  document.getElementById(id).style.display = "flex";
}
function closeDialog(id) {
  document.getElementById(id).style.display = "none";
}

function openUnifiedSettingsModal() {
  document.getElementById("sbProjectUrlInput").value =
    localStorage.getItem("kb_supabase_url") || DEFAULT_SB_URL;
  document.getElementById("sbAnonKeyInput").value =
    localStorage.getItem("kb_supabase_anon") || DEFAULT_SB_KEY;

  document.getElementById("apiEndpointInput").value =
    localStorage.getItem("kinbaku_api_endpoint") || "";
  document.getElementById("apiKeyInput").value =
    localStorage.getItem("kinbaku_api_key") || "";
  document.getElementById("apiModelInput").value =
    localStorage.getItem("kinbaku_api_model") || "";

  document.getElementById("sysPromptPart1").value =
    localStorage.getItem("kinbaku_prompt_p1") || DEFAULT_PROMPTS.p1;
  document.getElementById("sysPromptPart2").value =
    localStorage.getItem("kinbaku_prompt_p2") || DEFAULT_PROMPTS.p2;
  document.getElementById("sysPromptPart3").value =
    localStorage.getItem("kinbaku_prompt_p3") || DEFAULT_PROMPTS.p3;
  document.getElementById("sysPromptPart4").value =
    localStorage.getItem("kinbaku_prompt_p4") || DEFAULT_PROMPTS.p4;

  switchSettingsMainTab(1);
  openDialog("dialogSettings");
}

function switchSettingsMainTab(tabIdx) {
  for (var i = 1; i <= 3; i++) {
    document.getElementById("tabMainSetContent" + i).style.display =
      i === tabIdx ? "flex" : "none";
    document.getElementById("tabMainSetBtn" + i).className =
      i === tabIdx ? "tab-btn active" : "tab-btn";
  }
  if (tabIdx === 3) switchPromptTab(1);
}

function switchPromptTab(tabIdx) {
  activePromptTab = tabIdx;
  for (var i = 1; i <= 4; i++) {
    document.getElementById("tabPromptBox" + i).style.display =
      i === tabIdx ? "flex" : "none";
    document.getElementById("tabPromptBtn" + i).className =
      i === tabIdx ? "tab-btn active" : "tab-btn";
  }
}

function resetAllPromptTabs() {
  if (confirm("确定要将全部提示词模块恢复为代码中的最新标准吗？")) {
    for (var i = 1; i <= 4; i++) {
      document.getElementById("sysPromptPart" + i).value =
        DEFAULT_PROMPTS["p" + i];
      localStorage.removeItem("kinbaku_prompt_p" + i);
    }
    alert("已成功恢复为代码最新指令集！");
  }
}

function commitUnifiedSettings() {
  var url = document.getElementById("sbProjectUrlInput").value.trim();
  var anon = document.getElementById("sbAnonKeyInput").value.trim();
  localStorage.setItem("kb_supabase_url", url);
  localStorage.setItem("kb_supabase_anon", anon);

  localStorage.setItem(
    "kinbaku_api_endpoint",
    document.getElementById("apiEndpointInput").value.trim(),
  );
  localStorage.setItem(
    "kinbaku_api_key",
    document.getElementById("apiKeyInput").value.trim(),
  );
  localStorage.setItem(
    "kinbaku_api_model",
    document.getElementById("apiModelInput").value.trim(),
  );

  localStorage.setItem(
    "kinbaku_prompt_p1",
    document.getElementById("sysPromptPart1").value.trim(),
  );
  localStorage.setItem(
    "kinbaku_prompt_p2",
    document.getElementById("sysPromptPart2").value.trim(),
  );
  localStorage.setItem(
    "kinbaku_prompt_p3",
    document.getElementById("sysPromptPart3").value.trim(),
  );
  localStorage.setItem(
    "kinbaku_prompt_p4",
    document.getElementById("sysPromptPart4").value.trim(),
  );

  initSupabaseClient();
  closeDialog("dialogSettings");
  alert("系统端点与全部配置已保存！");
}

function toggleDropdown(e, panelId) {
  e.stopPropagation();
  var targetPanel = document.getElementById(panelId);
  var isAlreadyOpen = targetPanel.classList.contains("show");
  closeAllDropdowns();
  if (!isAlreadyOpen) targetPanel.classList.add("show");
}

function closeAllDropdowns() {
  var allPanels = document.querySelectorAll(".dropdown-panel");
  for (var i = 0; i < allPanels.length; i++)
    allPanels[i].classList.remove("show");
}

document.addEventListener("click", function (e) {
  if (
    e.target.closest(".dropdown-opt") ||
    !e.target.closest(".dropdown-container")
  )
    closeAllDropdowns();
});

function restoreLocalCache() {
  try {
    var c = localStorage.getItem("kinbaku_prep_course");
    if (c) {
      courseStore = JSON.parse(c);
      document.getElementById("inpTopic").value = courseStore.topic || "";
      document.getElementById("inpSchedule").value = courseStore.schedule || "";
      document.getElementById("inpGoals").value = courseStore.goals || "";
      document.getElementById("inpPrereq").value = courseStore.prereq || "";
    }
    var doc = localStorage.getItem("kinbaku_doc_ai");
    if (doc) {
      renderMarkdownToScreen(doc);
    }
  } catch (e) {}
}

function refreshIndicators() {
  var dot = document.getElementById("indicatorStatus");
  if (courseStore.saved) {
    dot.className = "dot-indicator ready";
  } else {
    dot.className = "dot-indicator";
  }
}

function applyApiPreset(type) {
  if (type === "siliconflow") {
    document.getElementById("apiEndpointInput").value =
      "https://api.siliconflow.cn/v1/chat/completions";
    document.getElementById("apiModelInput").value = "deepseek-ai/DeepSeek-V3";
    alert("已应用【硅基流动】预设端点！");
  } else if (type === "gemini") {
    document.getElementById("apiEndpointInput").value =
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    document.getElementById("apiModelInput").value = "gemini-1.5-flash";
    alert("已应用【Google Gemini】预设端点！");
  }
}

/* ================= 7. 宗师教案生成引擎 ================= */
async function executeGeneration() {
  if (
    !courseStore.saved &&
    !courseStore.topic &&
    !document.getElementById("inpTopic").value.trim()
  ) {
    alert("请先点击右上角【本期授课筹备】设置本次课题与目标！");
    openPrepDrawer();
    return;
  }

  courseStore.topic = document.getElementById("inpTopic").value.trim();
  courseStore.schedule =
    document.getElementById("inpSchedule").value.trim() || "1对1私教 2.0小时";
  courseStore.goals = document.getElementById("inpGoals").value.trim();
  courseStore.prereq = document.getElementById("inpPrereq").value.trim();
  modelStore.todayNotes = document
    .getElementById("inpModelTodayNotes")
    .value.trim();

  if (isRawEditorOn) forceExitRawEditor();

  var btn = document.getElementById("btnRunGenerate");
  btn.innerHTML =
    '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>推演中...</span>';
  btn.disabled = true;

  document.getElementById("emptyPlaceholder").style.display = "none";
  document.getElementById("renderedDocTarget").style.display = "none";
  var loadingStage = document.getElementById("aiLoadingStage");
  loadingStage.style.display = "flex";

  aiSecondsElapsed = 0;
  var timerText = document.getElementById("aiTimerCounterText");
  var progressBar = document.getElementById("aiProgressBar");
  var stepNarrator = document.getElementById("aiStepNarrator");

  progressBar.style.width = "8%";
  timerText.innerText = "已耗时: 00 秒 | 正在连接大模型";

  aiTimerInterval = setInterval(function () {
    aiSecondsElapsed++;
    var secStr =
      aiSecondsElapsed < 10 ? "0" + aiSecondsElapsed : "" + aiSecondsElapsed;
    timerText.innerText = "已耗时: " + secStr + " 秒 | 宗师模型推演中";
    if (aiSecondsElapsed <= 15)
      progressBar.style.width = 8 + aiSecondsElapsed * 5 + "%";
    if (aiSecondsElapsed === 3)
      stepNarrator.innerText =
        "正在调阅知识库母卷，编织前置技能摸底与认知诊断...";
    else if (aiSecondsElapsed === 8)
      stepNarrator.innerText = "正在提取工作坊实操走绳线路与动作纠偏口令流...";
    else if (aiSecondsElapsed === 14)
      stepNarrator.innerText = "正在核对三大外周神经解剖红线与退潮复位清单...";
  }, 1000);

  try {
    var activeApiKey =
      localStorage.getItem("kinbaku_api_key") ||
      localStorage.getItem("kinbaku_cloud_api_key");
    if (activeApiKey) {
      await requestCloudLLM(activeApiKey);
    } else {
      await new Promise(function (r) {
        setTimeout(r, 600);
      });
      var doc = buildLocalKinbakuSyllabus();
      renderMarkdownToScreen(doc);
    }
    progressBar.style.width = "100%";
  } catch (err) {
    alert(
      "云端接口连接异常 (" +
        err.message +
        ")，已无缝降级为本地生理解剖库生成！",
    );
    var fallback = buildLocalKinbakuSyllabus();
    renderMarkdownToScreen(fallback);
  } finally {
    clearInterval(aiTimerInterval);
    btn.innerHTML =
      '<svg class="svg-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>生成教案</span>';
    btn.disabled = false;
  }
}

async function requestCloudLLM(apiKey) {
  var endpoint =
    localStorage.getItem("kinbaku_api_endpoint") ||
    "https://api.siliconflow.cn/v1/chat/completions";
  var modelName =
    localStorage.getItem("kinbaku_api_model") || "deepseek-ai/DeepSeek-V3";

  var fullMasterDoc = await loadMasterKnowledge();
  var p1 = localStorage.getItem("kinbaku_prompt_p1") || DEFAULT_PROMPTS.p1;
  var p2 = localStorage.getItem("kinbaku_prompt_p2") || DEFAULT_PROMPTS.p2;
  var p3 = localStorage.getItem("kinbaku_prompt_p3") || DEFAULT_PROMPTS.p3;
  var p4 = localStorage.getItem("kinbaku_prompt_p4") || DEFAULT_PROMPTS.p4;

  var combinedSystemPrompt = p1 + "\n\n" + p2 + "\n\n" + p3 + "\n\n" + p4;

  if (fullMasterDoc) {
    combinedSystemPrompt +=
      "\n\n========================================\n" +
      "【最高参考全景知识库（必须严格使用本库中的真实词汇与解剖规范，严禁编造任何本库未记载的玄学名词）】：\n" +
      "========================================\n\n" +
      fullMasterDoc;
  }

  var audienceContext = currentStudent
    ? "【授课受众画像】：" +
      currentStudent.name +
      " (" +
      (currentStudent.level_stage || "在学") +
      ")\n" +
      "- 既往发力习惯与短板瓶颈：" +
      (currentStudent.habits_bottlenecks || "暂未具体指定") +
      "\n" +
      "- 长期学习诉求：" +
      (currentStudent.learning_goals || "全面进阶")
    : "【授课受众画像】：具备常规走绳基础的学员，亟需纠正发力习惯、掌握身体重心带绳。";

  var modelContext = currentModel
    ? "【本次搭档模特身心档案】：" +
      currentModel.name +
      " (" +
      (currentModel.relation_type || "练习搭档") +
      ")\n" +
      "- 关节活动度/超伸受限：" +
      (currentModel.joints_mobility || "正常无超伸") +
      "\n" +
      "- 神经耐受/微循环注意：" +
      (currentModel.nerve_circulation || "正常") +
      "\n" +
      "- 既往伤病史/皮肤耐受：" +
      (currentModel.injury_history || "无特殊") +
      "\n" +
      "- 心理阈值/安全词：" +
      (currentModel.psychology_aftercare || "常规交流") +
      "\n" +
      (modelStore.todayNotes
        ? "- ⚠️ 本日临时状态特别提示：" + modelStore.todayNotes
        : "")
    : "【本次搭档模特】：通用生理安全基准（上臂桡神经三角区净空、手腕桡骨茎突无单绳硬剪切、每10分钟微循环掐甲测试）。" +
      (modelStore.todayNotes
        ? "\n- ⚠️ 本日临时状态特别提示：" + modelStore.todayNotes
        : "");

  var prereqContext = courseStore.prereq
    ? "【课前基础摸底与前置检查/注意事项】：\n" + courseStore.prereq
    : "【课前基础摸底与前置检查/注意事项】：课前检查学员基础双平结的紧实度与倒折自锁手感；摸底其对骨架支撑与身体重心带绳的认知。";

  var userPrompt =
    "【本次课程核心主题】：" +
    courseStore.topic +
    "\n" +
    "【授课排期与课时】：" +
    courseStore.schedule +
    "\n" +
    "【本期预期突破目标】：" +
    (courseStore.goals || "戒除蛮力拔河，建立自锁信任") +
    "\n\n" +
    audienceContext +
    "\n\n" +
    modelContext +
    "\n\n" +
    prereqContext +
    "\n\n" +
    "【核心强制要求】：\n" +
    "1. 本教案严禁通用化套词！必须深入结合上方提供的【搭档模特身心档案】（包括模特的关节受限、超伸情况、神经敏感区、既往伤病史以及本日临时状态），在教案的【现场实操带练口令流 (Verbal Cues)】中，至少设计 1~2 处讲师点名针对该模特身体弱点对学员大声喝止或纠正动作的实操口语！\n" +
    "2. 在【生理解剖与巡场必查清单】中，必须明确列出以该模特名字开头的专属避坑排查项（如避开特定受限关节、神经减压等）！\n" +
    "请严格遵循工作坊实操铁律与挂载的母卷全景知识库，输出一份言之有物、步骤地道、真正针对该学员与该模特生理特点的专业教案 Markdown。";

  var res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: combinedSystemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok)
    throw new Error(
      "API 端点返回错误 " + res.status + " (" + res.statusText + ")",
    );
  var data = await res.json();
  renderMarkdownToScreen(data.choices[0].message.content);
}

// 离线兜底降级教案
function buildLocalKinbakuSyllabus() {
  var topic = courseStore.topic || "现代绳缚受力平衡与手感纠偏";
  var schedule = courseStore.schedule || "1对1私教 2.0小时";
  var audName = currentStudent ? currentStudent.name : "标准学员画像";
  var prereq =
    courseStore.prereq ||
    "课前检查双平结打结扎实度，摸底其对后手缚受力的理解。";

  return (
    "# 教案方案：" +
    topic +
    "\n\n" +
    "> ⏱️ **教学形态**：" +
    schedule +
    " | **学员画像**：" +
    audName +
    " | **制定日期**：" +
    new Date().toLocaleDateString("zh-CN") +
    "\n\n" +
    "---\n\n" +
    "## Ⅰ. 课前 10 分钟：前置技能摸底与认知诊断\n" +
    "> 🗣️ **讲师现场提问与摸底口令**：\n" +
    "> “在正式走绳之前，先打一个标准平结我看看。注意看你的手腕——收紧绳圈时是靠手臂的死力往后拽，还是用身体重心的后坐力自然带紧？”\n\n" +
    "- **准入自查点**：" +
    prereq +
    "\n" +
    "- **认知纠偏**：若学员动作显露僵硬或手臂代偿，暂缓推进高位结构，先进行 5 分钟重心收绳徒手脱敏。\n\n" +
    "## Ⅱ. 核心走绳线路拆解与流派对比\n\n" +
    "| 对比维度 | 骨架自锁型走绳 | 肌肉顺应型走绳 |\n" +
    "| :--- | :--- | :--- |\n" +
    "| 张力建立 | 依赖绳圈自身摩擦咬合与倒折锁扣 | 顺应肌纤维走向渐进式收束 |\n" +
    "| 关节余量 | 保持恒定角度悬空搭接 | 引导肢体微屈消除超伸剪切 |\n\n" +
    "## Ⅲ. 现场实操带练口令流 (Verbal Cues)\n" +
    "> 🗣️ **发力纠偏现场说辞**：\n" +
    "> “学员双手离开绳尾，退后半步。看——现在的张力依靠的是绳圈彼此间的摩擦自锁，而不是你手臂肌肉的蛮力。把手掌贴在模特的背部，等她呼气、肩膀自然沉下去时，再顺势走下一圈。”\n\n" +
    "## Ⅳ. 巡场解剖安全检查清单\n" +
    "- [ ] 外周神经排查口诀执行：【桡管虎口，腕管中指尖，肘管小指环】\n" +
    "- [ ] 桡神经浅表三角区完全避让，无单点压迫，留有两指滑动余量\n" +
    "- [ ] 掐甲充血测试：按压指甲 2 秒内迅速恢复血色\n" +
    "- [ ] 观察锁骨上窝起伏，确认胸部主圈未妨碍深长通气\n" +
    "- [ ] 急救剪放置于讲师触手可及处\n\n" +
    "## Ⅴ. 逆向解绳程序与 Aftercare 退潮复位\n" +
    "1. **逆向解绳原则**：遵循“先解除高拉力辅助绳，最后拆解核心承重绳”，解绳过程保持手掌托扶，严禁暴力抽绳磨损皮肉。\n" +
    "2. **关节被动复位**：双手托住模特手肘与手腕关节，慢速顺时针做 3-5 次轻柔旋转。\n" +
    "3. **心理退潮与复盘问询**：递上温开水，给模特 5 分钟平躺缓冲，轻声问询：“在刚才绳结锁死时，呼吸节奏舒服吗？”记录反馈。\n"
  );
}

/* ================= 8. Markdown 渲染引擎 (双模原生结构) ================= */
function renderMarkdownToScreen(text) {
  var cleanText = text ? text.trim() : "";
  currentLectureText = cleanText;

  var placeholder = document.getElementById("emptyPlaceholder");
  var docBox = document.getElementById("renderedDocTarget");
  var rawBox = document.getElementById("sourceEditorBox");
  var loadingStage = document.getElementById("aiLoadingStage");
  var statusBadge = document.getElementById("cardStatusBadge");

  if (loadingStage) loadingStage.style.display = "none";
  if (rawBox) rawBox.value = cleanText;

  if (!cleanText) {
    localStorage.removeItem("kinbaku_doc_ai");
    if (placeholder) placeholder.style.display = "block";
    if (docBox) {
      docBox.style.display = "none";
      docBox.innerHTML = "";
    }
    if (rawBox) rawBox.style.display = "none";
    document.getElementById("labelStatus").innerText = "教案待生成";
    if (statusBadge) statusBadge.className = "badge-dot";
    return;
  }

  localStorage.setItem("kinbaku_doc_ai", cleanText);
  if (placeholder) placeholder.style.display = "none";
  if (docBox) {
    docBox.style.display = isRawEditorOn ? "none" : "block";

    // ① 将 $$ 流程转化为干净的链条容器
    var processedText = cleanText.replace(/\$\$(.*?)\$\$/gs, function (match, content) {
      var pureText = content.replace(/\\text\{([^}]+)\}/g, "$1").trim();
      if (/\\longrightarrow|\\rightarrow|->|→/.test(pureText)) {
        var steps = pureText.split(/\\longrightarrow|\\rightarrow|->|→/);
        var stepsHtml = '<div class="chain-flow-box">';
        steps.forEach(function (step, idx) {
          stepsHtml += '<span class="chain-node">' + step.trim() + '</span>';
          if (idx < steps.length - 1) {
            stepsHtml += '<span class="chain-arrow">➔</span>';
          }
        });
        stepsHtml += '</div>';
        return stepsHtml;
      }
      return match;
    });

    // ② 调用 Marked 解析
    docBox.innerHTML = window.marked ? marked.parse(processedText) : processedText;

    // ③ 双模自适应：PC 保留纯正原生紧凑表格，手机端伴生微型卡片
    docBox.querySelectorAll('table').forEach(function (tbl) {
      if (tbl.parentElement.classList.contains('pro-table-wrapper')) return;

      var headers = [];
      tbl.querySelectorAll('thead th').forEach(function (th) {
        headers.push(th.innerText.trim());
      });

      var flowContainer = document.createElement('div');
      flowContainer.className = 'pro-card-flow';

      tbl.querySelectorAll('tbody tr').forEach(function (tr) {
        var tds = tr.querySelectorAll('td');
        if (!tds.length) return;

        var card = document.createElement('div');
        card.className = 'pro-card-item';

        var badge = document.createElement('div');
        badge.className = 'pro-card-badge';
        badge.innerText = tds[0] ? tds[0].innerText.trim() : '';
        card.appendChild(badge);

        for (var i = 1; i < tds.length; i++) {
          var row = document.createElement('div');
          row.className = 'pro-card-row';

          var label = document.createElement('span');
          label.className = 'pro-card-label';
          label.innerText = (headers[i] || '详情') + '：';

          var val = document.createElement('span');
          val.className = 'pro-card-val';
          val.innerHTML = tds[i].innerHTML;

          row.appendChild(label);
          row.appendChild(val);
          card.appendChild(row);
        }
        flowContainer.appendChild(card);
      });

      var wrapper = document.createElement('div');
      wrapper.className = 'pro-table-wrapper';

      tbl.parentNode.insertBefore(wrapper, tbl);
      wrapper.appendChild(tbl);
      wrapper.appendChild(flowContainer);
    });

    // ④ 增强任务复选框样式
    docBox.querySelectorAll('input[type="checkbox"]').forEach(function (chk) {
      if (chk.parentElement) {
        chk.parentElement.classList.add("check-line-item");
      }
    });
  }

  document.getElementById("labelStatus").innerText =
    "教案已就绪 (" + new Date().toLocaleTimeString() + ")";
  if (statusBadge) statusBadge.className = "badge-dot active";
}

/* ================= 9. 编辑与提词大字模式 ================= */
function switchRawEditor() {
  var raw = document.getElementById("sourceEditorBox");
  var out = document.getElementById("renderedDocTarget");
  var placeholder = document.getElementById("emptyPlaceholder");
  var btnDock = document.getElementById("btnDockToggleEdit");
  var iconDock = document.getElementById("dockEditSvg");
  var textDock = document.getElementById("dockEditText");

  isRawEditorOn = !isRawEditorOn;
  if (isRawEditorOn) {
    raw.value = currentLectureText || "";
    raw.style.display = "block";
    if (out) out.style.display = "none";
    if (placeholder) placeholder.style.display = "none";
    if (textDock) textDock.innerText = "预览";
    if (btnDock) btnDock.classList.add("btn-active-toggle");
    if (iconDock)
      iconDock.innerHTML =
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  } else {
    currentLectureText = (raw.value || "").trim();
    raw.style.display = "none";
    if (textDock) textDock.innerText = "编辑";
    if (btnDock) btnDock.classList.remove("btn-active-toggle");
    if (iconDock)
      iconDock.innerHTML =
        '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>';
    renderMarkdownToScreen(currentLectureText);
  }
}

function forceExitRawEditor() {
  isRawEditorOn = false;
  var raw = document.getElementById("sourceEditorBox");
  if (raw) raw.style.display = "none";
  var btnDock = document.getElementById("btnDockToggleEdit");
  var iconDock = document.getElementById("dockEditSvg");
  var textDock = document.getElementById("dockEditText");
  if (textDock) textDock.innerText = "编辑";
  if (btnDock) btnDock.classList.remove("btn-active-toggle");
  if (iconDock)
    iconDock.innerHTML =
      '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>';
}

function onRawEditorChange() {
  currentLectureText = document.getElementById("sourceEditorBox").value;
  localStorage.setItem("kinbaku_doc_ai", currentLectureText);
}

function switchStageMode() {
  if (isRawEditorOn) {
    forceExitRawEditor();
    renderMarkdownToScreen(currentLectureText);
  }
  isStageModeOn = !isStageModeOn;
  var card = document.getElementById("articlePaper");
  var bar = document.getElementById("teleprompterBar");
  var dock = document.getElementById("bottomActionDock");

  if (isStageModeOn) {
    card.classList.add("stage-mode");
    bar.style.display = "flex";
    dock.style.display = "none";
  } else {
    card.classList.remove("stage-mode");
    bar.style.display = "none";
    dock.style.display = "flex";
  }
}

function switchTheme() {
  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "light" : "dark",
  );
  updateThemeSvg(!isDark);
}

function updateThemeSvg(isDark) {
  var svg = document.getElementById("themeSvg");
  if (!svg) return;
  if (isDark) {
    svg.innerHTML =
      '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  } else {
    svg.innerHTML =
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
}

function copyLectureContent() {
  if (!currentLectureText.trim()) return alert("当前暂无教案内容可复制");
  navigator.clipboard
    .writeText(currentLectureText)
    .then(function () {
      alert("教案 Markdown 内容已成功复制到剪贴板！");
    })
    .catch(function () {
      alert("复制失败，请手动全选复制。");
    });
}

function saveAsMarkdown() {
  if (!currentLectureText) return alert("当前没有可导出的教案");
  var blob = new Blob([currentLectureText], {
    type: "text/markdown;charset=utf-8",
  });
  triggerFileDownload(blob, "绳缚教案_" + makeDateStamp() + ".md");
}

function saveAsWord() {
  if (!currentLectureText) return alert("当前没有可导出的教案");
  var bodyHtml = document.getElementById("renderedDocTarget").innerHTML;
  var docPrefix =
    '\u003Chtml xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"\u003E\u003Chead\u003E\u003Cmeta charset="utf-8"\u003E\u003Ctitle\u003E教案\u003C/title\u003E\u003Cstyle\u003Ebody{font-family:"PingFang SC","Microsoft YaHei",sans-serif;font-size:11pt;line-height:1.7}h1{font-size:18pt;color:#991b1b;border-bottom:2pt solid #991b1b}h2{font-size:14pt;color:#b91c1c;border-left:4pt solid #b91c1c;padding-left:6pt}h3{font-size:12pt;color:#991b1b}h4{font-size:11pt;font-weight:bold;color:#333}table{border-collapse:collapse;width:100%;margin:10pt 0}th,td{border:1pt solid #cbd5e1;padding:6pt 8pt;text-align:left}th{background-color:#f1f5f9}blockquote{background:#fef3c7;border-left:4pt solid #d97706;padding:8pt}\u003C/style\u003E\u003C/head\u003E\u003Cbody\u003E';
  var docSuffix = "\u003C/body\u003E\u003C/html\u003E";
  var fullDocContent = docPrefix + bodyHtml + docSuffix;
  var blob = new Blob(["\ufeff" + fullDocContent], {
    type: "application/msword",
  });
  triggerFileDownload(blob, "绳缚教案_" + makeDateStamp() + ".doc");
}

function loadMarkdownFile(e) {
  var file = e.target.files && e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (evt) {
    if (isRawEditorOn) forceExitRawEditor();
    renderMarkdownToScreen(evt.target.result);
    closeAllDropdowns();
    alert("教案导入成功！");
  };
  reader.readAsText(file);
  e.target.value = "";
}

function appendQuickNote() {
  var note = prompt("请输入授课中即时想到的补充要点（将追加到教案末尾）：");
  if (note) {
    currentLectureText +=
      "\n\n> 📝 **授课即时速记 (" +
      new Date().toLocaleTimeString() +
      ")**：" +
      note +
      "\n";
    renderMarkdownToScreen(currentLectureText);
  }
}

function resetCurrentLecture() {
  if (confirm("确定要清空当前的教案正文吗？")) {
    if (isStageModeOn) switchStageMode();
    forceExitRawEditor();
    currentLectureText = "";
    var raw = document.getElementById("sourceEditorBox");
    if (raw) raw.value = "";
    renderMarkdownToScreen("");
    closeAllDropdowns();
  }
}

function triggerFileDownload(blob, filename) {
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function makeDateStamp() {
  var d = new Date();
  return (
    "" +
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0")
  );
}
