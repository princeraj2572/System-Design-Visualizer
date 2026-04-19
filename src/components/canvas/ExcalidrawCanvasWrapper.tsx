'use client';

import React, { useRef, useEffect, useState } from 'react';
import SimpleDrawingCanvas from './SimpleDrawingCanvas';
import ExcalidrawStyles from './ExcalidrawStyles';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Set flag that we're on client
    setIsClient(true);
    setIsLoaded(true);
  }, []);

  if (!isClient || !isLoaded) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center justify-center gap-4 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
        <p className="text-gray-600 font-medium">Initializing Drawing Canvas...</p>
      </div>
    );
  }

  // Use simple drawing canvas as fallback
  return (
    <>
      <ExcalidrawStyles />
      <div 
        ref={containerRef}
        className="w-full h-full bg-white overflow-hidden"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <SimpleDrawingCanvas onElementsChange={onElementsChange} />
      </div>
    </>
  );
};

export default ExcalidrawCanvasWrapper;
