# NoRp UI 设计器 - 术语表与故障排查

## 📚 术语表

### A
- **AI 设计助手 (AI Design Assistant)**：智能页面生成工具，通过自然语言描述自动生成 HTML/CSS 代码
- **API Key**：访问 AI 服务的密钥（Claude API Key、OpenAI API Key 等）
- **AsyncGenerator**：异步生成器，用于流式输出 AI 响应

### B
- **边距 (Margin)**：元素外边距，控制元素与其他元素的距离
- **边框 (Border)**：元素边框，包括宽度、样式、颜色
- **布尔值 (Boolean)**：true/false 布尔类型

### C
- **画布 (Canvas)**：中央设计区域，显示和编辑页面
- **组件库 (Component Library)**：预设的 UI 组件集合
- **快速模板 (Quick Template)**：预定义的页面模板，一键生成

### D
- **导出 (Export)**：将项目导出为 HTML、Vue、React 等格式
- **对齐 (Align)**：元素对齐工具（左对齐、居中、右对齐等）
- **断点 (Breakpoint)**：响应式设计的屏幕尺寸断点

### E
- **E2E 测试 (End-to-End Testing)**：端到端测试，使用 Playwright 进行自动化测试

### F
- **Flexbox**：弹性盒子布局，一维布局模型
- **Float**：浮动布局（已过时，推荐使用 Flexbox）

### G
- **Grid**：网格布局，二维布局模型
- **Gradient**：渐变（线性渐变、径向渐变）

### H
- **HMR (Hot Module Replacement)**：热模块替换，开发时自动更新
- **Hover**：鼠标悬停状态
- **HTML**：超文本标记语言，网页结构

### I
- **内联样式 (Inline Style)**：写在 style 属性中的 CSS
- **内边距 (Padding)**：元素内边距，内容与边框的距离

### J
- **JSON**：JavaScript Object Notation，数据交换格式

### L
- **Live Reload**：实时重载，文件修改后自动刷新

### M
- **Modal**：模态框，弹出对话框
- **Media Query**：媒体查询，响应式设计核心技术

### N
- **NoRp**：本项目名称，AI 驱动的 UI 设计工具

### O
- **Opacity**：不透明度（0-1）

### P
- **属性面板 (Property Panel)**：右侧面板，编辑选中元素的样式
- **页面列表 (Page List)**：左侧面板，管理项目中的所有页面
- **Pinia**：Vue 3 的状态管理库

### Q
- **Quick Template**：快速模板

### R
- **响应式设计 (Responsive Design)**：适配不同屏幕尺寸的设计
- **RGBA**：带透明度的颜色表示法
- **Rem**：相对单位，相对于根元素字体大小

### S
- **Shadow**：阴影（box-shadow、text-shadow）
- **State**：状态（Vue 响应式数据）
- **Store**：状态存储（Pinia store）

### T
- **Transform**：变换（旋转、缩放、平移）
- **Transition**：过渡动画
- **TypeScript**：JavaScript 的超集，添加类型系统

### V
- **Vue 3**：渐进式 JavaScript 框架
- **Vite**：下一代前端构建工具

### W
- **Workspace**：工作区，用户项目存储位置

### X
- **XSS**：跨站脚本攻击（需要防范的安全问题）

### Z
- **Z-Index**：层叠顺序，控制元素堆叠顺序

---

## 🔧 故障排查指南

### 问题 1：应用无法启动

**症状**：
- 运行 `npm run electron:dev` 后报错
- 应用窗口闪退

**可能原因**：
1. 依赖未安装
2. 端口被占用
3. Node.js 版本不兼容

**解决方案**：
```bash
# 1. 检查 Node.js 版本（需要 >= 16）
node --version

# 2. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 3. 检查端口 5173 是否被占用
# Windows
netstat -ano | findstr :5173
# Mac/Linux
lsof -i :5173

# 4. 杀死占用端口的进程
# Windows
taskkill /PID <进程ID> /F
# Mac/Linux
kill -9 <进程ID>
```

---

### 问题 2：AI 面板无法打开

**症状**：
- 点击 🤖 按钮没有反应
- AI 面板显示空白

**可能原因**：
1. AI store 未初始化
2. 浏览器控制台有错误

**解决方案**：
```bash
# 1. 打开开发者工具查看错误
# 菜单：View > Toggle Developer Tools
# 或快捷键：Ctrl/Cmd + Shift + I

# 2. 检查控制台错误信息
# 常见错误：
# - "Cannot read property of undefined"
# - "Failed to fetch"

# 3. 清除缓存重启
rm -rf dist node_modules/.vite
npm run electron:dev
```

---

### 问题 3：AI 生成失败

**症状**：
- 发送消息后没有响应
- 显示错误提示

**可能原因**：
1. API Key 未配置或无效
2. 网络连接问题
3. API 额度不足

**解决方案**：
```bash
# 1. 检查 AI 设置
# 打开 AI 面板 > 点击 ⚙️ 设置
# 确认 API Key 已正确配置

# 2. 测试网络连接
# 访问：https://api.anthropic.com
# 或：https://api.openai.com

# 3. 检查 API 额度
# 登录 Claude/OpenAI 控制台查看剩余额度

# 4. 尝试切换模型
# 设置 > 模型选择 > 选择其他模型
```

---

### 问题 4：插入到画布失败

**症状**：
- 点击"插入到画布"没有反应
- 页面内容未显示

**可能原因**：
1. 当前没有选中页面
2. 生成的 HTML 格式错误
3. iframe 通信失败

**解决方案**：
```javascript
// 1. 确认当前页面已选中
// 检查左侧页面列表是否有高亮的页面

// 2. 手动创建新页面
// 页面列表 > 点击 + 按钮

// 3. 检查浏览器控制台
// 查看是否有错误信息

// 4. 重启应用
// 完全关闭应用后重新启动
```

---

### 问题 5：元素无法选择

**症状**：
- 点击元素没有反应
- 无法选中特定元素

**可能原因**：
1. 元素被其他元素遮挡
2. iframe 未加载完成
3. 元素设置了 `pointer-events: none`

**解决方案**：
```javascript
// 1. 等待画布完全加载
// 观察页面是否完全显示

// 2. 使用图层树选择
// 如果有图层树功能，从树中选择元素

// 3. 检查元素样式
// 在开发者工具中检查：
// - pointer-events
// - z-index
// - position

// 4. 刷新页面
// Ctrl/Cmd + R 刷新画布
```

---

### 问题 6：属性面板不显示

**症状**：
- 右侧面板空白
- 选中元素后属性面板没有更新

**可能原因**：
1. 元素数据未正确传递
2. Vue 响应式失效

**解决方案**：
```javascript
// 1. 重新选择元素
// 点击画布空白处取消选择
// 再次点击元素

// 2. 检查开发者工具
// 查看 Vue DevTools 中的组件状态

// 3. 重启应用
```

---

### 问题 7：项目无法保存

**症状**：
- 点击保存没有反应
- 保存后打开丢失数据

**可能原因**：
1. 文件系统权限问题
2. 路径包含特殊字符
3. 磁盘空间不足

**解决方案**：
```bash
# 1. 检查文件权限
# 确保应用有读写权限

# 2. 避免特殊字符路径
# 不要使用：中文、空格、特殊符号
# 推荐：/path/to/projects/my-project

# 3. 检查磁盘空间
# Windows: 右键磁盘 > 属性
# Mac/Linux: df -h

# 4. 使用"另存为"
# 尝试保存到其他位置
```

---

### 问题 8：导出失败

**症状**：
- 点击导出没有反应
- 导出的文件无法打开

**可能原因**：
1. 生成器配置错误
2. 文件路径无效

**解决方案**：
```bash
# 1. 检查导出设置
# 确认选择了正确的格式

# 2. 尝试不同格式
# 先导出为 HTML 单文件测试

# 3. 检查控制台错误
# 查看生成过程中的错误信息

# 4. 手动创建导出目录
# 确保目标目录存在且有写入权限
```

---

### 问题 9：快捷键不工作

**症状**：
- 按 `Ctrl/Cmd + S` 没有保存
- 其他快捷键失效

**可能原因**：
1. 焦点不在主窗口
2. 与系统快捷键冲突
3. 输入法干扰

**解决方案**：
```javascript
// 1. 确认焦点在主窗口
// 点击画布区域获取焦点

// 2. 关闭输入法
// 切换到英文输入模式

// 3. 检查快捷键设置
// 如果有自定义快捷键功能，检查配置

// 4. 使用菜单操作
// 作为快捷键的替代方案
```

---

### 问题 10：性能问题

**症状**：
- 应用运行缓慢
- 拖拽元素卡顿
- CPU 占用高

**可能原因**：
1. 页面元素过多
2. AI 生成代码质量差
3. 硬件配置低

**解决方案**：
```javascript
// 1. 优化页面
// - 删除不必要的元素
// - 简化复杂布局

// 2. 检查 AI 生成的代码
// 查看是否有性能问题：
// - 过多的嵌套
// - 大量的阴影和渐变
// - 未优化的动画

// 3. 调整设置
// - 关闭自动保存
// - 减少历史记录数量

// 4. 升级硬件
// 推荐：8GB+ RAM、SSD 硬盘
```

---

## 🐛 调试技巧

### 打开开发者工具

```
菜单：View > Toggle Developer Tools
快捷键：Ctrl/Cmd + Shift + I
```

### 查看 Console 错误

1. 打开开发者工具
2. 切换到 Console 标签
3. 查看红色错误信息
4. 复制错误信息搜索解决方案

### 使用 Vue DevTools

```bash
# 安装 Vue DevTools 浏览器扩展
# Chrome: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org

# 查看组件树和状态
# 检查 Props、State、Events
```

### 检查网络请求

1. 打开开发者工具
2. 切换到 Network 标签
3. 执行操作（如 AI 生成）
4. 查看请求和响应
5. 检查状态码和返回数据

### 性能分析

```
开发者工具 > Performance 标签
点击 Record 开始录制
执行操作
点击 Stop 停止录制
分析性能瓶颈
```

---

## 📞 获取帮助

### 官方资源

- 📖 [完整文档](USER_MANUAL.md)
- 🚀 [快速入门](QUICK_START.md)
- 💬 [社区论坛](https://github.com/norp/discussions)
- 🐛 [问题追踪](https://github.com/norp/issues)

### 提交问题时请提供

1. **版本信息**：
   ```bash
   npm list norp-ui-designer
   ```

2. **操作系统**：
   - Windows 11 / macOS 14 / Ubuntu 22.04

3. **错误信息**：
   - 复制完整的错误堆栈
   - 附带截图（如果可能）

4. **重现步骤**：
   - 详细描述如何触发问题

5. **期望行为**：
   - 描述你期望发生什么

### 社区支持

- Discord: https://discord.gg/norp
- 邮件: support@norp.design
- Twitter: @norp_design

---

## 🔄 更新与升级

### 检查更新

```bash
# 查看当前版本
npm list norp-ui-designer

# 检查最新版本
npm view norp-ui-designer version

# 更新到最新版本
npm update norp-ui-designer
```

### 备份项目

更新前建议备份项目：

```bash
# 复制 .norp 项目文件
cp my-project.norp my-project-backup.norp

# 或导出为 HTML
# 在应用中：文件 > 导出
```

---

**祝使用愉快！如有问题请随时联系。** 🎉
