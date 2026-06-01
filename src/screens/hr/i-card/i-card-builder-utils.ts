export const clampCardsPerPage = (value: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.min(10, Math.max(1, Math.trunc(value)));
};

export const isPdfBlob = async (blob: Blob) => {
  if (!blob.size) return false;
  if (blob.type && !blob.type.toLowerCase().includes('pdf')) return false;

  return (await blob.slice(0, 4).text()) === '%PDF';
};

export type ICardLayoutElementType =
  | 'text'
  | 'photo'
  | 'logo'
  | 'qr'
  | 'barcode'
  | 'shape'
  | 'line';

export type ICardFieldBinding =
  | 'name'
  | 'employeeCode'
  | 'designation'
  | 'department'
  | 'organization'
  | 'contactNo'
  | 'bloodGroup'
  | 'photo'
  | 'validityYear'
  | 'address'
  | 'schoolName'
  | 'schoolAddress'
  | 'static';

export type ICardLayoutElement = {
  id: string;
  type: ICardLayoutElementType;
  fieldKey?: ICardFieldBinding;
  label?: string;
  value?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  visible: boolean;
  locked?: boolean;
  style?: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: number | string;
    textAlign?: 'left' | 'center' | 'right';
    showLabel?: boolean;
    separator?: string;
    photoShape?: 'square' | 'rounded' | 'circle';
  };
};

export type ICardLayout = {
  orientation: 'Horizontal' | 'Vertical';
  width: number;
  height: number;
  backgroundColor: string;
  themeColor: string;
  front: { elements: ICardLayoutElement[] };
  back?: { elements: ICardLayoutElement[] };
};

export type ICardPrintSettings = {
  pageSize: 'A4';
  cardsPerPage: number;
  margin: number;
  gap: number;
  showCutMarks: boolean;
};

type ICardLayoutPresetOptions = {
  orientation?: 'Horizontal' | 'Vertical';
  width?: number;
  height?: number;
  themeColor?: string;
  backgroundColor?: string;
  qrCodeEnabled?: boolean;
  barcodeEnabled?: boolean;
};

export const DEFAULT_PRINT_SETTINGS: ICardPrintSettings = {
  pageSize: 'A4',
  cardsPerPage: 8,
  margin: 18,
  gap: 10,
  showCutMarks: true,
};

export const snapToGrid = (value: number, grid = 4) => Math.round(value / grid) * grid;

export const clampLayoutDimension = (value: number, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(2000, Math.max(100, Math.trunc(value)));
};

export const clampElementDimension = (value: number, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(2000, Math.max(1, Math.trunc(value)));
};

export const parseLayoutJson = (value?: string | null): ICardLayout | null => {
  if (!value?.trim()) return null;
  try {
    const parsed = JSON.parse(value) as ICardLayout;
    if (!parsed?.front || !Array.isArray(parsed.front.elements)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const parsePrintSettingsJson = (value?: string | null): ICardPrintSettings => {
  if (!value?.trim()) return DEFAULT_PRINT_SETTINGS;
  try {
    const parsed = JSON.parse(value) as Partial<ICardPrintSettings>;
    return {
      pageSize: 'A4',
      cardsPerPage: clampCardsPerPage(parsed.cardsPerPage ?? DEFAULT_PRINT_SETTINGS.cardsPerPage),
      margin: Math.min(60, Math.max(0, Math.trunc(parsed.margin ?? DEFAULT_PRINT_SETTINGS.margin))),
      gap: Math.min(40, Math.max(0, Math.trunc(parsed.gap ?? DEFAULT_PRINT_SETTINGS.gap))),
      showCutMarks: parsed.showCutMarks ?? DEFAULT_PRINT_SETTINGS.showCutMarks,
    };
  } catch {
    return DEFAULT_PRINT_SETTINGS;
  }
};

const element = (
  id: string,
  type: ICardLayoutElementType,
  fieldKey: ICardFieldBinding | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  z: number,
  style: ICardLayoutElement['style'] = {},
  label?: string,
  value?: string
): ICardLayoutElement => ({
  id,
  type,
  fieldKey,
  x,
  y,
  w,
  h,
  z,
  visible: true,
  style,
  label,
  value,
});

export const createICardLayoutPreset = (
  presetKey: string,
  options: ICardLayoutPresetOptions = {}
): ICardLayout => {
  const orientation =
    options.orientation ?? (presetKey === 'vertical-badge' ? 'Vertical' : 'Horizontal');
  const width = options.width ?? (orientation === 'Vertical' ? 280 : 420);
  const height = options.height ?? (orientation === 'Vertical' ? 420 : 260);
  const themeColor = options.themeColor ?? '#1D4ED8';
  const backgroundColor = options.backgroundColor ?? '#F8FAFC';
  const qrCodeEnabled = options.qrCodeEnabled ?? true;
  const barcodeEnabled = options.barcodeEnabled ?? true;
  const base = { orientation, width, height, backgroundColor, themeColor };

  if (presetKey === 'vertical-badge') {
    return {
      ...base,
      front: {
        elements: [
          element('header', 'shape', undefined, 0, 0, width, 86, 0, {
            backgroundColor: themeColor,
          }),
          element('logo', 'logo', undefined, 18, 16, 48, 48, 2),
          element('school', 'text', 'schoolName', 74, 16, width - 92, 26, 3, {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 700,
          }),
          element('address', 'text', 'schoolAddress', 74, 44, width - 92, 28, 3, {
            color: '#DBEAFE',
            fontSize: 9,
          }),
          element('photo', 'photo', 'photo' as ICardFieldBinding, 85, 104, 110, 124, 4, {
            borderColor: themeColor,
            borderWidth: 2,
            photoShape: 'rounded',
          }),
          element('name', 'text', 'name', 28, 240, width - 56, 28, 5, {
            fontSize: 18,
            fontWeight: 800,
            textAlign: 'center',
          }),
          element('designation', 'text', 'designation', 28, 270, width - 56, 20, 5, {
            color: '#475569',
            fontSize: 11,
            textAlign: 'center',
          }),
          element(
            'code',
            'text',
            'employeeCode',
            40,
            310,
            width - 80,
            20,
            5,
            { showLabel: true, separator: ': ', fontSize: 10, textAlign: 'center' },
            'Code'
          ),
          {
            ...element('qr', 'qr', undefined, width - 76, height - 76, 54, 54, 6),
            visible: qrCodeEnabled,
          },
          element(
            'valid',
            'text',
            'validityYear',
            24,
            height - 52,
            150,
            20,
            5,
            { showLabel: true, fontSize: 9 },
            'Valid'
          ),
        ],
      },
    };
  }

  const photoFirst = presetKey === 'photo-first';
  const minimal = presetKey === 'minimal';
  return {
    ...base,
    front: {
      elements: [
        element('accent', 'shape', undefined, 0, 0, photoFirst ? 134 : width, height, 0, {
          backgroundColor: photoFirst ? `${themeColor}` : backgroundColor,
          borderColor: '#CBD5E1',
          borderWidth: 1,
        }),
        element('topline', 'line', undefined, 16, 66, width - 32, 2, 1, {
          backgroundColor: themeColor,
        }),
        element('logo', 'logo', undefined, 18, 16, 44, 44, 2),
        element('school', 'text', 'schoolName', 72, 14, width - 92, 24, 3, {
          color: themeColor,
          fontSize: 15,
          fontWeight: 800,
        }),
        element('address', 'text', 'schoolAddress', 72, 38, width - 92, 22, 3, {
          color: '#64748B',
          fontSize: 8,
        }),
        element(
          'photo',
          'photo',
          'photo' as ICardFieldBinding,
          photoFirst ? 22 : 22,
          86,
          photoFirst ? 90 : 78,
          photoFirst ? 106 : 92,
          4,
          {
            borderColor: themeColor,
            borderWidth: minimal ? 0 : 1,
            photoShape: presetKey === 'modern-staff' ? 'circle' : 'rounded',
          }
        ),
        element('name', 'text', 'name', photoFirst ? 148 : 116, 88, photoFirst ? 180 : 200, 28, 5, {
          fontSize: 18,
          fontWeight: 800,
        }),
        element('designation', 'text', 'designation', photoFirst ? 148 : 116, 118, 180, 20, 5, {
          color: '#475569',
          fontSize: 11,
        }),
        element(
          'code',
          'text',
          'employeeCode',
          photoFirst ? 148 : 116,
          146,
          150,
          20,
          5,
          { showLabel: true, separator: ': ', fontSize: 10 },
          'Code'
        ),
        element(
          'department',
          'text',
          'department',
          photoFirst ? 148 : 116,
          170,
          150,
          18,
          5,
          { showLabel: true, separator: ': ', fontSize: 9 },
          'Dept'
        ),
        element(
          'phone',
          'text',
          'contactNo',
          photoFirst ? 148 : 116,
          194,
          150,
          18,
          5,
          { showLabel: true, separator: ': ', fontSize: 9 },
          'Phone'
        ),
        {
          ...element('qr', 'qr', undefined, width - 76, height - 74, 54, 54, 6),
          visible: qrCodeEnabled,
        },
        {
          ...element('barcode', 'barcode', undefined, 22, height - 38, 150, 22, 6),
          visible: barcodeEnabled,
        },
      ],
    },
  };
};

export const migrateFieldsToLayout = (
  fields: { name: string; enabled: boolean }[],
  options: ICardLayoutPresetOptions = {}
) => {
  const layout = createICardLayoutPreset(
    options.orientation === 'Vertical' ? 'vertical-badge' : 'formal-staff',
    options
  );
  const enabled = new Set(fields.filter((field) => field.enabled).map((field) => field.name));
  return {
    ...layout,
    front: {
      elements: layout.front.elements.map((item) => ({
        ...item,
        visible: Boolean(
          (item.type === 'qr' && (options.qrCodeEnabled ?? true)) ||
          (item.type === 'barcode' && (options.barcodeEnabled ?? true)) ||
          (!item.fieldKey && item.type !== 'qr' && item.type !== 'barcode') ||
          (item.fieldKey && ['schoolName', 'schoolAddress', 'static'].includes(item.fieldKey)) ||
          (item.fieldKey && enabled.has(item.fieldKey))
        ),
      })),
    },
  };
};
