<template>
  <div class="component-palette h-full flex flex-col">
    <div class="p-4 border-b border-gray-700">
      <h3 class="text-white font-semibold">组件库</h3>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-for="(components, category) in categorizedComponents" :key="category" class="mb-4">
        <h4 class="text-xs text-gray-400 uppercase tracking-wide mb-2 px-2">{{ category }}</h4>
        <div class="grid grid-cols-2 gap-2">
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
