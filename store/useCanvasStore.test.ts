import { beforeEach, describe, expect, it } from 'vitest';
import { useCanvasStore } from './useCanvasStore';
import type { Project } from '@/types';

function resetStore() {
  useCanvasStore.setState({
    nodes: [],
    edges: [],
    shapes: [],
    frames: [],
    history: [],
    future: [],
    selectedNodeId: null,
    selectedShapeId: null,
    selectedFrameId: null,
  });
}

beforeEach(() => {
  resetStore();
});

describe('addFrame', () => {
  it('adds a frame with the given title, color, position and size', () => {
    const id = useCanvasStore.getState().addFrame({
      position: { x: 10, y: 20 },
      width: 240,
      height: 160,
      title: 'VPC',
      color: '#6366f1',
    });
    const frame = useCanvasStore.getState().frames.find((f) => f.id === id);
    expect(frame).toBeDefined();
    expect(frame?.data).toEqual({ title: 'VPC', color: '#6366f1', width: 240, height: 160 });
    expect(frame?.position).toEqual({ x: 10, y: 20 });
  });

  it('records a history entry so the addition can be undone', () => {
    useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 100, height: 100, title: 'A', color: '#000' });
    expect(useCanvasStore.getState().history.length).toBe(1);
  });
});

describe('updateFrameData', () => {
  it('patches only the given fields', () => {
    const id = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 100, height: 100, title: 'A', color: '#000' });
    useCanvasStore.getState().updateFrameData(id, { title: 'Renamed' });
    const frame = useCanvasStore.getState().frames.find((f) => f.id === id);
    expect(frame?.data.title).toBe('Renamed');
    expect(frame?.data.color).toBe('#000');
  });
});

describe('reparentNode', () => {
  it('sets parentNode and the given position on a node, without an extent', () => {
    const frameId = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 300, height: 300, title: 'F', color: '#000' });
    useCanvasStore.getState().addNode('database', { x: 500, y: 500 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().reparentNode(nodeId, frameId, { x: 15, y: 15 });

    const node = useCanvasStore.getState().nodes.find((n) => n.id === nodeId);
    expect(node?.parentNode).toBe(frameId);
    // extent is intentionally left unset — `extent: 'parent'` would clamp the
    // node inside the frame and make dragging it back out impossible.
    expect(node?.extent).toBeUndefined();
    expect(node?.position).toEqual({ x: 15, y: 15 });
  });

  it('clears parentNode and extent when parentId is null', () => {
    const frameId = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 300, height: 300, title: 'F', color: '#000' });
    useCanvasStore.getState().addNode('database', { x: 0, y: 0 });
    const nodeId = useCanvasStore.getState().nodes[0].id;
    useCanvasStore.getState().reparentNode(nodeId, frameId, { x: 15, y: 15 });

    useCanvasStore.getState().reparentNode(nodeId, null, { x: 200, y: 200 });

    const node = useCanvasStore.getState().nodes.find((n) => n.id === nodeId);
    expect(node?.parentNode).toBeUndefined();
    expect(node?.extent).toBeUndefined();
    expect(node?.position).toEqual({ x: 200, y: 200 });
  });

  it('reparents a frame (nesting) rather than a node', () => {
    const outerId = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 400, height: 400, title: 'Outer', color: '#000' });
    const innerId = useCanvasStore.getState().addFrame({ position: { x: 500, y: 500 }, width: 100, height: 100, title: 'Inner', color: '#000' });

    useCanvasStore.getState().reparentNode(innerId, outerId, { x: 30, y: 30 });

    const inner = useCanvasStore.getState().frames.find((f) => f.id === innerId);
    expect(inner?.parentNode).toBe(outerId);
    expect(inner?.position).toEqual({ x: 30, y: 30 });
  });
});

describe('deleteFrame', () => {
  it('removes the frame and ungroups its direct children to their absolute position', () => {
    const parentId = useCanvasStore.getState().addFrame({ position: { x: 100, y: 100 }, width: 300, height: 300, title: 'Parent', color: '#000' });
    useCanvasStore.getState().addNode('database', { x: 0, y: 0 });
    const childId = useCanvasStore.getState().nodes[0].id;
    useCanvasStore.getState().reparentNode(childId, parentId, { x: 20, y: 20 });

    useCanvasStore.getState().deleteFrame(parentId);

    const state = useCanvasStore.getState();
    expect(state.frames.find((f) => f.id === parentId)).toBeUndefined();
    const child = state.nodes.find((n) => n.id === childId);
    expect(child?.parentNode).toBeUndefined();
    expect(child?.position).toEqual({ x: 120, y: 120 });
  });

  it('leaves grandchildren attached to their still-existing intermediate parent', () => {
    const outerId = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 400, height: 400, title: 'Outer', color: '#000' });
    const innerId = useCanvasStore.getState().addFrame({ position: { x: 50, y: 50 }, width: 200, height: 200, title: 'Inner', color: '#000' });
    useCanvasStore.getState().reparentNode(innerId, outerId, { x: 50, y: 50 });
    useCanvasStore.getState().addNode('database', { x: 0, y: 0 });
    const childId = useCanvasStore.getState().nodes[0].id;
    useCanvasStore.getState().reparentNode(childId, innerId, { x: 10, y: 10 });

    useCanvasStore.getState().deleteFrame(outerId);

    const state = useCanvasStore.getState();
    expect(state.frames.find((f) => f.id === outerId)).toBeUndefined();
    const inner = state.frames.find((f) => f.id === innerId);
    expect(inner?.parentNode).toBeUndefined();
    expect(inner?.position).toEqual({ x: 50, y: 50 }); // 0,0 (outer) + 50,50
    const child = state.nodes.find((n) => n.id === childId);
    expect(child?.parentNode).toBe(innerId); // untouched — still nested in "Inner"
    expect(child?.position).toEqual({ x: 10, y: 10 });
  });
});

describe('duplicateFrame', () => {
  it('creates a copy offset by 32px with a new id, without duplicating children', () => {
    const frameId = useCanvasStore.getState().addFrame({ position: { x: 10, y: 10 }, width: 200, height: 150, title: 'F', color: '#111' });

    useCanvasStore.getState().duplicateFrame(frameId);

    const state = useCanvasStore.getState();
    expect(state.frames).toHaveLength(2);
    const clone = state.frames.find((f) => f.id !== frameId)!;
    expect(clone.position).toEqual({ x: 42, y: 42 });
    expect(clone.data).toEqual({ title: 'F', color: '#111', width: 200, height: 150 });
    expect(state.selectedFrameId).toBe(clone.id);
  });
});

describe('undo/redo with frames', () => {
  it('undoes and redoes frame creation', () => {
    const id = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 100, height: 100, title: 'A', color: '#000' });
    expect(useCanvasStore.getState().frames).toHaveLength(1);

    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().frames).toHaveLength(0);

    useCanvasStore.getState().redo();
    expect(useCanvasStore.getState().frames.map((f) => f.id)).toEqual([id]);
  });
});

describe('getProject / loadProject', () => {
  it('round-trips frames through getProject and loadProject', () => {
    useCanvasStore.getState().addFrame({ position: { x: 5, y: 5 }, width: 100, height: 100, title: 'A', color: '#000' });
    const project = useCanvasStore.getState().getProject();
    expect(project.frames).toHaveLength(1);

    resetStore();
    useCanvasStore.getState().loadProject(project);
    expect(useCanvasStore.getState().frames).toHaveLength(1);
    expect(useCanvasStore.getState().frames[0].data.title).toBe('A');
  });

  it('defaults frames to an empty array when loading a project saved before this feature existed', () => {
    const legacyProject = {
      id: 'x', name: 'Legacy', nodes: [], edges: [], shapes: [],
      documentContent: '', createdAt: '', updatedAt: '',
    } as unknown as Project;
    useCanvasStore.getState().loadProject(legacyProject);
    expect(useCanvasStore.getState().frames).toEqual([]);
  });
});
