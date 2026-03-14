<template>
  <div class="h-screen w-screen flex flex-col bg-gray-900">
    <!-- Header -->
    <header class="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
      <div class="flex items-center gap-4">
        <h1 class="text-white font-semibold text-lg">NoRp UI 设计器</h1>
        <span :class="[
          'px-2 py-0.5 text-xs rounded',
          isElectron ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
        ]">
          {{ isElectron ? 'Electron' : 'Browser' }}
        </span>
        <div class="flex gap-2">
          <button
            @click="newProject"
            class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            新建
          </button>
          <button
            @click="openProject"
            class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            打开
          </button>
          <button
            @click="saveProject"
            class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            保存
          </button>
          <button
            @click="exportHtml"
            class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded"
          >
            导出
          </button>
        </div>
      </div>
      <div class="flex-1"></div>
      <button
        @click="showProjectSettings = true"
        class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded"
      >
        项目设置
      </button>
      <button
        @click="showAppSettings = true"
        class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded"
      >
        应用设置
      </button>
      <button
        @click="showAISettings = true"
        class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded"
      >
        AI 设置
      </button>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Pages -->
      <aside class="w-48 bg-gray-800 border-r border-gray-700 flex flex-col">
        <PageList />
      </aside>

      <!-- Left Panel: Component Library -->
      <aside class="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <ComponentPalette />
      </aside>

      <!-- Center: Canvas -->
      <main class="flex-1 bg-gray-900 overflow-hidden relative">
        <Canvas />
      </main>

      <!-- Right Panel: Properties & Layers -->
      <aside class="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
        <div class="border-b border-gray-700">
          <PropertyPanel />
        </div>
        <div>
          <LayerTree />
        </div>
      </aside>
    </div>

    <!-- AI Panel (Floating) -->
    <ChatPanel v-if="showAIPanel" class="fixed bottom-4 right-4 w-96 h-[600px]" />

    <!-- Toggle AI Panel Button -->
    <button
      @click="showAIPanel = !showAIPanel"
      class="fixed bottom-4 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
      title="切换 AI 聊天"
    >
      🤖
    </button>

    <!-- AI Settings Modal -->
    <AISettings v-if="showAISettings" @close="showAISettings = false" />

    <!-- New Project Dialog -->
    <NewProjectDialog
      v-if="showNewProjectDialog"
      @create="handleNewProject"
      @cancel="showNewProjectDialog = false"
    />

    <!-- Project Settings Dialog -->
    <ProjectSettingsDialog
      v-if="showProjectSettings && projectStore.project"
      :project="projectStore.project"
      @save="handleProjectSettingsSave"
      @cancel="showProjectSettings = false"
    />

    <!-- App Settings Dialog -->
    <AppSettingsDialog
      v-if="showAppSettings"
      @save="handleAppSettingsSave"
      @cancel="showAppSettings = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Canvas from './components/Editor/Canvas.vue';
import PropertyPanel from './components/Editor/PropertyPanel.vue';
import LayerTree from './components/Editor/LayerTree.vue';
import PageList from './components/Editor/PageList.vue';
import ComponentPalette from './components/ComponentLibrary/ComponentPalette.vue';
import ChatPanel from './components/AIPanel/ChatPanel.vue';
import AISettings from './components/AIPanel/AISettings.vue';
import NewProjectDialog from './components/Dialogs/NewProjectDialog.vue';
import ProjectSettingsDialog from './components/Dialogs/ProjectSettingsDialog.vue';
import AppSettingsDialog from './components/Dialogs/AppSettingsDialog.vue';
import { useProjectStore } from './stores/project';
import { useEditorStore } from './stores/editor';
import { storageService } from './services/storage';
import { exportService } from './services/export';
import type { ExportOptions } from './types';

const projectStore = useProjectStore();
const editorStore = useEditorStore();

const showAIPanel = ref(false);
const showAISettings = ref(false);
const showNewProjectDialog = ref(false);
const showProjectSettings = ref(false);
const showAppSettings = ref(false);
const isElectron = ref(false);

onMounted(() => {
  // Create a default project on startup
  projectStore.createProject('Untitled Project');

  // Debug: Check if electronAPI is available
  isElectron.value = !!(window as any).electronAPI;
  console.log('Running in Electron:', isElectron.value);
  console.log('electronAPI:', (window as any).electronAPI);

  // Listen for menu events if in Electron
  if (isElectron.value && (window as any).electronAPI?.onMenuEvent) {
    (window as any).electronAPI.onMenuEvent((event: string, ...args: any[]) => {
      switch (event) {
        case 'menu:new-project':
          newProject();
          break;
        case 'menu:open-project':
          if (args[0]) {
            openProjectFromFile(args[0]);
          }
          break;
        case 'menu:save':
          saveProject();
          break;
        case 'menu:export':
          if (args[0]) {
            exportHtmlTo(args[0]);
          }
          break;
        case 'menu:ai-settings':
          showAISettings.value = true;
          break;
        case 'menu:project-settings':
          showProjectSettings.value = true;
          break;
        case 'menu:app-settings':
          showAppSettings.value = true;
          break;
        case 'menu:shortcuts':
          showAppSettings.value = true; // Open app settings with shortcuts tab
          break;
        case 'menu:about':
          showAppSettings.value = true; // Open app settings with about tab
          break;
        case 'menu:zoom-in':
          editorStore.setZoom(editorStore.zoom + 0.1);
          break;
        case 'menu:zoom-out':
          editorStore.setZoom(editorStore.zoom - 0.1);
          break;
        case 'menu:reset-zoom':
          editorStore.resetView();
          break;
        case 'menu:select-all':
          // TODO: Implement select all functionality
          console.log('Select all - to be implemented');
          break;
      }
    });
  }
});

async function openProjectFromFile(filePath: string) {
  try {
    const project = await storageService.loadProject(filePath);
    if (project) {
      projectStore.loadProject(project);
      editorStore.clearHistory();
    }
  } catch (error) {
    console.error('Failed to open project:', error);
    alert('打开项目失败');
  }
}

async function exportHtmlTo(filePath: string) {
  try {
    if (!projectStore.project) return;

    const options: ExportOptions = {
      format: 'html-single',
      minify: false,
      includeDependencies: false,
      responsive: true
    };

    const result = exportService.exportToSingleHTML(projectStore.project, options);
    await storageService.writeFile(filePath, result.html);
    alert('导出成功！');
  } catch (error) {
    console.error('Failed to export:', error);
    alert('导出失败');
  }
}

async function newProject() {
  if (projectStore.isDirty) {
    const confirmed = confirm('当前项目未保存，是否继续？');
    if (!confirmed) return;
  }
  // 显示新建项目对话框
  showNewProjectDialog.value = true;
}

function handleNewProject(config: any) {
  projectStore.createProject(config.name);
  // 应用其他设置...
  showNewProjectDialog.value = false;
}

async function openProject() {
  try {
    // Check if running in Electron
    if (!(window as any).electronAPI) {
      alert('当前在浏览器模式运行，无法打开文件。请使用 Electron 桌面应用。');
      return;
    }

    const result = await storageService.showOpenDialog();
    if (!result.canceled && result.filePaths.length > 0) {
      const project = await storageService.loadProject(result.filePaths[0]);
      if (project) {
        projectStore.loadProject(project);
        editorStore.clearHistory();
        alert('项目已打开');
      }
    }
  } catch (error) {
    console.error('Failed to open project:', error);
    alert('打开项目失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

async function saveProject() {
  try {
    if (!projectStore.project) {
      alert('没有可保存的项目');
      return;
    }

    // Check if running in Electron
    if (!(window as any).electronAPI) {
      alert('当前在浏览器模式运行，无法保存文件。请使用 Electron 桌面应用。');
      console.log('模拟保存：', JSON.stringify(projectStore.project, null, 2));
      return;
    }

    // If project already has a path, save directly
    // Otherwise show save dialog
    const result = await storageService.showSaveDialog({
      defaultPath: `${projectStore.project.name}.norp`
    });

    if (!result.canceled && result.filePath) {
      const success = await storageService.saveProject(result.filePath, projectStore.project);
      if (success) {
        projectStore.markAsSaved();
        alert('项目已保存到: ' + result.filePath);
      } else {
        alert('保存失败');
      }
    }
  } catch (error) {
    console.error('Failed to save project:', error);
    alert('保存项目失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

async function exportHtml() {
  try {
    if (!projectStore.project) {
      alert('没有可导出的项目');
      return;
    }

    const options: ExportOptions = {
      format: 'html-single',
      minify: false,
      includeDependencies: false,
      responsive: true
    };

    const result = exportService.exportToSingleHTML(projectStore.project, options);

    // Check if running in Electron
    if (!(window as any).electronAPI) {
      // Browser mode - download using Blob
      const blob = new Blob([result.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectStore.project.name}.html`;
      a.click();
      URL.revokeObjectURL(url);
      alert('导出成功！');
      return;
    }

    // Electron mode - show save dialog
    const defaultPath = `${projectStore.project.name}.html`;
    const saveResult = await storageService.showSaveDialog({
      filters: [{ name: 'HTML File', extensions: ['html'] }],
      defaultPath
    });

    if (!saveResult.canceled && saveResult.filePath) {
      await storageService.writeFile(saveResult.filePath, result.html);
      alert('导出成功！文件已保存到: ' + saveResult.filePath);
    }
  } catch (error) {
    console.error('Failed to export:', error);
    alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

function handleProjectSettingsSave(settings: any) {
  // Apply project settings
  if (projectStore.project) {
    projectStore.project.name = settings.name;
    projectStore.project.settings = {
      ...projectStore.project.settings,
      gridEnabled: settings.gridEnabled,
      gridSize: settings.gridSize,
      snapToGrid: settings.snapToGrid,
      autosave: settings.autosave,
      autosaveInterval: settings.autosaveInterval
    };
  }
  showProjectSettings.value = false;
}

function handleAppSettingsSave(settings: any) {
  // Apply app settings
  localStorage.setItem('norp-app-settings', JSON.stringify(settings));
  showAppSettings.value = false;
}
</script>
