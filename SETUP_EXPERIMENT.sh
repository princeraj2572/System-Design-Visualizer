#!/usr/bin/env bash

# Excalidraw Canvas Experiment - Quick Start Script
# Run this to set up and start testing the experimental canvas

echo "🧪 Excalidraw Canvas Experiment - Quick Start"
echo "=============================================="
echo ""

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feature/excalidraw-canvas-experiment" ]; then
    echo "📍 Checking out experiment branch..."
    git checkout feature/excalidraw-canvas-experiment
fi

echo "✅ On branch: feature/excalidraw-canvas-experiment"
echo ""

# Show what's new
echo "📁 New Files Created:"
echo "  ✨ src/components/editor/canvas/Experimental_ExcalidrawCanvas.tsx"
echo "  ✨ src/components/editor/canvas/ExcalidrawCanvas.css"
echo "  ✨ src/app/experiment/excalidraw-canvas/page.tsx"
echo "  📖 EXCALIDRAW_EXPERIMENT_GUIDE.md"
echo "  📖 FEATURE_BRANCH_README.md"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 Next Steps:"
echo "  1. Run: npm run dev"
echo "  2. Open: http://localhost:3000/experiment/excalidraw-canvas"
echo "  3. Read: EXCALIDRAW_EXPERIMENT_GUIDE.md"
echo "  4. Test both canvas implementations!"
echo ""
echo "💡 Tips:"
echo "  - Toggle between 'Current (ReactFlow)' and 'Excalidraw (Experimental)'"
echo "  - Check 'Show Comparison' to see feature matrix"
echo "  - Follow the testing checklist for comprehensive evaluation"
echo ""
echo "🎯 Happy Testing! 🚀"
