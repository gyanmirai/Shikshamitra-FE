import type { StudioOrder } from './layer-commands';
import type { StudioAlign } from './geometry-commands';

export const alignments: { label: string; mode: StudioAlign }[] = [
  { label: 'Align left', mode: 'left' },
  { label: 'Align center', mode: 'center' },
  { label: 'Align right', mode: 'right' },
  { label: 'Align top', mode: 'top' },
  { label: 'Align middle', mode: 'middle' },
  { label: 'Align bottom', mode: 'bottom' },
];

export const orders: { label: string; mode: StudioOrder }[] = [
  { label: 'Bring to front', mode: 'front' },
  { label: 'Bring forward', mode: 'forward' },
  { label: 'Send backward', mode: 'backward' },
  { label: 'Send to back', mode: 'back' },
];
