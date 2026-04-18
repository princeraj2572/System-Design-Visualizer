/**
 * PropertiesTab - Edit node identity and capacity
 */

'use client';
import { Node } from '@xyflow/react';
import { NodeDataExtended, NodeColorKey } from '@/types/architecture';

const COLORS: Array<{ value: NodeColorKey; hex: string }> = [
  { value: 'blue', hex: '#3B82F6' },
  { value: 'green', hex: '#22C55E' },
  { value: 'amber', hex: '#F59E0B' },
  { value: 'purple', hex: '#8B5CF6' },
  { value: 'coral', hex: '#F97316' },
  { value: 'teal', hex: '#14B8A6' },
  { value: 'gray', hex: '#9CA3AF' },
];

interface PropertiesTabProps {
  node: Node<NodeDataExtended>;
  onUpdate?: (nodeId: string, patch: Partial<NodeDataExtended>) => void;
}

export function PropertiesTab({ node, onUpdate }: PropertiesTabProps) {
  const d = node.data?.data ?? node.data;
  const upd = (patch: Partial<NodeDataExtended>) => {
    if (onUpdate) onUpdate(node.id, patch);
  };

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 rounded-lg p-2 border border-gray-100 dark:border-zinc-800">
        <span className="text-xl">{d?.icon ?? '◯'}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{d?.label ?? 'Node'}</p>
          <p className="text-[9px] text-gray-400">{d?.category} · {d?.sublabel}</p>
        </div>
      </div>

      {/* Identity Section */}
      <Section title="Identity">
        <Field label="Label">
          <input
            className="prop-input"
            value={d?.label ?? ''}
            onChange={e => upd({ ...d, label: e.target.value } as any)}
          />
        </Field>
        <Field label="Technology">
          <input
            className="prop-input"
            value={d?.sublabel ?? ''}
            onChange={e => upd({ ...d, sublabel: e.target.value } as any)}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="prop-input resize-none"
            rows={2}
            value={d?.description ?? ''}
            onChange={e => upd({ ...d, description: e.target.value } as any)}
          />
        </Field>
      </Section>

      {/* Capacity Section */}
      <Section title="Capacity">
        <Field label="Target RPS">
          <input
            className="prop-input"
            value={d?.targetRps ?? ''}
            placeholder="e.g. 10k rps"
            onChange={e => upd({ ...d, targetRps: e.target.value } as any)}
          />
        </Field>
        <Field label="SLA">
          <input
            className="prop-input"
            value={d?.sla ?? ''}
            placeholder="e.g. 99.9%"
            onChange={e => upd({ ...d, sla: e.target.value } as any)}
          />
        </Field>
        <Field label="Replicas">
          <input
            className="prop-input"
            type="number"
            min={1}
            value={d?.replicas ?? 1}
            onChange={e => upd({ ...d, replicas: parseInt(e.target.value) } as any)}
          />
        </Field>
        <Field label="Region">
          <input
            className="prop-input"
            value={d?.region ?? ''}
            placeholder="e.g. us-east-1"
            onChange={e => upd({ ...d, region: e.target.value } as any)}
          />
        </Field>
      </Section>

      {/* Color Picker */}
      <Section title="Color">
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => upd({ ...d, color: c.value } as any)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                d?.color === c.value ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-transparent'
              }`}
              style={{ background: c.hex }}
              title={c.value}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400 mb-2">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] text-gray-400 mb-1">{label}</p>
      {children}
    </div>
  );
}
