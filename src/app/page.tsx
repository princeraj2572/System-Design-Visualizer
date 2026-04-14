'use client';

import { useCallback } from 'react';
import Layout from '@/components/ui/Layout';
import NodePalette from '@/components/canvas/NodePalette';
import ArchitectureCanvas from '@/components/canvas/ArchitectureCanvas';
import PropertiesPanel from '@/components/canvas/PropertiesPanel';

export default function Home() {
  const handleNodeDragStart = useCallback((nodeType: string) => {
    console.log('Starting drag for node type:', nodeType);
  }, []);

  return (
    <Layout>
      <div className="flex h-full gap-0">
        {/* Left Sidebar - Component Palette */}
        <div className="flex-shrink-0">
          <NodePalette onNodeDragStart={handleNodeDragStart} />
        </div>

        {/* Center - Architecture Canvas */}
        <div className="flex-1">
          <ArchitectureCanvas />
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="flex-shrink-0">
          <PropertiesPanel />
        </div>
      </div>
    </Layout>
  );
}
