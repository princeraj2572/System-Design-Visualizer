/**
 * Design system constants and configuration
 */

export const COLORS = {
  // Slate - neutral colors
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  // Cyan - primary brand
  cyan: {
    50: '#ecf9ff',
    100: '#cff1ff',
    200: '#a5e8ff',
    300: '#67daff',
    400: '#1dccff',
    500: '#00b8e6',
    600: '#0095c9',
    700: '#0074a3',
    800: '#0a5a87',
    900: '#0e4a6f',
  },
  // Amber - accent/warning
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Semantic colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const BORDER_RADIUS = {
  none: '0px',
  xs: '0.25rem',
  sm: '0.375rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
};

export const SHADOWS = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

export const TRANSITIONS = {
  fast: '75ms',
  base: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
};

// Node type configuration
export const NODE_TYPES = {
  'api-server': {
    label: 'API Server',
    icon: '🔧',
    color: '#3b82f6',
    description: 'REST/GraphQL API endpoint',
  },
  'database': {
    label: 'Database',
    icon: '🗄️',
    color: '#8b5cf6',
    description: 'Data persistence layer',
  },
  'cache': {
    label: 'Cache',
    icon: '⚡',
    color: '#06b6d4',
    description: 'In-memory cache (Redis, Memcached)',
  },
  'load-balancer': {
    label: 'Load Balancer',
    icon: '⚖️',
    color: '#ec4899',
    description: 'Distribute traffic',
  },
  'message-queue': {
    label: 'Message Queue',
    icon: '📨',
    color: '#f59e0b',
    description: 'Async message processing',
  },
  'worker': {
    label: 'Worker',
    icon: '👷',
    color: '#10b981',
    description: 'Background job processor',
  },
  'storage': {
    label: 'Storage',
    icon: '💾',
    color: '#6366f1',
    description: 'Object/File storage',
  },
  'service': {
    label: 'Microservice',
    icon: '🔌',
    color: '#14b8a6',
    description: 'Business logic service',
  },
};

export const EDGE_TYPES = {
  http: { label: 'HTTP/REST', color: '#3b82f6' },
  grpc: { label: 'gRPC', color: '#06b6d4' },
  'message-queue': { label: 'Message Queue', color: '#f59e0b' },
  database: { label: 'Database Query', color: '#8b5cf6' },
  event: { label: 'Event Stream', color: '#ef4444' },
};
