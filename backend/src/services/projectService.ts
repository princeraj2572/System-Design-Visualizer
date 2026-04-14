/**
 * Project Service
 */

import pool from '@/config/database';
import redisClient from '@/config/redis';
import { Project, Node, Edge, NodeGroup } from '@/models/types';
import { NotFoundError, AuthorizationError } from '@/utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(
    userId: string,
    name: string,
    description: string,
    nodes: Node[] = [],
    edges: Edge[] = [],
    groups: NodeGroup[] = []
  ): Promise<Project> {
    // Validate hierarchy
    if (groups.length > 0) {
      this.validateHierarchy(groups, nodes.map(n => n.id));
    }

    const projectId = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO projects (id, user_id, name, description, nodes, edges, groups, version, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, '1.0.0', $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [
      projectId,
      userId,
      name,
      description,
      JSON.stringify(nodes),
      JSON.stringify(edges),
      JSON.stringify(groups),
      now,
      now,
    ]);

    const project = result.rows[0];

    // Cache in Redis (optional - continue if Redis fails)
    try {
      await redisClient.setEx(
        `project:${projectId}`,
        3600,
        JSON.stringify(project)
      );
    } catch (redisError) {
      // Redis is optional, continue without caching
      console.warn('Redis caching unavailable, using database only');
    }

    return this.formatProject(project);
  }

  /**
   * Get project by ID
   */
  static async getProjectById(projectId: string, userId?: string): Promise<Project> {
    // Try cache first
    try {
      const cached = await redisClient.get(`project:${projectId}`);
      if (cached) {
        return this.formatProject(JSON.parse(cached));
      }
    } catch (redisError) {
      // Redis error, continue to database
      console.warn('Redis unavailable, fetching from database');
    }

    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await pool.query(query, [projectId]);

    if (!result.rows.length) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    const project = result.rows[0];

    // Check authorization for private projects
    if (!project.is_public && userId && project.user_id !== userId) {
      throw new AuthorizationError('Not authorized to access this project');
    }

    // Cache in Redis (optional)
    try {
      await redisClient.setEx(
        `project:${projectId}`,
        3600,
        JSON.stringify(project)
      );
    } catch (redisError) {
      // Redis is optional, continue without caching
      console.warn('Redis caching unavailable, using database only');
    }

    return this.formatProject(project);
  }

  /**
   * List user's projects
   */
  static async getUserProjects(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ projects: Project[]; total: number }> {
    const offset = (page - 1) * pageSize;

    const query = 'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2 OFFSET $3';
    const countQuery = 'SELECT COUNT(*) FROM projects WHERE user_id = $1';

    const [resultsRes, countRes] = await Promise.all([
      pool.query(query, [userId, pageSize, offset]),
      pool.query(countQuery, [userId]),
    ]);

    return {
      projects: resultsRes.rows.map((p) => this.formatProject(p)),
      total: parseInt(countRes.rows[0].count),
    };
  }

  /**
   * Update project
   */
  static async updateProject(
    projectId: string,
    userId: string,
    updates: Partial<Project>
  ): Promise<Project> {
    // Check authorization
    const project = await this.getProjectById(projectId, userId);

    if (project.user_id !== userId) {
      throw new AuthorizationError('Not authorized to update this project');
    }

    const setClause = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      setClause.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      setClause.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (updates.nodes !== undefined) {
      setClause.push(`nodes = $${paramCount++}`);
      values.push(JSON.stringify(updates.nodes));
    }

    if (updates.edges !== undefined) {
      setClause.push(`edges = $${paramCount++}`);
      values.push(JSON.stringify(updates.edges));
    }

    if (updates.groups !== undefined) {
      // Validate hierarchy
      this.validateHierarchy(updates.groups, updates.nodes ? updates.nodes.map(n => n.id) : project.nodes.map((n: any) => n.id));
      setClause.push(`groups = $${paramCount++}`);
      values.push(JSON.stringify(updates.groups));
    }

    setClause.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(projectId);

    const query = `
      UPDATE projects
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    // Invalidate cache (optional)
    try {
      await redisClient.del(`project:${projectId}`);
    } catch (redisError) {
      // Redis is optional, continue without cache invalidation
      console.warn('Redis cache invalidation unavailable');
    }

    return this.formatProject(result.rows[0]);
  }

  /**
   * Delete project
   */
  static async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.getProjectById(projectId, userId);

    if (project.user_id !== userId) {
      throw new AuthorizationError('Not authorized to delete this project');
    }

    const query = 'DELETE FROM projects WHERE id = $1';
    await pool.query(query, [projectId]);

    // Invalidate cache (optional)
    try {
      await redisClient.del(`project:${projectId}`);
    } catch (redisError) {
      // Redis is optional, continue without cache invalidation
      console.warn('Redis cache invalidation unavailable');
    }
  }

  /**
   * Validate hierarchy integrity
   */
  private static validateHierarchy(groups: NodeGroup[], nodeIds: string[]): void {
    const visitedGroups = new Set<string>();
    const nodeIdSet = new Set(nodeIds);

    for (const group of groups) {
      // Check for circular references
      this.checkCircularReferences(group.id, group.parentId, groups, visitedGroups);

      // Check that all child nodes exist
      for (const childId of group.childNodeIds) {
        if (!nodeIdSet.has(childId)) {
          throw new Error(`Invalid group: child node ${childId} does not exist`);
        }
      }

      // Check that parent group exists if specified
      if (group.parentId && !groups.find(g => g.id === group.parentId)) {
        throw new Error(`Invalid group: parent group ${group.parentId} does not exist`);
      }
    }
  }

  /**
   * Check for circular references in group hierarchy
   */
  private static checkCircularReferences(
    currentId: string,
    parentId: string | null | undefined,
    groups: NodeGroup[],
    visited: Set<string>
  ): void {
    if (!parentId) return;

    if (visited.has(parentId)) {
      throw new Error(`Circular reference detected in group hierarchy`);
    }

    visited.add(parentId);
    const parentGroup = groups.find(g => g.id === parentId);
    if (parentGroup) {
      this.checkCircularReferences(currentId, parentGroup.parentId, groups, visited);
    }
  }

  /**
   * Format project response
   */
  private static formatProject(rawProject: any): Project {
    return {
      ...rawProject,
      nodes: typeof rawProject.nodes === 'string' ? JSON.parse(rawProject.nodes) : rawProject.nodes,
      edges: typeof rawProject.edges === 'string' ? JSON.parse(rawProject.edges) : rawProject.edges,
      groups: typeof rawProject.groups === 'string' ? JSON.parse(rawProject.groups) : (rawProject.groups || []),
    };
  }
}
