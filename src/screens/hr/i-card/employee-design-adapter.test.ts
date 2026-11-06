import { it, expect, describe } from 'vitest';

import { parseLayoutJson, parsePrintSettingsJson } from './i-card-builder-utils';

const legacyElement = {
  id: 'return',
  type: 'text',
  fieldKey: 'static',
  value: 'Return to school office',
  x: 10,
  y: 12,
  w: 200,
  h: 24,
  z: 2,
  visible: true,
  locked: true,
  style: { fontFamily: 'Arial', color: '#112233', fontWeight: 700 },
  paletteBindings: { color: 'themeColor' },
};

describe('employee card saved-design adapters', () => {
  it('adds physical trim to a legacy layout without losing either side or custom styles', () => {
    const layout = parseLayoutJson(
      JSON.stringify({
        orientation: 'Vertical',
        width: 280,
        height: 420,
        themeColor: '#112233',
        backgroundColor: '#FFFFFF',
        front: { elements: [{ ...legacyElement, id: 'front' }] },
        back: { elements: [legacyElement] },
      })
    );
    expect(layout).toMatchObject({ widthMm: 53.98, heightMm: 85.6 });
    expect(layout?.back?.elements).toEqual([legacyElement]);
    expect(parseLayoutJson(JSON.stringify(layout))).toEqual(layout);
  });

  it('preserves explicit physical size and both sides on a schema 2 round trip', () => {
    const layout = parseLayoutJson(
      JSON.stringify({
        orientation: 'Horizontal',
        width: 420,
        height: 260,
        widthMm: 90,
        heightMm: 55,
        themeColor: '#112233',
        backgroundColor: '#FFFFFF',
        front: { elements: [legacyElement] },
        back: { elements: [legacyElement] },
      })
    );
    expect(layout).toMatchObject({ widthMm: 90, heightMm: 55 });
    expect(parseLayoutJson(JSON.stringify(layout))).toEqual(layout);
  });

  it('converts legacy print points once and retains explicit mm duplex settings', () => {
    const legacy = parsePrintSettingsJson(
      JSON.stringify({
        pageSize: 'A4',
        cardsPerPage: 8,
        margin: 18,
        gap: 10,
        showCutMarks: true,
      })
    );
    expect(legacy.units).toBe('mm');
    expect(legacy.margin).toBeCloseTo(6.35);
    expect(legacy.gap).toBeCloseTo(25.4 / 7.2);
    const settings = {
      ...legacy,
      pageSize: 'Card',
      margin: 9.5,
      gap: 2.5,
      bleedMm: 1,
      safeInsetMm: 2,
      duplexFlip: 'short-edge',
      backRotation: 180,
      backOffsetXmm: -1.25,
      backOffsetYmm: 0.5,
      sideMode: 'back',
    };
    expect(parsePrintSettingsJson(JSON.stringify(settings))).toEqual(settings);
  });

  it('uses approved physical defaults for new settings and ignores nonfinite dimensions', () => {
    expect(parsePrintSettingsJson()).toMatchObject({
      units: 'mm',
      margin: 10,
      gap: 3,
      bleedMm: 0,
      safeInsetMm: 3,
      sideMode: 'both',
      duplexFlip: 'long-edge',
      backRotation: 0,
    });
    const settings = parsePrintSettingsJson('{"units":"mm","margin":"bad","gap":null}');
    expect(Number.isFinite(settings.margin)).toBe(true);
    expect(Number.isFinite(settings.gap)).toBe(true);
  });

  it('round trips the full supported v2 safe inset and offset ranges', () => {
    const settings = {
      ...parsePrintSettingsJson(),
      safeInsetMm: 20,
      backOffsetXmm: 25,
      backOffsetYmm: -30,
    };
    expect(parsePrintSettingsJson(JSON.stringify(settings))).toEqual(settings);
  });
});
