/**
 * Export Utilities - Shared helper functions for all exporters
 */

/**
 * Download file to user's computer
 * @param content File content as string
 * @param filename Name for downloaded file
 * @param mimeType MIME type (e.g., 'text/plain', 'application/json')
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download file:', error);
    throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Whether copy was successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate appropriate filename based on format
 * @param format Export format (yaml, plantuml, terraform, cloudformation, mermaid, c4)
 * @param projectName Project name or default
 * @returns Formatted filename with extension
 */
export function generateFilename(format: string, projectName: string = 'architecture'): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitized = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

  const extensions: Record<string, string> = {
    yaml: 'yaml',
    plantuml: 'puml',
    terraform: 'tf',
    cloudformation: 'yaml',
    mermaid: 'mmd',
    c4: 'c4',
  };

  const ext = extensions[format.toLowerCase()] || 'txt';
  return `${sanitized}-${timestamp}.${ext}`;
}

/**
 * Escape string for YAML format
 * @param text Text to escape
 * @returns YAML-safe string
 */
export function escapeYaml(text: string): string {
  if (!text) return '""';
  if (text.includes('"') || text.includes('\n') || text.includes(':')) {
    return `"${text.replace(/"/g, '\\"')}"`;
  }
  return text;
}

/**
 * Escape string for PlantUML format
 * @param text Text to escape
 * @returns PlantUML-safe string
 */
export function escapePlantUML(text: string): string {
  return text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * Escape string for Terraform/HCL format
 * @param text Text to escape
 * @returns HCL-safe string
 */
export function escapeTerraform(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\$/g, '$$');
}

/**
 * Escape string for Mermaid format
 * @param text Text to escape
 * @returns Mermaid-safe string
 */
export function escapeMermaid(text: string): string {
  return text.replace(/["\n]/g, ' ').substring(0, 50);
}

/**
 * Convert node type to friendly label
 * @param nodeType Node type identifier
 * @returns Human-readable label
 */
export function getNodeLabel(nodeType: string): string {
  return nodeType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate unique resource name for Terraform/CF
 * @param name Original name
 * @param index Optional index for uniqueness
 * @returns Terraform-safe resource name
 */
export function generateResourceName(name: string, index?: number): string {
  let sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  sanitized = sanitized.replace(/^_|_$/g, '');
  if (index !== undefined) {
    sanitized = `${sanitized}_${index}`;
  }
  return sanitized || `resource_${Date.now()}`;
}

/**
 * Get connection type label
 * @param connectionType Connection type (http, grpc, message-queue, database, event)
 * @returns Human-readable connection type
 */
export function getConnectionTypeLabel(connectionType: string): string {
  const labels: Record<string, string> = {
    http: 'HTTP/REST',
    grpc: 'gRPC',
    'message-queue': 'Message Queue',
    database: 'Database Query',
    event: 'Event Stream',
  };
  return labels[connectionType] || connectionType;
}

/**
 * Format date for comments in IaC
 * @returns Formatted date string
 */
export function getFormattedDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Indent text by specified number of spaces
 * @param text Text to indent
 * @param spaces Number of spaces (default 2)
 * @returns Indented text
 */
export function indent(text: string, spaces: number = 2): string {
  const prefix = ' '.repeat(Math.max(0, spaces));
  return text
    .split('\n')
    .map((line) => (line.trim() ? prefix + line : line))
    .join('\n');
}

/**
 * Create a comment header for export files
 * @param format Export format name
 * @param projectName Name of project
 * @returns Comment header as string
 */
export function createCommentHeader(format: string, projectName: string): string {
  const dateStr = getFormattedDate();

  const headers: Record<string, (name: string, date: string) => string> = {
    yaml: (name, date) => `# Architecture: ${name}\n# Generated: ${date}\n# Format: YAML\n`,
    plantuml: (name, date) => `' Architecture: ${name}\n' Generated: ${date}\n' Format: PlantUML\n`,
    terraform: (name, date) => `# Architecture: ${name}\n# Generated: ${date}\n# Format: Terraform HCL\n`,
    cloudformation: (name, date) => `# Architecture: ${name}\n# Generated: ${date}\n# Format: CloudFormation\n`,
    mermaid: (name, date) => `%% Architecture: ${name}\n%% Generated: ${date}\n%% Format: Mermaid\n`,
    c4: (name, date) => `' Architecture: ${name}\n' Generated: ${date}\n' Format: C4\n`,
  };

  const headerFn = headers[format.toLowerCase()];
  return headerFn ? headerFn(projectName, dateStr) : `# ${format} Export\n`;
}
