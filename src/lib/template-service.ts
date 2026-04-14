/**
 * Template Service
 * Manages architecture templates and patterns
 */

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  category: 'microservices' | 'monolith' | 'serverless' | 'hybrid' | 'other';
  thumbnail?: string;
  nodes: any[];
  edges: any[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  popularity: number;
  isPublic: boolean;
  author?: string;
}

export interface TemplateCategory {
  name: string;
  description: string;
  icon: string;
  count: number;
}

// Built-in templates
const BUILTIN_TEMPLATES: ArchitectureTemplate[] = [
  {
    id: 'tmpl-microservices-001',
    name: 'Microservices with API Gateway',
    description: 'Standard microservices architecture with API Gateway, load balancer, and multiple services',
    category: 'microservices',
    tags: ['microservices', 'api-gateway', 'scalable'],
    nodes: [
      {
        id: 'node-1',
        type: 'web-frontend',
        position: { x: 100, y: 100 },
        metadata: {
          name: 'Web Frontend',
          description: 'React SPA',
          technology: 'React + Next.js',
        },
      },
      {
        id: 'node-2',
        type: 'api-gateway',
        position: { x: 300, y: 100 },
        metadata: {
          name: 'API Gateway',
          description: 'Central API entry point',
          technology: 'Kong',
        },
      },
      {
        id: 'node-3',
        type: 'microservice',
        position: { x: 100, y: 300 },
        metadata: {
          name: 'User Service',
          description: 'User management microservice',
          technology: 'Node.js',
        },
      },
      {
        id: 'node-4',
        type: 'microservice',
        position: { x: 300, y: 300 },
        metadata: {
          name: 'Product Service',
          description: 'Product management microservice',
          technology: 'Python',
        },
      },
      {
        id: 'node-5',
        type: 'microservice',
        position: { x: 500, y: 300 },
        metadata: {
          name: 'Order Service',
          description: 'Order processing microservice',
          technology: 'Java',
        },
      },
      {
        id: 'node-6',
        type: 'message-queue',
        position: { x: 300, y: 500 },
        metadata: {
          name: 'Message Queue',
          description: 'Async communication',
          technology: 'RabbitMQ',
        },
      },
      {
        id: 'node-7',
        type: 'sql-database',
        position: { x: 200, y: 700 },
        metadata: {
          name: 'Primary DB',
          description: 'Main database',
          technology: 'PostgreSQL',
        },
      },
      {
        id: 'node-8',
        type: 'nosql-database',
        position: { x: 400, y: 700 },
        metadata: {
          name: 'Cache',
          description: 'Distributed cache',
          technology: 'Redis',
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'rest-api', label: 'REST' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'rest-api', label: 'REST' },
      { id: 'edge-3', source: 'node-2', target: 'node-4', type: 'rest-api', label: 'REST' },
      { id: 'edge-4', source: 'node-2', target: 'node-5', type: 'rest-api', label: 'REST' },
      { id: 'edge-5', source: 'node-3', target: 'node-6', type: 'message-queue', label: 'Async' },
      { id: 'edge-6', source: 'node-4', target: 'node-6', type: 'message-queue', label: 'Async' },
      { id: 'edge-7', source: 'node-3', target: 'node-7', type: 'database', label: 'SQL' },
      { id: 'edge-8', source: 'node-2', target: 'node-8', type: 'cache', label: 'Cache' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    popularity: 95,
    isPublic: true,
  },
  {
    id: 'tmpl-serverless-001',
    name: 'Serverless REST API',
    description: 'AWS Lambda-based serverless architecture with API Gateway and DynamoDB',
    category: 'serverless',
    tags: ['serverless', 'aws', 'lambda', 'api-gateway'],
    nodes: [
      {
        id: 'node-1',
        type: 'web-frontend',
        position: { x: 100, y: 100 },
        metadata: {
          name: 'Client Application',
          description: 'Frontend consumer',
          technology: 'React',
        },
      },
      {
        id: 'node-2',
        type: 'api-gateway',
        position: { x: 300, y: 100 },
        metadata: {
          name: 'API Gateway',
          description: 'REST endpoint',
          technology: 'AWS API Gateway',
        },
      },
      {
        id: 'node-3',
        type: 'lambda',
        position: { x: 100, y: 300 },
        metadata: {
          name: 'Create Function',
          description: 'POST handler',
          technology: 'AWS Lambda (Node.js)',
        },
      },
      {
        id: 'node-4',
        type: 'lambda',
        position: { x: 300, y: 300 },
        metadata: {
          name: 'Read Function',
          description: 'GET handler',
          technology: 'AWS Lambda (Node.js)',
        },
      },
      {
        id: 'node-5',
        type: 'lambda',
        position: { x: 500, y: 300 },
        metadata: {
          name: 'Update Function',
          description: 'PUT handler',
          technology: 'AWS Lambda (Node.js)',
        },
      },
      {
        id: 'node-6',
        type: 'nosql-database',
        position: { x: 300, y: 500 },
        metadata: {
          name: 'DynamoDB',
          description: 'NoSQL database',
          technology: 'AWS DynamoDB',
        },
      },
      {
        id: 'node-7',
        type: 's3',
        position: { x: 500, y: 500 },
        metadata: {
          name: 'S3 Bucket',
          description: 'File storage',
          technology: 'AWS S3',
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'rest-api', label: 'HTTPS' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'rest-api', label: 'POST' },
      { id: 'edge-3', source: 'node-2', target: 'node-4', type: 'rest-api', label: 'GET' },
      { id: 'edge-4', source: 'node-2', target: 'node-5', type: 'rest-api', label: 'PUT' },
      { id: 'edge-5', source: 'node-3', target: 'node-6', type: 'database', label: 'Write' },
      { id: 'edge-6', source: 'node-4', target: 'node-6', type: 'database', label: 'Read' },
      { id: 'edge-7', source: 'node-5', target: 'node-6', type: 'database', label: 'Write' },
      { id: 'edge-8', source: 'node-3', target: 'node-7', type: 'storage', label: 'Upload' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    popularity: 88,
    isPublic: true,
  },
  {
    id: 'tmpl-monolith-001',
    name: 'Traditional Monolith',
    description: 'Classic monolithic application with web server, application server, and relational database',
    category: 'monolith',
    tags: ['monolith', 'traditional', 'stable'],
    nodes: [
      {
        id: 'node-1',
        type: 'web-frontend',
        position: { x: 100, y: 100 },
        metadata: {
          name: 'Web Browser',
          description: 'Client',
          technology: 'HTML/CSS/JavaScript',
        },
      },
      {
        id: 'node-2',
        type: 'load-balancer',
        position: { x: 300, y: 100 },
        metadata: {
          name: 'Load Balancer',
          description: 'HTTP load balancing',
          technology: 'Nginx',
        },
      },
      {
        id: 'node-3',
        type: 'backend-service',
        position: { x: 100, y: 300 },
        metadata: {
          name: 'Application Server 1',
          description: 'Monolithic app',
          technology: 'Spring Boot',
        },
      },
      {
        id: 'node-4',
        type: 'backend-service',
        position: { x: 300, y: 300 },
        metadata: {
          name: 'Application Server 2',
          description: 'Monolithic app',
          technology: 'Spring Boot',
        },
      },
      {
        id: 'node-5',
        type: 'sql-database',
        position: { x: 200, y: 500 },
        metadata: {
          name: 'Primary Database',
          description: 'Main database',
          technology: 'Oracle',
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'rest-api', label: 'HTTP' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'rest-api', label: 'HTTP' },
      { id: 'edge-3', source: 'node-2', target: 'node-4', type: 'rest-api', label: 'HTTP' },
      { id: 'edge-4', source: 'node-3', target: 'node-5', type: 'database', label: 'JDBC' },
      { id: 'edge-5', source: 'node-4', target: 'node-5', type: 'database', label: 'JDBC' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    popularity: 72,
    isPublic: true,
  },
];

// Template service class
class TemplateService {
  private templates: ArchitectureTemplate[] = [];
  private userTemplates: Map<string, ArchitectureTemplate[]> = new Map();

  constructor() {
    this.templates = BUILTIN_TEMPLATES;
  }

  /**
   * Get all available templates (built-in + user templates)
   */
  getAllTemplates(userId?: string): ArchitectureTemplate[] {
    const allTemplates = [...this.templates];
    if (userId && this.userTemplates.has(userId)) {
      allTemplates.push(...this.userTemplates.get(userId)!);
    }
    return allTemplates.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Get built-in templates only
   */
  getBuiltInTemplates(): ArchitectureTemplate[] {
    return [...this.templates];
  }

  /**
   * Get templates by category
   */
  getByCategory(category: ArchitectureTemplate['category']): ArchitectureTemplate[] {
    return this.templates.filter((t) => t.category === category);
  }

  /**
   * Get template categories with counts
   */
  getCategories(): TemplateCategory[] {
    const categories = new Map<string, number>();
    const icons: Record<string, string> = {
      microservices: '🐝',
      monolith: '🏢',
      serverless: '⚡',
      hybrid: '🔀',
      other: '🎨',
    };
    const descriptions: Record<string, string> = {
      microservices: 'Scalable service-oriented architectures',
      monolith: 'Traditional monolithic applications',
      serverless: 'Serverless and event-driven systems',
      hybrid: 'Mixed architecture patterns',
      other: 'Other architectural patterns',
    };

    this.templates.forEach((t) => {
      categories.set(t.category, (categories.get(t.category) || 0) + 1);
    });

    return Array.from(categories.entries()).map(([name, count]) => ({
      name: name as any,
      description: descriptions[name] || 'Architecture pattern',
      icon: icons[name] || '📐',
      count,
    }));
  }

  /**
   * Search templates by query
   */
  search(query: string): ArchitectureTemplate[] {
    const q = query.toLowerCase();
    return this.templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  /**
   * Save a new user template
   */
  saveUserTemplate(
    userId: string,
    template: Omit<ArchitectureTemplate, 'id' | 'createdAt' | 'updatedAt' | 'popularity'>
  ): ArchitectureTemplate {
    const newTemplate: ArchitectureTemplate = {
      ...template,
      id: `tmpl-user-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      popularity: 0,
    };

    if (!this.userTemplates.has(userId)) {
      this.userTemplates.set(userId, []);
    }
    this.userTemplates.get(userId)!.push(newTemplate);
    return newTemplate;
  }

  /**
   * Get user templates
   */
  getUserTemplates(userId: string): ArchitectureTemplate[] {
    return this.userTemplates.get(userId) || [];
  }

  /**
   * Delete user template
   */
  deleteUserTemplate(userId: string, templateId: string): boolean {
    const templates = this.userTemplates.get(userId);
    if (!templates) return false;
    const index = templates.findIndex((t) => t.id === templateId);
    if (index === -1) return false;
    templates.splice(index, 1);
    return true;
  }

  /**
   * Increment template popularity
   */
  incrementPopularity(templateId: string): void {
    const template = this.templates.find((t) => t.id === templateId);
    if (template) {
      template.popularity++;
      template.updatedAt = new Date();
    }
  }
}

// Export singleton instance
export const templateService = new TemplateService();
