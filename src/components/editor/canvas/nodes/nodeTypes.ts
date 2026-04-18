/**
 * Node Types Registry - maps shape types to React components
 * CRITICAL: Define outside React components to prevent ReactFlow re-registration on every render
 */

import { ServiceNode } from './ServiceNode';
import { DatabaseNode } from './DatabaseNode';
import { CacheNode } from './CacheNode';
import { QueueNode } from './QueueNode';
import { ClientNode } from './ClientNode';
import { GroupNode } from './GroupNode';

export const nodeTypes = {
  rectangle: ServiceNode,
  cylinder: DatabaseNode,
  hexagon: CacheNode,
  parallelogram: QueueNode,
  pill: ClientNode,
  diamond: ServiceNode, // use ServiceNode with diamond variant if needed
  cloud: ServiceNode, // use ServiceNode with cloud variant
  group: GroupNode,
} as const;
