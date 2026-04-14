# System Design Visualizer - Developer Guide

## 1. Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Basic React knowledge
- Familiarity with TypeScript

### Installation

```bash
cd system-visualizer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 2. Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main page component
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── canvas/             # Canvas-related components
│   │   ├── ArchitectureCanvas.tsx
│   │   ├── NodePalette.tsx
│   │   └── PropertiesPanel.tsx
│   ├── nodes/              # Node implementations
│   │   └── ArchitectureNode.tsx
│   ├── edges/              # Edge implementations
│   │   └── ArchitectureEdge.tsx
│   └── ui/                 # UI building blocks
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Toolbar.tsx
│       └── Layout.tsx
│
├── hooks/                  # Custom React hooks
│   └── (custom hooks here)
│
├── store/                  # Zustand state management
│   └── architecture-store.ts
│
├── types/                  # TypeScript type definitions
│   └── architecture.ts
│
└── utils/                  # Utility functions
    └── design-system.ts
```

## 3. State Management (Zustand Store)

### Accessing the Store

```typescript
import { useArchitectureStore } from '@/store/architecture-store';

function MyComponent() {
  const nodes = useArchitectureStore((state) => state.nodes);
  const addNode = useArchitectureStore((state) => state.addNode);
  
  // Or subscribe to entire store (not recommended for performance)
  const store = useArchitectureStore();
}
```

### Store API Reference

#### Node Operations

```typescript
// Add a new node
addNode({
  type: 'database',
  position: { x: 100, y: 100 },
  metadata: {
    name: 'PostgreSQL DB',
    description: 'Primary database',
    technology: 'PostgreSQL',
    config: { version: '14.0' }
  }
});

// Remove a node
removeNode('node-uuid-here');

// Update node properties
updateNode('node-uuid-here', {
  metadata: {
    name: 'Updated Name',
    description: 'New description',
    technology: 'MongoDB',
    config: {}
  }
});

// Select a node
selectNode('node-uuid-here');

// Deselect current node
selectNode(null);
```

#### Edge Operations

```typescript
// Add a new edge (connection)
addEdge({
  source: 'node-1-id',
  target: 'node-2-id',
  label: 'HTTP REST',
  type: 'http'
});

// Remove an edge
removeEdge('edge-uuid-here');

// Update edge properties
updateEdge('edge-uuid-here', {
  label: 'gRPC Call',
  type: 'grpc'
});
```

#### History & Undo/Redo

```typescript
// Save current state to history
saveToHistory();

// Undo last action
undo();

// Redo last undone action
redo();

// Clear everything
clearAll();
```

#### Theme Management

```typescript
// Toggle theme
setTheme('dark');
setTheme('light');
```

## 4. Component Development Guide

### Creating a New UI Component

```typescript
// src/components/ui/YourComponent.tsx
import React from 'react';

interface YourComponentProps {
  title: string;
  onAction?: () => void;
  className?: string;
}

export const YourComponent = React.forwardRef<
  HTMLDivElement,
  YourComponentProps
>(({ title, onAction, className = '' }, ref) => {
  return (
    <div ref={ref} className={`p-4 rounded-lg ${className}`}>
      <h3 className="font-bold">{title}</h3>
      {onAction && (
        <button onClick={onAction} className="mt-2 px-3 py-1 bg-cyan-500 text-white rounded">
          Action
        </button>
      )}
    </div>
  );
});

YourComponent.displayName = 'YourComponent';

export default YourComponent;
```

### Integrating with Zustand Store

```typescript
'use client';

import React from 'react';
import { useArchitectureStore } from '@/store/architecture-store';

export const MyCanvas = () => {
  // Select specific state slices
  const nodes = useArchitectureStore((state) => state.nodes);
  const selectedNode = useArchitectureStore((state) => state.selectedNode);
  
  // Select actions
  const addNode = useArchitectureStore((state) => state.addNode);
  const updateNode = useArchitectureStore((state) => state.updateNode);
  
  const handleAddNode = () => {
    addNode({
      type: 'api-server',
      position: { x: 200, y: 200 },
      metadata: {
        name: 'New API Server',
        description: '',
        technology: '',
      }
    });
  };

  return (
    <div>
      <button onClick={handleAddNode}>Add Node</button>
      <div>Total nodes: {nodes.length}</div>
      {selectedNode && <p>Selected: {selectedNode}</p>}
    </div>
  );
};
```

## 5. Using React Flow

### Custom Node Component

```typescript
import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

interface CustomNodeData {
  label: string;
  color: string;
}

export const CustomNode = (props: NodeProps<CustomNodeData>) => {
  return (
    <div
      style={{
        background: props.data.color,
        padding: '10px',
        borderRadius: '8px',
        border: props.selected ? '2px solid blue' : '1px solid gray'
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{props.data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
```

### Canvas with React Flow

```typescript
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';

export const Canvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const onConnect = (connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      {/* Controls and background */}
    </ReactFlow>
  );
};
```

## 6. Styling with TailwindCSS

### Common Patterns

```typescript
// Button styles
const buttonStyles = {
  primary: 'bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg',
  secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg',
  ghost: 'text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg'
};

// Container styles
const containerStyles = {
  card: 'bg-white border border-slate-200 rounded-lg p-4 shadow-sm',
  panel: 'bg-white border-l border-slate-200 p-4'
};

// Text styles
const textStyles = {
  heading: 'text-xl font-bold text-slate-900',
  subheading: 'text-lg font-semibold text-slate-800',
  body: 'text-base text-slate-700',
  small: 'text-sm text-slate-600'
};

// Usage
<div className={containerStyles.card}>
  <h2 className={textStyles.heading}>Title</h2>
  <p className={textStyles.body}>Description</p>
  <button className={buttonStyles.primary}>Action</button>
</div>
```

## 7. Common Development Tasks

### Adding a New Node Type

1. **Add to type definition**:
```typescript
// src/types/architecture.ts
export type NodeType = 'api-server' | 'database' | 'your-new-type';
```

2. **Add to design system**:
```typescript
// src/utils/design-system.ts
export const NODE_TYPES = {
  'your-new-type': {
    label: 'Your Type',
    icon: '🆕',
    color: '#your-color',
    description: 'Description here'
  }
};
```

3. **Update NodePalette** to include in drag-and-drop.

### Adding a New Toolbar Button

```typescript
// src/components/ui/Toolbar.tsx
<Button
  size="sm"
  variant="ghost"
  onClick={() => {
    // Your action here
  }}
  title="Tooltip text"
>
  🎯 Your Button
</Button>
```

### Persisting Custom Data

```typescript
// Save to localStorage
const saveProject = () => {
  const state = useArchitectureStore.getState();
  localStorage.setItem('myProject', JSON.stringify({
    nodes: state.nodes,
    edges: state.edges,
  }));
};

// Load from localStorage
const loadProject = () => {
  const saved = localStorage.getItem('myProject');
  if (saved) {
    const data = JSON.parse(saved);
    useArchitectureStore.setState({
      nodes: data.nodes,
      edges: data.edges,
    });
  }
};
```

## 8. Debugging

### Enable React DevTools

```typescript
// Check store state in console
(window as any).architectureStore = useArchitectureStore;

// Then in browser console:
// architectureStore.getState()
// architectureStore.setState({ ... })
```

### Debug Node Changes

```typescript
useArchitectureStore.subscribe(
  (state) => state.nodes,
  (nodes) => console.log('Nodes changed:', nodes)
);
```

### Performance Profiling

```bash
# Build and analyze bundle
npm run build

# Run performance tests
npm run test
```

## 9. Testing

### Unit Test Example (Jest)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useArchitectureStore } from '@/store/architecture-store';

describe('useArchitectureStore', () => {
  it('should add a node', () => {
    const { result } = renderHook(() => useArchitectureStore());
    
    act(() => {
      result.current.addNode({
        type: 'api-server',
        position: { x: 0, y: 0 },
        metadata: {
          name: 'Test',
          description: '',
          technology: ''
        }
      });
    });
    
    expect(result.current.nodes).toHaveLength(1);
  });
});
```

## 10. Production Build

### Build for Production

```bash
npm run build
npm start
```

### Optimization Checklist

- [ ] Remove console.log in production
- [ ] Enable minification
- [ ] Optimize images and assets
- [ ] Test performance with Lighthouse
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Verify LocalStorage quota
- [ ] Test export/import functionality

## 11. Troubleshooting

### Issue: State not updating after action
**Solution**: Ensure you're using the Zustand hook correctly:
```typescript
// Wrong
const store = useArchitectureStore();

// Correct - select specific state
const { nodes, addNode } = useArchitectureStore((state) => ({
  nodes: state.nodes,
  addNode: state.addNode
}));
```

### Issue: Canvas not rendering nodes
**Solution**: Check that React Flow nodeTypes are registered:
```typescript
const nodeTypes = {
  architecture: ArchitectureNode // Must match type in nodes
};
```

### Issue: Performance degradation with large graphs
**Solution**: 
- Use React.memo for node/edge components
- Implement virtual scrolling
- Debounce large state updates
- Use useCallback for event handlers

## 12. Best Practices

1. **Always use specific state selectors** for performance
2. **Memoize callbacks** that are passed to child components
3. **Keep components small and focused** on single responsibility
4. **Use TypeScript** for type safety
5. **Test edge cases** like circular dependencies
6. **Provide user feedback** for all actions
7. **Handle errors gracefully** with proper error boundaries
8. **Document complex logic** with comments
9. **Use semantic HTML** for accessibility
10. **Keep LocalStorage usage** under control

---

## Additional Resources

- [React Flow Documentation](https://reactflow.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [React Hooks API Reference](https://react.dev/reference/react)

---

## Support & Contributions

For issues, questions, or contributions, please refer to the GitHub repository:
https://github.com/princeraj2572/System-Design-Visualizer

Happy developing! 🚀
