import { describe, expect, it } from 'vitest';

import {
  getStudentICardLayout,
  readStudentICardLayout,
  applyStudentICardDesign,
  createStudentICardTemplate,
  getStudentICardDesignErrors,
  getStudentICardPrintSettings,
} from './student-icard-design';

describe('student configurable ID-card adapter', () => {
  it('starts with the approved front/back design at exact ID-1 trim dimensions', () => {
    const template = createStudentICardTemplate();
    const layout = readStudentICardLayout(template)!;
    expect(template).toMatchObject({ presetKey: 'classic-identity', schemaVersion: 2, backSideEnabled: true });
    expect(layout).toMatchObject({ widthMm: 85.6, heightMm: 53.98 });
    expect(layout.back?.elements.length).toBeGreaterThan(0);
    expect(getStudentICardDesignErrors(template)).toEqual([]);
    expect(template.fields).not.toContain('DateOfBirth');
  });

  it('round-trips custom front and back configuration while preserving assignment and concurrency metadata', () => {
    const initial = { ...createStudentICardTemplate(), id: 'saved', concurrencyStamp: 'stamp',
      selectionRestricted: true, selection: null, schoolName: 'School' };
    const layout = getStudentICardLayout(initial);
    layout.widthMm = 90;
    layout.heightMm = 55;
    layout.back!.elements.push({ id: 'return-note', type: 'text', fieldKey: 'static',
      value: 'Return to the school office.', x: 20, y: 100, w: 330, h: 24,
      z: 10, visible: true, locked: true, style: { fontFamily: 'Arial', fontSize: 12 } });
    const settings = { ...getStudentICardPrintSettings(initial), bleedMm: 3, backOffsetXmm: 1 };
    const saved = applyStudentICardDesign(initial, layout, settings);
    expect(saved).toMatchObject({ id: 'saved', concurrencyStamp: 'stamp', selectionRestricted: true, selection: null });
    expect(readStudentICardLayout(saved)).toEqual(layout);
    expect(getStudentICardPrintSettings(saved)).toEqual(settings);
    expect(saved).not.toBe(initial);
  });

  it('synchronises student data and photograph switches with visible configured elements', () => {
    const template = createStudentICardTemplate();
    const layout = getStudentICardLayout(template);
    [layout.front, layout.back!].forEach((side) => {
      side.elements = side.elements.map((element) => ({ ...element,
        visible: element.type === 'photo' || element.fieldKey === 'AcademicYear' ? false : element.visible }));
    });
    const saved = applyStudentICardDesign(template, layout, getStudentICardPrintSettings(template));
    expect(saved.showPhoto).toBe(false);
    expect(saved.fields).not.toContain('AcademicYear');
    expect(saved.fields).toContain('StudentName');
  });

  it('does not activate a data field present only on a disabled back side', () => {
    const template = { ...createStudentICardTemplate(), backSideEnabled: false };
    const layout = getStudentICardLayout(template);
    layout.back!.elements.push({ id: 'birth', type: 'text', fieldKey: 'DateOfBirth',
      x: 20, y: 100, w: 200, h: 20, z: 10, visible: true });
    const saved = applyStudentICardDesign(template, layout, getStudentICardPrintSettings(template));
    expect(saved.fields).not.toContain('DateOfBirth');
  });

  it('retains legacy JSON unchanged until the user edits its design', () => {
    const legacy = { ...createStudentICardTemplate(), schemaVersion: 1,
      layoutJson: null, printSettingsJson: null, backSideEnabled: false, presetKey: 'minimal' };
    const before = JSON.stringify(legacy);
    expect(readStudentICardLayout(legacy)).toBeNull();
    expect(getStudentICardLayout(legacy).front.elements.length).toBeGreaterThan(0);
    expect(JSON.stringify(legacy)).toBe(before);
  });

  it('retains invalid position edits so errors block saving without resetting the draft', () => {
    const template = createStudentICardTemplate();
    const layout = getStudentICardLayout(template);
    layout.front.elements.find((element) => element.fieldKey === 'StudentName')!.x = 1000;
    const saved = applyStudentICardDesign(template, layout, getStudentICardPrintSettings(template));
    expect(getStudentICardLayout(saved).front.elements).toEqual(layout.front.elements);
    expect(getStudentICardDesignErrors(saved).join(' ')).toMatch(/outside/);
  });

  it('restores back-only field visibility after disabling and enabling the back side', () => {
    const template = createStudentICardTemplate();
    const layout = getStudentICardLayout(template);
    layout.back!.elements.push({ id: 'birth', type: 'text', fieldKey: 'DateOfBirth',
      x: 20, y: 100, w: 200, h: 20, z: 10, visible: true });
    const disabled = applyStudentICardDesign({ ...template, backSideEnabled: false }, layout,
      getStudentICardPrintSettings(template));
    const enabled = applyStudentICardDesign({ ...disabled, backSideEnabled: true },
      getStudentICardLayout(disabled), getStudentICardPrintSettings(disabled));
    expect(getStudentICardLayout(enabled).back!.elements.find((element) => element.id === 'birth')?.visible).toBe(true);
    expect(enabled.fields).toContain('DateOfBirth');
  });

  it('rejects malformed JSON and blocks foreign-module bindings without losing the draft', () => {
    const template = createStudentICardTemplate();
    expect(readStudentICardLayout({ ...template, layoutJson: '{broken' })).toBeNull();
    const layout = getStudentICardLayout(template);
    layout.front.elements.push({ id: 'private', type: 'text', fieldKey: 'employeeCode',
      x: 1, y: 1, w: 40, h: 20, z: 5, visible: true });
    expect(getStudentICardDesignErrors({ ...template, layoutJson: JSON.stringify(layout) }).join(' ')).toMatch(/unavailable field/);
    expect(getStudentICardDesignErrors({ ...template, layoutJson: '{broken' })[0]).toMatch(/invalid/);
  });
});
