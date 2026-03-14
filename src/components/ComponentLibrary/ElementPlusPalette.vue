<template>
  <div class="element-palette h-full flex flex-col bg-gray-800 border-r border-gray-700">
    <!-- Header with tabs -->
    <div class="p-4 border-b border-gray-700">
      <div class="flex gap-2">
        <button
          @click="activeTab = 'basic'"
          :class="[
            'px-3 py-1 text-sm rounded',
            activeTab === 'basic' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          ]"
        >
          基础组件
        </button>
        <button
          @click="activeTab = 'element'"
          :class="[
            'px-3 py-1 text-sm rounded',
            activeTab === 'element' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          ]"
        >
          Element Plus
        </button>
      </div>
    </div>

    <!-- Basic Components -->
    <div v-if="activeTab === 'basic'" class="flex-1 overflow-y-auto p-2">
      <div v-for="(components, category) in basicComponents" :key="category" class="mb-4">
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

    <!-- Element Plus Components -->
    <div v-if="activeTab === 'element'" class="flex-1 overflow-y-auto p-2">
      <div v-for="(components, category) in elementComponents" :key="category" class="mb-4">
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
import { ref } from 'vue';
import type { Component } from '@/types';

const activeTab = ref('element');

// Basic components (原有的 HTML 组件)
const basicComponents = ref({
  '基础': [
    {
      id: 'btn-basic',
      name: 'Button',
      category: 'basic',
      icon: '⚙',
      template: '<button class="btn">Click me</button>',
      defaultStyles: {
        padding: '10px 20px',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }
    },
    {
      id: 'input-basic',
      name: 'Input',
      category: 'basic',
      icon: '⌨',
      template: '<input type="text" class="input" placeholder="Enter text..." />',
      defaultStyles: {
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px'
      }
    }
  ]
});

// Element Plus components
const elementComponents = ref({
  '按钮': [
    {
      id: 'el-button-default',
      name: '默认按钮',
      category: 'button',
      icon: '🔘',
      template: '<el-button>默认按钮</el-button>'
    },
    {
      id: 'el-button-primary',
      name: '主要按钮',
      category: 'button',
      icon: '🔵',
      template: '<el-button type="primary">主要按钮</el-button>'
    },
    {
      id: 'el-button-success',
      name: '成功按钮',
      category: 'button',
      icon: '🟢',
      template: '<el-button type="success">成功按钮</el-button>'
    },
    {
      id: 'el-button-warning',
      name: '警告按钮',
      category: 'button',
      icon: '🟡',
      template: '<el-button type="warning">警告按钮</el-button>'
    },
    {
      id: 'el-button-danger',
      name: '危险按钮',
      category: 'button',
      icon: '🔴',
      template: '<el-button type="danger">危险按钮</el-button>'
    },
    {
      id: 'el-button-plain',
      name: '朴素按钮',
      category: 'button',
      icon: '⚪',
      template: '<el-button plain>朴素按钮</el-button>'
    }
  ],
  '表单': [
    {
      id: 'el-input',
      name: '输入框',
      category: 'form',
      icon: '📝',
      template: '<el-input placeholder="请输入内容" />'
    },
    {
      id: 'el-input-password',
      name: '密码框',
      category: 'form',
      icon: '🔒',
      template: '<el-input type="password" placeholder="请输入密码" show-password />'
    },
    {
      id: 'el-textarea',
      name: '文本域',
      category: 'form',
      icon: '📄',
      template: '<el-input type="textarea" :rows="2" placeholder="请输入内容" />'
    },
    {
      id: 'el-select',
      name: '选择器',
      category: 'form',
      icon: '📋',
      template: '<el-select placeholder="请选择"><el-option label="选项1" value="1" /><el-option label="选项2" value="2" /></el-select>'
    },
    {
      id: 'el-switch',
      name: '开关',
      category: 'form',
      icon: '🔘',
      template: '<el-switch />'
    },
    {
      id: 'el-slider',
      name: '滑块',
      category: 'form',
      icon: '📊',
      template: '<el-slider />'
    }
  ],
  '数据展示': [
    {
      id: 'el-table',
      name: '表格',
      category: 'data',
      icon: '📊',
      template: '<el-table :data="tableData"><el-table-column prop="name" label="名称" /><el-table-column prop="address" label="地址" /></el-table>'
    },
    {
      id: 'el-tag',
      name: '标签',
      category: 'data',
      icon: '🏷️',
      template: '<el-tag>标签一</el-tag><el-tag type="success">标签二</el-tag><el-tag type="info">标签三</el-tag>'
    },
    {
      id: 'el-progress',
      name: '进度条',
      category: 'data',
      icon: '📈',
      template: '<el-progress :percentage="50" />'
    },
    {
      id: 'el-badge',
      name: '徽章',
      category: 'data',
      icon: '🔴',
      template: '<el-badge :value="12"><el-button>消息</el-button></el-badge>'
    }
  ],
  '反馈': [
    {
      id: 'el-alert',
      name: '警告',
      category: 'feedback',
      icon: '⚠️',
      template: '<el-alert title="成功提示的文案" type="success" show-icon />'
    },
    {
      id: 'el-message',
      name: '消息提示',
      category: 'feedback',
      icon: '💬',
      template: '<el-button @click="ElMessage.success(\'操作成功\')">按钮</el-button>'
    },
    {
      id: 'el-message-box',
      name: '消息框',
      category: 'feedback',
      icon: '📦',
      template: '<el-button @click="ElMessageBox.alert(\'消息内容\', \'标题\')">消息框</el-button>'
    },
    {
      id: 'el-notification',
      name: '通知',
      category: 'feedback',
      icon: '🔔',
      template: '<el-button @click="ElNotification({ title: \'标题\', message: \'这是消息内容\' })">通知</el-button>'
    }
  ],
  '导航': [
    {
      id: 'el-menu',
      name: '菜单',
      category: 'navigation',
      icon: '📋',
      template: '<el-menu mode="horizontal" default-active="1"><el-menu-item index="1">处理中心</el-menu-item><el-menu-item index="2">工作台</el-menu-item></el-menu>'
    },
    {
      id: 'el-tabs',
      name: '标签页',
      category: 'navigation',
      icon: '📑',
      template: '<el-tabs><el-tab-pane label="用户" name="first">用户</el-tab-pane><el-tab-pane label="角色" name="second">角色</el-tab-pane></el-tabs>'
    },
    {
      id: 'el-breadcrumb',
      name: '面包屑',
      category: 'navigation',
      icon: '📍',
      template: '<el-breadcrumb separator="/"><el-breadcrumb-item :to="{ path: \'/\' }">首页</el-breadcrumb-item><el-breadcrumb-item><a href="/">活动管理</a></el-breadcrumb-item></el-breadcrumb>'
    }
  ],
  '布局': [
    {
      id: 'el-container',
      name: '容器布局',
      category: 'layout',
      icon: '📦',
      template: '<el-container><el-header>Header</el-header><el-main>Main</el-main><el-footer>Footer</el-footer></el-container>'
    },
    {
      id: 'el-card',
      name: '卡片',
      category: 'layout',
      icon: '🃏',
      template: '<el-card><template #header><span>卡片名称</span></template>卡片内容</el-card>'
    },
    {
      id: 'el-collapse',
      name: '折叠面板',
      category: 'layout',
      icon: '📁',
      template: '<el-collapse><el-collapse-item title="面板 1">内容 1</el-collapse-item><el-collapse-item title="面板 2">内容 2</el-collapse-item></el-collapse>'
    }
  ]
});

function handleDragStart(event: DragEvent, component: Component) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('component', component.template);
    event.dataTransfer.setData('text/plain', component.template);
    event.dataTransfer.effectAllowed = 'copy';
    (window as any).draggedComponentHtml = component.template;
    console.log('Dragging component:', component.name);
  }
}
</script>
