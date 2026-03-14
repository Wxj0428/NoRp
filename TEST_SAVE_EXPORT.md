# 保存和导出功能测试指南

## 🔍 检查运行环境

应用右上角会显示当前运行模式：
- 🟢 **Electron** - 桌面应用模式，支持完整文件操作
- 🟡 **Browser** - 浏览器模式，仅支持导出功能

## 💾 保存功能

### Electron 模式

1. **点击"保存"按钮**
   - 首次保存会弹出文件对话框
   - 选择保存位置和文件名（.norp 格式）
   - 点击"保存"完成

2. **控制台检查**
   ```
   Running in Electron: true
   electronAPI: { fs: {...}, dialog: {...}, onMenuEvent: ... }
   ```

3. **保存成功提示**
   - ✅ "项目已保存到: [文件路径]"

### 浏览器模式

1. **点击"保存"按钮**
   - 会提示："当前在浏览器模式运行，无法保存文件"
   - 控制台会显示项目 JSON 数据

## 📤 导出功能

### Electron 模式

1. **点击"导出"按钮**
   - 弹出文件对话框
   - 选择保存位置（.html 格式）
   - 点击"保存"完成

2. **导出成功**
   - ✅ "导出成功！文件已保存到: [文件路径]"

### 浏览器模式（已支持！）

1. **点击"导出"按钮**
   - 自动下载 HTML 文件
   - 文件名：[项目名称].html
   - ✅ "导出成功！"

## 🧪 功能测试步骤

### 测试 1: 浏览器模式导出

```bash
# 启动开发服务器
npm run dev
```

1. 打开浏览器访问 http://localhost:5173
2. 从组件库拖拽一个组件到画布
3. 点击"导出"按钮
4. ✅ 应该自动下载 HTML 文件
5. 打开下载的 HTML 文件验证

### 测试 2: Electron 模式保存和导出

```bash
# 启动 Electron 应用
npm run electron:dev
```

1. 等待 Electron 窗口打开
2. 检查右上角显示 "Electron"
3. 拖拽组件到画布
4. 点击"保存"，选择保存位置
5. ✅ 应该显示 "项目已保存"
6. 点击"导出"，导出 HTML 文件
7. ✅ 应该显示 "导出成功"

## 🐛 常见问题

### 问题 1: Electron 窗口一闪而过

**原因**: 可能是进程崩溃或配置错误

**解决**:
```bash
# 查看错误日志
npm run electron:dev 2>&1 | tee electron.log
```

### 问题 2: 点击保存没反应

**检查**:
1. 按F12打开开发者工具
2. 查看Console标签：
   ```
   Running in Electron: true/false
   electronAPI: {...}
   ```
3. 如果 `electronAPI` 为 `undefined`，说明 preload 脚本未加载

**解决**:
```bash
# 重新构建
rm -rf dist-electron
npm run build
npm run electron:dev
```

### 问题 3: 保存对话框不显示

**原因**: Electron 对话框API调用失败

**检查**:
```javascript
// 在Console中运行
window.electronAPI.dialog.showSaveDialog({
  filters: [{ name: 'NoRp Project', extensions: ['norp'] }]
}).then(result => console.log(result))
```

### 问题 4: "拒绝访问" 错误

**原因**: 文件系统权限问题

**解决**:
- 以管理员身份运行
- 或选择有写权限的目录（如桌面、文档）

## 📝 测试清单

- [ ] 浏览器模式导出 HTML
- [ ] Electron 模式保存项目
- [ ] Electron 模式打开项目
- [ ] Electron 模式导出 HTML
- [ ] 验证导出的 HTML 可正常使用
- [ ] 验证保存的项目可重新加载

## 🎯 快速验证

### 最简单的测试（浏览器模式）

```bash
npm run dev
```

1. 访问 http://localhost:5173
2. 拖拽一个按钮组件
3. 点击"导出"
4. ✅ 自动下载 HTML 文件

这个功能现在应该可以正常工作了！
