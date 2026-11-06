import type { ReactNode } from 'react';

export type IdentityCardElement = {
  id: string;
  type: 'text' | 'photo' | 'logo' | 'qr' | 'barcode' | 'shape' | 'line';
  fieldKey?: string;
  label?: string;
  value?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  visible: boolean;
  locked?: boolean;
  paletteBindings?: Partial<
    Record<'color' | 'backgroundColor' | 'borderColor', 'themeColor' | 'backgroundColor'>
  >;
  style?: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: number | string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    showLabel?: boolean;
    separator?: string;
    photoShape?: 'square' | 'rounded' | 'circle';
  };
};

export type IdentityCardLayout = {
  orientation: 'Horizontal' | 'Vertical';
  width: number;
  height: number;
  widthMm: number;
  heightMm: number;
  backgroundColor: string;
  themeColor: string;
  presetKey?: string;
  front: { elements: IdentityCardElement[] };
  back?: { elements: IdentityCardElement[] };
};

export type IdentityCardPrintSettings = {
  pageSize: 'A4' | 'Card';
  units: 'mm';
  cardsPerPage: number;
  margin: number;
  gap: number;
  showCutMarks: boolean;
  bleedMm: number;
  safeInsetMm: number;
  duplexFlip: 'long-edge' | 'short-edge';
  backRotation: 0 | 180;
  backOffsetXmm: number;
  backOffsetYmm: number;
  sideMode: 'both' | 'front' | 'back';
};

export type IdentityCardFieldOption = { key: string; label: string };
export type IdentityCardPreviewProps = {
  layout: IdentityCardLayout;
  side?: 'front' | 'back';
  values?: Record<string, string | null | undefined>;
  logoUrl?: string;
  logoHidden?: boolean;
  photoUrl?: string;
  qrCodeEnabled?: boolean;
  barcodeEnabled?: boolean;
};

export type IdentityCardDesignerProps = IdentityCardPreviewProps & {
  brandingContent?: ReactNode;
  onLayoutChange: (layout: IdentityCardLayout) => void;
  printSettings: IdentityCardPrintSettings;
  onPrintSettingsChange: (settings: IdentityCardPrintSettings) => void;
  fields: IdentityCardFieldOption[];
  disabled?: boolean;
  backSideEnabled: boolean;
  onBackSideEnabledChange: (enabled: boolean) => void;
  qrCodeEnabled: boolean;
  onQrCodeEnabledChange: (enabled: boolean) => void;
  onBarcodeEnabledChange?: (enabled: boolean) => void;
};

export type IdentityCardConfigurationProps = IdentityCardDesignerProps & {
  tab: string;
  onTabChange: (tab: string) => void;
  guides: boolean;
  onGuidesChange: (guides: boolean) => void;
  elements: IdentityCardElement[];
  selected?: IdentityCardElement;
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (type: IdentityCardElement['type']) => void;
  onElementChange: (element: IdentityCardElement) => void;
  onDelete: () => void;
};
