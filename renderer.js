// 全局变量
let conversationHistory = [];
let isApiConfigured = false;
let currentChatId = null;
let chatHistory = [];

// DOM 元素
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const messageCount = document.getElementById('messageCount');
const typingIndicator = document.getElementById('typingIndicator');
const newChatBtn = document.getElementById('newChatBtn');
const historyBtn = document.getElementById('historyBtn');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadApiKey();
    loadChatHistory();
    loadAiSettings();
});

// 设置事件监听器
function setupEventListeners() {
    // API密钥保存
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    clearApiKeyBtn.addEventListener('click', handleClearApiKey);
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSaveApiKey();
        }
    });

    // 消息发送
    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // 输入框自动调整高度
    messageInput.addEventListener('input', autoResizeTextarea);

    // 聊天操作
    newChatBtn.addEventListener('click', startNewChat);
    historyBtn.addEventListener('click', showChatHistory);
    

}

// 加载保存的API密钥
function loadApiKey() {
    // 在实际应用中，你应该从安全的存储中读取API密钥
    // 这里为了演示，我们从localStorage读取
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey && savedApiKey.length > 10 && !savedApiKey.includes('()')) {
        // 只加载看起来有效的API密钥
        apiKeyInput.value = savedApiKey;
        // 不自动测试，让用户手动点击保存
    } else if (savedApiKey) {
        // 清除无效的API密钥
        localStorage.removeItem('deepseek_api_key');
        console.log('Cleared invalid API key from storage');
    }
}

// 处理API密钥保存
async function handleSaveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        showError('API Key Required', 'Please enter your DeepSeek API key.');
        return;
    }

    // 验证API密钥格式
    if (apiKey.length < 10) {
        showError('Invalid API Key', 'API key seems too short. Please check your DeepSeek API key.');
        return;
    }

    // 更新状态指示器
    updateApiStatus('connecting', 'Connecting...');

    try {
        const result = await window.electronAPI.initOpenAI(apiKey);
        
        if (result.success) {
            // 保存API密钥
            await window.electronAPI.saveApiKey(apiKey);
            localStorage.setItem('deepseek_api_key', apiKey);
            
            updateApiStatus('connected', 'Connected');
            isApiConfigured = true;
            updateSendButtonState();
            
            showSuccess('API Key saved successfully!');
        } else {
            updateApiStatus('disconnected', 'Connection failed');
            showError('Connection Failed', result.error || 'Failed to connect to DeepSeek API.');
        }
    } catch (error) {
        updateApiStatus('disconnected', 'Connection failed');
        showError('Error', 'Failed to initialize API connection.');
    }
}

// 处理清除API密钥
function handleClearApiKey() {
    if (confirm('Are you sure you want to clear the API key?')) {
        // 清除本地存储
        localStorage.removeItem('deepseek_api_key');
        
        // 清空输入框
        apiKeyInput.value = '';
        
        // 重置状态
        updateApiStatus('disconnected', 'Not configured');
        isApiConfigured = false;
        updateSendButtonState();
        
        // 重置OpenAI客户端
        openai = null;
        
        showSuccess('API key cleared successfully!');
    }
}



// 生成聊天ID
function generateChatId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 保存聊天记录
function saveChatToHistory() {
    if (conversationHistory.length === 0) return;
    
    // 生成或使用现有的聊天ID
    if (!currentChatId) {
        currentChatId = generateChatId();
    }
    
    const chatData = {
        id: currentChatId,
        title: getChatTitle(),
        messages: [...conversationHistory],
        timestamp: Date.now(),
        lastMessage: conversationHistory[conversationHistory.length - 1]?.content || ''
    };
    
    // 更新或添加聊天记录
    const existingIndex = chatHistory.findIndex(chat => chat.id === currentChatId);
    if (existingIndex >= 0) {
        // 更新现有记录
        chatHistory[existingIndex] = chatData;
    } else {
        // 添加新记录到开头
        chatHistory.unshift(chatData);
    }
    
    // 限制历史记录数量（最多保存50个聊天）
    if (chatHistory.length > 50) {
        chatHistory = chatHistory.slice(0, 50);
    }
    
    // 保存到本地存储
    localStorage.setItem('talker_chat_history', JSON.stringify(chatHistory));
}

// 获取聊天标题
function getChatTitle() {
    const firstUserMessage = conversationHistory.find(msg => msg.role === 'user');
    if (firstUserMessage) {
        return firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
    }
    return 'New Chat';
}

// 加载聊天历史
function loadChatHistory() {
    try {
        const saved = localStorage.getItem('talker_chat_history');
        if (saved) {
            chatHistory = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Failed to load chat history:', error);
        chatHistory = [];
    }
}

// 显示聊天历史
function showChatHistory() {
    const historyModal = createHistoryModal();
    document.body.appendChild(historyModal);
}

// 创建历史记录模态框
function createHistoryModal() {
    const modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.innerHTML = `
        <div class="history-modal-content">
            <div class="history-modal-header">
                <h3><i class="fas fa-history"></i> Chat History</h3>
                <div class="header-actions">
                    ${chatHistory.length > 0 ? `
                        <button class="btn-delete-all" onclick="deleteAllChats()">
                            <i class="fas fa-trash-alt"></i> Delete All
                        </button>
                    ` : ''}
                    <button class="close-btn" onclick="this.closest('.history-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="history-list">
                ${chatHistory.length === 0 ? '<p class="no-history">No chat history found.</p>' : ''}
                ${chatHistory.map(chat => `
                    <div class="history-item" data-chat-id="${chat.id}">
                        <div class="history-item-content">
                            <div class="history-title">${chat.title}</div>
                            <div class="history-meta">
                                <span class="history-time">${formatTime(chat.timestamp)}</span>
                                <span class="history-messages">${Math.floor(chat.messages.length / 2)} messages</span>
                            </div>
                        </div>
                        <div class="history-actions">
                            <button class="btn-load" onclick="loadChat('${chat.id}')">
                                <i class="fas fa-play"></i> Continue
                            </button>
                            <button class="btn-delete" onclick="deleteChat('${chat.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    return modal;
}

// 加载指定聊天
function loadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    
    // 保存当前聊天
    if (conversationHistory.length > 0) {
        saveChatToHistory();
    }
    
    // 加载选中的聊天
    currentChatId = chat.id;
    conversationHistory = [...chat.messages];
    
    // 清空并重新显示消息
    messagesContainer.innerHTML = '';
    conversationHistory.forEach((msg, index) => {
        if (index % 2 === 0) { // 用户消息
            addMessageToUI('user', msg.content, false);
        } else { // AI消息
            addMessageToUI('ai', msg.content, false);
        }
    });
    
    // 更新消息计数
    updateMessageCount();
    
    // 关闭模态框
    document.querySelector('.history-modal')?.remove();
    
    showSuccess('Chat loaded successfully!');
}

// 删除聊天记录
function deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat?')) {
        chatHistory = chatHistory.filter(chat => chat.id !== chatId);
        localStorage.setItem('talker_chat_history', JSON.stringify(chatHistory));
        
        // 如果删除的是当前聊天，清空当前聊天
        if (currentChatId === chatId) {
            currentChatId = null;
            conversationHistory = [];
            startNewChat();
        }
        
        // 重新显示历史记录
        const modal = document.querySelector('.history-modal');
        if (modal) {
            modal.remove();
            showChatHistory();
        }
        
        showSuccess('Chat deleted successfully!');
    }
}

// 删除所有聊天记录
function deleteAllChats() {
    if (confirm('Are you sure you want to delete ALL chat history? This action cannot be undone.')) {
        chatHistory = [];
        localStorage.setItem('talker_chat_history', JSON.stringify(chatHistory));
        
        // 清空当前聊天
        currentChatId = null;
        conversationHistory = [];
        startNewChat();
        
        // 关闭模态框
        const modal = document.querySelector('.history-modal');
        if (modal) {
            modal.remove();
        }
        
        showSuccess('All chat history deleted successfully!');
    }
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
        return 'Just now';
    } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + 'm ago';
    } else if (diff < 86400000) { // 1天内
        return Math.floor(diff / 3600000) + 'h ago';
    } else {
        return date.toLocaleDateString();
    }
}

// 更新API状态
function updateApiStatus(status, text) {
    statusIndicator.className = `status-indicator ${status}`;
    statusText.textContent = text;
}

// 处理发送消息
async function handleSendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    if (!isApiConfigured) {
        showError('API Not Configured', 'Please set your DeepSeek API key first.');
        return;
    }

    // 添加用户消息到界面
    addMessageToUI('user', message);
    
    // 清空输入框
    messageInput.value = '';
    autoResizeTextarea();
    
    // 更新发送按钮状态
    updateSendButtonState();
    
    // 显示打字指示器
    showTypingIndicator();
    
    try {
        // 发送消息到AI
        const result = await window.electronAPI.sendMessage(message, conversationHistory);
        
        hideTypingIndicator();
        
        if (result.success) {
            // 添加AI回复到界面
            addMessageToUI('ai', result.response);
            
            // 更新对话历史
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: result.response }
            );
            
            updateMessageCount();
            
            // 保存聊天记录（只在有对话内容时保存）
            if (conversationHistory.length > 0) {
                saveChatToHistory();
            }
        } else {
            showError('Error', result.error || 'Failed to get response from AI.');
        }
    } catch (error) {
        hideTypingIndicator();
        showError('Error', 'Failed to send message.');
    }
}

// 添加消息到UI
function addMessageToUI(role, content, scrollToBottom = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    // 移除欢迎消息
    const welcomeMessage = messagesContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到底部（可选）
    if (scrollToBottom) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// 自动调整文本框高度
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    updateSendButtonState();
}

// 更新发送按钮状态
function updateSendButtonState() {
    const hasText = messageInput.value.trim().length > 0;
    sendBtn.disabled = !hasText || !isApiConfigured;
}

// 显示打字指示器
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
}

// 隐藏打字指示器
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// 更新消息计数
function updateMessageCount() {
    const count = conversationHistory.length / 2; // 每轮对话包含用户和AI的消息
    messageCount.textContent = `${count} messages`;
}

// 开始新对话
function startNewChat() {
    // 保存当前聊天（如果有内容）
    if (conversationHistory.length > 0) {
        saveChatToHistory();
    }
    
    // 重置对话状态
    conversationHistory = [];
    currentChatId = null;
    
    // 更新界面
    messagesContainer.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="fas fa-robot"></i>
            </div>
            <h3>Welcome to Talker!</h3>
            <p>Start a new conversation with your AI assistant.</p>
        </div>
    `;
    updateMessageCount();
}



// 显示错误消息
function showError(title, message) {
    window.electronAPI.showError(title, message);
}

// 显示成功消息
function showSuccess(message) {
    // 简单的成功提示，你可以根据需要改进
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);