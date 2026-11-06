import type { EmployeeICardTemplate } from 'src/redux/hr/employee-icard-template-api';

import { it, expect, describe } from 'vitest';

import { getEmployeeCardPreviewValues } from './employee-card-values';
import {
  initialBuilder,
  buildTemplateState,
  getEmployeeCardDesignPayload,
  getEmployeeCardDraftSignature,
} from './employee-builder-state';

describe('employee saved card configuration', () => {
  it('starts with Staff Professional, both sides, and fixed physical defaults', () => {
    const state = initialBuilder('2026-2027');
    expect(state.presetKey).toBe('staff-professional');
    expect(state.backSideEnabled).toBe(true);
    expect(state.layout).toMatchObject({ widthMm: 85.6, heightMm: 53.98 });
    expect(state.layout.back?.elements.length).toBeGreaterThan(0);
    expect(state.printSettings).toMatchObject({ units: 'mm', margin: 10, gap: 3 });
  });

  it('saves edited backs, physical sizes, and duplex settings without replacing a legacy layout', () => {
    const state = initialBuilder();
    state.layout.widthMm = 92;
    state.layout.heightMm = 60;
    state.layout.back!.elements.push({
      id: 'custom-return',
      type: 'text',
      fieldKey: 'static',
      value: 'Return to school office',
      x: 10,
      y: 10,
      w: 140,
      h: 20,
      z: 9,
      visible: true,
      locked: true,
      style: { fontFamily: 'Arial', color: '#223344' },
      paletteBindings: { color: 'themeColor' },
    });
    state.printSettings = {
      ...state.printSettings,
      duplexFlip: 'short-edge',
      backRotation: 180,
      backOffsetXmm: -1,
      backOffsetYmm: 0.5,
      sideMode: 'back',
      margin: 12.5,
    };
    const payload = getEmployeeCardDesignPayload(state);
    expect(payload.schemaVersion).toBe(2);
    const restored = buildTemplateState({
      id: 'template',
      academicYearId: 'year',
      name: 'Saved staff',
      isActive: true,
      ...payload,
      backSideEnabled: true,
    } as EmployeeICardTemplate);
    expect(restored.layout).toEqual(state.layout);
    expect(restored.printSettings).toEqual(state.printSettings);
  });

  it('enables a field configured on the back and disables a removed optional field', () => {
    const state = initialBuilder();
    state.layout.front.elements = state.layout.front.elements.filter(
      (element) => element.fieldKey !== 'designation'
    );
    state.layout.back!.elements.push({
      id: 'phone',
      type: 'text',
      fieldKey: 'contactNo',
      x: 10,
      y: 10,
      w: 100,
      h: 20,
      z: 4,
      visible: true,
    });
    const fields = JSON.parse(getEmployeeCardDesignPayload(state).fieldsJson);
    expect(fields.find((field: { name: string }) => field.name === 'contactNo').enabled).toBe(true);
    expect(fields.find((field: { name: string }) => field.name === 'designation').enabled).toBe(
      false
    );
  });

  it('guards identity, organization and side changes while ignoring resolved image URLs', () => {
    const state = initialBuilder();
    const before = getEmployeeCardDraftSignature(state);
    expect(getEmployeeCardDraftSignature({ ...state, logoPreview: 'blob:preview' })).toBe(before);
    [
      { name: 'Changed' },
      { schoolName: 'Changed' },
      { organization: 'scoped' },
      { backSideEnabled: false },
    ].forEach((patch) => {
      expect(getEmployeeCardDraftSignature({ ...state, ...patch })).not.toBe(before);
    });
  });

  it('keeps absent staff data absent in sample previews', () => {
    const values = getEmployeeCardPreviewValues({ schoolName: '', schoolAddress: '' });
    expect(values.name).toBeUndefined();
    expect(values.contactNo).toBeUndefined();
    expect(values.bloodGroup).toBeUndefined();
  });
});
