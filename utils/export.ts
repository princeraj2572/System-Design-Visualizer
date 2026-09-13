import type { Project } from '@/types';

export function exportToJSON(project: Project): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(project.name)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToPNG(elementId: string, filename: string): Promise<void> {
  const { toPng } = await import('html-to-image');
  const el = document.getElementById(elementId);
  if (!el) {
    console.error('Canvas element not found for PNG export');
    return;
  }
  try {
    const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${slugify(filename)}.png`;
    a.click();
  } catch (err) {
    console.error('PNG export failed:', err);
  }
}

export function importFromJSON(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string) as Project;
        if (!project.nodes || !project.edges) {
          reject(new Error('File does not look like a valid project'));
          return;
        }
        resolve(project);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function saveProjectToLocalStorage(project: Project): void {
  const saved: Project[] = JSON.parse(
    localStorage.getItem('sysvis-projects') ?? '[]'
  );
  const idx = saved.findIndex((p) => p.name === project.name);
  const updated = { ...project, updatedAt: new Date().toISOString() };
  if (idx >= 0) saved[idx] = updated;
  else saved.push(updated);
  localStorage.setItem('sysvis-projects', JSON.stringify(saved));
}

export function loadProjectsFromLocalStorage(): Project[] {
  return JSON.parse(localStorage.getItem('sysvis-projects') ?? '[]');
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
