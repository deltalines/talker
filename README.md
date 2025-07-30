# Talker - AI Chat Application

一个基于 Electron 的 AI 聊天应用，使用 DeepSeek API 提供智能对话功能。

## 功能特性

- 🤖 与 DeepSeek AI 进行实时对话
- 💬 现代化的聊天界面设计
- 🔐 安全的 API 密钥管理
- 📱 跨平台桌面应用
- 🎨 美观的用户界面
- ⚡ 快速响应和流畅体验

## 安装和运行

### 前置要求

- Node.js (版本 16 或更高)
- npm 或 yarn

### 安装步骤

1. 克隆或下载项目文件
2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发模式：
   ```bash
   npm start
   ```

### 配置 API 密钥

1. 获取 DeepSeek API 密钥：
   - 访问 [DeepSeek 官网](https://platform.deepseek.com/)
   - 注册账户并获取 API 密钥

2. 在应用中配置：
   - 启动应用后，在左侧边栏输入你的 API 密钥
   - 点击 "Save" 按钮保存
   - 状态指示器会显示连接状态

## 使用说明

### 基本操作

1. **设置 API 密钥**：在左侧边栏输入并保存你的 DeepSeek API 密钥
2. **AI 设定**：在 AI Settings 区域输入或载入 AI 个性设定文件
3. **开始对话**：在底部输入框中输入消息，按 Enter 或点击发送按钮
4. **新对话**：点击 "New Chat" 按钮开始新的对话
5. **历史记录**：点击 "History" 按钮查看和管理历史聊天记录

### 历史记录功能

- **自动保存**：每次对话都会自动保存到历史记录
- **继续对话**：可以从历史记录中继续之前的对话
- **删除记录**：可以删除单个或所有历史聊天记录
- **智能标题**：自动根据对话内容生成聊天标题
- **时间显示**：显示每个聊天的创建时间和消息数量

### AI 设定功能

- **个性设定**：可以输入或载入 AI 的个性设定和指令
- **文件支持**：支持从 .txt 和 .md 文件载入设定
- **本地保存**：设定会自动保存到本地存储
- **快速切换**：可以随时修改和切换不同的 AI 设定

### 快捷键

- `Enter`：发送消息
- `Shift + Enter`：换行
- `Ctrl/Cmd + Enter`：发送消息

## 项目结构

```
talker/
├── main.js              # Electron 主进程
├── preload.js           # 预加载脚本
├── renderer.js          # 渲染进程脚本
├── index.html           # 主界面
├── styles.css           # 样式文件
├── package.json         # 项目配置
└── README.md           # 项目说明
```

## 技术栈

- **Electron**：跨平台桌面应用框架
- **OpenAI SDK**：与 DeepSeek API 通信
- **HTML/CSS/JavaScript**：前端界面
- **Font Awesome**：图标库

## 构建应用

### 开发模式
```bash
npm run dev
```

### 构建可执行文件

#### 方法一：使用 electron-packager（推荐）
```bash
npm run pack
```
这将创建一个便携式的Windows可执行文件，保存在 `dist/Talker-win32-x64/` 目录中。

#### 方法二：使用 electron-builder
```bash
npm run build
```
注意：此方法可能需要管理员权限和网络连接。

### 多平台构建
```bash
npm run pack-all
```
这将为Windows、macOS和Linux创建可执行文件。

### 运行构建后的应用
1. 进入 `dist/Talker-win32-x64/` 目录
2. 双击 `Talker.exe` 或运行 `启动Talker.bat`
3. 在应用中配置你的DeepSeek API密钥
4. 开始聊天！

## 安全注意事项

- API 密钥会保存在本地存储中，请确保设备安全
- 建议定期更换 API 密钥
- 不要在不安全的网络环境下使用

## 故障排除

### 常见问题

1. **API 连接失败 (401 错误)**
   - 检查 API 密钥格式是否正确（应该是长字符串，通常以 `sk-` 开头）
   - 确保 API 密钥没有额外的空格或特殊字符
   - 验证 DeepSeek 账户是否激活且有足够余额
   - 使用测试脚本验证：`node test-api.js <your-api-key>`

2. **应用无法启动**
   - 确保 Node.js 版本正确
   - 重新安装依赖：`npm install`
   - 检查系统权限

3. **消息发送失败**
   - 检查 API 密钥配置
   - 确认网络连接正常
   - 查看控制台错误信息

### API 密钥测试

如果遇到 401 认证错误，可以使用提供的测试脚本验证 API 密钥：

```bash
node test-api.js <your-deepseek-api-key>
```

这将帮助诊断 API 密钥是否正确配置。

## 开发说明

### 添加新功能

1. 在 `main.js` 中添加新的 IPC 处理器
2. 在 `preload.js` 中暴露新的 API
3. 在 `renderer.js` 中实现前端逻辑
4. 更新 `index.html` 和 `styles.css` 以支持新界面

### 自定义样式

修改 `styles.css` 文件来自定义应用外观。主要样式类：

- `.app-container`：应用主容器
- `.sidebar`：侧边栏样式
- `.messages-container`：消息容器
- `.message`：消息样式
- `.input-container`：输入区域样式

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.2.0
- 新增 AI 设定功能，支持从 txt、md 文件载入个性设定
- 删除 Clear Chat 按钮，优化界面布局
- 在历史记录界面添加一键删除所有记录功能
- 改进历史记录管理，支持批量删除

### v1.1.0
- 新增历史聊天记录功能
- 支持从历史记录继续对话
- 智能聊天标题生成
- 历史记录管理（查看、删除）
- 自动保存对话内容

### v1.0.0
- 初始版本发布
- 基本的 AI 聊天功能
- 现代化的用户界面
- API 密钥管理
- 跨平台支持 