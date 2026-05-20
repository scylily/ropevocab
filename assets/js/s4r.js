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

      // 截图功能实现
      document.addEventListener('DOMContentLoaded', function () {
        const saveAsImageBtn = document.getElementById('saveAsImageBtn');

        if (saveAsImageBtn) {
          saveAsImageBtn.addEventListener('click', function () {
            // 获取确认页元素
            const confirmationPage = document.querySelector('.confirmation-page');

            // 显示加载提示
            const originalText = saveAsImageBtn.innerHTML;
            saveAsImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>正在生成图片...</span>';
            saveAsImageBtn.disabled = true;

            // 使用 html2canvas 截图
            html2canvas(confirmationPage, {
              scale: 2, // 提高图片质量
              useCORS: true,
              backgroundColor: '#ffffff',
              logging: false,
              allowTaint: true
            }).then(canvas => {
              // 将 canvas 转换为图片
              const image = canvas.toDataURL('image/png');

              // 创建下载链接
              const link = document.createElement('a');
              link.download = '绳缚体验确认单.png';
              link.href = image;

              // 触发下载
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // 在移动端，尝试使用其他方式保存
              if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                // 移动端可能无法直接下载，尝试显示图片让用户长按保存
                showMobileSaveOption(image);
              }

              // 恢复按钮状态
              saveAsImageBtn.innerHTML = originalText;
              saveAsImageBtn.disabled = false;

              // 显示成功提示
              showSuccessToast('图片已生成，请保存到相册');
            }).catch(error => {
              console.error('截图失败:', error);

              // 恢复按钮状态
              saveAsImageBtn.innerHTML = originalText;
              saveAsImageBtn.disabled = false;

              // 显示错误提示
              showErrorToast('截图失败，请重试');
            });
          });
        }

        // 移动端显示保存选项
        function showMobileSaveOption(imageUrl) {
          // 创建一个全屏的图片预览
          const overlay = document.createElement('div');
          overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
    `;

          // 创建图片
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.cssText = `
      max-width: 100%;
      max-height: 80%;
      border-radius: 10px;
    `;

          // 创建提示文字
          const hint = document.createElement('div');
          hint.textContent = '长按图片保存到相册';
          hint.style.cssText = `
      color: white;
      margin-top: 20px;
      font-size: 16px;
      text-align: center;
      background: rgba(139, 92, 246, 0.5);
      padding: 10px 20px;
      border-radius: 20px;
    `;

          // 创建关闭按钮
          const closeBtn = document.createElement('button');
          closeBtn.innerHTML = '<i class="fas fa-times"></i> 关闭';
          closeBtn.style.cssText = `
      margin-top: 20px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    `;

          // 点击关闭
          closeBtn.addEventListener('click', function () {
            document.body.removeChild(overlay);
          });

          // 点击背景关闭
          overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
              document.body.removeChild(overlay);
            }
          });

          // 添加到页面
          overlay.appendChild(img);
          overlay.appendChild(hint);
          overlay.appendChild(closeBtn);
          document.body.appendChild(overlay);
        }

        // 显示成功提示
        function showSuccessToast(message) {
          const toast = document.createElement('div');
          toast.textContent = message;
          toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;

          // 添加动画样式
          if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
            document.head.appendChild(style);
          }

          document.body.appendChild(toast);

          // 3秒后自动消失
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
              if (toast.parentNode) {
                document.body.removeChild(toast);
              }
            }, 300);
          }, 3000);
        }

        // 显示错误提示
        function showErrorToast(message) {
          const toast = document.createElement('div');
          toast.textContent = message;
          toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--danger);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;

          document.body.appendChild(toast);

          // 3秒后自动消失
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
              if (toast.parentNode) {
                document.body.removeChild(toast);
              }
            }, 300);
          }, 3000);
        }
      });
