const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

let mainWindow;
let openai;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 初始化OpenAI客户端
ipcMain.handle('init-openai', async (event, apiKey) => {
  try {
    // 清理API密钥，移除可能的额外字符
    const cleanApiKey = apiKey.trim().replace(/[^\w\-]/g, '');
    
    if (!cleanApiKey || cleanApiKey.length < 10) {
      return { success: false, error: 'Invalid API key format. Please check your DeepSeek API key.' };
    }
    
    openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: cleanApiKey
    });
    
    // 测试连接
    try {
      const testCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: "Hello" }],
        model: "deepseek-chat",
        max_tokens: 10
      });
      return { success: true };
    } catch (testError) {
      console.error('API test failed:', testError);
      return { success: false, error: 'API key validation failed. Please check your DeepSeek API key.' };
    }
  } catch (error) {
    console.error('OpenAI initialization error:', error);
    return { success: false, error: error.message };
  }
});

// 发送消息到AI
ipcMain.handle('send-message', async (event, message, conversationHistory) => {
  if (!openai) {
    return { success: false, error: 'OpenAI client not initialized. Please set your API key first.' };
  }

  try {
    const messages = [
      { role: "system", content: "You are a helpful assistant. Please provide clear and concise responses." },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "deepseek-chat",
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    return { success: true, response: response };
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return { success: false, error: error.message };
  }
});

// 保存API密钥
ipcMain.handle('save-api-key', async (event, apiKey) => {
  try {
    // 在实际应用中，你应该使用更安全的方式存储API密钥
    // 这里为了演示，我们只是返回成功
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 显示错误对话框
ipcMain.handle('show-error', async (event, title, content) => {
    dialog.showErrorBox(title, content);
});

// 加载设置文件
ipcMain.handle('load-settings-file', async (event) => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Text Files', extensions: ['txt', 'md'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            const content = fs.readFileSync(filePath, 'utf8');
            return { success: true, content: content };
        } else {
            return { success: false, error: 'No file selected' };
        }
    } catch (error) {
        console.error('Error loading settings file:', error);
        return { success: false, error: error.message };
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 