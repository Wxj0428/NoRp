# Playwright 测试文档

## 概述

本项目使用 Playwright 进行端到端（E2E）自动化测试，确保应用的核心功能正常运行。

## 测试覆盖范围

### AI 面板功能测试 (`tests/e2e/ai-panel.spec.ts`)

测试 AI 助手面板的各项功能：

- ✅ AI 面板按钮显示
- ✅ 打开/关闭 AI 面板
- ✅ 快速模板显示（6个模板：登录页、仪表板、产品列表、表单页、落地页、设置页）
- ✅ 点击模板填充输入框
- ✅ 示例需求显示
- ✅ 欢迎消息显示
- ✅ 清空对话功能
- ✅ 输入框占位符
- ✅ 发送按钮状态控制
- ✅ 插入到画布按钮状态

### 页面列表功能测试 (`tests/e2e/page-list.spec.ts`)

测试页面管理功能：

- ✅ 页面列表显示
- ✅ 页面项显示
- ✅ 添加新页面
- ✅ 页面说明模态框
- ✅ 添加按钮可见性
- ✅ 页面计数显示

## 运行测试

### 运行所有测试（无头模式）
```bash
npm run test
```

### 运行测试（有头模式 - 可视化）
```bash
npm run test:headed
```

### 运行测试（UI 模式 - 交互式）
```bash
npm run test:ui
```

### 调试测试
```bash
npm run test:debug
```

### 查看测试报告
```bash
npm run test:report
```

## 测试配置

测试配置文件：`playwright.config.ts`

关键配置：
- **浏览器**: Chromium
- **基础 URL**: http://localhost:5173
- **测试目录**: tests/e2e
- **并行运行**: 是（10 workers）
- **失败重试**: CI 环境 2 次
- **截图**: 仅失败时
- **Trace**: 仅首次重试时
- **报告**: HTML 格式

## 测试统计

- **总测试数**: 17
- **通过率**: 100% (17/17)
- **执行时间**: ~7-8 秒

## 编写新测试

1. 在 `tests/e2e/` 目录下创建新的测试文件
2. 使用 `test.describe` 组织测试套件
3. 使用 `test` 定义测试用例
4. 使用 Playwright 的定位器和断言

示例：

```typescript
import { test, expect } from '@playwright/test';

test.describe('新功能测试', () => {
  test('应该做某事', async ({ page }) => {
    await page.goto('/');

    // 执行操作
    await page.locator('button').click();

    // 验证结果
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## 最佳实践

1. **使用描述性测试名称**: 清楚说明测试的内容
2. **等待元素**: 使用 `await expect().toBeVisible()` 等待元素出现
3. **精确选择器**: 优先使用 data-testid、aria-label 或稳定的属性
4. **清理状态**: 使用 `beforeEach` 确保每个测试的初始状态一致
5. **独立测试**: 每个测试应该独立运行，不依赖其他测试

## 常见问题

### 测试超时
- 默认超时 30 秒
- 可以在 playwright.config.ts 中调整

### 元素未找到
- 检查选择器是否正确
- 增加等待时间
- 使用 Playwright Inspector 查看实际 DOM 结构

### 测试不稳定
- 使用 `waitForTimeout` 增加等待
- 使用 `retry` 配置重试
- 检查网络请求是否完成

## CI/CD 集成

测试可以集成到 CI/CD 流程中：

```yaml
# GitHub Actions 示例
- name: Run tests
  run: npm run test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 相关资源

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [定位器指南](https://playwright.dev/docs/locators)
- [断言列表](https://playwright.dev/docs/assertions)
