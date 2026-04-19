'use client';

import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ExcalidrawStyles from './ExcalidrawStyles';

// Dynamically import Excalidraw to avoid SSR issues
const ExcalidrawComponent = dynamic(
  async () => {
    const excalidrawModule = await import('excalidraw');
    return excalidrawModule.Excalidraw;
  },
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading Excalidraw...</div>
  }
);

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
  const excalidrawAPI = useRef<any>(null);

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

  if (!typeof window !== 'undefined') {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <ExcalidrawStyles />
      <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden excalidraw-container">
        <ExcalidrawComponent
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
    </>
  );
};

export default ExcalidrawCanvasWrapper;
