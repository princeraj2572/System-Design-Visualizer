/**
 * Resizable Sidebar - Can be resized by dragging the edge or detached
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';
import SidebarNav from '@/components/canvas/SidebarNav';

interface ResizableSidebarProps {
  onSelectTool?: (toolId: string, itemId?: string) => void;
  onRender?: () => void;
  isDetached?: boolean;
  onDetach?: () => void;
  onAttach?: () => void;
  defaultWidth?: number;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  onSelectTool,
  onRender,
  isDetached = false,
  onDetach,
  onAttach,
  defaultWidth = 208, // w-52 = 208px
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;

      // Clamp width between 150px and 400px
      if (newWidth >= 150 && newWidth <= 400) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (isDetached) {
    return (
      <div
        className="fixed bg-white border border-slate-300 rounded-lg shadow-2xl flex flex-col overflow-hidden z-40 group"
        style={{
          width: `${width}px`,
          height: '70vh',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
        }}
      >
        {/* Detached Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-700 uppercase">Tools</h3>
          <button
            onClick={onAttach}
            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
            title="Attach sidebar"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <SidebarNav onSelectTool={onSelectTool} onRender={onRender} className="border-0" />

        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          onMouseDown={() => setIsDragging(true)}
          className="absolute right-0 top-0 w-1 h-full bg-slate-300 hover:bg-cyan-500 cursor-col-resize transition-colors"
          title="Drag to resize"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden relative group"
      style={{ width: `${width}px` }}
    >
      {/* Detach Button - Visible on hover */}
      <button
        onClick={onDetach}
        className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 rounded shadow-md opacity-0 group-hover:opacity-100 hover:bg-slate-50 transition-all z-10"
        title="Detach sidebar"
      >
        <GripHorizontal size={14} className="text-slate-500" />
      </button>

      {/* Content */}
      <SidebarNav onSelectTool={onSelectTool} onRender={onRender} className="border-0" />

      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        onMouseDown={() => setIsDragging(true)}
        className="absolute right-0 top-0 w-1 h-full bg-slate-200 hover:bg-cyan-500 cursor-col-resize opacity-0 group-hover:opacity-100 transition-all"
        title="Drag to resize"
      />
    </div>
  );
};

export default ResizableSidebar;
