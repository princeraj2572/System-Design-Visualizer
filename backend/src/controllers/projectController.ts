/**
 * Project Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '@/services/projectService';
import { validateProject, validateProjectUpdate } from '@/validators/project';
import { asyncHandler } from '@/middleware/errorHandler';
import { successResponse } from '@/utils/response';
import { AuthRequest } from '@/middleware/auth';

export const createProject = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name, description, nodes, edges } = validateProject(req.body);
    
    const project = await ProjectService.createProject(
      req.userId!,
      name,
      description,
      nodes,
      edges
    );

    res.status(201).json(
      successResponse(project, 'Project created successfully', 'create')
    );
  }
);

export const getProject = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const project = await ProjectService.getProjectById(id, req.userId);

    res.json(
      successResponse(project, 'Project retrieved successfully', 'read')
    );
  }
);

export const listProjects = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        'Projects retrieved successfully',
        'read'
      )
    );
  }
);

export const updateProject = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updates = validateProjectUpdate(req.body);

    const project = await ProjectService.updateProject(
      id,
      req.userId!,
      updates
    );

    res.json(
      successResponse(project, 'Project updated successfully', 'update')
    );
  }
);

export const deleteProject = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await ProjectService.deleteProject(id, req.userId!);

    res.json(
      successResponse(null, 'Project deleted successfully', 'delete')
    );
  }
);

export const exportProject = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const project = await ProjectService.getProjectById(id, req.userId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="project-${project.id}.json"`
    );

    res.json(project);
  }
);
