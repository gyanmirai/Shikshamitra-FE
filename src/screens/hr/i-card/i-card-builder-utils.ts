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
  'text' | 'photo' | 'logo' | 'qr' | 'barcode' | 'shape' | 'line';

type ICardPaletteKey = 'themeColor' | 'backgroundColor';
type ICardPaletteStyleKey = 'color' | 'backgroundColor' | 'borderColor';

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
  paletteBindings?: Partial<Record<ICardPaletteStyleKey, ICardPaletteKey>>;
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
export const DEFAULT_ICARD_TEXT_COLOR = '#111827';
const paletteStyleKeys: ICardPaletteStyleKey[] = ['color', 'backgroundColor', 'borderColor'];

export const getUniqueICardLayoutElementId = (
  elements: ICardLayoutElement[],
  preferredId: string
) => {
  const baseId = preferredId.trim() || 'element';
  const existingIds = new Set(elements.map((element) => String(element.id || '').trim()));
  if (!existingIds.has(baseId)) return baseId;

  let suffix = 2;
  while (existingIds.has(`${baseId}-${suffix}`)) {
    suffix += 1;
  }
  return `${baseId}-${suffix}`;
};

const normalizeLayoutElementIds = (elements: ICardLayoutElement[]) =>
  elements.reduce<ICardLayoutElement[]>((normalized, element, index) => {
    const preferredId = String(element.id || '').trim() || `element-${index + 1}`;
    const id = getUniqueICardLayoutElementId(normalized, preferredId);
    normalized.push(id === element.id ? element : { ...element, id });
    return normalized;
  }, []);

const normalizeTextElementStyle = (element: ICardLayoutElement): ICardLayoutElement =>
  element.type === 'text'
    ? {
        ...element,
        style: {
          color: DEFAULT_ICARD_TEXT_COLOR,
          ...element.style,
        },
      }
    : element;

const normalizeLayoutTextStyles = (layout: ICardLayout): ICardLayout => {
  const { back, ...frontLayout } = layout;
  const normalized: ICardLayout = {
    ...frontLayout,
    front: {
      ...layout.front,
      elements: normalizeLayoutElementIds(layout.front.elements).map(normalizeTextElementStyle),
    },
  };

  if (back && Array.isArray(back.elements)) {
    normalized.back = {
      ...back,
      elements: normalizeLayoutElementIds(back.elements).map(normalizeTextElementStyle),
    };
  }

  return normalized;
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
    return normalizeLayoutTextStyles(parsed);
  } catch {
    return null;
  }
};

export const hasPersistedEmployeeICardTemplate = (
  templateId?: string | null,
  savedTemplateId?: string | null
) => Boolean(templateId || savedTemplateId);

export const getDefaultICardDesignerElementId = (
  layout: ICardLayout,
  selectedElementId?: string | null
) => {
  const selected = layout.front.elements.find((item) => item.id === selectedElementId);
  if (selected) return selected.id;

  return layout.front.elements.find((item) => item.visible && item.type === 'text')?.id ?? null;
};

export const filterEmployeeICardPreviewRows = <
  T extends {
    fullName?: string | null;
    employeeIdentifier?: string | null;
    designation?: string | null;
    department?: string | null;
  },
>(
  employees: T[],
  search: string
) => {
  const normalizedSearch = search.trim().toLocaleLowerCase();
  if (!normalizedSearch) return employees;

  return employees.filter((employee) =>
    [employee.fullName, employee.employeeIdentifier, employee.designation, employee.department]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase().includes(normalizedSearch))
  );
};

export const clampEmployeeICardPreviewIndex = (index: number, employeeCount: number) => {
  if (!Number.isFinite(index) || employeeCount <= 0) return 0;
  return Math.min(Math.max(0, Math.trunc(index)), employeeCount - 1);
};

export const canNavigateEmployeeICardStep = (
  step: number,
  activeStep: number,
  completedSteps: number[],
  isUpdateMode: boolean
) => isUpdateMode || step === activeStep || completedSteps.includes(step);

export const markEmployeeICardStepCompleted = (completedSteps: number[], step: number) =>
  completedSteps.includes(step)
    ? completedSteps
    : [...completedSteps, step].sort((first, second) => first - second);

export const updateICardLayoutElementStyle = (
  layout: ICardLayout,
  elementId: string,
  patch: NonNullable<ICardLayoutElement['style']>
): ICardLayout => {
  const updateElement = (element: ICardLayoutElement) => {
    if (element.id !== elementId) return element;

    const paletteBindings = { ...element.paletteBindings };
    paletteStyleKeys.forEach((styleKey) => {
      if (Object.prototype.hasOwnProperty.call(patch, styleKey)) {
        delete paletteBindings[styleKey];
      }
    });

    return {
      ...element,
      paletteBindings,
      style: { ...element.style, ...patch },
    };
  };

  return {
    ...layout,
    front: {
      ...layout.front,
      elements: layout.front.elements.map(updateElement),
    },
  };
};

export const updateICardLayoutPaletteColor = (
  layout: ICardLayout,
  key: ICardPaletteKey,
  value: string
): ICardLayout => {
  const previousValue = layout[key].trim().toLocaleLowerCase();
  const updateElement = (element: ICardLayoutElement): ICardLayoutElement => {
    if (!element.style) return element;

    const nextStyle = { ...element.style };
    const nextBindings = { ...element.paletteBindings };
    const hasExplicitBindings = element.paletteBindings !== undefined;
    let changed = false;
    paletteStyleKeys.forEach((styleKey) => {
      const isLegacyBoundStyle =
        !hasExplicitBindings && nextStyle[styleKey]?.trim().toLocaleLowerCase() === previousValue;
      if (nextBindings[styleKey] === key || isLegacyBoundStyle) {
        nextStyle[styleKey] = value;
        nextBindings[styleKey] = key;
        changed = true;
      }
    });

    return changed ? { ...element, paletteBindings: nextBindings, style: nextStyle } : element;
  };
  const nextLayout: ICardLayout = {
    ...layout,
    [key]: value,
    front: {
      ...layout.front,
      elements: layout.front.elements.map(updateElement),
    },
  };

  if (layout.back) {
    nextLayout.back = {
      ...layout.back,
      elements: layout.back.elements.map(updateElement),
    };
  }

  return nextLayout;
};

export const updateICardBuilderPaletteColor = <
  TState extends {
    themeColor: string;
    backgroundColor: string;
    layout: ICardLayout;
  },
>(
  state: TState,
  key: ICardPaletteKey,
  value: string
): TState =>
  ({
    ...state,
    [key]: value,
    layout: updateICardLayoutPaletteColor(state.layout, key, value),
  }) as TState;

const bindLayoutPaletteStyles = (layout: ICardLayout): ICardLayout => {
  const bindElement = (element: ICardLayoutElement): ICardLayoutElement => {
    const paletteBindings: Partial<Record<ICardPaletteStyleKey, ICardPaletteKey>> = {};
    paletteStyleKeys.forEach((styleKey) => {
      const color = element.style?.[styleKey]?.trim().toLocaleLowerCase();
      if (color === layout.themeColor.trim().toLocaleLowerCase()) {
        paletteBindings[styleKey] = 'themeColor';
      } else if (color === layout.backgroundColor.trim().toLocaleLowerCase()) {
        paletteBindings[styleKey] = 'backgroundColor';
      }
    });

    return { ...element, paletteBindings };
  };
  const boundLayout: ICardLayout = {
    ...layout,
    front: {
      ...layout.front,
      elements: layout.front.elements.map(bindElement),
    },
  };

  if (layout.back) {
    boundLayout.back = {
      ...layout.back,
      elements: layout.back.elements.map(bindElement),
    };
  }

  return boundLayout;
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
  style:
    type === 'text'
      ? {
          color: DEFAULT_ICARD_TEXT_COLOR,
          ...style,
        }
      : style,
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

  if (orientation === 'Vertical') {
    const photoFirst = presetKey === 'photo-first';
    const photoWidth = photoFirst ? 116 : 104;
    const photoHeight = photoFirst ? 126 : 114;
    const photoX = Math.round((width - photoWidth) / 2);

    return bindLayoutPaletteStyles({
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
          element(
            'photo',
            'photo',
            'photo' as ICardFieldBinding,
            photoX,
            96,
            photoWidth,
            photoHeight,
            4,
            {
              borderColor: themeColor,
              borderWidth: 2,
              photoShape: 'rounded',
            }
          ),
          element('name', 'text', 'name', 24, 222, width - 48, 28, 5, {
            fontSize: 18,
            fontWeight: 800,
            textAlign: 'center',
          }),
          element('designation', 'text', 'designation', 24, 252, width - 48, 20, 5, {
            color: '#475569',
            fontSize: 11,
            textAlign: 'center',
          }),
          element(
            'code',
            'text',
            'employeeCode',
            24,
            278,
            width - 48,
            18,
            5,
            { showLabel: true, separator: ': ', fontSize: 10, textAlign: 'center' },
            'Code'
          ),
          element(
            'department',
            'text',
            'department',
            24,
            300,
            width - 48,
            18,
            5,
            { showLabel: true, separator: ': ', fontSize: 9, textAlign: 'center' },
            'Dept'
          ),
          element(
            'phone',
            'text',
            'contactNo',
            24,
            322,
            width - 48,
            18,
            5,
            { showLabel: true, separator: ': ', fontSize: 9, textAlign: 'center' },
            'Phone'
          ),
          {
            ...element('qr', 'qr', undefined, width - 70, height - 70, 50, 50, 6),
            visible: qrCodeEnabled,
          },
          {
            ...element('barcode', 'barcode', undefined, 20, height - 68, 142, 22, 6),
            visible: barcodeEnabled,
          },
          element(
            'valid',
            'text',
            'validityYear',
            20,
            height - 38,
            142,
            18,
            5,
            { showLabel: true, fontSize: 9 },
            'Valid'
          ),
        ],
      },
    });
  }

  const photoFirst = presetKey === 'photo-first';
  const minimal = presetKey === 'minimal';
  return bindLayoutPaletteStyles({
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
  });
};

export const reflowICardLayout = (
  layout: ICardLayout,
  presetKey: string,
  options: ICardLayoutPresetOptions
): ICardLayout => {
  const next = createICardLayoutPreset(presetKey, options);
  const currentById = new Map(layout.front.elements.map((item) => [item.id, item]));
  const nextIds = new Set(next.front.elements.map((item) => item.id));
  const widthRatio = next.width / Math.max(1, layout.width);
  const heightRatio = next.height / Math.max(1, layout.height);

  const presetElements = next.front.elements.map((item) => {
    const current = currentById.get(item.id);
    if (!current) return item;

    const visible =
      item.type === 'qr'
        ? (options.qrCodeEnabled ?? item.visible)
        : item.type === 'barcode'
          ? (options.barcodeEnabled ?? item.visible)
          : current.visible;

    const paletteBindings = { ...item.paletteBindings };
    paletteStyleKeys.forEach((styleKey) => {
      if (
        current.style?.[styleKey] !== undefined &&
        current.paletteBindings?.[styleKey] === undefined
      ) {
        delete paletteBindings[styleKey];
      }
    });

    return {
      ...item,
      visible,
      paletteBindings,
      style: {
        ...item.style,
        ...current.style,
      },
      label: current.label ?? item.label,
      value: current.value ?? item.value,
    };
  });

  const customElements = layout.front.elements
    .filter((item) => !nextIds.has(item.id))
    .map((item) => {
      const width = Math.min(next.width, Math.max(1, Math.round(item.w * widthRatio)));
      const height = Math.min(next.height, Math.max(1, Math.round(item.h * heightRatio)));

      return {
        ...item,
        x: Math.min(next.width - width, Math.max(0, Math.round(item.x * widthRatio))),
        y: Math.min(next.height - height, Math.max(0, Math.round(item.y * heightRatio))),
        w: width,
        h: height,
      };
    });

  return {
    ...next,
    front: {
      elements: [...presetElements, ...customElements],
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
