// 网站配置
window.AI_SITES = {
  grok: {
    id: 'grok',
    urlMatch: 'grok.com',
    inputSelector: 'textarea',
    inputIndex: 0,  // 第一个匹配的元素
  },
  deepseek: {
    id: 'deepseek',
    urlMatch: 'deepseek.com',
    inputSelector: '#chat-input',
    inputIndex: 0,
  },
  doubao: {
    id: 'doubao',
    urlMatch: 'doubao.com',
    inputSelector: '[data-testid="chat_input_input"]',
    inputIndex: 0,
  }
};

// 源网站配置（用于发送消息的网站）
window.SOURCE_SITE = window.AI_SITES.grok;

// 目标网站配置（接收消息的网站）
window.TARGET_SITES = [window.AI_SITES.deepseek, window.AI_SITES.doubao]; 


// 检查当前是否在split.html页面中
if (window.location.href.includes(chrome.runtime.getURL('split.html'))) {
  console.log('Split page loaded');
  document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有iframe
    const frames = {};
    [...window.TARGET_SITES, window.SOURCE_SITE].forEach(site => {
      frames[site.id] = document.getElementById(site.id);
      console.log(`${site.id} frame initialized`);
    });

    // 为iframe注入脚本
    const injectScript = async (frame) => {
      try {
        const response = await fetch(chrome.runtime.getURL('inject.js'));
        const code = await response.text();
        const script = document.createElement('script');
        script.textContent = code;
        (frame.contentDocument || frame.contentWindow.document).head.appendChild(script);
      } catch (error) {
        console.error('Failed to inject script:', error);
      }
    };

    // 监听iframe加载完成后注入脚本
    Object.values(frames).forEach(frame => {
      frame.addEventListener('load', () => {
        console.log(`${frame.id} frame loaded, injecting script`);
        injectScript(frame);
      });
    });
  });
} else {
  // 获取当前网站配置
  const currentSite = Object.values(window.AI_SITES).find(site => 
    window.location.href.includes(site.urlMatch)
  );

  if (currentSite) {
    console.log(`${currentSite.id} page initialized`);

    if (currentSite.id === window.SOURCE_SITE.id) {
      // 源网站逻辑
      // 监听输入框变化
      document.addEventListener('input', (e) => {
        if (e.target.matches(currentSite.inputSelector)) {
          const inputs = document.querySelectorAll(currentSite.inputSelector);
          if (inputs[currentSite.inputIndex] === e.target) {
            console.log(`${currentSite.id} input detected:`, e.target.value);
            chrome.runtime.sendMessage({
              type: 'SYNC_INPUT',
              text: e.target.value
            });
          }
        }
      });

      // 监听回车事件
      document.addEventListener('keydown', (e) => {
        if (e.target.matches(currentSite.inputSelector) && e.key === 'Enter' && !e.shiftKey) {
          const inputs = document.querySelectorAll(currentSite.inputSelector);
          if (inputs[currentSite.inputIndex] === e.target) {
            console.log(`${currentSite.id} enter pressed`);
            chrome.runtime.sendMessage({
              type: 'SYNC_ENTER'
            });
          }
        }
      });
    } else {
      // 目标网站逻辑
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(`${currentSite.id} received message:`, message);
        const inputElement = document.querySelector(currentSite.inputSelector);

        if (message.type === 'SYNC_INPUT' && inputElement) {
          console.log(`Updating ${currentSite.id} input:`, message.text);
          inputElement.value = message.text;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        } 
        else if (message.type === 'SYNC_ENTER' && inputElement) {
          console.log(`Simulating enter press in ${currentSite.id}`);
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
          });
          inputElement.dispatchEvent(enterEvent);
        }
      });
    }
  }
} 