'use client';

import React from 'react';
import styles from './ExcalidrawCanvas.module.css';

export const ExcalidrawStyles = () => (
  <style>{`
    .excalidraw {
      font-family: 'Cascadia', 'Segoe UI', sans-serif;
      height: 100%;
      width: 100%;
    }
    
    .excalidraw-textEditorContainer {
      position: absolute;
    }
    
    .excalidraw canvas {
      display: block;
    }
    
    .excalidraw [role="button"] {
      cursor: pointer;
    }
    
    .excalidraw-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .excalidraw-ui-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `}</style>
);

export default ExcalidrawStyles;
