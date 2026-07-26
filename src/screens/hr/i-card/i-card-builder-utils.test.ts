import { it, expect, describe } from 'vitest';

import {
  isPdfBlob,
  snapToGrid,
  parseLayoutJson,
  clampCardsPerPage,
  reflowICardLayout,
  clampElementDimension,
  migrateFieldsToLayout,
  parsePrintSettingsJson,
  createICardLayoutPreset,
  DEFAULT_ICARD_TEXT_COLOR,
  canNavigateEmployeeICardStep,
  getUniqueICardLayoutElementId,
  updateICardLayoutPaletteColor,
  updateICardLayoutElementStyle,
  filterEmployeeICardPreviewRows,
  clampEmployeeICardPreviewIndex,
  updateICardBuilderPaletteColor,
  markEmployeeICardStepCompleted,
  getDefaultICardDesignerElementId,
  hasPersistedEmployeeICardTemplate,
} from './i-card-builder-utils';

describe('Employee I-Card builder utilities', () => {
  it('clamps cards per page into the backend-supported range', () => {
    expect(clampCardsPerPage(0)).toBe(1);
    expect(clampCardsPerPage(8)).toBe(8);
    expect(clampCardsPerPage(11)).toBe(10);
  });

  it('prevents NaN and decimal card counts', () => {
    expect(clampCardsPerPage(Number.NaN)).toBe(1);
    expect(clampCardsPerPage(4.8)).toBe(4);
  });

  it('clamps element dimensions without forcing text fields to card-size minimums', () => {
    expect(clampElementDimension(24, 18)).toBe(24);
    expect(clampElementDimension(0, 18)).toBe(1);
    expect(clampElementDimension(Number.NaN, 18)).toBe(18);
  });

  it('accepts only non-empty PDF blobs', async () => {
    await expect(isPdfBlob(new Blob(['%PDF-1.7'], { type: 'application/pdf' }))).resolves.toBe(
      true
    );
    await expect(
      isPdfBlob(new Blob(['{"error":true}'], { type: 'application/json' }))
    ).resolves.toBe(false);
    await expect(isPdfBlob(new Blob([], { type: 'application/pdf' }))).resolves.toBe(false);
  });

  it('creates six template-friendly layout presets with front elements', () => {
    const presetKeys = [
      'formal-staff',
      'modern-staff',
      'vertical-badge',
      'visitor-style',
      'minimal',
      'photo-first',
    ];

    presetKeys.forEach((key) => {
      const layout = createICardLayoutPreset(key);
      expect(layout.front.elements.length).toBeGreaterThan(5);
      expect(layout.front.elements.some((element) => element.type === 'photo')).toBe(true);
    });
  });

  it('uses horizontal dimensions when moving from vertical to a horizontal preset', () => {
    const layout = createICardLayoutPreset('formal-staff', {
      orientation: 'Horizontal',
      width: 420,
      height: 260,
    });

    expect(layout.orientation).toBe('Horizontal');
    expect(layout.width).toBe(420);
    expect(layout.height).toBe(260);
  });

  it('keeps qr and barcode visibility aligned with toggles', () => {
    const layout = createICardLayoutPreset('formal-staff', {
      qrCodeEnabled: false,
      barcodeEnabled: false,
    });

    expect(layout.front.elements.find((element) => element.type === 'qr')?.visible).toBe(false);
    expect(layout.front.elements.find((element) => element.type === 'barcode')?.visible).toBe(
      false
    );
  });

  it('parses print settings with safe defaults and clamping', () => {
    expect(parsePrintSettingsJson('{"cardsPerPage":12,"margin":99,"gap":-4}')).toMatchObject({
      pageSize: 'A4',
      cardsPerPage: 10,
      margin: 60,
      gap: 0,
    });
  });

  it('migrates legacy field toggles into element visibility', () => {
    const layout = migrateFieldsToLayout(
      [
        { name: 'name', enabled: true },
        { name: 'employeeCode', enabled: true },
        { name: 'designation', enabled: false },
      ],
      { qrCodeEnabled: false, barcodeEnabled: false }
    );

    expect(layout.front.elements.find((element) => element.fieldKey === 'name')?.visible).toBe(
      true
    );
    expect(
      layout.front.elements.find((element) => element.fieldKey === 'designation')?.visible
    ).toBe(false);
    expect(layout.front.elements.find((element) => element.type === 'qr')?.visible).toBe(false);
    expect(layout.front.elements.find((element) => element.type === 'barcode')?.visible).toBe(
      false
    );
  });

  it('parses valid layout json and snaps designer movement', () => {
    const layout = createICardLayoutPreset('formal-staff');

    expect(parseLayoutJson(JSON.stringify(layout))?.front.elements.length).toBeGreaterThan(0);
    expect(parseLayoutJson('not-json')).toBeNull();
    expect(snapToGrid(18, 4)).toBe(20);
  });

  it('defaults the designer inspector to the first visible text element', () => {
    const layout = createICardLayoutPreset('formal-staff');

    expect(getDefaultICardDesignerElementId(layout, null)).toBe(
      layout.front.elements.find((element) => element.visible && element.type === 'text')?.id
    );
    expect(getDefaultICardDesignerElementId(layout, 'photo')).toBe('photo');
  });

  it('keeps an explicitly selected hidden palette element selected', () => {
    const layout = createICardLayoutPreset('formal-staff', { qrCodeEnabled: false });

    expect(getDefaultICardDesignerElementId(layout, 'qr')).toBe('qr');
  });

  it('reflows the photo-first preset inside vertical card bounds', () => {
    const horizontal = createICardLayoutPreset('photo-first', {
      orientation: 'Horizontal',
      width: 420,
      height: 260,
      qrCodeEnabled: false,
    });
    const layout = reflowICardLayout(horizontal, 'photo-first', {
      orientation: 'Vertical',
      width: 280,
      height: 420,
      qrCodeEnabled: false,
      barcodeEnabled: true,
    });

    expect(layout.orientation).toBe('Vertical');
    expect(layout.front.elements.find((element) => element.type === 'qr')?.visible).toBe(false);
    expect(layout.front.elements.find((element) => element.type === 'barcode')?.visible).toBe(true);
    expect(layout.front.elements.every((element) => element.x >= 0 && element.y >= 0)).toBe(true);
    expect(
      layout.front.elements.every(
        (element) => element.x + element.w <= layout.width && element.y + element.h <= layout.height
      )
    ).toBe(true);
  });

  it('filters selected-card previews by employee identity fields', () => {
    const employees = [
      {
        fullName: 'Asha Patel',
        employeeIdentifier: 'EMP-101',
        designation: 'Teacher',
        department: 'Science',
      },
      {
        fullName: 'Ravi Shah',
        employeeIdentifier: 'EMP-202',
        designation: 'Accountant',
        department: 'Finance',
      },
    ];

    expect(filterEmployeeICardPreviewRows(employees, 'science')).toEqual([employees[0]]);
    expect(filterEmployeeICardPreviewRows(employees, 'emp-202')).toEqual([employees[1]]);
    expect(filterEmployeeICardPreviewRows(employees, '  ')).toEqual(employees);
  });

  it('keeps the selected-card preview index inside the current selection', () => {
    expect(clampEmployeeICardPreviewIndex(4, 5)).toBe(4);
    expect(clampEmployeeICardPreviewIndex(4, 2)).toBe(1);
    expect(clampEmployeeICardPreviewIndex(-2, 2)).toBe(0);
    expect(clampEmployeeICardPreviewIndex(Number.NaN, 2)).toBe(0);
    expect(clampEmployeeICardPreviewIndex(2, 0)).toBe(0);
  });

  it('updates theme-bound preset colors without replacing inspector overrides', () => {
    const layout = updateICardLayoutElementStyle(
      createICardLayoutPreset('formal-staff', {
        themeColor: '#1D4ED8',
        backgroundColor: '#F8FAFC',
      }),
      'school',
      { color: '#1D4ED8' }
    );

    const updatedTheme = updateICardLayoutPaletteColor(layout, 'themeColor', '#059669');
    const updatedPalette = updateICardLayoutPaletteColor(
      updatedTheme,
      'backgroundColor',
      '#FFFFFF'
    );

    expect(updatedPalette.themeColor).toBe('#059669');
    expect(updatedPalette.backgroundColor).toBe('#FFFFFF');
    expect(
      updatedPalette.front.elements.find((element) => element.id === 'topline')?.style
        ?.backgroundColor
    ).toBe('#059669');
    expect(
      updatedPalette.front.elements.find((element) => element.id === 'photo')?.style?.borderColor
    ).toBe('#059669');
    expect(
      updatedPalette.front.elements.find((element) => element.id === 'accent')?.style
        ?.backgroundColor
    ).toBe('#FFFFFF');
    expect(
      updatedPalette.front.elements.find((element) => element.id === 'school')?.style?.color
    ).toBe('#1D4ED8');
  });

  it('keeps builder and layout palette colors synchronized for logo-derived colors', () => {
    const initialState = {
      themeColor: '#1D4ED8',
      backgroundColor: '#F8FAFC',
      layout: createICardLayoutPreset('formal-staff', {
        themeColor: '#1D4ED8',
        backgroundColor: '#F8FAFC',
      }),
      logoBlobName: 'old-logo',
    };

    const updatedState = updateICardBuilderPaletteColor(initialState, 'themeColor', '#059669');

    expect(updatedState.themeColor).toBe('#059669');
    expect(updatedState.logoBlobName).toBe('old-logo');
    expect(updatedState.layout.themeColor).toBe('#059669');
    expect(
      updatedState.layout.front.elements.find((element) => element.id === 'topline')?.style
        ?.backgroundColor
    ).toBe('#059669');
  });

  it('normalizes duplicate saved IDs and allocates collision-free field IDs', () => {
    const layout = createICardLayoutPreset('formal-staff');
    const schoolAddress = layout.front.elements.find(
      (element) => element.fieldKey === 'schoolAddress'
    );
    expect(schoolAddress).toBeDefined();

    const employeeAddress = {
      ...schoolAddress!,
      id: 'address',
      fieldKey: 'address' as const,
      label: 'Address',
    };
    const parsed = parseLayoutJson(
      JSON.stringify({
        ...layout,
        front: {
          ...layout.front,
          elements: [...layout.front.elements, employeeAddress],
        },
      })
    );
    const parsedIds = parsed?.front.elements.map((element) => element.id) || [];

    expect(new Set(parsedIds).size).toBe(parsedIds.length);
    expect(parsed?.front.elements.find((element) => element.fieldKey === 'address')?.id).toBe(
      'address-2'
    );
    expect(getUniqueICardLayoutElementId(layout.front.elements, 'field-address')).toBe(
      'field-address'
    );
  });

  it('propagates the recommended light background to palette-bound elements', () => {
    const layout = createICardLayoutPreset('formal-staff', {
      themeColor: '#1D4ED8',
      backgroundColor: '#F8FAFC',
    });
    const lowContrastLayout = updateICardLayoutPaletteColor(layout, 'backgroundColor', '#1D4ED8');

    const recommendedLayout = updateICardLayoutPaletteColor(
      lowContrastLayout,
      'backgroundColor',
      '#F8FAFC'
    );

    expect(recommendedLayout.backgroundColor).toBe('#F8FAFC');
    expect(
      recommendedLayout.front.elements.find((element) => element.id === 'accent')?.style
        ?.backgroundColor
    ).toBe('#F8FAFC');
    expect(
      recommendedLayout.front.elements.find((element) => element.id === 'topline')?.style
        ?.backgroundColor
    ).toBe('#1D4ED8');
  });

  it('tracks completed step navigation without allowing create-mode jumps ahead', () => {
    const completed = markEmployeeICardStepCompleted([0], 2);

    expect(completed).toEqual([0, 2]);
    expect(canNavigateEmployeeICardStep(0, 2, completed, false)).toBe(true);
    expect(canNavigateEmployeeICardStep(1, 2, completed, false)).toBe(false);
    expect(canNavigateEmployeeICardStep(4, 2, completed, true)).toBe(true);
  });

  it('allows full step navigation after a create-mode template is saved in place', () => {
    expect(hasPersistedEmployeeICardTemplate(null, null)).toBe(false);
    expect(hasPersistedEmployeeICardTemplate(null, 'saved-template-1')).toBe(true);
    expect(
      canNavigateEmployeeICardStep(
        4,
        0,
        [],
        hasPersistedEmployeeICardTemplate(null, 'saved-template-1')
      )
    ).toBe(true);
  });

  it('persists text color changes in serialized layout json', () => {
    const layout = createICardLayoutPreset('formal-staff');
    const updated = updateICardLayoutElementStyle(layout, 'name', { color: '#B91C1C' });
    const parsed = parseLayoutJson(JSON.stringify(updated));

    expect(parsed?.front.elements.find((element) => element.id === 'name')?.style?.color).toBe(
      '#B91C1C'
    );
  });

  it('defaults ordinary text to a visible card color while preserving explicit colors', () => {
    const layout = createICardLayoutPreset('formal-staff');

    expect(layout.front.elements.find((element) => element.id === 'name')?.style?.color).toBe(
      DEFAULT_ICARD_TEXT_COLOR
    );
    expect(layout.front.elements.find((element) => element.id === 'school')?.style?.color).toBe(
      layout.themeColor
    );
  });

  it('normalizes legacy layout json so text without color is visible on white cards', () => {
    const parsed = parseLayoutJson(
      JSON.stringify({
        orientation: 'Horizontal',
        width: 420,
        height: 260,
        backgroundColor: '#FFFFFF',
        themeColor: '#1D4ED8',
        front: {
          elements: [
            {
              id: 'name',
              type: 'text',
              fieldKey: 'name',
              x: 12,
              y: 12,
              w: 120,
              h: 24,
              z: 1,
              visible: true,
              style: { fontSize: 12 },
            },
            {
              id: 'school',
              type: 'text',
              fieldKey: 'schoolName',
              x: 12,
              y: 40,
              w: 120,
              h: 24,
              z: 2,
              visible: true,
              style: { color: '#FFFFFF' },
            },
          ],
        },
      })
    );

    expect(parsed?.front.elements.find((element) => element.id === 'name')?.style?.color).toBe(
      DEFAULT_ICARD_TEXT_COLOR
    );
    expect(parsed?.front.elements.find((element) => element.id === 'school')?.style?.color).toBe(
      '#FFFFFF'
    );
  });

  it('preserves a valid front layout when legacy back data is malformed', () => {
    const parsed = parseLayoutJson(
      JSON.stringify({
        orientation: 'Horizontal',
        width: 420,
        height: 260,
        backgroundColor: '#FFFFFF',
        themeColor: '#1D4ED8',
        front: {
          elements: [
            {
              id: 'name',
              type: 'text',
              fieldKey: 'name',
              x: 12,
              y: 12,
              w: 120,
              h: 24,
              z: 1,
              visible: true,
              style: { fontSize: 12 },
            },
          ],
        },
        back: {},
      })
    );

    expect(parsed?.front.elements.find((element) => element.id === 'name')?.style?.color).toBe(
      DEFAULT_ICARD_TEXT_COLOR
    );
    expect(parsed?.back).toBeUndefined();
  });
});
