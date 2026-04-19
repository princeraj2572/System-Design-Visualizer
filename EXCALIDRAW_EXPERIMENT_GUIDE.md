# 🧪 Excalidraw Canvas Experiment - Testing Guide

**Branch**: `feature/excalidraw-canvas-experiment`  
**Status**: In Testing & Evaluation  
**Created**: April 20, 2026  
**Purpose**: Evaluate and compare canvas implementations for System Design Visualizer

---

## Overview

This experimental branch tests a new Excalidraw-inspired canvas component alongside the current ReactFlow implementation. The goal is to determine which approach best suits your System Design Visualizer's needs.

### What's New

1. **Experimental_ExcalidrawCanvas.tsx** - New canvas component with Excalidraw-inspired features
2. **ExcalidrawCanvas.css** - Enhanced styling with hand-drawn aesthetic
3. **excalidraw-canvas/page.tsx** - Testing page to switch between implementations
4. **This guide** - Comprehensive testing instructions

---

## How to Access the Testing Page

```bash
# 1. Make sure you're on the experiment branch
git branch -a
git checkout feature/excalidraw-canvas-experiment

# 2. Start the dev server
npm run dev

# 3. Visit the testing page
# http://localhost:3000/experiment/excalidraw-canvas
```

---

## Testing Scenarios

### Scenario 1: Basic Interaction

**Test**: Drag and drop nodes from the sidebar

1. Click on "📊 Current (ReactFlow)" mode
2. Drag a component (e.g., "Microservice") from the left sidebar
3. Drop it on the canvas
4. Repeat with "✨ Excalidraw (Experimental)" mode
5. Compare smoothness and visual feedback

**What to look for**:
- [ ] Drag preview is accurate
- [ ] Drop position snaps to grid
- [ ] Node appears instantly
- [ ] Visual feedback is clear
- [ ] No lag or stuttering

---

### Scenario 2: Connections

**Test**: Create edges between nodes

1. Add 2-3 microservice nodes to the canvas
2. Connect them by dragging from one node's port to another
3. Click on the edge to select it
4. Switch to Excalidraw mode and repeat

**What to look for**:
- [ ] Connection creation is intuitive
- [ ] Edge rendering is smooth
- [ ] Labels are visible and positioned correctly
- [ ] Protocol colors display properly
- [ ] Animated edges (async) are clear

---

### Scenario 3: Navigation

**Test**: Pan and zoom across the canvas

1. Use scroll wheel to zoom in/out
2. Drag the canvas to pan
3. Click "fit view" button
4. Use minimap to navigate
5. Switch between modes and compare

**What to look for**:
- [ ] Zoom is smooth and responsive
- [ ] Panning feels natural
- [ ] Minimap is helpful
- [ ] Controls are easy to access
- [ ] Performance stays good with 10+ nodes

---

### Scenario 4: Selection & Editing

**Test**: Select nodes and edit properties

1. Click a node to select it
2. Verify the right panel updates
3. Drag to multi-select nodes
4. Switch to Excalidraw mode and repeat

**What to look for**:
- [ ] Selection feedback is clear
- [ ] Selection outline is visible
- [ ] Right panel updates instantly
- [ ] Multi-select works smoothly
- [ ] Selection handles are visible

---

### Scenario 5: Visual Design

**Test**: Compare aesthetics and clarity

1. Create a complex diagram (10+ nodes, 15+ edges)
2. Take a screenshot in both modes
3. Evaluate:
   - Node visibility
   - Edge clarity
   - Color scheme
   - Overall layout
   - Professional appearance

**What to look for**:
- [ ] Nodes are clearly distinguished
- [ ] Edges don't obscure content
- [ ] Colors match category (compute/storage/etc)
- [ ] Grid helps with alignment
- [ ] Dark mode is legible
- [ ] Layout is professional

---

### Scenario 6: Performance

**Test**: Test with large diagrams

```bash
# Generate test data
npm run test-data  # Creates 1000-node test file

# Load in both canvas modes
```

1. Create a large diagram (50+ nodes)
2. Measure:
   - Pan smoothness
   - Zoom responsiveness
   - Frame rate
   - Memory usage
   - Interaction lag

**What to look for**:
- [ ] No stuttering even with 50+ nodes
- [ ] Zoom remains smooth
- [ ] Pan is responsive
- [ ] No memory leaks
- [ ] CPU usage stays reasonable

---

## Feature Comparison Matrix

| Feature | Current (ReactFlow) | Excalidraw (Experimental) | Notes |
|---------|-------------------|-------------------------|-------|
| **Stability** | ✅ Proven | 🔄 New | ReactFlow is production-ready |
| **Customization** | ✅ High | ✨ Enhanced | Excalidraw has more styling |
| **Hand-drawn Look** | ⚠️ Limited | ✨ Yes | Excalidraw aesthetic included |
| **Performance** | ✅ Excellent | ?️ TBD | Needs load testing |
| **Infinite Canvas** | ✅ Yes | ✅ Yes | Both support this |
| **TypeScript** | ✅ Full | ✅ Full | Both are fully typed |
| **Shape Library** | ✅ 42 types | ✅ 42 types | Shared library |
| **Collision Detection** | ✅ Yes | ✅ Yes | Shared algorithm |
| **Dark Mode** | ✅ Full | ✅ Full | Both supported |
| **Mobile Friendly** | ✅ Good | ?️ TBD | Needs mobile testing |
| **Browser Support** | ✅ Wide | ✅ Standard | Both modern browsers |

---

## Evaluation Criteria

Score each aspect from 1-5 (5 = Excellent):

### Usability
- (1-5) Ease of use: ____
- (1-5) Intuitiveness: ____
- (1-5) Responsiveness: ____

### Visuals
- (1-5) Component clarity: ____
- (1-5) Edge visibility: ____
- (1-5) Overall aesthetics: ____
- (1-5) Dark mode support: ____

### Performance
- (1-5) Zoom smoothness: ____
- (1-5) Pan responsiveness: ____
- (1-5) Drag performance: ____
- (1-5) Load time: ____

### Stability
- (1-5) Crashes/errors: ____
- (1-5) Consistency: ____
- (1-5) Built-in features: ____

**Total Score (out of 60)**:
- Current: ____
- Excalidraw: ____

---

## Known Issues & Limitations

### Current Implementation (ReactFlow)
- Limited hand-drawn aesthetic
- Standard rectangular nodes might feel corporate
- Less customizable edge rendering

### Excalidraw Implementation (experimental)
- Still in development
- Some features incomplete
- May need performance optimization
- Requires thorough browser testing

---

## Testing Checklist

- [ ] Accessed testing page successfully
- [ ] Tested drag & drop in both modes
- [ ] Created connections between nodes
- [ ] Tested pan & zoom
- [ ] Tested selection & multi-select
- [ ] Evaluated visual design
- [ ] Tested with 10+ nodes
- [ ] Tested dark mode
- [ ] Noted performance observations
- [ ] Completed evaluation criteria
- [ ] Identified preferred approach
- [ ] Documented feedback in comments

---

## Next Steps (After Testing)

### If Current ReactFlow Wins:
1. Continue with existing implementation
2. Delete experimental branch
3. Focus on optimizing current features

### If Excalidraw Experiment Wins:
1. Complete experimental implementation
2. Merge into feature branch
3. Extensive browser compatibility testing
4. Performance optimization
5. Merge to master when production-ready

### If Mixed Approach Wins:
1. Extract best features from both
2. Create hybrid implementation
3. Test hybrid thoroughly
4. Deploy when stable

---

## Browser Testing

Test in these browsers if possible:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Feedback & Comments

### What worked well in Current mode:
- 
- 

### What worked well in Excalidraw mode:
- 
- 

### Issues encountered:
- 
- 

### Performance observations:
- 
- 

### Preferred approach:
- [ ] Current (ReactFlow)
- [ ] Excalidraw (Experimental)
- [ ] Hybrid approach

### Why:
(Explain your choice here)

---

## Useful Commands

```bash
# Check current branch
git branch -a

# Switch to experiment branch
git checkout feature/excalidraw-canvas-experiment

# View changes from master
git diff master

# View commit history for this branch
git log --oneline -10

# Return to master (after testing)
git checkout master

# Delete experiment branch (if not needed)
git branch -d feature/excalidraw-canvas-experiment

# Compare with master (in diff viewer)
git diff master -- src/components/editor/canvas/
```

---

## Resources

- **Excalidraw Docs**: https://docs.excalidraw.com/
- **Excalidraw Repo**: https://github.com/excalidraw/excalidraw
- **ReactFlow Docs**: https://reactflow.dev/
- **Canvas Best Practices**: https://github.com/excalidraw/excalidraw/discussions

---

## Questions?

📝 Document progress and findings as you test  
💬 Leave detailed comments in code for each observation  
📊 Record metrics for comparison  
🐛 Note any bugs or unexpected behavior  

---

**Happy Testing! 🚀**

*This experimental branch is designed for evaluation and learning. Feel free to experiment freely and document what you discover!*
