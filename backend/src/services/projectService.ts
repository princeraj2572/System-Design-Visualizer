/**
 * Project Service
 */

import pool from '@/config/database';
import redisClient from '@/config/redis';
import { Project, Node, Edge } from '@/models/types';
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
    edges: Edge[] = []
  ): Promise<Project> {
    const projectId = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO projects (id, user_id, name, description, nodes, edges, version, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, '1.0.0', $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      projectId,
      userId,
      name,
      description,
      JSON.stringify(nodes),
      JSON.stringify(edges),
      now,
      now,
    ]);

    const project = result.rows[0];

    // Cache in Redis
    await redisClient.setEx(
      `project:${projectId}`,
      3600,
      JSON.stringify(project)
    );

    return this.formatProject(project);
  }

  /**
   * Get project by ID
   */
  static async getProjectById(projectId: string, userId?: string): Promise<Project> {
    // Try cache first
    const cached = await redisClient.get(`project:${projectId}`);
    if (cached) {
      return this.formatProject(JSON.parse(cached));
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

    // Cache in Redis
    await redisClient.setEx(
      `project:${projectId}`,
      3600,
      JSON.stringify(project)
    );

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

    // Invalidate cache
    await redisClient.del(`project:${projectId}`);

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

    // Invalidate cache
    await redisClient.del(`project:${projectId}`);
  }

  /**
   * Format project response
   */
  private static formatProject(rawProject: any): Project {
    return {
      ...rawProject,
      nodes: typeof rawProject.nodes === 'string' ? JSON.parse(rawProject.nodes) : rawProject.nodes,
      edges: typeof rawProject.edges === 'string' ? JSON.parse(rawProject.edges) : rawProject.edges,
    };
  }
}
