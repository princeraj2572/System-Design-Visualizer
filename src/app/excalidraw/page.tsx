'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ExcalidrawStyles from '@/components/canvas/ExcalidrawStyles';

// Dynamically import ExcalidrawCanvasWrapper
const ExcalidrawCanvasWrapper = dynamic(
  () => import('@/components/canvas/ExcalidrawCanvasWrapper'),
  { 
    ssr: false,
    loading: () => <div className="flex-1 bg-white rounded-lg shadow-lg flex items-center justify-center">Loading canvas...</div>
  }
);

/**
 * Excalidraw Integration Test Page
 * 
 * This page demonstrates the integrated Excalidraw canvas
 * within the System Design Visualizer project.
 * 
 * Features being tested:
 * - Excalidraw drawing interface
 * - Element tracking and export
 * - Comparison with React Flow canvas
 */
export default function ExcalidrawPage() {
  const [elements, setElements] = useState<any[]>([]);
  const [showJson, setShowJson] = useState(false);

  const handleElementsChange = (newElements: any[]) => {
    setElements(newElements);
    console.log('Elements updated:', newElements);
  };

  const exportDiagram = () => {
    const dataStr = JSON.stringify(elements, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `excalidraw-diagram-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ExcalidrawStyles />
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Excalidraw Integration</h1>
            <p className="text-blue-100 mt-1">Hand-drawn diagram editor - Feature Branch Testing</p>
          </div>
          <Link
            href="/editor"
            className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition"
          >
            Back to React Flow Canvas
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Canvas Area */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Drawing Canvas</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ExcalidrawCanvasWrapper
              onElementsChange={handleElementsChange}
              readOnly={false}
            />
          </div>
        </div>

        {/* Sidebar - Controls & Info */}
        <div className="w-80 bg-white rounded-lg shadow-lg overflow-auto flex flex-col">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0">
            <h3 className="font-bold text-lg">Tools & Info</h3>
          </div>

          <div className="p-4 flex-1 overflow-auto space-y-4">
            {/* Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Diagram Stats</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Elements:</span> {elements.length}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={exportDiagram}
                disabled={elements.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                📥 Export Diagram
              </button>

              <button
                onClick={() => setShowJson(!showJson)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                {showJson ? 'Hide' : 'Show'} JSON Data
              </button>
            </div>

            {/* Features */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Features</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Free drawing tools</li>
                <li>✓ Shape insertion</li>
                <li>✓ Text annotations</li>
                <li>✓ Real-time export</li>
                <li>✓ Grid snapping</li>
                <li>✓ Undo/Redo</li>
              </ul>
            </div>

            {/* Comparisons */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">vs React Flow</h4>
              <div className="text-xs text-gray-700 space-y-2">
                <p>
                  <strong>Excalidraw:</strong> Hand-drawn aesthetic, free-form drawing
                </p>
                <p>
                  <strong>React Flow:</strong> Professional node-edge graphs, structured layouts
                </p>
              </div>
            </div>

            {/* JSON Display */}
            {showJson && elements.length > 0 && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-2">
                <h4 className="font-semibold text-gray-800 mb-2 text-xs">JSON Data</h4>
                <pre className="text-xs overflow-auto max-h-48 bg-gray-50 p-2 rounded border border-gray-300">
                  {JSON.stringify(elements.slice(0, 2), null, 2)}
                  {elements.length > 2 && '\n... and more'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <footer className="bg-blue-50 border-t border-blue-200 px-6 py-4">
        <div className="max-w-7xl mx-auto text-sm text-gray-700">
          <p>
            <strong>Excalidraw Integration:</strong> This is an experimental canvas combining the 
            hand-drawn aesthetic of Excalidraw with the system design capabilities of our project.
            Use this to create beautiful architecture diagrams with a sketch-like appearance.
          </p>
        </div>
      </footer>
    </div>
  );
}
