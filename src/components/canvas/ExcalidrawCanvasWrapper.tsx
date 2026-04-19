'use client';

import React, { useRef, useEffect } from 'react';
import { Excalidraw, MainMenu, convertToExcalidrawElements } from 'excalidraw';
import type { ExcalidrawAPI } from 'excalidraw/types';
import 'excalidraw/excalidraw.css';

interface ExcalidrawCanvasWrapperProps {
  onElementsChange?: (elements: any[]) => void;
  initialData?: any;
  readOnly?: boolean;
}

/**
 * ExcalidrawCanvasWrapper - Integrates Excalidraw diagram editor
 * 
 * Features:
 * - Full Excalidraw drawing capabilities
 * - Hand-drawn aesthetic for diagrams
 * - Real-time element change tracking
 * - Export to multiple formats
 * - Collaborative editing support (via Excalidraw)
 */
export const ExcalidrawCanvasWrapper: React.FC<ExcalidrawCanvasWrapperProps> = ({
  onElementsChange,
  initialData,
  readOnly = false,
}) => {
  const excalidrawAPI = useRef<ExcalidrawAPI>(null);

  useEffect(() => {
    if (excalidrawAPI.current) {
      // Set initial data if provided
      if (initialData) {
        excalidrawAPI.current.updateData(initialData);
      }
    }
  }, [initialData]);

  const handleChange = (elements: any[], appState: any, files: any) => {
    if (onElementsChange) {
      onElementsChange(elements);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <Excalidraw
        ref={excalidrawAPI}
        onChange={handleChange}
        isCollaborating={false}
        autoFocus={true}
        theme="light"
        gridModeEnabled={true}
        zenModeEnabled={false}
        viewBackgroundColor="#ffffff"
        renderAction={() => null}
        UIOptions={{
          canvasMenu: {
            defaultItems: ['clearReset', 'export', 'saveAsImage'],
          },
        }}
      />
    </div>
  );
};

export default ExcalidrawCanvasWrapper;
