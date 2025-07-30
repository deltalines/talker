const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 初始化OpenAI客户端
  initOpenAI: (apiKey) => ipcRenderer.invoke('init-openai', apiKey),
  
  // 发送消息到AI
  sendMessage: (message, conversationHistory) => 
    ipcRenderer.invoke('send-message', message, conversationHistory),
  
  // 保存API密钥
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  
  // 显示错误对话框
  showError: (title, content) => ipcRenderer.invoke('show-error', title, content),
  
  // 加载设置文件
  loadSettingsFile: () => ipcRenderer.invoke('load-settings-file')
}); 