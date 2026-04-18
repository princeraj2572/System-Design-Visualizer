/**
 * Edge Types Registry - maps edge types to React components
 * CRITICAL: Define outside React components to prevent ReactFlow re-registration on every render
 */

import { SmartEdge } from './SmartEdge';

export const edgeTypes = { smart: SmartEdge } as const;
