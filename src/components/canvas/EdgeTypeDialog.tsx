'use client';

import Button from '@/components/ui/Button';

interface EdgeTypeDialogProps {
  isOpen: boolean;
  onSelect: (type: 'http' | 'grpc' | 'message-queue' | 'database' | 'event') => void;
  onCancel: () => void;
}

export const EdgeTypeDialog = ({
  isOpen,
  onSelect,
  onCancel,
}: EdgeTypeDialogProps) => {
  if (!isOpen) return null;

  const edgeTypes: Array<{
    value: 'http' | 'grpc' | 'message-queue' | 'database' | 'event';
    label: string;
    description: string;
  }> = [
    {
      value: 'http',
      label: 'HTTP/REST',
      description: 'Synchronous REST API calls',
    },
    {
      value: 'grpc',
      label: 'gRPC',
      description: 'High-performance RPC protocol',
    },
    {
      value: 'message-queue',
      label: 'Message Queue',
      description: 'Asynchronous message processing',
    },
    {
      value: 'database',
      label: 'Database Query',
      description: 'Direct database access',
    },
    {
      value: 'event',
      label: 'Event Stream',
      description: 'Event-driven communication',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Select Connection Type
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Choose how these components communicate:
        </p>

        <div className="space-y-3 mb-6">
          {edgeTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onSelect(type.value)}
              className="w-full text-left p-3 border border-slate-300 rounded-lg hover:bg-cyan-50 hover:border-cyan-400 transition-colors"
            >
              <div className="font-semibold text-slate-900">{type.label}</div>
              <div className="text-sm text-slate-600">{type.description}</div>
            </button>
          ))}
        </div>

        <Button onClick={onCancel} variant="ghost" className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EdgeTypeDialog;
