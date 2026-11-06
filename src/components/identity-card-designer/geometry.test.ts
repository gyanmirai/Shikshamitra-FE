import { it, expect, describe } from 'vitest';

import { createIdentityCardPreset } from './presets';
import {
  getIdentityCardSheetLayout,
  validateIdentityCardLayout,
  DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
} from './geometry';

describe('fixed physical identity card geometry', () => {
  it('rejects malformed layout structures and unsupported print enums without throwing', () => {
    const layout = createIdentityCardPreset('classic-identity');
    expect(
      validateIdentityCardLayout({ ...layout, front: undefined } as unknown as typeof layout).join(
        ' '
      )
    ).toContain('front');
    layout.front.elements[0] = {
      ...layout.front.elements[0],
      id: '',
      type: 'unknown',
    } as unknown as (typeof layout.front.elements)[number];
    expect(validateIdentityCardLayout(layout).join(' ')).toContain('type');
    expect(
      getIdentityCardSheetLayout(createIdentityCardPreset('classic-identity'), {
        ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
        pageSize: 'A3',
        units: 'px',
      } as unknown as typeof DEFAULT_IDENTITY_CARD_PRINT_SETTINGS).errors.join(' ')
    ).toContain('Paper');
  });
  it('reflows a portrait preset into a tall canvas with valid bounds', () => {
    const layout = createIdentityCardPreset('classic-identity', { widthMm: 53.98, heightMm: 85.6 });
    expect(layout).toMatchObject({ orientation: 'Vertical', width: 270, height: 428 });
    expect(validateIdentityCardLayout(layout)).toEqual([]);
  });
  it('fits eight CR80 cards at actual size and caps requested count', () => {
    const layout = createIdentityCardPreset('classic-identity');
    const result = getIdentityCardSheetLayout(layout, {
      ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
      cardsPerPage: 10,
    });
    expect(result).toMatchObject({
      columns: 2,
      rows: 4,
      capacity: 8,
      effectiveCardsPerPage: 8,
      errors: [],
    });
    expect(layout.widthMm).toBe(85.6);
    expect(layout.heightMm).toBe(53.98);
  });
  it('includes bleed and rejects impossible sizes without scaling', () => {
    const layout = createIdentityCardPreset('staff-professional', { widthMm: 200, heightMm: 200 });
    const result = getIdentityCardSheetLayout(layout, {
      ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
      bleedMm: 3,
    });
    expect(result.capacity).toBe(0);
    expect(result.errors.join(' ')).toContain('No card fits');
    expect(layout.widthMm).toBe(200);
  });
  it('uses one exact sized card for card media and rejects invalid numeric settings', () => {
    const layout = createIdentityCardPreset('classic-identity');
    expect(
      getIdentityCardSheetLayout(layout, {
        ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
        pageSize: 'Card',
      })
    ).toMatchObject({ capacity: 1, effectiveCardsPerPage: 1 });
    expect(
      getIdentityCardSheetLayout(layout, {
        ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
        gap: Number.NaN,
      }).errors.length
    ).toBeGreaterThan(0);
  });
  it('keeps approved preset structure and validates both sides and allowed fields', () => {
    const student = createIdentityCardPreset('classic-identity');
    const staff = createIdentityCardPreset('staff-professional');
    expect(student.front.elements.some((item) => item.fieldKey === 'StudentName')).toBe(true);
    expect(staff.front.elements.find((item) => item.type === 'photo')?.style?.photoShape).toBe(
      'circle'
    );
    expect(validateIdentityCardLayout(student)).toEqual([]);
    student.back!.elements.push({ ...student.front.elements[0], id: 'bad', x: -5 });
    expect(validateIdentityCardLayout(student).join(' ')).toContain('outside');
    expect(validateIdentityCardLayout(staff, [{ key: 'name', label: 'Name' }]).join(' ')).toContain(
      'binding'
    );
  });
});
