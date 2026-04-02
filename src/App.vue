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

        <!-- Project Info -->
        <div class="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded border border-gray-700">
          <span class="text-gray-400 text-xs">项目:</span>
          <span class="text-white text-sm font-medium truncate max-w-[200px]">
            {{ projectStore.project?.name || '未命名项目' }}
          </span>
          <span v-if="projectStore.isDirty" class="text-yellow-400 text-xs">●</span>
        </div>

        <div class="flex gap-2">
          <button @click="newProject" class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            新建
          </button>
          <button @click="openProject" class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            打开
          </button>
          <button @click="saveProject" :class="['px-3 py-1 text-sm rounded', projectStore.isDirty ? 'text-yellow-300 hover:text-yellow-200 hover:bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700']">
            保存
          </button>
          <button @click="exportHtml" class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
            导出
          </button>
        </div>
      </div>
      <div class="flex-1"></div>
      <button @click="showAIPanel = !showAIPanel" class="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
        AI 面板
      </button>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Pages -->
      <aside
        :class="['bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-200', leftPanelCollapsed ? 'w-10' : 'w-48']"
      >
        <div v-if="!leftPanelCollapsed" class="flex-1 overflow-y-auto">
          <PageList></PageList>
        </div>
        <button
          @click="leftPanelCollapsed = !leftPanelCollapsed"
          class="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 text-xs border-t border-gray-700 mt-auto"
          :title="leftPanelCollapsed ? '展开页面列表' : '折叠页面列表'"
        >
          {{ leftPanelCollapsed ? '▶' : '◀' }}
        </button>
      </aside>

      <!-- Left Panel: Component Library -->
      <aside
        :class="['bg-gray-800 border-r border-gray-700 overflow-y-auto transition-all duration-200', componentPanelCollapsed ? 'w-10' : 'w-64']"
      >
        <div v-if="!componentPanelCollapsed">
          <ComponentPalette></ComponentPalette>
        </div>
        <button
          @click="componentPanelCollapsed = !componentPanelCollapsed"
          class="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 text-xs border-t border-gray-700"
          :title="componentPanelCollapsed ? '展开组件库' : '折叠组件库'"
        >
          {{ componentPanelCollapsed ? '▶' : '◀' }}
        </button>
      </aside>

      <!-- Center: Canvas -->
      <main class="flex-1 bg-gray-900 overflow-hidden relative">
        <Canvas></Canvas>
      </main>

      <!-- Right Panel: Properties & Layers -->
      <aside
        :class="['bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-200', rightPanelCollapsed ? 'w-10' : 'w-80']"
      >
        <div v-if="!rightPanelCollapsed" class="flex-1 overflow-y-auto">
          <div class="border-b border-gray-700">
            <PropertyPanel></PropertyPanel>
          </div>
          <div>
            <LayerTree></LayerTree>
          </div>
        </div>
        <button
          @click="rightPanelCollapsed = !rightPanelCollapsed"
          class="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 text-xs border-t border-gray-700 mt-auto"
          :title="rightPanelCollapsed ? '展开属性面板' : '折叠属性面板'"
        >
          {{ rightPanelCollapsed ? '◀' : '▶' }}
        </button>
      </aside>
    </div>

    <!-- Footer Status Bar -->
    <footer class="h-8 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-xs text-gray-400">
      <div class="flex items-center gap-4">
        <!-- Current Page -->
        <div class="flex items-center gap-2">
          <span>当前页面:</span>
          <span class="text-gray-300">{{ projectStore.currentPage?.name || '无' }}</span>
        </div>

        <div class="w-px h-4 bg-gray-700"></div>

        <!-- Pages Count -->
        <div class="flex items-center gap-2">
          <span>页面数:</span>
          <span class="text-gray-300">{{ projectStore.pageList.length }}</span>
        </div>

        <div class="w-px h-4 bg-gray-700"></div>

        <!-- Element Count -->
        <div class="flex items-center gap-2">
          <span>元素数:</span>
          <span class="text-gray-300">{{ elementCount }}</span>
        </div>

        <div class="w-px h-4 bg-gray-700"></div>

        <!-- Project Path -->
        <div v-if="projectPath || projectStore.project?.path" class="flex items-center gap-2">
          <span>项目:</span>
          <span class="text-gray-300 truncate max-w-[300px]" :title="projectPath || projectStore.project?.path">
            {{ projectPathDisplay }}
          </span>
          <span v-if="!projectStore.project?.path" class="text-yellow-400 text-xs">(未保存)</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <span>项目:</span>
          <span class="text-gray-400">未保存</span>
        </div>
      </div>

      <div class="flex-1"></div>

      <!-- Save Status -->
      <div class="flex items-center gap-2">
        <span v-if="projectStore.isDirty" class="text-yellow-400">● 未保存</span>
        <span v-else class="text-green-400">✓ 已保存</span>
      </div>
    </footer>

    <!-- AI Panel (Floating) -->
    <ChatPanel
      v-show="showAIPanel"
      @close="showAIPanel = false"
      @openSettings="showAISettings = true"
      class="fixed bottom-16 right-4 w-96 max-h-[70vh]"
    ></ChatPanel>

    <!-- AI Settings Modal -->
    <AISettings
      v-if="showAISettings"
      @close="showAISettings = false"
    ></AISettings>

    <!-- Toggle AI Panel Button -->
    <button
      @click="showAIPanel = !showAIPanel"
      class="fixed bottom-12 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-50"
      title="切换 AI 聊天"
    >
      🤖
    </button>

    <!-- Toast Notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Canvas from './components/Editor/Canvas.vue';
import PropertyPanel from './components/Editor/PropertyPanel.vue';
import LayerTree from './components/Editor/LayerTree.vue';
import PageList from './components/Editor/PageList.vue';
import ComponentPalette from './components/ComponentLibrary/ComponentPalette.vue';
import ChatPanel from './components/AIPanel/ChatPanel.vue';
import AISettings from './components/AIPanel/AISettings.vue';
import Toast from './components/common/Toast.vue';
import { useProjectStore } from './stores/project';
import { useEditorStore } from './stores/editor';
import { useToastStore } from './stores/toast';
import { storageService } from './services/storage';
import { generateStandaloneHTML } from './services/html-generator';
import { useKeyboard } from './composables/useKeyboard';
import { registerDefaultShortcuts } from './core/shortcuts';

const projectStore = useProjectStore();
const editorStore = useEditorStore();
const toast = useToastStore();

const showAIPanel = ref(false);
const showAISettings = ref(false);
const isElectron = ref(false);
const projectPath = ref<string | null>(null);
const workspacePath = ref<string | null>(null);

// Panel collapse states
const leftPanelCollapsed = ref(false);
const componentPanelCollapsed = ref(false);
const rightPanelCollapsed = ref(false);

// 项目路径显示（截断显示）
const projectPathDisplay = computed(() => {
  if (!projectPath.value) return '未保存';
  if (projectPath.value.length > 50) {
    return '...' + projectPath.value.slice(-47);
  }
  return projectPath.value;
});

// Computed: Element count in current page
const elementCount = computed(() => {
  if (!projectStore.currentPage?.html) return 0;
  const html = projectStore.currentPage.html;
  const selfClosing = html.match(/<(img|br|hr|input|meta|link)[^>]*>/gi)?.length || 0;
  const openingTags = html.match(/<([a-z][a-z0-9]*)\b[^>]*>/gi)?.length || 0;
  return selfClosing + openingTags;
});

onMounted(() => {
  projectStore.createProject('Untitled Project');
  isElectron.value = !!(window as any).electronAPI;

  // Register keyboard shortcuts
  registerDefaultShortcuts({
    editorStore,
    projectStore,
    saveProject,
  });
  useKeyboard();

  // Electron 模式下提示设置工作区
  if (isElectron.value && !workspacePath.value) {
    // 可选：首次启动时提示设置工作区
  }

  // 监听 Electron 菜单事件
  if (isElectron.value) {
    const electronAPI = (window as any).electronAPI;

    // 监听所有菜单事件
    electronAPI?.onMenuEvent?.((event: string, ..._args: any[]) => {
      switch (event) {
        case 'menu:ai-settings':
          showAIPanel.value = true;
          showAISettings.value = true;
          break;
        case 'menu:new-project':
          newProject();
          break;
        case 'menu:save':
          saveProject();
          break;
        case 'menu:export':
          exportHtml();
          break;
      }
    });
  }
});

// Setup workspace directory
async function setupWorkspaceDirectory() {
  try {
    const result = await storageService.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择工作区目录'
    });

    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      workspacePath.value = result.filePaths[0];
      console.log('工作区目录设置成功:', workspacePath.value);
      toast.success('工作区目录已设置: ' + workspacePath.value);
    }
  } catch (error) {
    console.error('设置工作区失败:', error);
  }
}

// 为项目选择保存位置
async function chooseProjectLocation() {
  try {
    const result = await storageService.showSaveDialog({
      title: '保存项目',
      defaultPath: projectStore.project?.name || 'Untitled Project',
      filters: [
        { name: 'NoRp Project', extensions: ['norp'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      return result.filePath;
    }
    return null;
  } catch (error) {
    console.error('选择项目位置失败:', error);
    return null;
  }
}

function newProject() {
  if (projectStore.isDirty) {
    const confirmed = confirm('当前项目未保存，是否继续？');
    if (!confirmed) return;
  }

  // 重置项目路径
  projectPath.value = null;

  // 创建新项目
  projectStore.createProject('New Project');

  // 确保编辑器状态也被重置
  editorStore.selectElement(null);
}

async function openProject() {
  try {
    // 浏览器模式 - 使用文件输入
    if (!(window as any).electronAPI) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.norp,.json';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const project = JSON.parse(content);
            projectStore.loadProject(project);
            editorStore.clearHistory();
            toast.success('项目已打开: ' + file.name);
          } catch (error) {
            toast.error('无法打开文件，请确保是有效的 .norp 项目文件');
          }
        };
        reader.readAsText(file);
      };

      input.click();
      return;
    }

    // Electron 模式
    const result = await storageService.showOpenDialog();
    if (result.canceled) return;

    if (!result.filePaths || result.filePaths.length === 0) {
      toast.warning('未选择文件');
      return;
    }

    const filePath = result.filePaths[0];
    const project = await storageService.loadProject(filePath);
    if (project) {
      // 设置项目路径
      project.path = filePath;
      projectStore.loadProject(project);
      projectPath.value = filePath;
      editorStore.clearHistory();
      toast.success('项目已打开: ' + project.name);
    } else {
      toast.error('无法打开项目，文件可能已损坏或格式不正确');
    }
  } catch (error) {
    console.error('打开项目异常:', error);
    toast.error('打开项目失败');
  }
}

async function saveProject() {
  try {
    if (!projectStore.project) {
      toast.warning('没有可保存的项目');
      return;
    }

    // 浏览器模式 - 下载 JSON 文件
    if (!(window as any).electronAPI) {
      const content = JSON.stringify(projectStore.project, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = projectStore.project.name + '.norp';
      a.click();
      URL.revokeObjectURL(url);

      projectStore.markAsSaved();
      toast.success('项目已导出（浏览器模式：文件已下载）');
      return;
    }

    // Electron 模式 - 选择保存位置
    let filePath: string | undefined = projectStore.project.path ?? undefined;

    // 如果是新建项目（没有路径），让用户选择保存位置
    if (!filePath) {
      filePath = await chooseProjectLocation();
      if (!filePath) {
        // 用户取消
        return;
      }

      // 确保文件扩展名是 .norp
      if (!filePath.endsWith('.norp')) {
        filePath = filePath + '.norp';
      }

      // 更新项目路径
      projectStore.project.path = filePath;
      projectPath.value = filePath;
    }

    const success = await storageService.saveProject(filePath, projectStore.project);

    if (success) {
      projectStore.markAsSaved();
      projectStore.project.modifiedAt = new Date();
      projectPath.value = filePath;
      toast.success('项目已保存');
    } else {
      toast.error('保存失败，请检查写入权限和磁盘空间');
    }
  } catch (error) {
    console.error('保存项目异常:', error);
    toast.error('保存项目失败: ' + (error instanceof Error ? error.message : String(error)));
  }
}

async function exportHtml() {
  try {
    if (!projectStore.project) {
      toast.warning('没有可导出的项目');
      return;
    }

    const html = generateStandaloneHTML(projectStore.project);

    // 浏览器模式 - 直接下载文件
    if (!(window as any).electronAPI) {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = projectStore.project.name + '.html';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('导出成功！文件已下载到浏览器下载目录。');
      return;
    }

    // Electron 模式 - 导出到项目旁边的 _导出 目录
    if (!projectStore.project.path) {
      toast.warning('请先保存项目，才能导出到指定位置');
      return;
    }

    // 从项目文件路径推导出导出目录
    // 例如：D:/projects/MyWebsite.norp -> D:/projects/MyWebsite_导出/
    const projectFilePath = projectStore.project.path;
    const lastSlashIndex = projectFilePath.lastIndexOf('/');
    const lastBackslashIndex = projectFilePath.lastIndexOf('\\');
    const slashIndex = Math.max(lastSlashIndex, lastBackslashIndex);

    if (slashIndex === -1) {
      toast.error('无法确定项目位置，请先保存项目');
      return;
    }

    const projectDir = projectFilePath.substring(0, slashIndex);
    const projectName = projectStore.project.name;
    const exportDir = projectDir + '/' + projectName + '_导出';
    const htmlFilePath = exportDir + '/' + projectName + '.html';

    await storageService.writeFile(htmlFilePath, html);

    toast.success('导出成功！位置: ' + exportDir);
  } catch (error) {
    console.error('Failed to export:', error);
    toast.error('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

function openAISettings() {
  showAIPanel.value = true;
  showAISettings.value = true;
}
</script>

<style scoped>
</style>
