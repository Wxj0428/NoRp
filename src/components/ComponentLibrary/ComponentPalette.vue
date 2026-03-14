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
  // Basic components
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
  },
  {
    id: 'text-basic',
    name: 'Text',
    category: 'basic',
    icon: '¶',
    template: '<p class="text">Lorem ipsum dolor sit amet</p>',
    defaultStyles: {
      fontSize: '16px',
      lineHeight: '1.5',
      color: '#374151'
    }
  },
  {
    id: 'heading-basic',
    name: 'Heading',
    category: 'basic',
    icon: 'H₁',
    template: '<h1 class="heading">Heading Text</h1>',
    defaultStyles: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#111827'
    }
  },
  {
    id: 'image-basic',
    name: 'Image',
    category: 'basic',
    icon: '🖼',
    template: '<img class="image" src="https://via.placeholder.com/300x200" alt="Placeholder" />',
    defaultStyles: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '4px'
    }
  },
  {
    id: 'link-basic',
    name: 'Link',
    category: 'basic',
    icon: '🔗',
    template: '<a href="#" class="link">Click here</a>',
    defaultStyles: {
      color: '#3b82f6',
      textDecoration: 'underline'
    }
  },

  // Layout components
  {
    id: 'container',
    name: 'Container',
    category: 'layout',
    icon: '▢',
    template: '<div class="container"></div>',
    defaultStyles: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }
  },
  {
    id: 'grid',
    name: 'Grid',
    category: 'layout',
    icon: '⊞',
    template:
      '<div class="grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;"><div>Cell 1</div><div>Cell 2</div></div>',
    defaultStyles: {
      display: 'grid',
      gap: '20px'
    }
  },
  {
    id: 'flex',
    name: 'Flex Box',
    category: 'layout',
    icon: '⊟',
    template:
      '<div class="flex" style="display: flex; gap: 20px;"><div>Item 1</div><div>Item 2</div></div>',
    defaultStyles: {
      display: 'flex',
      gap: '20px'
    }
  },
  {
    id: 'card',
    name: 'Card',
    category: 'layout',
    icon: '▭',
    template:
      '<div class="card"><div class="card-content">Card content</div></div>',
    defaultStyles: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }
  },

  // Form components
  {
    id: 'form',
    name: 'Form',
    category: 'forms',
    icon: '📋',
    template:
      '<form class="form"><div style="margin-bottom: 10px;"><label>Label</label><input type="text" style="width: 100%; padding: 8px; margin-top: 4px; border: 1px solid #ddd; border-radius: 4px;" /></div><button type="submit" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit</button></form>',
    defaultStyles: {}
  },
  {
    id: 'textarea',
    name: 'Textarea',
    category: 'forms',
    icon: '📝',
    template: '<textarea class="textarea" rows="4" placeholder="Enter text..."></textarea>',
    defaultStyles: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px',
      resize: 'vertical'
    }
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'forms',
    icon: '☑',
    template: '<label class="checkbox"><input type="checkbox" /> Check me</label>',
    defaultStyles: {
      cursor: 'pointer'
    }
  },
  {
    id: 'select',
    name: 'Select',
    category: 'forms',
    icon: '▼',
    template: '<select class="select"><option>Option 1</option><option>Option 2</option></select>',
    defaultStyles: {
      padding: '10px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px'
    }
  },

  // Navigation
  {
    id: 'navbar',
    name: 'Navbar',
    category: 'navigation',
    icon: '☰',
    template:
      '<nav class="navbar" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;"><div style="font-weight: bold; font-size: 18px;">Logo</div><div style="display: flex; gap: 20px;"><a href="#" style="color: #374151; text-decoration: none;">Home</a><a href="#" style="color: #374151; text-decoration: none;">About</a><a href="#" style="color: #374151; text-decoration: none;">Contact</a></div></nav>',
    defaultStyles: {}
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'navigation',
    icon: '›',
    template:
      '<nav class="breadcrumb" style="display: flex; gap: 8px; font-size: 14px;"><a href="#" style="color: #3b82f6; text-decoration: none;">Home</a><span style="color: #9ca3af;">/</span><a href="#" style="color: #3b82f6; text-decoration: none;">Category</a><span style="color: #9ca3af;">/</span><span style="color: #6b7280;">Page</span></nav>',
    defaultStyles: {}
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'navigation',
    icon: '⚌',
    template:
      '<div class="tabs" style="border-bottom: 1px solid #e5e7eb;"><button style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid #3b82f6; cursor: pointer; color: #3b82f6; font-weight: 500;">Tab 1</button><button style="padding: 10px 20px; background: none; border: none; cursor: pointer; color: #6b7280;">Tab 2</button><button style="padding: 10px 20px; background: none; border: none; cursor: pointer; color: #6b7280;">Tab 3</button></div>',
    defaultStyles: {}
  },

  // Data Display
  {
    id: 'table',
    name: 'Table',
    category: 'data',
    icon: '⊟',
    template:
      '<table class="table" style="width: 100%; border-collapse: collapse;"><thead><tr style="background: #f9fafb;"><th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Header 1</th><th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Header 2</th></tr></thead><tbody><tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Data 1</td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Data 2</td></tr><tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Data 3</td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Data 4</td></tr></tbody></table>',
    defaultStyles: {}
  },
  {
    id: 'list',
    name: 'List',
    category: 'data',
    icon: '⋮',
    template:
      '<ul class="list" style="list-style: disc; padding-left: 20px;"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>',
    defaultStyles: {}
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'data',
    icon: '●',
    template:
      '<span class="badge" style="display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 12px; font-weight: 500;">Badge</span>',
    defaultStyles: {}
  },

  // Feedback
  {
    id: 'alert',
    name: 'Alert',
    category: 'feedback',
    icon: '⚠',
    template:
      '<div class="alert" style="padding: 12px 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; color: #92400e;">This is an alert message</div>',
    defaultStyles: {}
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'feedback',
    icon: '◉',
    template:
      '<div class="modal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;"><div style="background: white; padding: 24px; border-radius: 8px; max-width: 400px; width: 100%;"><h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: bold;">Modal Title</h3><p style="margin: 0 0 20px 0; color: #6b7280;">Modal content goes here</p><button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button></div></div>',
    defaultStyles: {}
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'feedback',
    icon: 'ⓘ',
    template:
      '<div class="tooltip" style="position: relative; display: inline-block;"><span style="cursor: help; border-bottom: 1px dotted #6b7280;">Hover me</span><div style="position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #1f2937; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; white-space: nowrap; margin-bottom: 4px;">Tooltip text</div></div>',
    defaultStyles: {}
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
    console.log('Dragging component:', component.name, component.template);
  }
}
</script>
