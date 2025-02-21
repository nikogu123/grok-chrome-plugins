(function() {
  const isGrok = window.location.href.includes('grok.com');
  const isDeepseek = window.location.href.includes('deepseek.com');

  if (isGrok) {
    console.log('Grok script injected');
    document.addEventListener('input', (e) => {
      if (e.target.tagName.toLowerCase() === 'textarea') {
        const textareas = document.querySelectorAll('textarea');
        if (textareas[0] === e.target) {
          console.log('Grok input detected:', e.target.value);
          window.parent.postMessage({
            type: 'GROK_INPUT',
            text: e.target.value
          }, '*');
        }
      }
    });
  }

  if (isDeepseek) {
    console.log('Deepseek script injected');
    window.addEventListener('message', (event) => {
      console.log('Deepseek received message:', event.data);
      if (event.data.type === 'UPDATE_DEEPSEEK') {
        const inputElement = document.getElementById('chat-input');
        if (inputElement) {
          console.log('Updating Deepseek input:', event.data.text);
          inputElement.value = event.data.text;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          console.log('Chat input element not found in Deepseek');
        }
      }
    });
  }
})(); 