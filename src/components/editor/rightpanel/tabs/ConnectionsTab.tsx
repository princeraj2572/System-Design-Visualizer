/**
 * ConnectionsTab - Manage incoming/outgoing edges
 */

'use client';
import { Node, Edge } from '@xyflow/react';
import { NodeDataExtended, EdgeDataExtended, EdgeProtocol } from '@/types/architecture';
import { getSuggestionsForNode } from '@/lib/connectionSuggestions';
import { Plus } from 'lucide-react';

const PROTOCOLS: EdgeProtocol[] = [
  'REST',
  'gRPC',
  'GraphQL',
  'WebSocket',
  'AMQP',
  'Kafka',
  'SQL',
  'TCP',
];

interface ConnectionsTabProps {
  node: Node<NodeDataExtended>;
  nodes: Node<NodeDataExtended>[];
  edges: Edge<EdgeDataExtended>[];
  onUpdateEdge?: (edgeId: string, patch: Partial<EdgeDataExtended>) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onAddNode?: (componentId: string, position: { x: number; y: number }) => void;
}

export function ConnectionsTab({
  node,
  nodes,
  edges,
  onUpdateEdge,
  onDeleteEdge,
  onAddNode,
}: ConnectionsTabProps) {
  const nodeData = node.data?.data ?? node.data;
  const incoming = edges.filter(e => e.target === node.id);
  const outgoing = edges.filter(e => e.source === node.id);
  const suggestions = getSuggestionsForNode(node as any, nodes as any, edges as any);

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Header */}
      <div className="text-xs font-medium text-gray-500">
        {nodeData?.icon} {nodeData?.label}
      </div>

      {/* Incoming */}
      <div>
        <p className="text-[9px] uppercase tracking-wide text-gray-400 font-medium mb-1">
          Incoming ({incoming.length})
        </p>
        {incoming.length === 0 && <p className="text-[9px] text-gray-300 italic">None</p>}
        {incoming.map(edge => {
          const source = getNodeById(edge.source);
          return (
            <EdgeCard
              key={edge.id}
              from={`${source?.data?.icon ?? ''} ${source?.data?.label ?? edge.source}`.trim()}
              to={`${nodeData?.icon} ${nodeData?.label}`.trim()}
              edgeData={edge.data?.data ?? edge.data}
              onProtocolChange={proto => {
                if (onUpdateEdge) onUpdateEdge(edge.id, { ...edge.data, protocol: proto } as any);
              }}
              onDelete={() => onDeleteEdge?.(edge.id)}
            />
          );
        })}
      </div>

      {/* Outgoing */}
      <div>
        <p className="text-[9px] uppercase tracking-wide text-gray-400 font-medium mb-1">
          Outgoing ({outgoing.length})
        </p>
        {outgoing.length === 0 && <p className="text-[9px] text-gray-300 italic">None</p>}
        {outgoing.map(edge => {
          const target = getNodeById(edge.target);
          return (
            <EdgeCard
              key={edge.id}
              from={`${nodeData?.icon} ${nodeData?.label}`.trim()}
              to={`${target?.data?.icon ?? ''} ${target?.data?.label ?? edge.target}`.trim()}
              edgeData={edge.data?.data ?? edge.data}
              onProtocolChange={proto => {
                if (onUpdateEdge) onUpdateEdge(edge.id, { ...edge.data, protocol: proto } as any);
              }}
              onDelete={() => onDeleteEdge?.(edge.id)}
            />
          );
        })}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-wide text-gray-400 font-medium mb-1">
            Suggestions
          </p>
          {suggestions.map(s => (
            <div
              key={s.componentId}
              className="flex items-center gap-2 px-2 py-1.5 rounded border border-gray-100 dark:border-zinc-800 mb-1 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-600"
              onClick={() => {
                onAddNode?.(s.componentId, {
                  x: node.position.x + 200,
                  y: node.position.y,
                });
              }}
            >
              <span className="text-sm">{s.icon}</span>
              <span className="flex-1 text-[10px] text-gray-600 dark:text-gray-300">{s.label}</span>
              <span className="text-[9px] text-blue-400 flex items-center gap-0.5">
                <Plus size={8} /> Add
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EdgeCard({
  from,
  to,
  edgeData,
  onProtocolChange,
  onDelete,
}: {
  from: string;
  to: string;
  edgeData: any;
  onProtocolChange: (p: EdgeProtocol) => void;
  onDelete: () => void;
}) {
  return (
    <div className="border border-gray-100 dark:border-zinc-800 rounded-md p-2 mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-medium truncate max-w-[160px]">
          {from} → {to}
        </span>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-400 text-xs ml-1">
          ✕
        </button>
      </div>
      <select
        className="prop-input text-[9px] py-1 w-full"
        value={edgeData?.protocol ?? 'REST'}
        onChange={e => onProtocolChange(e.target.value as EdgeProtocol)}
      >
        {PROTOCOLS.map(p => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
