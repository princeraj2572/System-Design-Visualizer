/**
 * Integration Test - Verify Hierarchy Implementation Works
 * This file tests that the hierarchy types and store work together correctly
 */

import type { NodeGroup, Project } from '@/types/architecture';

// Test 1: Create a project with nodes and groups
const testProject: Project = {
  id: 'test-project-1',
  name: 'Test Architecture',
  description: 'Testing hierarchy support',
  nodes: [
    {
      id: 'api-1',
      type: 'api-gateway',
      position: { x: 100, y: 100 },
      parentId: 'group-1',
      metadata: {
        name: 'API Gateway',
        description: 'Main API entry point',
        technology: 'Node.js',
      },
    },
    {
      id: 'db-1',
      type: 'sql-database',
      position: { x: 100, y: 300 },
      parentId: 'group-1',
      metadata: {
        name: 'PostgreSQL',
        description: 'Main database',
        technology: 'PostgreSQL',
      },
    },
    {
      id: 'cache-1',
      type: 'cache',
      position: { x: 300, y: 100 },
      parentId: null,
      metadata: {
        name: 'Redis Cache',
        description: 'Distributed cache',
        technology: 'Redis',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'api-1',
      target: 'db-1',
      label: 'queries',
      type: 'database',
    },
  ],
  groups: [
    {
      id: 'group-1',
      name: 'Core Services',
      description: 'Main service group',
      parentId: null,
      childNodeIds: ['api-1', 'db-1'],
      color: '#E8F1F5',
      position: { x: 50, y: 50 },
      size: { width: 400, height: 400 },
      isCollapsed: false,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test 2: Verify node hierarchy relationships
export function verifyHierarchy(project: Project): boolean {
  // Check that all nodes referenced in groups exist
  const groups = project.groups || [];
  for (const group of groups) {
    for (const nodeId of group.childNodeIds) {
      const nodeExists = project.nodes.some(n => n.id === nodeId);
      if (!nodeExists) {
        console.error(`Node ${nodeId} referenced in group ${group.id} does not exist`);
        return false;
      }
      
      // Verify the node has this group as parent
      const node = project.nodes.find(n => n.id === nodeId);
      if (node?.parentId !== group.id) {
        console.error(`Node ${nodeId} has incorrect parentId`);
        return false;
      }
    }
  }
  
  return true;
}

// Test 3: Verify no circular references
export function checkNoCircularReferences(groups: NodeGroup[]): boolean {
  const visited = new Set<string>();
  
  for (const group of groups) {
    if (hasCircularParent(group.id, group.parentId, groups, visited)) {
      console.error(`Circular reference detected in group ${group.id}`);
      return false;
    }
    visited.clear();
  }
  
  return true;
}

function hasCircularParent(
  currentId: string,
  parentId: string | null | undefined,
  groups: NodeGroup[],
  visited: Set<string>
): boolean {
  if (!parentId) return false;
  if (visited.has(parentId)) return true;
  
  visited.add(parentId);
  const parentGroup = groups.find(g => g.id === parentId);
  if (!parentGroup) return false;
  
  return hasCircularParent(currentId, parentGroup.parentId, groups, visited);
}

// Run tests
console.log('Test Project:', JSON.stringify(testProject, null, 2));
console.log('Hierarchy valid:', verifyHierarchy(testProject));
console.log('No circular refs:', checkNoCircularReferences(testProject.groups || []));
