/**
 * Zoom controls for canvas
 * Allows zooming in/out and fitting to view
 */

'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  minZoom?: number;
  maxZoom?: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  minZoom = 0.2,
  maxZoom = 4,
}) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-40">
      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        title="Zoom In (Ctrl + Plus)"
        className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ZoomIn size={20} className="text-slate-600" />
      </button>

      {/* Zoom Level Display */}
      <div className="px-2 py-1 text-center text-xs font-semibold text-slate-600 bg-slate-50 rounded border border-slate-200">
        {Math.round(zoom * 100)}%
      </div>

      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        title="Zoom Out (Ctrl + Minus)"
        className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ZoomOut size={20} className="text-slate-600" />
      </button>

      {/* Divider */}
      <div className="h-px bg-slate-200 my-1" />

      {/* Fit to View Button */}
      <button
        onClick={onFitView}
        title="Fit to View (Ctrl + 0)"
        className="p-2 hover:bg-slate-100 rounded transition-colors"
      >
        <Maximize2 size={20} className="text-slate-600" />
      </button>
    </div>
  );
};

export default ZoomControls;
