// 身体部位数据
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
        { id: '无', name: '无', icon: 'fas fas fa-user-secret' }
      ];

      // 存储用户填写的数据
      let userFormData = {};

      // 初始化身体部位选择
      function initBodyPartSelectors() {
        const noTouchContainer = document.getElementById('noTouchAreas');
        const noBondageContainer = document.getElementById('noBondageAreas');

        bodyParts.forEach(part => {
          // 不希望被触碰
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

          // 不可捆绑
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

      // 更新隐藏输入框的值
      function updateHiddenInput(inputId, containerId) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(containerId);
        const selectedItems = container.querySelectorAll('.selected');

        const values = Array.from(selectedItems).map(item => {
          if (containerId === 'feelingTags') {
            return item.textContent;
          } else {
            return item.dataset.id;
          }
        });

        input.value = values.join(',');
      }

      // 收集所有表单数据
      function collectFormData() {
        const form = document.getElementById('ropeForm');
        const formData = new FormData(form);
        userFormData = {};

        // 收集所有表单字段
        for (let [key, value] of formData.entries()) {
          if (key === 'accepts') {
            if (!userFormData.accepts) userFormData.accepts = [];
            userFormData.accepts.push(value);
          } else {
            userFormData[key] = value;
          }
        }

        // 收集身体部位选择
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

        // 收集感受标签
        const feelingItems = document.querySelectorAll('.feeling-option input[type="checkbox"]:checked');
        userFormData.feelingItems = Array.from(feelingItems).map(item => ({
          value: item.value,
          text: item.nextElementSibling.querySelector('.option-title').textContent.trim(),
          desc: item.nextElementSibling.querySelector('.option-desc').textContent.trim()
        }));

        return userFormData;
      }


      // 显示确认页面
      function showConfirmation() {
        // 隐藏成功消息，显示确认页面
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('confirmationPage').style.display = 'block';

        // 填充确认页面的数据
        populateConfirmationPage();
      }

      // 填充确认页面
      function populateConfirmationPage() {
        // 安全须知确认
        document.getElementById('confSafety').innerHTML =
          `<p>✅ 我已确认理解并同意所有安全须知内容</p>`;

        // 基本信息
        document.getElementById('confNickname').innerHTML =
          `<p><strong>${userFormData.nickname || '未填写'}</strong></p>`;

        document.getElementById('confAdult').innerHTML =
          `<p>${userFormData.adult === 'yes' ? '是' : '否'}</p>`;

        document.getElementById('confMedical').innerHTML =
          `<p>${userFormData.medical_history || '无'}</p>`;

        document.getElementById('confPiercings').innerHTML =
          `<p>${userFormData.piercings || '无'}</p>`;

        // 安全词
        document.getElementById('confSafeword').innerHTML =
          `<p><strong>${userFormData.safeword || '未设置'}</strong></p>
                 <p class="form-help">在紧急情况下说出此安全词或做出安全动作，将无条件立即中止活动</p>`;

        // 裸露程度
        document.getElementById('confTopless').innerHTML =
          `<p>${userFormData.topless === 'accept' ? '接受上半身赤裸' : '不接受上半身赤裸'}</p>
                 <p class="form-help">注：下体私密部位需穿着内裤</p>`;

        // 痕迹接受度
        let marksHtml = `<p>${userFormData.marks === 'accept' ? '能接受痕迹' : '不能接受痕迹'}</p>`;
        if (userFormData.marks === 'not_accept' && userFormData.no_marks_areas) {
          marksHtml += `<p class="form-help">不可以留下痕迹的区域：${userFormData.no_marks_areas}</p>`;
        }
        document.getElementById('confMarks').innerHTML = marksHtml;

        // 获取并显示不可留痕的区域
        var noMarksAreas = document.getElementById('no_marks_areas').value;
        var confirmationNoMarksAreas = document.getElementById('confirmationNoMarksAreas');
        var noMarksAreasValue = document.getElementById('noMarksAreasValue');
        if (noMarksAreas && noMarksAreas.trim() !== '') {
          noMarksAreasValue.textContent = noMarksAreas;
          confirmationNoMarksAreas.style.display = 'block';
        } else {
          confirmationNoMarksAreas.style.display = 'none';
        }

        // 不希望被触碰的部位
        let noTouchHtml = '<ul>';
        if (userFormData.noTouchItems && userFormData.noTouchItems.length > 0) {
          userFormData.noTouchItems.forEach(item => {
            const part = bodyParts.find(p => p.id === item.id);
            noTouchHtml += `<li><i class="${part.icon}"></i> ${item.name}</li>`;
          });
        } else {
          noTouchHtml += '<li>无特殊限制</li>';
        }
        noTouchHtml += '</ul>';
        document.getElementById('confNoTouch').innerHTML = noTouchHtml;

        // 不可以被捆绑的部位
        let noBondageHtml = '<ul>';
        if (userFormData.noBondageItems && userFormData.noBondageItems.length > 0) {
          userFormData.noBondageItems.forEach(item => {
            const part = bodyParts.find(p => p.id === item.id);
            noBondageHtml += `<li><i class="${part.icon}"></i> ${item.name}</li>`;
          });
        } else {
          noBondageHtml += '<li>无特殊限制</li>';
        }
        noBondageHtml += '</ul>';
        document.getElementById('confNoBondage').innerHTML = noBondageHtml;

        // 疼痛相关偏好
        let painHtml = `<p>${userFormData.other_pain === 'yes' ? '希望体验除捆绑感外的其他疼痛' : '不希望体验其他疼痛'}</p>`;

        // 疼痛忍耐程度
        const painToleranceMap = {
          '恋痛': '恋痛',
          '不怕': '不怕',
          '轻微': '轻微',
          '完全不要': '完全不要'
        };
        painHtml += `<p>疼痛忍耐程度：<strong>${painToleranceMap[userFormData.pain_tolerance] || '未选择'}</strong></p>`;

        // 具体项目接受度
        if (userFormData.accepts && userFormData.accepts.length > 0) {
          painHtml += '<p>能接受的特定项目：</p><ul>';
          const acceptMap = {
            'hair_pulling': '拉头发',
            'slapping': '耳光',
            'spanking': 'SP',
            'thigh_rope': '股绳'
          };
          userFormData.accepts.forEach(accept => {
            painHtml += `<li><strong>${acceptMap[accept] || accept}</strong></li>`;
          });
          painHtml += '</ul>';
        }

        document.getElementById('confPain').innerHTML = painHtml;

        // 互动偏好
        let interactionHtml = `<p>接受拥抱：<strong>${userFormData.hug === 'yes' ? '是' : '否'}</strong></p>`;
        interactionHtml += `<p>喜欢"五感剥夺"玩法：<strong>${userFormData.sensory_deprivation === 'yes' ? '是' : '否'}</strong></p>`;

        // 蒙眼接受度
        const blindfoldMap = {
          '享受': '享受',
          '可以接受': '可以接受',
          '不接受（会不安）': '不接受（会不安）'
        };
        interactionHtml += `<p>蒙眼接受度：<strong>${blindfoldMap[userFormData.blindfold] || '未选择'}</strong></p>`;

        // 堵嘴接受度
        const gagMap = {
          '享受': '享受',
          '可以轻度接受': '可以轻度接受',
          '不接受': '不接受'
        };
        interactionHtml += `<p>堵嘴接受度：<strong>${gagMap[userFormData.gag] || '未选择'}</strong></p>`;

        // 呼吸控制接受度
        const breathControlMap = {
          'enjoy': '享受',
          'neck': '脖颈呼吸控制',
          'light': '轻度呼吸控制',
          'no': '不接受'
        };
        interactionHtml += `<p>呼吸控制接受度：<strong>${breathControlMap[userFormData.breath_control] || '未选择'}</strong></p>`;

        document.getElementById('confInteraction').innerHTML = interactionHtml;

        // 影像记录<strong>【未经允许不可对外流传】</strong>
        document.getElementById('confRecording').innerHTML =
          `<p><strong>${userFormData.recording === 'yes' ? '希望留下影像记录' : '不希望留下影像记录'}</strong></p>`;

        // 期望的感受
        let feelingsHtml = '<ul style="list-style-type: none; padding-left: 0;">';
        if (userFormData.feelingItems && userFormData.feelingItems.length > 0) {
          userFormData.feelingItems.forEach(item => {
            feelingsHtml += `
                       <p><strong>${item.value}</strong>`;
          });
        } else {
          feelingsHtml += '<li>无特殊偏好</li>';
        }
        feelingsHtml += '</ul>';
        document.getElementById('confFeelings').innerHTML = feelingsHtml;
      }

      // 返回修改
      function goBackToForm() {
        document.getElementById('confirmationPage').style.display = 'none';
        document.getElementById('formContent').style.display = 'block';
        document.querySelector('.status-bar').style.display = 'flex';
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

      // 表单提交处理
      document.getElementById('ropeForm').addEventListener('submit', function (e) {
        e.preventDefault();

        // 收集表单数据
        collectFormData();

        // 在实际使用中，这里会提交到Formspree

        // 现在先显示成功消息
        document.getElementById('formContent').style.display = 'none';
        document.querySelector('.status-bar').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';


        // 实际提交代码（取消注释并替换YOUR_FORM_ID后使用）
        /*
        const form = e.target;
        const formData = new FormData(form);

        fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
          .then(response => {
            if (response.ok) {
              document.getElementById('formContent').style.display = 'none';
              document.querySelector('.status-bar').style.display = 'none';
              document.getElementById('successMessage').style.display = 'block';
            } else {
              alert('提交失败，请稍后重试');
            }
          })
          .catch(error => {
            alert('提交失败，请检查网络连接');
          });
          */

      });

      // 页面加载完成后初始化
      document.addEventListener('DOMContentLoaded', function () {
        initBodyPartSelectors();
        // initFeelingTags();

        // 更新状态栏
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

/**
 * 适配微信与移动端的精简版长图生成与预览功能（参照 IBTI 方案）
 * @param {string} id - 需要截取的页面容器元素 ID
 */
function downloadS4RImage(id) {
  const element = document.getElementById(id) || document.body;

  // 1. 使用原生最简单的弹窗拦截，提示用户正在处理
  alert("正在生成精致长图，请稍候片刻并在点击[确定]后等待预览");

  // 2. 调用 html2canvas 渲染页面（确保页面已引入 html2canvas.min.js）
  html2canvas(element, {
    scale: 2,                  // 提升2倍清晰度，防止长图模糊
    backgroundColor: "#ffffff",// 强制白底，防止暗色模式或透明背景导致黑图
    useCORS: true              // 开启跨域图片支持
  }).then(canvas => {
    const imageData = canvas.toDataURL("image/png");

    // 3. 检查或一次性注入全屏遮罩及预览框（包含内联关闭逻辑）
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

    // 4. 将生成的图片数据塞入预览图，并将遮罩层显示出来
    const imgDisplay = document.getElementById('generated-image');
    imgDisplay.src = imageData;
    overlay.style.display = 'flex';

    console.log("S4R 长图生成成功");
  }).catch(err => {
    console.error("生成长图失败:", err);
  });
}
