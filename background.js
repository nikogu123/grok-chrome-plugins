chrome.action.onClicked.addListener(async (tab) => {
  // 打开split.html页面
  chrome.tabs.create({
    url: chrome.runtime.getURL('split.html')
  });
});

// 处理消息转发
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.type === 'GROK_INPUT' || message.type === 'GROK_ENTER') {
    // 广播消息到所有content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message);
      });
    });
  }
});
