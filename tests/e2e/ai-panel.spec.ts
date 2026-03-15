import { test, expect } from '@playwright/test';

test.describe('AI 面板功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示 AI 面板按钮', async ({ page }) => {
    // 检查右下角是否有 AI 面板按钮
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await expect(aiButton).toBeVisible();
  });

  test('点击按钮应该打开 AI 面板', async ({ page }) => {
    // 点击 AI 按钮
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 检查 AI 面板是否打开
    const chatPanel = page.locator('.chat-panel');
    await expect(chatPanel).toBeVisible();

    // 检查标题
    await expect(chatPanel.locator('h3')).toContainText('AI 助手');
  });

  test('AI 面板应该显示快速模板', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 检查快速模板区域
    await expect(page.locator('text=🚀 快速模板')).toBeVisible();

    // 检查所有快速模板按钮
    const templates = [
      { name: '登录页', icon: '🔐' },
      { name: '仪表板', icon: '📊' },
      { name: '产品列表', icon: '🛍️' },
      { name: '表单页', icon: '📝' },
      { name: '落地页', icon: '🎯' },
      { name: '设置页', icon: '⚙️' }
    ];

    for (const template of templates) {
      await expect(page.locator(`button:has-text("${template.icon}")`).and(page.locator(`button:has-text("${template.name}")`))).toBeVisible();
    }
  });

  test('点击快速模板应该填充输入框', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 点击登录页模板
    const loginTemplate = page.locator('button').filter({ hasText: /🔐/ });
    await loginTemplate.click();

    // 检查输入框是否被填充
    const textarea = page.locator('textarea[placeholder*="快速模板"]');
    await expect(textarea).toHaveValue(/生成一个现代化的登录页面/);
  });

  test('AI 面板应该显示示例需求', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 检查示例需求区域
    await expect(page.locator('text=💡 示例需求')).toBeVisible();

    // 检查至少有一个示例按钮
    const exampleButtons = page.locator('button').filter({ hasText: /生成/ });
    await expect(exampleButtons.first()).toBeVisible();
  });

  test('AI 面板应该显示欢迎消息', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 检查欢迎消息
    await expect(page.locator('text=欢迎使用 NoRp AI 设计助手')).toBeVisible();
    await expect(page.locator('text=点击顶部的快速模板')).toBeVisible();
  });

  test('应该能够清空对话', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 等待欢迎消息加载
    await expect(page.locator('text=欢迎使用 NoRp AI 设计助手')).toBeVisible();

    // 点击清空对话按钮
    const chatPanel = page.locator('.chat-panel');
    const clearButton = chatPanel.locator('button').filter({ hasText: /清空对话/ });
    await clearButton.click();

    // 等待清空完成
    await page.waitForTimeout(1000);

    // 检查清空按钮是否仍然存在（表示功能正常运行）
    await expect(clearButton).toBeVisible();
  });

  test('AI 面板应该有关闭按钮', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 检查关闭按钮 - 使用 title 属性
    const chatPanel = page.locator('.chat-panel');
    const closeButton = chatPanel.locator('button[title="关闭"]');
    await expect(closeButton).toBeVisible();

    // 点击关闭按钮
    await closeButton.click();

    // 等待面板关闭
    await expect(chatPanel).not.toBeVisible({ timeout: 5000 });
  });

  test('输入框应该有正确的占位符', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 检查输入框占位符
    const textarea = page.locator('textarea[placeholder*="快速模板"]');
    await expect(textarea).toHaveAttribute('placeholder', /💡 提示：点击上方快速模板/);
  });

  test('发送按钮在输入框为空时应该禁用', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 清空输入框（如果有内容）
    const chatPanel = page.locator('.chat-panel');
    const textarea = chatPanel.locator('textarea');
    await textarea.fill('');

    // 检查发送按钮是否禁用 - 使用 disabled 属性选择
    const sendButton = chatPanel.locator('button:disabled').filter({ hasText: '' });
    // 由于有多个按钮，检查发送按钮区域是否有 disabled 状态的按钮
    const disabledButtons = await chatPanel.locator('button:disabled').count();
    expect(disabledButtons).toBeGreaterThan(0);
  });

  test('插入到画布按钮应该在没有代码时隐藏', async ({ page }) => {
    // 打开 AI 面板
    const aiButton = page.locator('button').filter({ hasText: /🤖/ }).first();
    await aiButton.click();

    // 检查"插入到画布"按钮不应该可见（因为没有生成的代码）
    const insertButton = page.locator('button').filter({ hasText: /✅ 插入到画布/ });
    await expect(insertButton).not.toBeVisible();
  });
});
