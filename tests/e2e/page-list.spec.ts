import { test, expect } from '@playwright/test';

test.describe('页面列表功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示页面列表', async ({ page }) => {
    // 检查页面列表标题 - 使用更精确的选择器
    await expect(page.locator('.page-list').locator('h3:has-text("页面")')).toBeVisible();
  });

  test('应该显示至少一个页面', async ({ page }) => {
    // 检查是否有页面
    const pages = page.locator('[class*="page-list"]').locator('text=📄');
    await expect(pages.first()).toBeVisible();
  });

  test('应该能够添加新页面', async ({ page }) => {
    // 获取初始页面数量
    const pageList = page.locator('.page-list');
    const initialCount = await pageList.locator('text=📄').count();

    // 点击添加按钮 - 在页面列表区域内查找
    const addButton = pageList.locator('button[title="添加页面"]');
    await addButton.click();

    // 等待新页面添加
    await page.waitForTimeout(500);

    // 检查页面数量是否增加
    const newCount = await pageList.locator('text=📄').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('应该能够显示页面说明模态框', async ({ page }) => {
    // 找到第一个页面
    const firstPage = page.locator('[class*="page-list"]').locator('span:has-text("📄")').first();

    // 双击页面打开说明（或右键菜单）
    await firstPage.click({ button: 'right' });

    // 检查右键菜单
    await expect(page.locator('text=页面说明')).toBeVisible();
  });

  test('添加页面按钮应该可见', async ({ page }) => {
    // 检查添加按钮 - 使用 title 属性
    const addButton = page.locator('.page-list').locator('button[title="添加页面"]');
    await expect(addButton).toBeVisible();
  });

  test('应该显示页面计数', async ({ page }) => {
    // 检查页面计数
    await expect(page.locator('text=/\\d+ 个页面/')).toBeVisible();
  });
});
