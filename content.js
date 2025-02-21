// 检查当前是否在split.html页面中
if (window.location.href.includes(chrome.runtime.getURL('split.html'))) {
  console.log('Split page loaded');
  // 在split.html中的逻辑
  document.addEventListener('DOMContentLoaded', () => {
    const deepseekFrame = document.getElementById('deepseek');
    const grokFrame = document.getElementById('grok');
    console.log('Split page loaded, frames initialized');

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
    grokFrame.addEventListener('load', () => {
      console.log('Grok frame loaded, injecting script');
      injectScript(grokFrame);
    });

    deepseekFrame.addEventListener('load', () => {
      console.log('Deepseek frame loaded, injecting script');
      injectScript(deepseekFrame);
    });
  });
} else if (window.location.href.includes('grok.com')) {
  // Grok页面逻辑
  console.log('Grok page initialized');
  
  // 监听输入框变化和按键事件
  document.addEventListener('input', (e) => {
    if (e.target.tagName.toLowerCase() === 'textarea') {
      const textareas = document.querySelectorAll('textarea');
      if (textareas[0] === e.target) {
        console.log('Grok input detected:', e.target.value);
        chrome.runtime.sendMessage({
          type: 'GROK_INPUT',
          text: e.target.value
        });
      }
    }
  });

  // 监听回车事件
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName.toLowerCase() === 'textarea' && e.key === 'Enter' && !e.shiftKey) {
      const textareas = document.querySelectorAll('textarea');
      if (textareas[0] === e.target) {
        console.log('Grok enter pressed');
        chrome.runtime.sendMessage({
          type: 'GROK_ENTER'
        });
      }
    }
  });
} else if (window.location.href.includes('deepseek.com')) {
  // Deepseek页面逻辑
  console.log('Deepseek page initialized');
  
  // 监听来自background的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Deepseek received message:', message);
    const inputElement = document.getElementById('chat-input');

    if (message.type === 'GROK_INPUT' && inputElement) {
      console.log('Updating Deepseek input:', message.text);
      inputElement.value = message.text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    } 
    else if (message.type === 'GROK_ENTER' && inputElement) {
      console.log('Simulating enter press in Deepseek');
      // 模拟回车键按下事件
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