# Quick Start - Final Integration Steps

## 🎯 Goal
Connect newly created spec-aligned components to your existing project so everything works together.

## 📋 Step-by-Step

### Step 1: Install Dependencies (5 min)
```bash
cd e:\Project\system visualizer
npm install
```

### Step 2: Type Check (2 min)
```bash
npm run type-check
```
If there are errors, they'll be in import paths or store method signatures. Fix them now.

### Step 3: Update Store Methods (10 min)
**File**: `src/store/architecture-store.ts`

Add these methods to your Zustand store (inside the store function):
```typescript
// UI State
setViewMode: (mode: 'document' | 'both' | 'canvas') => set(state => { 
  state.viewMode = mode; 
}),
setRightPanelTab: (tab: 'properties' | 'connections' | 'documentation') => set(state => {
  state.rightPanelTab = tab;
}),
setSidebarSearch: (query: string) => set(state => {
  state.sidebarSearchQuery = query;
}),

// Enhanced addNode with collision detection
addNode: (componentId: string, position: { x: number; y: number }) => set(state => {
  const { getComponentDefinition } = require('@/lib/componentLibrary');
  const { findFreePosition } = require('@/lib/collisionDetection');
  const def = getComponentDefinition(componentId);
  if (!def) return;

  // Use collision detection for actual nodes
  const nodes = state.nodes as any[];
  const availablePosition = findFreePosition(position, nodes.map(n => ({
    id: n.id,
    position: n.position,
    style: { width: n.width ?? 140, height: n.height ?? 70 }
  })));

  const newNode = {
    id: require('nanoid').nanoid(),
    type: def.shape,
    position: availablePosition,
    data: {
      data: {
        label: def.label,
        sublabel: def.sublabel,
        category: def.category,
        shape: def.shape,
        icon: def.icon,
        description: '',
        notes: '',
        tags: [],
        color: def.defaultColor,
        isLocked: false,
        isCollapsed: false,
        ...def.defaultData,
      }
    },
  };
  
  state.nodes.push(newNode);
}),

// Add these fields to initial state if not present
viewMode: 'canvas',
rightPanelTab: 'properties',
sidebarSearchQuery: '',
```

### Step 4: Update Editor Page (15 min)
**File**: `src/app/editor/[projectId]/page.tsx`

Replace with:
```typescript
'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { useArchitectureStore } from '@/store/architecture-store';
import LeftSidebar from '@/components/editor/sidebar/LeftSidebar';
import CanvasPanel from '@/components/editor/canvas/CanvasPanel';
import RightPanel from '@/components/editor/rightpanel';

export default function EditorPage({ params }: { params: { projectId: string } }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    selectedEdge,
    setViewMode,
    setRightPanelTab,
    setSidebarSearch,
    selectNode,
    selectEdge,
    updateNode: updateNodeData,
    updateEdge: updateEdgeData,
    removeEdge: deleteEdge,
    addNode,
    sidebarSearchQuery,
    viewMode,
    rightPanelTab,
    isGridVisible,
    isMinimapVisible,
  } = useArchitectureStore();

  // Get selected node/edge data
  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  const selectedEdgeData = edges.find(e => e.id === selectedEdge);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
        {/* Left Sidebar - Component Library */}
        <LeftSidebar
          searchQuery={sidebarSearchQuery}
          onSearch={setSidebarSearch}
        />

        {/* Center - Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Optional: Top toolbar with view mode tabs */}
          <div className="border-b border-gray-200 dark:border-zinc-800 p-2 flex gap-2">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'canvas'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setViewMode('document')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'document'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Document
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'both'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Both
            </button>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <CanvasPanel
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectNode={(id) => {
                selectNode(id);
                if (id) setRightPanelTab('properties');
              }}
              onSelectEdge={(id) => {
                selectEdge(id);
                if (id) setRightPanelTab('connections');
              }}
              onAddNode={addNode}
              showGrid={isGridVisible}
              showMinimap={isMinimapVisible}
            />
          </div>
        </main>

        {/* Right Sidebar - Inspector */}
        <RightPanel
          selectedNode={selectedNodeData as any}
          selectedEdge={selectedEdgeData as any}
          nodes={nodes as any}
          edges={edges as any}
          onUpdateNode={(nodeId, patch) => {
            updateNodeData(nodeId, {
              ...selectedNodeData,
              data: {
                ...(selectedNodeData?.data || {}),
                ...patch.data || patch,
              },
            });
          }}
          onUpdateEdge={(edgeId, patch) => {
            updateEdgeData(edgeId, {
              ...selectedEdgeData,
              data: {
                ...(selectedEdgeData?.data || {}),
                ...patch.data || patch,
              },
            });
          }}
          onDeleteEdge={deleteEdge}
          onAddNode={addNode}
        />
      </div>
    </ReactFlowProvider>
  );
}
```

### Step 5: Build & Test (5 min)
```bash
npm run build
npm run dev
```

Then test:
1. Open http://localhost:3000 in browser
2. Drag "Microservice" from left sidebar to canvas
3. Click it - right panel should show Properties
4. Edit the name field - should update instantly
5. Drag another component - should snap to grid but not overlap

### Step 6: Common Fixes

**Error: "Cannot find module '@xyflow/react'"**
→ Run `npm install` again

**Error: "nodeTypes is not defined"**
→ Import at top of CanvasPanel: `import { nodeTypes } from './nodes/nodeTypes';`

**Nodes not dragging**
→ Check that `isLocked` is false on node data

**Edges not showing**
→ Verify `edgeTypes` import in CanvasPanel

**Right panel doesn't update**
→ Make sure `onUpdateNode` patch includes full `data` object

## 🧪 Verification Checklist

- [ ] `npm run build` completes without errors
- [ ] `npm run type-check` passes
- [ ] `npm run dev` starts without errors
- [ ] Can drag component from sidebar to canvas
- [ ] Dropped component appears with correct shape
- [ ] Can click node to select it
- [ ] Right panel shows Properties tab
- [ ] Can edit node name and see it update
- [ ] Can create edge by dragging between handles
- [ ] Edge shows protocol badge
- [ ] Can select Connections tab and see edge options

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Components not dragging | Check `onDragStart` sets correct data-transfer type in sidebar |
| Edges not connecting | Verify `onConnect` handler in CanvasPanel |
| Right panel blank | Check `selectedNodeData` is being passed correctly |
| Nodes overlapping | Verify `findFreePosition` is called in store `addNode` |
| TypeScript errors | Run `npm run type-check` to see exact errors |

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Sidebar components drag smoothly
2. ✅ Dropped nodes snap to 20px grid
3. ✅ Nodes never overlap
4. ✅ Right panel updates when selecting nodes
5. ✅ Edge protocol badges appear and animate on async
6. ✅ Connection suggestions appear in Connections tab
7. ✅ Can edit all properties without errors

---

**Estimated Time**: 30-45 minutes total
**Complexity**: Medium (mostly copy-paste with minor store integration)
**Result**: Fully functional spec-based design canvas with 24-component library
