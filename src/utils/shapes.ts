/**
 * Shape Rendering System for Architecture Components
 * Maps node types to custom SVG shapes (cylinder, hexagon, diamond, etc.)
 */

export type Shape = 
  | 'rectangle' 
  | 'cylinder' 
  | 'hexagon' 
  | 'diamond' 
  | 'circle' 
  | 'parallelogram' 
  | 'cloud' 
  | 'trapezoid';

export const NODE_SHAPES: Record<string, Shape> = {
  // Frontend
  'client': 'rectangle',
  'web-frontend': 'rectangle',
  'mobile-app': 'circle',

  // API
  'api-gateway': 'trapezoid',
  'rest-api': 'rectangle',
  'graphql-server': 'rectangle',
  'grpc-server': 'rectangle',
  'websocket-server': 'rectangle',

  // Compute
  'lambda': 'circle',
  'container': 'rectangle',
  'vm': 'rectangle',

  // Data
  'sql-database': 'cylinder',
  'nosql-database': 'cylinder',
  'graph-database': 'hexagon',
  'search-engine': 'hexagon',
  'data-warehouse': 'cylinder',

  // Cache/CDN
  'cache': 'hexagon',
  'cdn': 'cloud',

  // Messaging
  'message-queue': 'parallelogram',
  'pub-sub': 'parallelogram',
  'event-bus': 'parallelogram',

  // Infrastructure
  'load-balancer': 'hexagon',
  'reverse-proxy': 'diamond',
  'firewall': 'diamond',
  'dns': 'diamond',
  'storage': 'cylinder',

  // Observability
  'monitoring': 'rectangle',
  'logging': 'rectangle',
  'tracing': 'rectangle',
  'alerting': 'rectangle',

  // Services
  'service': 'rectangle',
  'worker': 'rectangle',
  
  // Legacy
  'api-server': 'rectangle',
  'database': 'cylinder',
};

/**
 * SVG Path generators for each shape
 * Paths are normalized to fit in a 100x100 coordinate system
 */
export const shapePaths: Record<Shape, (width: number, height: number) => string> = {
  /**
   * Rectangle - standard box shape
   */
  rectangle: (width, height) => {
    const x = 0;
    const y = 0;
    return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
  },

  /**
   * Cylinder - for databases and storage
   */
  cylinder: (width, height) => {
    const ellipseHeight = height * 0.15; // Top ellipse height
    const bodyTop = ellipseHeight;
    const bodyBottom = height - ellipseHeight;

    return `
      M 0 ${bodyTop}
      L 0 ${bodyBottom}
      Q 0 ${height} ${width / 2} ${height}
      Q ${width} ${height} ${width} ${bodyBottom}
      L ${width} ${bodyTop}
      Q ${width} ${ellipseHeight} ${width / 2} 0
      Q 0 ${ellipseHeight} 0 ${bodyTop}
    `;
  },

  /**
   * Hexagon - for cache and load balancers
   */
  hexagon: (width, height) => {
    const w = width;
    const h = height;
    const wQuarter = w / 4;
    const hQuarter = h / 4;

    return `
      M ${wQuarter} 0
      L ${3 * wQuarter} 0
      L ${w} ${hQuarter}
      L ${w} ${3 * hQuarter}
      L ${3 * wQuarter} ${h}
      L ${wQuarter} ${h}
      L 0 ${3 * hQuarter}
      L 0 ${hQuarter}
      Z
    `;
  },

  /**
   * Diamond - for decision points and routers
   */
  diamond: (width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    return `
      M ${cx} 0
      L ${width} ${cy}
      L ${cx} ${height}
      L 0 ${cy}
      Z
    `;
  },

  /**
   * Circle - for simple services or users
   */
  circle: (width, height) => {
    const radius = Math.min(width, height) / 2;
    const cx = width / 2;
    const cy = height / 2;
    return `
      M ${cx - radius} ${cy}
      A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}
      A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy}
    `;
  },

  /**
   * Parallelogram - for message queues and async services
   */
  parallelogram: (width, height) => {
    const skew = width * 0.15;
    return `
      M ${skew} 0
      L ${width} 0
      L ${width - skew} ${height}
      L 0 ${height}
      Z
    `;
  },

  /**
   * Cloud - for external services and CDN
   */
  cloud: (width, height) => {
    const bumps = `
      M 10 ${height * 0.6}
      Q 5 ${height * 0.3} 15 ${height * 0.2}
      Q 25 ${height * 0.05} 35 ${height * 0.15}
      Q 50 ${height * -0.1} 60 ${height * 0.2}
      Q 75 ${height * 0.1} ${width - 15} ${height * 0.3}
      Q ${width} ${height * 0.5} ${width - 20} ${height * 0.75}
      L 20 ${height * 0.75}
      Q 5 ${height * 0.8} 10 ${height * 0.6}
      Z
    `;
    return bumps;
  },

  /**
   * Trapezoid - for API gateways and entry points
   */
  trapezoid: (width, height) => {
    const topInset = width * 0.2;
    return `
      M ${topInset} 0
      L ${width - topInset} 0
      L ${width} ${height}
      L 0 ${height}
      Z
    `;
  },
};

/**
 * Get the SVG path string for a node type
 */
export function getShapePath(nodeType: string, width: number = 140, height: number = 100): string {
  const shape = NODE_SHAPES[nodeType] || 'rectangle';
  const pathGenerator = shapePaths[shape];
  if (!pathGenerator) {
    return shapePaths.rectangle(width, height);
  }
  return pathGenerator(width, height);
}

/**
 * Get shape for a node type
 */
export function getShape(nodeType: string): Shape {
  return NODE_SHAPES[nodeType] || 'rectangle';
}

/**
 * CSS class for shape styling
 */
export function getShapeClassName(shape: Shape): string {
  return `shape-${shape}`;
}
