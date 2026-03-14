# NoRp UI Designer

An AI-driven UI design tool built with Electron, Vue 3, and TypeScript. Create responsive web interfaces through natural language conversation and visual editing.

## Features

- **AI-Powered Design**: Generate UI components and layouts using natural language
- **Visual Editor**: Drag-and-drop interface with real-time editing
- **Component Library**: Pre-built components (buttons, forms, navigation, etc.)
- **Property Panel**: Fine-tune styles with an intuitive property editor
- **Layer Tree**: View and manage element hierarchy
- **Multiple AI Providers**: Support for Claude, OpenAI, and local models (Ollama)
- **Export Options**: Export to HTML, Vue, or React components

## Tech Stack

- **Desktop Framework**: Electron
- **Frontend**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: TailwindCSS
- **AI SDKs**: @anthropic-ai/sdk, openai

## Project Structure

```
noRp/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry
│   ├── preload.ts        # Preload script
│   └── ipc/              # IPC handlers
├── src/
│   ├── components/       # Vue components
│   │   ├── Editor/       # Visual editor components
│   │   ├── AIPanel/      # AI chat panel
│   │   └── ComponentLibrary/  # Component palette
│   ├── services/         # Services (AI, storage, export)
│   ├── stores/           # Pinia stores
│   ├── core/             # Core logic (element manager, history)
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
└── workspace/            # User projects (generated content)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts Vite dev server and opens the Electron app.

### Building

Build for production:
```bash
npm run build
```

Package desktop application:
```bash
npm run electron:build     # All platforms
npm run electron:build:win  # Windows only
npm run electron:build:mac  # macOS only
npm run electron:build:linux  # Linux only
```

## Configuration

### AI Setup

1. Click "AI Settings" in the app header
2. Choose your AI provider:
   - **Claude**: Get API key from [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI**: Get API key from [platform.openai.com](https://platform.openai.com/api-keys)
   - **Local (Ollama)**: Ensure Ollama is running on `http://localhost:11434`
3. Enter your API key and configure model settings

## Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + C` - Copy
- `Ctrl/Cmd + V` - Paste
- `Ctrl/Cmd + X` - Cut
- `Delete` - Delete selected element
- `Ctrl/Cmd + D` - Duplicate
- `Ctrl/Cmd + S` - Save project

## Usage

1. **Create New Project**: Click "New" in the header
2. **Add Components**: Drag components from the left panel to the canvas
3. **Edit Properties**: Select an element to edit its properties in the right panel
4. **AI Generation**: Click the robot button to open AI chat and generate components
5. **Export**: Click "Export" to save your design as HTML

## Development Notes

### Adding New Components

Edit `src/components/ComponentLibrary/ComponentPalette.vue` to add new components to the library.

### AI Service Implementation

AI services are implemented in `src/services/ai/`. Each service (Claude, OpenAI, Local) extends the base `AIService` class.

### IPC Communication

The main process handles file operations through IPC. See `electron/main.ts` for available IPC channels.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
