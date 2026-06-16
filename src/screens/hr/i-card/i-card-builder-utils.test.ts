import { it, expect, describe } from 'vitest';

import {
  isPdfBlob,
  snapToGrid,
  parseLayoutJson,
  clampCardsPerPage,
  clampElementDimension,
  migrateFieldsToLayout,
  parsePrintSettingsJson,
  createICardLayoutPreset,
  canNavigateEmployeeICardStep,
  updateICardLayoutElementStyle,
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
});
