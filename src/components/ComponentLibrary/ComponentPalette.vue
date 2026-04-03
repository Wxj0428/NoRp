<template>
  <div class="component-palette h-full flex flex-col">
    <div class="p-4 border-b border-gray-700">
      <h3 class="text-white font-semibold">组件库</h3>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-for="(components, category) in categorizedComponents" :key="category" class="mb-2">
        <button
          @click="toggleCategory(category)"
          class="w-full flex items-center justify-between px-2 py-1 text-xs text-gray-400 uppercase tracking-wide hover:text-gray-200 transition"
        >
          <span>{{ category }} ({{ components.length }})</span>
          <span class="text-[10px] transition-transform duration-200" :style="{ transform: collapsedCategories.has(category) ? 'rotate(-90deg)' : 'rotate(0deg)' }">&#9660;</span>
        </button>
        <div v-show="!collapsedCategories.has(category)" class="grid grid-cols-2 gap-2 mt-1">
          <div
            v-for="component in components"
            :key="component.id"
            draggable="true"
            @dragstart="handleDragStart($event, component)"
            class="bg-gray-900 hover:bg-gray-700 rounded p-3 cursor-grab text-center transition"
          >
            <div class="text-2xl mb-1">{{ component.icon }}</div>
            <div class="text-xs text-gray-300">{{ component.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Component } from '@/types';

const collapsedCategories = ref(new Set<string>());

function toggleCategory(category: string) {
  if (collapsedCategories.value.has(category)) {
    collapsedCategories.value.delete(category);
  } else {
    collapsedCategories.value.add(category);
  }
}

const components = ref<Component[]>([
  // 按钮
  {
    id: 'btn-primary',
    name: '主要按钮',
    category: '按钮',
    icon: '🔵',
    template: `<button class="btn btn-primary">点击我</button>
<style>
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}
</style>`
  },
  {
    id: 'btn-success',
    name: '成功按钮',
    category: '按钮',
    icon: '🟢',
    template: `<button class="btn btn-success">成功</button>
<style>
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}
.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(17, 153, 142, 0.3);
}
.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(17, 153, 142, 0.4);
}
</style>`
  },
  {
    id: 'btn-danger',
    name: '危险按钮',
    category: '按钮',
    icon: '🔴',
    template: `<button class="btn btn-danger">删除</button>
<style>
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}
.btn-danger {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(235, 51, 73, 0.3);
}
.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(235, 51, 73, 0.4);
}
</style>`
  },
  {
    id: 'btn-outline',
    name: '边框按钮',
    category: '按钮',
    icon: '⚪',
    template: `<button class="btn btn-outline">边框按钮</button>
<style>
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}
.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}
</style>`
  },

  // 表单
  {
    id: 'input-text',
    name: '输入框',
    category: '表单',
    icon: '📝',
    template: `<input type="text" class="input" placeholder="请输入内容..." />
<style>
.input {
  width: 100%;
  max-width: 300px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;
}
.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.input::placeholder {
  color: #a0aec0;
}
</style>`
  },
  {
    id: 'input-search',
    name: '搜索框',
    category: '表单',
    icon: '🔍',
    template: `<div class="search-wrapper">
  <input type="text" class="search-input" placeholder="搜索..." />
  <svg class="search-icon" width="20" height="20" fill="none" stroke="currentColor">
    <circle cx="9" cy="9" r="7"/>
    <path d="M21 21l-6-6"/>
  </svg>
</div>
<style>
.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 300px;
}
.search-input {
  width: 100%;
  padding: 12px 16px 12px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  font-size: 14px;
  box-sizing: border-box;
  background: white;
}
.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  pointer-events: none;
}
</style>`
  },
  {
    id: 'textarea',
    name: '文本域',
    category: '表单',
    icon: '📄',
    template: `<textarea class="textarea" rows="3" placeholder="请输入内容..."></textarea>
<style>
.textarea {
  width: 100%;
  max-width: 300px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;
}
.textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
</style>`
  },
  {
    id: 'checkbox',
    name: '复选框',
    category: '表单',
    icon: '☑️',
    template: `<label class="checkbox-label">
  <input type="checkbox" class="checkbox" />
  <span>同意条款</span>
</label>
<style>
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #2d3748;
}
.checkbox {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  accent-color: #667eea;
  cursor: pointer;
}
</style>`
  },

  // 卡片
  {
    id: 'card-basic',
    name: '基础卡片',
    category: '卡片',
    icon: '🃏',
    template: `<div class="card">
  <h3 class="card-title">卡片标题</h3>
  <p class="card-content">这是一段卡片内容，可以包含文字、图片或其他元素。</p>
</div>
<style>
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  max-width: 300px;
}
.card-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}
.card-content {
  margin: 0;
  font-size: 14px;
  color: #718096;
  line-height: 1.6;
}
</style>`
  },
  {
    id: 'card-image',
    name: '图片卡片',
    category: '卡片',
    icon: '🖼️',
    template: `<div class="image-card">
  <div class="image-card-header">
    <div class="image-placeholder">🖼️</div>
  </div>
  <div class="image-card-body">
    <h3 class="image-card-title">图片卡片</h3>
    <p class="image-card-text">这是一个带图片的卡片示例</p>
  </div>
</div>
<style>
.image-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  max-width: 300px;
}
.image-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-placeholder {
  font-size: 48px;
}
.image-card-body {
  padding: 20px;
}
.image-card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}
.image-card-text {
  margin: 0;
  font-size: 14px;
  color: #718096;
}
</style>`
  },

  // 标签徽章
  {
    id: 'badge',
    name: '徽章',
    category: '标签',
    icon: '🏷️',
    template: `<span class="badge">新功能</span>
<style>
.badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}
</style>`
  },
  {
    id: 'tag',
    name: '标签',
    category: '标签',
    icon: '🏷️',
    template: `<div class="tags">
  <span class="tag tag-blue">蓝色</span>
  <span class="tag tag-green">绿色</span>
  <span class="tag tag-orange">橙色</span>
</div>
<style>
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
.tag-blue {
  background: #ebf8ff;
  color: #3182ce;
}
.tag-green {
  background: #f0fff4;
  color: #38a169;
}
.tag-orange {
  background: #fffaf0;
  color: #dd6b20;
}
</style>`
  },

  // 提示
  {
    id: 'alert-success',
    name: '成功提示',
    category: '提示',
    icon: '✅',
    template: `<div class="alert alert-success">
  <span class="alert-icon">✓</span>
  <span class="alert-message">操作成功完成！</span>
</div>
<style>
.alert {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.alert-success {
  background: #f0fff4;
  border: 1px solid #c6f6d5;
  color: #276749;
}
.alert-icon {
  font-size: 18px;
  margin-right: 12px;
  font-weight: bold;
}
.alert-message {
  font-size: 14px;
}
</style>`
  },
  {
    id: 'alert-warning',
    name: '警告提示',
    category: '提示',
    icon: '⚠️',
    template: `<div class="alert alert-warning">
  <span class="alert-icon">⚠</span>
  <span class="alert-message">请注意这条警告信息</span>
</div>
<style>
.alert {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.alert-warning {
  background: #fffaf0;
  border: 1px solid #feebc8;
  color: #975a16;
}
.alert-icon {
  font-size: 18px;
  margin-right: 12px;
  font-weight: bold;
}
.alert-message {
  font-size: 14px;
}
</style>`
  },

  // 导航
  {
    id: 'navbar',
    name: '导航栏',
    category: '导航',
    icon: '📍',
    template: `<nav class="navbar">
  <a href="#" class="nav-link active">首页</a>
  <a href="#" class="nav-link">产品</a>
  <a href="#" class="nav-link">关于</a>
  <a href="#" class="nav-link">联系</a>
</nav>
<style>
.navbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: #718096;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.nav-link:hover {
  background: #edf2f7;
  color: #2d3748;
}
.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>`
  },
  {
    id: 'breadcrumb',
    name: '面包屑',
    category: '导航',
    icon: '🧭',
    template: `<nav class="breadcrumb">
  <a href="#" class="breadcrumb-link">首页</a>
  <span class="breadcrumb-separator">/</span>
  <a href="#" class="breadcrumb-link">产品</a>
  <span class="breadcrumb-separator">/</span>
  <span class="breadcrumb-current">详情</span>
</nav>
<style>
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}
.breadcrumb-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}
.breadcrumb-link:hover {
  color: #764ba2;
}
.breadcrumb-separator {
  margin: 0 8px;
  color: #a0aec0;
}
.breadcrumb-current {
  color: #718096;
  font-weight: 500;
}
</style>`
  },

  // 布局
  {
    id: 'grid-2',
    name: '两列布局',
    category: '布局',
    icon: '▦',
    template: `<div class="grid-2">
  <div class="grid-item">列 1</div>
  <div class="grid-item">列 2</div>
</div>
<style>
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}
.grid-item {
  background: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  color: #718096;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>`
  },
  {
    id: 'grid-3',
    name: '三列布局',
    category: '布局',
    icon: '▦',
    template: `<div class="grid-3">
  <div class="grid-item">列 1</div>
  <div class="grid-item">列 2</div>
  <div class="grid-item">列 3</div>
</div>
<style>
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 400px;
}
.grid-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #718096;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>`
  },
  {
    id: 'divider',
    name: '分割线',
    category: '布局',
    icon: '➖',
    template: `<hr class="divider" />
<style>
.divider {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 16px 0;
  width: 100%;
}
</style>`
  },

  // ========== 页面模板 ==========
  {
    id: 'template-dashboard',
    name: '仪表板布局',
    category: '页面模板',
    icon: '📊',
    template: `<div class="admin-dashboard">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="logo">管理后台</h2>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active">📊 仪表板</a>
      <a href="#" class="nav-item">👥 用户管理</a>
      <a href="#" class="nav-item">📦 产品管理</a>
      <a href="#" class="nav-item">📈 数据分析</a>
      <a href="#" class="nav-item">⚙️ 系统设置</a>
    </nav>
  </aside>
  <main class="main-content">
    <header class="topbar">
      <div class="search-box">
        <input type="text" placeholder="搜索..." />
      </div>
      <div class="user-menu">
        <span>管理员</span>
        <div class="avatar">👤</div>
      </div>
    </header>
    <div class="content-area">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">1,234</div>
          <div class="stat-label">总用户数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">5,678</div>
          <div class="stat-label">订单数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">¥89,012</div>
          <div class="stat-label">总收入</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">+23%</div>
          <div class="stat-label">增长率</div>
        </div>
      </div>
      <div class="chart-section">
        <h3 class="section-title">数据概览</h3>
        <div class="chart-placeholder">📊 图表区域</div>
      </div>
    </div>
  </main>
</div>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
.admin-dashboard {
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f7fa;
}
.sidebar {
  width: 240px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #34495e;
}
.logo {
  font-size: 20px;
  font-weight: 600;
}
.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}
.nav-item {
  display: block;
  padding: 12px 20px;
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.2s;
}
.nav-item:hover, .nav-item.active {
  background: #34495e;
  color: white;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.topbar {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
}
.search-box input {
  padding: 8px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  width: 300px;
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 36px;
  height: 36px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}
.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}
.section-title {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 16px;
}
.chart-placeholder {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  color: #bdc3c7;
  font-size: 48px;
}
</style>`
  },

  {
    id: 'template-table',
    name: '表格页面',
    category: '页面模板',
    icon: '📋',
    template: `<div class="table-page">
  <div class="page-header">
    <h1 class="page-title">用户管理</h1>
    <button class="btn-primary">+ 新增用户</button>
  </div>
  <div class="table-toolbar">
    <div class="search-wrapper">
      <input type="text" class="search-input" placeholder="搜索用户..." />
    </div>
    <div class="filter-group">
      <select class="filter-select">
        <option>所有状态</option>
        <option>启用</option>
        <option>禁用</option>
      </select>
    </div>
  </div>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th><input type="checkbox" /></th>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>状态</th>
          <th>注册时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="checkbox" /></td>
          <td>
            <div class="user-info">
              <div class="user-avatar">张</div>
              <span>张三</span>
            </div>
          </td>
          <td>zhang@example.com</td>
          <td><span class="role-badge admin">管理员</span></td>
          <td><span class="status-badge active">启用</span></td>
          <td>2024-01-15</td>
          <td>
            <button class="action-btn edit">编辑</button>
            <button class="action-btn delete">删除</button>
          </td>
        </tr>
        <tr>
          <td><input type="checkbox" /></td>
          <td>
            <div class="user-info">
              <div class="user-avatar">李</div>
              <span>李四</span>
            </div>
          </td>
          <td>li@example.com</td>
          <td><span class="role-badge user">用户</span></td>
          <td><span class="status-badge active">启用</span></td>
          <td>2024-01-18</td>
          <td>
            <button class="action-btn edit">编辑</button>
            <button class="action-btn delete">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="table-footer">
    <div class="page-info">显示 1-10 条，共 50 条</div>
    <div class="pagination">
      <button class="page-btn">上一页</button>
      <button class="page-btn active">1</button>
      <button class="page-btn">2</button>
      <button class="page-btn">3</button>
      <button class="page-btn">下一页</button>
    </div>
  </div>
</div>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
.table-page {
  padding: 30px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  color: #2c3e50;
}
.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}
.table-toolbar {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
}
.search-wrapper input {
  padding: 8px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  width: 300px;
}
.filter-select {
  padding: 8px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
}
.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e1e8ed;
}
.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f3f5;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}
.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.role-badge.admin { background: #ffeaa7; color: #d35400; }
.role-badge.user { background: #dfe6e9; color: #2d3436; }
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge.active { background: #d4edda; color: #155724; }
.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
  font-size: 12px;
}
.action-btn.edit { background: #3498db; color: white; }
.action-btn.delete { background: #e74c3c; color: white; }
.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-info { color: #7f8c8d; }
.pagination { display: flex; gap: 8px; }
.page-btn {
  padding: 8px 16px;
  border: 1px solid #e1e8ed;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}
.page-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}
</style>`
  },

  {
    id: 'template-form',
    name: '表单页面',
    category: '页面模板',
    icon: '📝',
    template: `<div class="form-page">
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">新增用户</h1>
      <p class="form-subtitle">请填写用户基本信息</p>
    </div>
    <form class="form-body">
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-group">
          <label class="form-label">用户名 <span class="required">*</span></label>
          <input type="text" class="form-input" placeholder="请输入用户名" />
          <span class="form-hint">用户名长度应为 3-20 个字符</span>
        </div>
        <div class="form-group">
          <label class="form-label">邮箱 <span class="required">*</span></label>
          <input type="email" class="form-input" placeholder="example@email.com" />
        </div>
        <div class="form-group">
          <label class="form-label">手机号</label>
          <input type="tel" class="form-input" placeholder="请输入手机号" />
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">角色与权限</h3>
        <div class="form-group">
          <label class="form-label">用户角色 <span class="required">*</span></label>
          <select class="form-select">
            <option>请选择角色</option>
            <option>管理员</option>
            <option>编辑</option>
            <option>普通用户</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">权限设置</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" checked />
              <span>查看数据</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" checked />
              <span>编辑数据</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" />
              <span>删除数据</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" />
              <span>导出数据</span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-section">
        <h3 class="section-title">其他信息</h3>
        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea class="form-textarea" rows="4" placeholder="请输入备注信息"></textarea>
        </div>
        <div class="form-group">
          <label class="checkbox-item">
            <input type="checkbox" />
            <span>发送欢迎邮件给用户</span>
          </label>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary">取消</button>
        <button type="submit" class="btn-primary">保存</button>
      </div>
    </form>
  </div>
</div>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
.form-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 30px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.form-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.form-header {
  padding: 30px;
  border-bottom: 1px solid #e1e8ed;
}
.form-title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 8px;
}
.form-subtitle {
  color: #7f8c8d;
  font-size: 14px;
}
.form-body {
  padding: 30px;
}
.form-section {
  margin-bottom: 30px;
}
.section-title {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f1f3f5;
}
.form-group {
  margin-bottom: 20px;
}
.form-label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}
.required { color: #e74c3c; }
.form-input, .form-select {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #95a5a6;
}
.form-textarea {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}
.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.checkbox-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.checkbox-item input {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  accent-color: #667eea;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}
.btn-primary, .btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}
</style>`
  },

  {
    id: 'template-login',
    name: '登录页面',
    category: '页面模板',
    icon: '🔐',
    template: `<div class="login-page">
  <div class="login-container">
    <div class="login-header">
      <div class="logo">🔐</div>
      <h1 class="login-title">欢迎回来</h1>
      <p class="login-subtitle">登录到您的账户</p>
    </div>
    <form class="login-form">
      <div class="form-group">
        <label class="form-label">邮箱地址</label>
        <div class="input-wrapper">
          <span class="input-icon">📧</span>
          <input type="email" class="form-input" placeholder="your@email.com" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">密码</label>
        <div class="input-wrapper">
          <span class="input-icon">🔒</span>
          <input type="password" class="form-input" placeholder="••••••••" />
        </div>
      </div>
      <div class="form-options">
        <label class="checkbox-label">
          <input type="checkbox" />
          <span>记住我</span>
        </label>
        <a href="#" class="forgot-link">忘记密码？</a>
      </div>
      <button type="submit" class="login-btn">登录</button>
      <div class="divider">
        <span>或</span>
      </div>
      <div class="social-login">
        <button type="button" class="social-btn">
          <span>🔑</span>
          <span>GitHub</span>
        </button>
        <button type="button" class="social-btn">
          <span>🔷</span>
          <span>Google</span>
        </button>
      </div>
    </form>
    <div class="login-footer">
      <p>还没有账户？<a href="#" class="register-link">立即注册</a></p>
    </div>
  </div>
</div>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.login-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.logo {
  font-size: 48px;
  margin-bottom: 16px;
}
.login-title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 8px;
}
.login-subtitle {
  color: #7f8c8d;
  font-size: 14px;
}
.login-form { margin-bottom: 24px; }
.form-group { margin-bottom: 20px; }
.form-label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}
.input-wrapper {
  position: relative;
}
.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
}
.form-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #7f8c8d;
}
.checkbox-label input {
  margin-right: 8px;
  accent-color: #667eea;
}
.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}
.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}
.login-btn:hover {
  transform: translateY(-2px);
}
.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}
.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #e1e8ed;
}
.divider span {
  position: relative;
  background: white;
  padding: 0 16px;
  color: #95a5a6;
  font-size: 14px;
}
.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.social-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
}
.login-footer {
  text-align: center;
  font-size: 14px;
  color: #7f8c8d;
}
.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}
</style>`
  },

  {
    id: 'template-settings',
    name: '设置页面',
    category: '页面模板',
    icon: '⚙️',
    template: `<div class="settings-page">
  <aside class="settings-sidebar">
    <h2 class="sidebar-title">设置</h2>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active">👤 个人资料</a>
      <a href="#" class="nav-item">🔐 账户安全</a>
      <a href="#" class="nav-item">🔔 通知设置</a>
      <a href="#" class="nav-item">🎨 外观设置</a>
      <a href="#" class="nav-item">🔑 API 密钥</a>
      <a href="#" class="nav-item">📊 使用统计</a>
    </nav>
  </aside>
  <main class="settings-main">
    <div class="settings-content">
      <h1 class="page-title">个人资料</h1>
      <div class="profile-section">
        <div class="avatar-section">
          <div class="avatar-large">👤</div>
          <button class="avatar-btn">更换头像</button>
        </div>
        <form class="profile-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">名</label>
              <input type="text" class="form-input" value="张" />
            </div>
            <div class="form-group">
              <label class="form-label">姓</label>
              <input type="text" class="form-input" value="三" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" class="form-input" value="zhangsan" />
          </div>
          <div class="form-group">
            <label class="form-label">邮箱地址</label>
            <input type="email" class="form-input" value="zhangsan@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea class="form-textarea" rows="4">全栈开发工程师，热爱技术</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">时区</label>
            <select class="form-select">
              <option>UTC+8 北京时间</option>
              <option>UTC+9 东京时间</option>
              <option>UTC-5 纽约时间</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary">保存更改</button>
          </div>
        </form>
      </div>
      <div class="danger-zone">
        <h3 class="zone-title">危险区域</h3>
        <p class="zone-description">这些操作是不可逆的，请谨慎操作</p>
        <button class="danger-btn">删除账户</button>
      </div>
    </div>
  </main>
</div>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
.settings-page {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.settings-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e1e8ed;
  padding: 24px 0;
}
.sidebar-title {
  padding: 0 24px;
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 20px;
}
.sidebar-nav { padding: 0 12px; }
.nav-item {
  display: block;
  padding: 12px 16px;
  color: #7f8c8d;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
}
.nav-item:hover, .nav-item.active {
  background: #f1f3f5;
  color: #2c3e50;
}
.settings-main {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}
.settings-content { max-width: 800px; }
.page-title {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 32px;
}
.profile-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e1e8ed;
}
.avatar-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}
.avatar-btn {
  padding: 8px 16px;
  border: 1px solid #e1e8ed;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group { margin-bottom: 20px; }
.form-label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}
.form-input, .form-select {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
}
.form-textarea {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}
.btn-primary, .btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}
.danger-zone {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 12px;
  padding: 24px;
}
.zone-title {
  font-size: 16px;
  color: #c53030;
  margin-bottom: 8px;
}
.zone-description {
  color: #718096;
  font-size: 14px;
  margin-bottom: 16px;
}
.danger-btn {
  padding: 10px 20px;
  background: #fc8181;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>`
  }
]);

const categorizedComponents = computed(() => {
  const grouped: Record<string, Component[]> = {};
  components.value.forEach((component) => {
    if (!grouped[component.category]) {
      grouped[component.category] = [];
    }
    grouped[component.category].push(component);
  });
  return grouped;
});

function handleDragStart(event: DragEvent, component: Component) {
  if (event.dataTransfer) {
    // 使用多种格式以确保兼容性
    event.dataTransfer.setData('component', component.template);
    event.dataTransfer.setData('text/plain', component.template);
    event.dataTransfer.effectAllowed = 'copy';
    // 存储到全局变量，供 iframe 内部访问
    (window as any).draggedComponentHtml = component.template;
    console.log('Dragging component:', component.name);
  }
}
</script>
