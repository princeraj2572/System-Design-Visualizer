/**
 * Project Controller
 */

import { Response, NextFunction } from 'express';
import { ProjectService } from '@/services/projectService';
import { validateProject, validateProjectUpdate } from '@/validators/project';
import { asyncHandler } from '@/middleware/errorHandler';
import { successResponse } from '@/utils/response';
import { AuthRequest } from '@/middleware/auth';
import { broadcastEvent, createChangeEvent, RealtimeEventTypes } from '@/realtime/realtimeService';
import { incrementEventSequence } from '@/realtime/websocket';
import { analyzeProject } from '@/services/analyticsService';

export const createProject = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { name, description, nodes, edges } = validateProject(req.body);
    
    const project = await ProjectService.createProject(
      req.userId!,
      name,
      description,
      nodes,
      edges
    );

    res.status(201).json(
      successResponse(project, 'Project created successfully')
    );
  }
);

export const getProject = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const project = await ProjectService.getProjectById(id, req.userId);

    res.json(
      successResponse(project, 'Project retrieved successfully')
    );
  }
);

export const listProjects = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const { projects, total } = await ProjectService.getUserProjects(
      req.userId!,
      page,
      pageSize
    );

    res.json(
      successResponse(
        { projects, total, page, pageSize },
        'Projects retrieved successfully'
      )
    );
  }
);

export const updateProject = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updates = validateProjectUpdate(req.body);

    const project = await ProjectService.updateProject(
      id,
      req.userId!,
      updates
    );

    // Broadcast real-time events for specific changes
    const sequence = incrementEventSequence(id);

    if (updates.nodes && Array.isArray(updates.nodes)) {
      // For now, broadcast a general project update event
      const event = createChangeEvent(
        RealtimeEventTypes.PROJECT_UPDATE,
        id,
        req.userId!,
        sequence,
        {
          timestamp: new Date().toISOString(),
          changedAt: 'nodes',
          nodeCount: updates.nodes.length,
        }
      );
      broadcastEvent(event);
    }

    if (updates.edges && Array.isArray(updates.edges)) {
      const event = createChangeEvent(
        RealtimeEventTypes.PROJECT_UPDATE,
        id,
        req.userId!,
        sequence,
        {
          timestamp: new Date().toISOString(),
          changedAt: 'edges',
          edgeCount: updates.edges.length,
        }
      );
      broadcastEvent(event);
    }

    if (updates.groups && Array.isArray(updates.groups)) {
      const event = createChangeEvent(
        RealtimeEventTypes.GROUP_UPDATE,
        id,
        req.userId!,
        sequence,
        {
          timestamp: new Date().toISOString(),
          groupCount: updates.groups.length,
        }
      );
      broadcastEvent(event);
    }

    res.json(
      successResponse(project, 'Project updated successfully')
    );
  }
);

export const deleteProject = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    await ProjectService.deleteProject(id, req.userId!);

    res.json(
      successResponse(null, 'Project deleted successfully')
    );
  }
);

export const exportProject = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const format = (req.query.format as string) || 'json';
    const project = await ProjectService.getProjectById(id, req.userId);

    const formats = ['json', 'yaml', 'markdown'];
    if (!formats.includes(format)) {
      res.status(400).json({
        success: false,
        message: `Invalid format. Supported formats: ${formats.join(', ')}`,
      });
      return;
    }

    let content = '';
    let filename = `project-${project.id}`;
    let contentType = 'application/json';

    if (format === 'json') {
      content = JSON.stringify(
        {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          project,
        },
        null,
        2
      );
      filename += '.json';
      contentType = 'application/json';
    } else if (format === 'yaml') {
      content = exportAsYAML(project);
      filename += '.yaml';
      contentType = 'text/yaml';
    } else if (format === 'markdown') {
      content = exportAsMarkdown(project);
      filename += '.md';
      contentType = 'text/markdown';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }
);

export const getAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const project = await ProjectService.getProjectById(id, req.userId);

    const analytics = analyzeProject(project as any);

    res.json(
      successResponse(analytics, 'Analytics calculated successfully')
    );
  }
);

// Helper functions for export formats
function exportAsYAML(project: any): string {
  const lines: string[] = [];

  lines.push('version: "1.0.0"');
  lines.push(`exportedAt: "${new Date().toISOString()}"`);
  lines.push('');

  lines.push('project:');
  lines.push(`  id: "${project.id}"`);
  lines.push(`  name: "${project.name}"`);
  lines.push(`  description: "${project.description || ''}"`);
  lines.push('');

  lines.push('  nodes:');
  project.nodes.forEach((node: any) => {
    lines.push(`    - id: "${node.id}"`);
    lines.push(`      type: "${node.type}"`);
    lines.push(`      position:`);
    lines.push(`        x: ${node.position.x}`);
    lines.push(`        y: ${node.position.y}`);
    if (node.metadata) {
      lines.push(`      metadata:`);
      lines.push(`        name: "${node.metadata.name}"`);
      lines.push(`        description: "${node.metadata.description || ''}"`);
      lines.push(`        technology: "${node.metadata.technology || ''}"`);
    }
  });
  lines.push('');

  lines.push('  edges:');
  project.edges.forEach((edge: any) => {
    lines.push(`    - id: "${edge.id}"`);
    lines.push(`      source: "${edge.source}"`);
    lines.push(`      target: "${edge.target}"`);
    lines.push(`      label: "${edge.label}"`);
  });

  return lines.join('\n');
}

function exportAsMarkdown(project: any): string {
  const lines: string[] = [];

  lines.push(`# ${project.name}`);
  lines.push('');
  if (project.description) {
    lines.push(`${project.description}`);
    lines.push('');
  }

  lines.push('## Architecture Overview');
  lines.push('');
  lines.push(`- **Total Components**: ${project.nodes.length}`);
  lines.push(`- **Total Connections**: ${project.edges.length}`);
  lines.push(`- **Component Groups**: ${(project.groups || []).length}`);
  lines.push('');

  const nodesByType: Record<string, number> = {};
  project.nodes.forEach((node: any) => {
    nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
  });

  lines.push('## Components by Type');
  lines.push('');
  Object.entries(nodesByType).forEach(([type, count]) => {
    lines.push(`- **${type}**: ${count}`);
  });
  lines.push('');

  lines.push('## Components');
  lines.push('');
  project.nodes.forEach((node: any) => {
    lines.push(`### ${node.metadata.name}`);
    lines.push(`- **Type**: ${node.type}`);
    if (node.metadata.technology) {
      lines.push(`- **Technology**: ${node.metadata.technology}`);
    }
    if (node.metadata.description) {
      lines.push(`- **Description**: ${node.metadata.description}`);
    }

    const outgoing = project.edges.filter((e: any) => e.source === node.id);
    const incoming = project.edges.filter((e: any) => e.target === node.id);

    if (outgoing.length > 0) {
      lines.push(`- **Connects To**:`);
      outgoing.forEach((edge: any) => {
        const targetNode = project.nodes.find((n: any) => n.id === edge.target);
        lines.push(`  - ${targetNode?.metadata.name} (${edge.label})`);
      });
    }

    if (incoming.length > 0) {
      lines.push(`- **Connected From**:`);
      incoming.forEach((edge: any) => {
        const sourceNode = project.nodes.find((n: any) => n.id === edge.source);
        lines.push(`  - ${sourceNode?.metadata.name} (${edge.label})`);
      });
    }

    lines.push('');
  });

  return lines.join('\n');
}
