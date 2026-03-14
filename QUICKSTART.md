# 快速启动指南

## 启动开发服务器

```bash
npm run dev
```

这将启动：
- Vite 开发服务器（http://localhost:5173）
- Electron 窗口

## 打包应用

### Windows
```bash
npm run electron:build:win
```
输出：`dist/NoRp UI 设计器 Setup 0.1.0.exe`

### macOS
```bash
npm run electron:build:mac
```
输出：`dist/NoRp UI 设计器-0.1.0.dmg`

### Linux
```bash
npm run electron:build:linux
```
输出：`dist/NoRp UI 设计器-0.1.0.AppImage`

## 配置 AI

### Claude
1. 打开应用
2. 点击"AI 设置"
3. 选择"Claude"
4. 输入 API Key（从 https://console.anthropic.com 获取）
5. 模型：`claude-3-5-sonnet-20241022`

### OpenAI
1. 打开应用
2. 点击"AI 设置"
3. 选择"OpenAI"
4. 输入 API Key（从 https://platform.openai.com/api-keys 获取）
5. 模型：`gpt-4` 或 `gpt-3.5-turbo`

### 本地模型（Ollama）
1. 安装 Ollama：https://ollama.ai
2. 下载模型：`ollama pull llama2`
3. 在应用中选择"Local Model"
4. 确认服务地址：`http://localhost:11434`

## 使用示例

### 创建登录页面

1. **创建项目**
   - 点击"新建"

2. **使用 AI 生成**
   - 点击右下角 🤖 按钮
   - 输入："创建一个现代化的登录表单，包含邮箱和密码输入框"
   - 点击"插入到画布"

3. **手动调整**
   - 从左侧拖拽组件到画布
   - 点击元素，在右侧面板调整样式
   - 拖拽元素调整位置

4. **保存和导出**
   - 点击"保存"保存项目
   - 点击"导出"导出 HTML 文件

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 新建项目 |
| Ctrl+O | 打开项目 |
| Ctrl+S | 保存项目 |
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |
| Ctrl+C | 复制 |
| Ctrl+V | 粘贴 |
| Ctrl+X | 剪切 |
| Delete | 删除选中元素 |
| Ctrl+D | 复制元素 |
| Ctrl+E | 导出 HTML |

## 常见问题

### Q: AI 生成失败？
A: 检查 API Key 是否正确，确保网络连接正常。

### Q: 无法拖拽组件？
A: 确保画布已加载完成，刷新页面重试。

### Q: 导出的 HTML 无法使用？
A: 检查是否有外部依赖（图片、字体等），确保资源路径正确。

### Q: 应用无法启动？
A: 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`。

## 技术支持

- GitHub Issues: https://github.com/norp/ui-designer/issues
- 文档: https://github.com/norp/ui-designer/wiki
