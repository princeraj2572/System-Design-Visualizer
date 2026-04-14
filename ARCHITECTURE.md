# System Design Visualizer - Architecture Design

## 1. High-Level Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser / Client                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js Application                         │   │
│  │  (React 19 with TypeScript)                              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │   │
│  │  │  UI Layer   │  │  Business    │  │  Presentation  │ │   │
│  │  │             │  │  Logic Layer │  │  Layer          │ │   │
│  │  ├─────────────┤  ├──────────────┤  ├─────────────────┤ │   │
│  │  │ Components  │  │ State Mgmt   │  │ Layout          │ │   │
│  │  │  • Toolbar  │  │  (Zustand)   │  │ Theme           │ │   │
│  │  │  • Canvas   │  │              │  │ Responsive      │ │   │
│  │  │  • Palette  │  │ Graph Logic  │  │ UX              │ │   │
│  │  │  • Panel    │  │              │  │                 │ │   │
│  │  │ • Nodes     │  │ Validation   │  │                 │ │   │
│  │  │ • Edges     │  │              │  │                 │ │   │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘ │   │
│  │                                                            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                  Data Layer                               │   │
│  │  ┌────────────────┐         ┌──────────────────────────┐ │   │
│  │  │  In-Memory     │         │  Persistent Storage      │ │   │
│  │  │  Store         │         │  • LocalStorage          │ │   │
│  │  │  (Zustand)     │◄────────►  • IndexedDB             │ │   │
│  │  │                │         │                          │ │   │
│  │  │ • Graph State  │         │ JSON Serialization       │ │   │
│  │  │ • UI State     │         │ (Export/Import)          │ │   │
│  │  └────────────────┘         └──────────────────────────┘ │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         React Flow Integration Layer                      │   │
│  │    (Graph Visualization & Interaction)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Component Architecture

```
App
├── Layout
│   ├── Toolbar
│   │   ├── File Operations (New, Save, Open)
│   │   ├── Edit Actions (Undo, Redo)
│   │   ├── Export Functions (JSON, PNG)
│   │   └── Settings (Theme Toggle)
│   │
│   ├── Main Container
│   │   ├── NodePalette (Left Sidebar)
│   │   │   ├── Component Library
│   │   │   │   ├── API Server
│   │   │   │   ├── Database
│   │   │   │   ├── Cache
│   │   │   │   ├── Load Balancer
│   │   │   │   ├── Message Queue
│   │   │   │   ├── Worker
│   │   │   │   └── Storage
│   │   │   └── Drag-Drop Handler
│   │   │
│   │   ├── ArchitectureCanvas (Center)
│   │   │   ├── ReactFlow Container
│   │   │   ├── NodeComponent
│   │   │   │   ├── Visual Rendering
│   │   │   │   ├── Handles (Connections)
│   │   │   │   └── Selection State
│   │   │   ├── EdgeComponent
│   │   │   │   ├── Connection Line
│   │   │   │   ├── Label Display
│   │   │   │   └── Type Styling
│   │   │   └── Canvas Controls
│   │   │       ├── Zoom
│   │   │       ├── Pan
│   │   │       └── Fit View
│   │   │
│   │   └── PropertiesPanel (Right Sidebar)
│   │       ├── Component Details
│   │       │   ├── Name Input
│   │       │   ├── Description
│   │       │   ├── Technology Stack
│   │       │   └── Config Options
│   │       └── Actions
│   │           ├── Save Changes
│   │           └── Delete Component
```

## 3. Data Model & State Structure

```typescript
// Global State (Zustand Store)
{
  // Graph Data
  nodes: Node[]
  edges: Edge[]
  
  // UI State
  selectedNode: string | null
  theme: 'light' | 'dark'
  
  // History/Undo-Redo
  history: HistoryEntry[]
  historyIndex: number
  
  // Computed State
  nodeCount: number
  connectionCount: number
}

// Node Structure
{
  id: string (UUID)
  type: 'api-server' | 'database' | 'cache' | 'load-balancer' | 
         'message-queue' | 'worker' | 'storage' | 'service'
  position: { x: number, y: number }
  metadata: {
    name: string
    description: string
    technology: string
    config: Record<string, any>
  }
}

// Edge Structure
{
  id: string (UUID)
  source: string (node id)
  target: string (node id)
  label: string
  type: 'http' | 'grpc' | 'message-queue' | 'database' | 'event'
}

// Project Structure (Serialized)
{
  id: string
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
  createdAt: ISO8601
  updatedAt: ISO8601
  version: string
}
```

## 4. Data Flow Architecture

```
User Interaction
      ↓
Event Handler
      ↓
    ┌─────────────────────────────┐
    │  Action Dispatch            │
    │ (Zustand Store)             │
    └─────────────────────────────┘
      ↓ (State Update)
    ┌─────────────────────────────┐
    │  Component Re-render        │
    │ (React Reconciliation)      │
    └─────────────────────────────┘
      ↓ (Side Effects)
    ┌─────────────────────────────┐
    │  Persistence                │
    │ (LocalStorage/IndexedDB)    │
    └─────────────────────────────┘
      ↓ (Sync with Store)
    ┌─────────────────────────────┐
    │  UI Updates                 │
    │ (Canvas, Panels)            │
    └─────────────────────────────┘
```

## 5. Component Communication Pattern

```
Toolbar                   NodePalette              PropertiesPanel
   │                          │                          │
   │─── Triggers Actions ─────▶ Zustand Store ◀──── Reads State
   │                          │          ▲                │
   │◀─── Receives Updates ─────┴─────────┼────────────────┤
   │                                     │
   │                          ArchitectureCanvas
   │                                     │
   │                          Renders Graph + Updates Store
   │
   └─────────────────────────────────────────────────────────
```

## 6. User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interaction Flows                       │
└─────────────────────────────────────────────────────────────────┘

1. ADDING A COMPONENT
   ┌────────────────────────────┐
   │ User drags from Palette    │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Generate new Node with ID  │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Add to Zustand Store       │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Canvas Re-renders Node     │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Persist to LocalStorage    │
   └────────────────────────────┘

2. CONNECTING COMPONENTS
   ┌────────────────────────────┐
   │ User drags from Handle A   │
   │      to Handle B           │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Validate connection        │
   │ (no circular deps)         │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Create Edge in Store       │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Canvas renders connection  │
   └────────────────────────────┘

3. EDITING COMPONENT
   ┌────────────────────────────┐
   │ User clicks on Node        │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Update selected in Store   │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Properties Panel Shows     │
   │ Component Details          │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ User edits fields          │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Store updates metadata     │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Persist changes            │
   └────────────────────────────┘

4. SAVING/EXPORTING
   ┌────────────────────────────┐
   │ User clicks Save/Export    │
   └────────────┬───────────────┘
                ↓
   ┌────────────────────────────┐
   │ Serialize Graph State      │
   │ (nodes + edges)            │
   └────────────┬───────────────┘
                ↓
   ┌────────────┬───────────────┐
   │            │               │
   ▼            ▼               ▼
 JSON      PNG Image      LocalStorage
```

## 7. State Management Strategy

### Local State (Component Level)
- UI hover states
- Temporary drag states
- Panel visibility toggles
- Form validation states

### Global State (Application Level - Zustand)
- All nodes and edges
- Selected node
- Application theme
- Undo/Redo history

### Persistent State (Storage)
- Project data (for reopening)
- User preferences
- Recent projects

## 8. Performance Optimization Strategy

```
Rendering Optimization:
├── React.memo for NodeComponent
├── useCallback memoization
├── useMemo for expensive computations
├── Virtual scrolling for large graphs
└── Lazy loading of heavy modules

State Management:
├── Selective updates (only changed nodes)
├── Graph computation caching
├── Debounced state updates
└── Efficient dispatching

Canvas Optimization:
├── React Flow's built-in optimizations
├── Viewport culling
├── Lazy edge rendering
└── Incremental rendering
```

## 9. Validation & Error Handling

```
Architecture Validation Checks:
├── Circular dependency detection
├── Disconnected node warnings
├── Invalid connection validation
├── Duplicate node name alerts
└── Technology compatibility checks

Error Handling:
├── Try-catch blocks for serialization
├── Storage quota management
├── Graceful degradation
└── User-friendly error messages
```

## 10. Export/Import Strategy

```
JSON Export:
  Graph State → Serialization → JSON File
  (Includes all metadata and connections)

PNG Export:
  Canvas → html-to-image → PNG Download
  (Visual representation for sharing)

Import:
  JSON File → Parse → Validate → Load into Store
  (Reconstruct complete architecture)
```

## 11. Technology Stack Rationale

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Framework** | Next.js 14 | Production-ready, optimized, built-in routing |
| **UI Library** | React 19 | Industry standard, component-based |
| **Language** | TypeScript | Type safety, better DX, fewer runtime errors |
| **Styling** | TailwindCSS | Utility-first, consistent design system |
| **Graph Viz** | React Flow | Specialized for node-edge graphs, interactive |
| **State** | Zustand | Lightweight, minimal boilerplate, intuitive API |
| **Storage** | LocalStorage/IndexedDB | Browser-native, no backend needed |
| **Export** | html-to-image | Client-side image generation |
| **Utilities** | Lodash, UUID | Common utilities, ID generation |

## 12. Future Scalability Considerations

```
Phase 2 - Advanced Features:
├── Collaborative editing (WebSocket)
├── Cloud project storage (Backend API)
├── Architecture templates library
├── AI-powered suggestions
└── Advanced validation rules

Phase 3 - Enterprise Features:
├── Team workspaces
├── Version control for architectures
├── Cost estimation engine
├── Infrastructure code generation
└── Analytics & auditing

Scaling Strategy:
├── Add backend API for cloud features
├── Implement WebSocket for real-time collab
├── Use IndexedDB for larger graphs
├── Add service worker for offline support
└── Implement code splitting & lazy loading
```

## 13. Security Considerations

```
Frontend Security:
├── Input sanitization for metadata
├── XSS prevention via React's default
├── Safe JSON serialization/deserialization
├── LocalStorage data validation
├── No sensitive data in client state
└── CSRF protection ready (for future backend)

Data Safety:
├── Duplicate to avoid data loss
├── Auto-save to LocalStorage
├── Export functionality for backup
└── Clear data options with confirmation
```

## 14. Accessibility & UX

```
Accessibility:
├── Keyboard navigation for canvas
├── ARIA labels for components
├── Screen reader support
├── High contrast mode (dark theme)
├── Focus management
└── Semantic HTML structure

UX Principles:
├── Intuitive drag-and-drop
├── Clear visual feedback
├── Helpful tooltips and hints
├── Undo/Redo for all actions
├── Quick access to common features
└── Responsive design (mobile-first)
```

## 15. Deployment Architecture

```
Development:
  npm run dev → localhost:3000

Production Build:
  npm run build → .next/ directory
  
Deployment Options:
  ├── Vercel (Recommended - Next.js native)
  ├── Netlify
  ├── Docker container
  ├── Self-hosted server
  └── Static hosting with API routes

Performance Targets:
  ├── First Contentful Paint: < 2s
  ├── Large Contentful Paint: < 3s
  ├── Cumulative Layout Shift: < 0.1
  └── Time to Interactive: < 3.5s
```

---

## Summary

The System Design Visualizer uses a **modern, scalable frontend architecture** with:
- **React Flow** for powerful graph visualization
- **Zustand** for lightweight state management
- **Next.js** for production-ready framework
- **TailwindCSS** for consistent, modern styling
- **LocalStorage/IndexedDB** for persistent client-side data

The architecture is **component-driven**, **user-centric**, and ready for future expansion with backend services, collaboration features, and cloud storage.
