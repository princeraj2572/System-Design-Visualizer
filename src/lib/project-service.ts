/**
 * Project Service - Integrates with backend API
 */

import { apiClient } from './api-client';
import type { NodeData, Edge, Project } from '@/types/architecture';

export interface CreateProjectRequest {
  name: string;
  description?: string;
  nodes?: NodeData[];
  edges?: Edge[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  nodes?: NodeData[];
  edges?: Edge[];
}

export interface ProjectsListResponse {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
}

export const projectService = {
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<{ data: Project }>('/projects', data);
    return response.data;
  },

  async listProjects(page: number = 1, pageSize: number = 10): Promise<ProjectsListResponse> {
    const response = await apiClient.get<{ data: ProjectsListResponse }>(
      `/projects?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await apiClient.get<{ data: Project }>(`/projects/${projectId}`);
    return response.data;
  },

  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.put<{ data: Project }>(`/projects/${projectId}`, data);
    return response.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  },

  async exportProject(projectId: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${projectId}/export`);
    return response;
  },
};
