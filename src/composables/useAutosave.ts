import { onUnmounted } from 'vue';
import { useProjectStore } from '../stores/project';
import { useToastStore } from '../stores/toast';
import { storageService } from '../services/storage';

export function useAutosave() {
  const projectStore = useProjectStore();
  const toast = useToastStore();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function startAutosave() {
    stopAutosave();

    intervalId = setInterval(async () => {
      const project = projectStore.project;
      if (!project || !projectStore.isDirty || !project.path) return;

      try {
        const success = await storageService.saveProject(project.path, project);
        if (success) {
          projectStore.markAsSaved();
        }
      } catch (e) {
        console.error('Autosave failed:', e);
      }
    }, projectStore.project?.settings?.autosaveInterval || 30000);
  }

  function stopAutosave() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  startAutosave();

  onUnmounted(() => {
    stopAutosave();
  });

  return { startAutosave, stopAutosave };
}
