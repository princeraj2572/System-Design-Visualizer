# System Design Visualizer - Technical Specifications

## 1. State Management Specification (Zustand Store)

### Store Structure

```typescript
interface ArchitectureState {
  // Graph Data
  nodes: Node[];
  edges: Edge[];
  
  // UI State
  selectedNode: string | null;
  theme: 'light' | 'dark';
  
  // History Management
  history: HistoryEntry[];
  historyIndex: number;
  
  // Actions
  addNode: (node: Omit<Node, 'id'>) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  selectNode: (id: string | null) => void;
  
  addEdge: (edge: Omit<Edge, 'id'>) => void;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  setTheme: (theme: 'light' | 'dark') => void;
  clearAll: () => void;
}
```

### State Mutations

#### Node Operations
```
addNode(node) → Generate UUID → Add to nodes array → Save to history
removeNode(id) → Remove from nodes → Remove connected edges → Update history
updateNode(id, updates) → Find node → Apply updates → Persist
selectNode(id) → Update selectedNode → Trigger panel update
```

#### Edge Operations
```
addEdge(edge) → Generate UUID → Validate connection → Add to edges
removeEdge(id) → Remove from edges array → Update UI
updateEdge(id, updates) → Update edge properties → Sync storage
```

#### History Management
```
saveToHistory() → Create snapshot of current state → Add to history stack
undo() → Move historyIndex backward → Restore state from snapshot
redo() → Move historyIndex forward → Restore future state
```

## 2. Component Specifications

### Toolbar Component
**Purpose**: Provide application-level controls

**Props**: None (uses Zustand directly)

**State Management**:
- Dispatches actions to Zustand store
- No local state (all global)

**Key Features**:
- New Project button
- Save/Load buttons
- Export options (JSON, PNG)
- Undo/Redo buttons
- Theme toggle

**Interactions**:
```
User Click → Action Dispatch → Zustand State Update → UI Re-render
```

### NodePalette Component
**Purpose**: Display available components for dragging

**Props**: 
```typescript
{
  onNodeDragStart?: (nodeType: NodeType) => void
}
```

**Data**:
- NODE_TYPES configuration with icons and descriptions
- Pre-configured component metadata

**Drag Handling**:
```
Drag Start → Set dataTransfer with JSON data
     ↓
Drop on Canvas → Parse data → Create new node
     ↓
Update Store → Re-render canvas
```

### ArchitectureCanvas Component
**Purpose**: Main drawing surface for architecture design

**Dependencies**:
- React Flow library
- Zustand store

**Core Features**:
```
Canvas Events:
├── onDragOver → Allow drop
├── onDrop → Create node at position
├── onConnect → Validate and create edge
├── onNodesChange → Update node positions
├── onEdgesChange → Update edge properties
└── onNodeClick → Select node, show properties
```

**Node Rendering**:
```typescript
// Custom node component integration
nodeTypes = {
  architecture: ArchitectureNode
}

// Custom edge component integration
edgeTypes = {
  architecture: ArchitectureEdge
}
```

### PropertiesPanel Component
**Purpose**: Edit selected node properties

**State Management**:
```typescript
interface PropertyPanelState {
  selectedNode: string | null;
  formData: {
    name: string;
    description: string;
    technology: string;
  }
}
```

**Operations**:
```
User selects node → Populate form with node metadata
          ↓
User edits fields → Update local form state
          ↓
User clicks Save → Dispatch updateNode action → Update store
          ↓
Component re-renders with new data
```

## 3. Data Persistence Strategy

### LocalStorage Schema

```json
{
  "sdv_current_project": {
    "id": "uuid",
    "name": "My Architecture",
    "description": "...",
    "nodes": [...],
    "edges": [...],
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  },
  
  "sdv_recent_projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "lastOpened": "ISO8601"
    }
  ],
  
  "sdv_user_preferences": {
    "theme": "dark",
    "autoSave": true,
    "enableValidation": true
  }
}
```

### IndexedDB (for larger projects)

```
Database: 'SystemDesignVisualizer'
Stores:
├── projects
│   ├── Key: projectId
│   └── Value: Full project data
├── components
│   ├── Key: timestamp
│   └── Value: Auto-save snapshots
└── exports
    ├── Key: exportId
    └── Value: Exported JSON/PNG data
```

## 4. Error Handling & Validation

### Input Validation

```typescript
// Node name validation
validateNodeName(name: string): { valid: boolean; error?: string }
  → Check: non-empty, < 50 chars, unique within workspace

// Technology validation
validateTechnology(tech: string): boolean
  → Check: known technologies or custom allowed

// Architecture validation
validateArchitecture(): ValidationResult
  → Check: No circular dependencies
  → Check: All nodes connected
  → Check: No duplicate IDs
  → Warn: Unconnected services
```

### Error Boundaries

```
Component Error → Error Boundary catches
              ↓
Log to console (dev) / Analytics (prod)
              ↓
Show user-friendly message
              ↓
Fallback UI renders
              ↓
Option to reload/recover
```

## 5. Performance Metrics & Optimization

### Key Performance Indicators

```
Metric                  Target      Monitoring
──────────────────────────────────────────────
First Paint            < 1.5s      Lighthouse
Interactive            < 3s        Web Vitals
Node Create            < 100ms     React DevTools
Edge Creation          < 50ms      Profiler
Canvas Drag            60 fps      Performance
JSON Export            < 500ms     Custom timing
PNG Export             < 1s        Custom timing
```

### Optimization Techniques

```
React Optimization:
├── Memoization
│   ├── React.memo for nodes/edges
│   ├── useCallback for handlers
│   └── useMemo for expensive calcs
├── Code Splitting
│   ├── Lazy load heavy components
│   └── Route-based splitting
└── Bundle Optimization
    ├── Tree shaking
    ├── Minification
    └── Compression

Canvas Optimization:
├── Virtualization (React Flow)
├── Viewport culling
├── Incremental rendering
└── Debounced updates

Store Optimization:
├── Selective updates
├── Normalized state
├── Memoized selectors
└── Batched updates
```

## 6. Export/Import Specification

### JSON Export Format

```json
{
  "version": "1.0.0",
  "exportDate": "ISO8601",
  "projectName": "string",
  "nodes": [
    {
      "id": "uuid",
      "type": "api-server|database|cache|...",
      "position": { "x": number, "y": number },
      "metadata": {
        "name": "string",
        "description": "string",
        "technology": "string",
        "config": {}
      }
    }
  ],
  "edges": [
    {
      "id": "uuid",
      "source": "nodeId",
      "target": "nodeId",
      "label": "string",
      "type": "http|grpc|message-queue|database|event"
    }
  ]
}
```

### Import Validation

```
Read JSON File
        ↓
Parse & Validate Schema
        ↓
Check Version Compatibility
        ↓
Validate Node IDs (UUID format)
        ↓
Validate Edge References (source/target exist)
        ↓
Check for Circular Dependencies
        ↓
Load into Store
        ↓
Render Canvas
```

## 7. Keyboard Shortcuts & Controls

### Canvas Shortcuts

```
Action              Shortcut        Function
────────────────────────────────────────────────
Undo               Ctrl+Z          Undo last action
Redo               Ctrl+Y          Redo last action
Save               Ctrl+S          Save to storage
Delete             Delete          Remove selected
Select All         Ctrl+A          Select all nodes
Copy               Ctrl+C          Copy node data
Paste              Ctrl+V          Paste node
Zoom In            Ctrl++          Increase zoom
Zoom Out           Ctrl+-          Decrease zoom
Fit to Screen      Ctrl+0          Reset view
Pan               Arrow Keys       Move viewport
```

## 8. Theme System

### Light Theme

```css
Background: #f8fafc (Slate-50)
Primary: #00b8e6 (Cyan-500)
Text: #0f172a (Slate-900)
Border: #cbd5e1 (Slate-300)
Hover: rgba(0, 184, 230, 0.1)
Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
```

### Dark Theme

```css
Background: #020617 (Slate-950)
Primary: #67daff (Cyan-300)
Text: #f8fafc (Slate-50)
Border: #334155 (Slate-700)
Hover: rgba(103, 218, 255, 0.1)
Shadow: 0 4px 6px rgba(0, 0, 0, 0.4)
```

## 9. Accessibility Features

### ARIA Implementation

```
Canvas Container:
  role="presentation"
  aria-label="Architecture Canvas"
  aria-describedby="canvas-help"

Nodes:
  role="button"
  aria-selected={selected}
  aria-label={`${node.name} component`}

Buttons:
  aria-pressed={state}
  aria-label="Clear description"

Form Inputs:
  aria-label="Component name"
  aria-invalid={hasError}
  aria-describedby="error-message"
```

### Keyboard Support

```
Tab Navigation:
  → Navigate through toolbar buttons
  → Focus canvas for keyboard input
  → Tab through property panel inputs

Arrow Keys:
  → Move selected node
  → Pan canvas when no node selected

Enter:
  → Activate button
  → Save edited field

Escape:
  → Deselect node
  → Close dialogs
  → Exit edit mode
```

## 10. Browser Compatibility

### Supported Browsers

```
Chrome/Edge       Latest 2 versions
Firefox           Latest 2 versions
Safari            Latest 2 versions
Mobile Chrome     Latest version
Mobile Safari     Latest version

Features Used:
├── ES2020+ (transpiled to ES2017)
├── CSS Grid/Flexbox
├── LocalStorage API
├── IndexedDB API
├── Drag and Drop API
├── Canvas API (for export)
└── Fetch API (for future backend)

Polyfills:
├── Promise
├── fetch
├── Object.assign
└── Array methods
```

---

## Implementation Checklist

- [x] State management setup (Zustand)
- [x] Component architecture
- [x] Data persistence strategy
- [x] Error handling framework
- [x] Performance optimization plan
- [x] Export/Import system
- [x] Keyboard shortcuts
- [x] Theme system
- [x] Accessibility features
- [ ] Backend API integration (Phase 2)
- [ ] WebSocket support (Phase 2)
- [ ] Server-side persistence (Phase 2)
- [ ] Authentication (Phase 2)
- [ ] Collaboration features (Phase 3)
