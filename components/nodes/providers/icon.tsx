import type { NodeIconComponent } from '@/types';

/**
 * Wraps a vendored provider SVG asset so it satisfies the same prop
 * signature as a lucide-react icon (size/className/style), letting
 * provider-specific NODE_CONFIG entries drop into the same rendering
 * code (CustomNode, PropertiesPanel, NodePalette) as generic icons.
 */
export function imgIcon(src: string): NodeIconComponent {
  return function ProviderIcon({ size = 20, className, style }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} width={size} height={size} className={className} style={style} alt="" />
    );
  };
}
