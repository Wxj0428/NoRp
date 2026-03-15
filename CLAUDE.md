# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NoRp UI Designer is an AI-driven UI design tool built with Electron, Vue 3, and TypeScript. Users generate web interfaces through natural language conversation with AI and fine-tune designs through visual editing.

## Development Commands

### Core Development
```bash
npm run electron:dev          # Start Electron app with Vite dev server (recommended)
npm run dev                   # Start Vite dev server only (for web testing)
npm run build                 # Build Vue frontend (TypeScript compilation + Vite build)
```

### Desktop App Packaging
```bash
npm run electron:build        # Build for all platforms
npm run electron:build:win    # Windows only (outputs .exe installer and unpacked folder)
npm run electron:build:mac    # macOS only (.dmg)
npm run electron:build:linux  # Linux only (.AppImage, .deb)
```

### Testing
```bash
npm run test                  # Run Playwright E2E tests (headless)
npm run test:ui               # Run tests with interactive UI
npm run test:headed           # Run tests with visible browser
npm run test:debug            # Debug tests with Playwright Inspector
npm run test:report           # Open HTML test report
```

### Single Test Execution
```bash
npx playwright test --grep "test name"              # Run specific test
npx playwright test tests/e2e/ai-panel.spec.ts      # Run specific test file
```

## Architecture

### Electron Architecture

**Process Separation:**
- **Main Process** (`electron/main.ts`): Controls app lifecycle, creates windows, handles native menus, file dialogs, and file system operations
- **Renderer Process** (Vue 3 app): Runs in sandboxed context (no Node.js integration)
- **Communication**: IPC via `webContents.send()` from main → renderer and `electronAPI.onMenuEvent()` via preload script

**Key Constraints:**
- `contextIsolation: true` - renderer cannot access Node directly
- `nodeIntegration: false` - security measure, must use exposed APIs
- All file operations must go through IPC handlers in main process

**Menu System:**
- Native menus defined in `electron/main.ts:createMenu()`
- Menu actions sent to renderer via `webContents.send('menu:action-name')`
- Renderer listens via `electronAPI.onMenuEvent()` in `App.vue`

### AI Service Architecture

**Pluggable Provider System:**
```
src/services/ai/
├── base.ts           # BaseAIService abstract class (defines interface)
├── claude.ts         # ClaudeService (Anthropic API)
├── openai.ts         # OpenAIService (OpenAI-compatible APIs)
├── local.ts          # LocalAIService (Ollama/LM Studio)
└── index.ts          # createAIService() factory function
```

**Interface Contract:**
All AI services must implement:
- `generateCode(prompt: string, context: ProjectContext): Promise<GeneratedCode>`
- `chat(messages: ChatMessage[]): AsyncGenerator<string>` (streaming responses)
- `isConfigured(): boolean`
- `updateConfig(config: Partial<AIServiceConfig>): void`

**Factory Pattern:**
`createAIService(config)` returns appropriate service based on `config.provider` ('claude' | 'openai' | 'local' | 'custom')

**System Prompt Enhancement:**
Base class provides `buildSystemPrompt()` with comprehensive design guidelines. Override in provider classes for customization.

### Canvas and Iframe Isolation

**Architecture:**
- User-designed pages render in isolated `<iframe>` (`Canvas.vue`)
- Cross-document communication via `window.postMessage()` and `iframe.contentWindow.postMessage()`
- Iframe content isolation prevents CSS conflicts between app UI and user designs

**Message Types:**
- From renderer → iframe: `select-element`, `update-style`, `delete-element`
- From iframe → renderer: `element-selected`, `element-updated`

**Device Presets:**
- Desktop (1400×900), Tablet (768×1024), Mobile (375×667)
- Resizes iframe container (not browser window)

### State Management (Pinia Stores)

**Three Core Stores:**

1. **project.ts**: Project data
   - `project`: Current Project object
   - `currentPageId`: ID of active page
   - `isDirty`: Unsaved changes flag
   - `createProject()`, `addPage()`, `deletePage()`, `updatePageHtml()`, `loadProject()`, `markAsSaved()`, `updatePageDescription()`

2. **editor.ts**: Editor state
   - `selectedElement`: Currently selected element (for property panel)
   - `pendingInsert`: HTML content waiting to be inserted to canvas (from AI generation)
   - `clipboard`: Cut/copied element data
   - `selectElement()`, `setPendingInsert()`, `clearPendingInsert()`

3. **ai.ts**: AI configuration and conversation
   - `config`: AIServiceConfig (provider, apiKey, baseURL, model, temperature)
   - `messages`: Conversation history
   - `error`: Last error message
   - `loadConfig()`, `saveConfig()`, `addMessage()`, `clearMessages()`

**Data Flow:**
- AI generates HTML → stored in `editor.pendingInsert`
- Canvas watches `pendingInsert` → calls `insertHTMLToCanvas()`
- Inserted HTML becomes part of `project.currentPage.html`

### Core Logic Modules

**src/core/ contains editor business logic:**

- **element-manager.ts**: Not yet fully implemented (will handle direct DOM manipulation)
- **history.ts**: Undo/redo stack management (not yet integrated)
- **selection-manager.ts**: Element selection state (currently handled in editor store)
- **shortcuts.ts**: Global keyboard shortcuts (registered in `App.vue` onMounted)

### Component System

**Component Library:**
- Pre-built components defined in `ComponentPalette.vue` and `ElementPlusPalette.vue`
- Each component has: `id`, `name`, `category`, `icon`, `template` (HTML), optional `defaultStyles`, `props`, `editableAreas`
- Categories: 'basic' | 'layout' | 'navigation' | 'data' | 'feedback' | 'forms' | 'media' | Chinese categories ('按钮', '表单', etc.)

**Quick Templates (AI):**
Six predefined templates in `ChatPanel.vue` with detailed prompts for:
- Login pages (🔐)
- Dashboards (📊)
- Product lists (🛍️)
- Forms (📝)
- Landing pages (🎯)
- Settings pages (⚙️)

### Type System

**Key Types in `src/types/index.ts`:**

- **Project**: Multi-page project with assets and settings
- **Page**: Individual page with HTML, styles, optional scripts and description
- **Component**: Reusable UI component definition
- **AIServiceConfig**: AI provider configuration
- **ChatMessage**: Role-based message ('user' | 'assistant' | 'system')

**Note:** TypeScript strict mode is temporarily disabled in tsconfig.json (`"strict": false`) to allow rapid development. Re-enable before production.

## Key Implementation Details

### AI Generation Workflow

1. User clicks quick template or enters custom prompt in `ChatPanel.vue`
2. System appends detailed design guidelines (from `base.ts:buildSystemPrompt()`)
3. `aiService.chat()` streams response (chunks displayed in real-time)
4. Code extracted from markdown blocks (```html...```)
5. Stored in `editor.pendingInsert`
6. `Canvas.vue` watches `pendingInsert` → calls `insertHTMLToCanvas()`
7. HTML inserted into iframe's `.page-container`
8. `project.updatePageHtml()` saves changes

### Page Description Feature

Each page has optional `description` field for documenting design rationale. Edited via modal in `PageList.vue` with `project.updatePageDescription()`. Default templates provided for new pages.

### Export System

`export.ts` handles project export:
- **HTML Single**: All styles inline in `<style>` attributes
- **HTML Split**: Separate CSS file
- **Vue/React**: Component format (placeholder)

### Storage Service

`storage.ts` provides file system operations via IPC:
- `saveProject()`: Write .norp JSON files
- `loadProject()`: Read and parse .norp files
- `showOpenDialog()`, `showSaveDialog()`: Native dialogs

## Important Conventions

### File Organization
- Vue components use `<script setup lang="ts">` syntax
- Component styles use TailwindCSS utility classes (no `<style>` blocks needed for app UI)
- Store composition API: `ref()`, `computed()`, functions returned from setup function

### Event Handling
- Electron menu events: `'menu:action-name'` format
- Custom events via `window.dispatchEvent()` or direct store mutations
- Iframe communication uses `postMessage()` with message type field

### Styling
- App UI: TailwindCSS classes (e.g., `bg-gray-800`, `p-4`, `rounded-lg`)
- User designs: Inline `style` attributes or `<style>` blocks in generated HTML

### Naming
- Files: kebab-case (`chat-panel.vue`, `element-manager.ts`)
- Components: PascalCase (`ChatPanel`, `PropertyPanel`)
- Stores: camelCase with 'use' prefix (`useProjectStore`, `useEditorStore`)

### Async Patterns
- AI streaming: `for await (const chunk of aiService.chat(messages))`
- File operations: IPC handlers return promises
- DOM updates: `await nextTick()` after reactive changes

## Testing

**E2E Tests with Playwright:**
- Located in `tests/e2e/`
- 17 tests covering AI panel and page management
- Auto-starts dev server, runs in Chromium
- Tests verify UI interactions, not visual appearance

**Running Single Test:**
```bash
npx playwright test --grep "test name"
```

## Common Patterns

### Adding New AI Provider

1. Create service class extending `BaseAIService` in `src/services/ai/`
2. Implement `generateCode()`, `chat()`, `isConfigured()`
3. Add case to `createAIService()` factory in `index.ts`
4. Update type union in `AIServiceConfig['provider']`

### Adding Store Actions

```typescript
// In store setup function
function newAction(param: Type) {
  // Modify state
  someRef.value = newValue;
}

return {
  // ...existing exports
  newAction
}
```

### Adding Menu Item

1. Add to template in `electron/main.ts:createMenu()`
2. Send event: `mainWindow?.webContents.send('menu:action-name', data)`
3. Listen in `App.vue`:
```typescript
electronAPI?.onMenuEvent?.((event, ...args) => {
  if (event === 'menu:action-name') {
    // handle action
  }
})
```

## Known Limitations

- TypeScript strict mode disabled (planned to re-enable)
- Undo/redo history system not yet integrated into UI
- Element manager (DOM manipulation) not fully implemented
- Code signing not configured (Windows shows warning on first run)
- Vue/React export formats are placeholders

## Build Output

- `dist/`: Vite build output (loaded by Electron in production)
- `dist-electron/`: Compiled Electron main process
- `dist/win-unpacked/`: Unpacked Windows app
- `dist/*.exe`: Windows installer

## Dependencies Notes

- `vue-tsc`: Type-checks .vue files (runs in build script before Vite)
- `concurrently`: Runs Vite and Electron together in dev mode
- `wait-on`: Ensures Vite server is ready before launching Electron
- `@playwright/test`: E2E testing framework
- Electron + Vite integration via `vite-plugin-electron`
