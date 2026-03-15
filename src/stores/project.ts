import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project, Page, Asset } from '../types';

export const useProjectStore = defineStore('project', () => {
  // State
  const project = ref<Project | null>(null);
  const currentPageId = ref<string | null>(null);
  const isDirty = ref(false);

  // Getters
  const currentPage = computed(() => {
    if (!project.value || !currentPageId.value) return null;
    return project.value.pages.find((p) => p.id === currentPageId.value) || null;
  });

  const pageList = computed(() => project.value?.pages || []);

  // Actions
  function createProject(name: string) {
    const newProject: Project = {
      id: generateId(),
      name,
      path: undefined, // 新建项目没有路径
      createdAt: new Date(),
      modifiedAt: new Date(),
      pages: [
        {
          id: generateId(),
          name: 'Page 1',
          html: '<!-- Drag components here -->',
          styles: {},
          description: `这是项目的首页。

💡 设计建议：
- 这是用户看到的第一印象
- 突出核心价值和功能
- 提供清晰的导航
- 保持简洁美观

📝 设计思路：
- 在这里记录首页的设计思路...`
        }
      ],
      assets: [],
      settings: {
        theme: 'dark',
        autosave: true,
        autosaveInterval: 30000,
        gridEnabled: true,
        gridSize: 10,
        snapToGrid: true
      }
    };

    project.value = newProject;
    currentPageId.value = newProject.pages[0].id;
    isDirty.value = false;
  }

  function updatePageHtml(html: string) {
    if (!currentPage.value) return;
    currentPage.value.html = html;
    isDirty.value = true;
  }

  function addPage(name: string) {
    if (!project.value) return;

    const newPage: Page = {
      id: generateId(),
      name,
      html: '<!-- Drag components here -->',
      styles: {},
      description: `这是一个新创建的页面。

💡 设计建议：
- 明确页面的主要功能和目标用户
- 考虑用户的交互流程和体验
- 保持简洁，突出重点内容
- 注意配色方案和视觉层次

📝 在这里记录你的设计思路...`
    };

    project.value.pages.push(newPage);
    currentPageId.value = newPage.id;
    isDirty.value = true;
  }

  function deletePage(pageId: string) {
    if (!project.value || project.value.pages.length <= 1) return;
    const index = project.value.pages.findIndex((p) => p.id === pageId);
    if (index > -1) {
      project.value.pages.splice(index, 1);
      if (currentPageId.value === pageId) {
        currentPageId.value = project.value.pages[0].id;
      }
      isDirty.value = true;
    }
  }

  function addAsset(asset: Omit<Asset, 'id'>) {
    if (!project.value) return;
    const newAsset: Asset = {
      id: generateId(),
      ...asset
    };
    project.value.assets.push(newAsset);
    isDirty.value = true;
  }

  function loadProject(loadedProject: Project) {
    project.value = loadedProject;
    currentPageId.value = loadedProject.pages[0]?.id || null;
    isDirty.value = false;
  }

  function markAsSaved() {
    isDirty.value = false;
    if (project.value) {
      project.value.modifiedAt = new Date();
    }
  }

  function updatePageDescription(description: string) {
    if (!currentPage.value) return;
    currentPage.value.description = description;
    isDirty.value = true;
  }

  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return {
    project,
    currentPageId,
    isDirty,
    currentPage,
    pageList,
    createProject,
    updatePageHtml,
    addPage,
    deletePage,
    addAsset,
    loadProject,
    markAsSaved,
    updatePageDescription
  }
});
