import { it, expect, describe } from 'vitest';

import { AUDIT_ALL_SENTINEL, ACADEMIC_AUDIT_ACTION_OPTIONS } from '../academicAudit.constants';
import {
  isAllSentinel,
  isActionValidForSubModule,
  getActionOptionsForSubModule,
} from './academicAuditActionMapper';

describe('isAllSentinel', () => {
  it('returns true for the sentinel constant', () => {
    expect(isAllSentinel(AUDIT_ALL_SENTINEL)).toBe(true);
  });

  it('returns true for empty string (legacy safety)', () => {
    expect(isAllSentinel('')).toBe(true);
  });

  it('returns false for a real sub-module or action value', () => {
    expect(isAllSentinel('academic_calendar')).toBe(false);
    expect(isAllSentinel('Daydeleted')).toBe(false);
  });
});

describe('getActionOptionsForSubModule', () => {
  it('returns generic options when the "all" sentinel is selected', () => {
    expect(getActionOptionsForSubModule(AUDIT_ALL_SENTINEL)).toBe(ACADEMIC_AUDIT_ACTION_OPTIONS);
  });

  it('returns generic options for empty string (legacy safety)', () => {
    expect(getActionOptionsForSubModule('')).toBe(ACADEMIC_AUDIT_ACTION_OPTIONS);
  });

  it('returns calendar-specific actions for academic_calendar', () => {
    const options = getActionOptionsForSubModule('academic_calendar');

    // Must include the "All Actions" reset entry with sentinel value
    expect(options[0]).toEqual({ label: 'All Actions', value: AUDIT_ALL_SENTINEL });

    // Must include known calendar action strings
    const values = options.map((o) => o.value);
    expect(values).toContain('Daydeleted');
    expect(values).toContain('Dayadded');
    expect(values).toContain('Calendarpublished');

    // Must NOT include generic-only values
    expect(values).not.toContain('created');
    expect(values).not.toContain('deleted');
  });

  it('returns generic options for a sub-module without a curated entry', () => {
    expect(getActionOptionsForSubModule('subject_creation')).toBe(ACADEMIC_AUDIT_ACTION_OPTIONS);
  });
});

describe('isActionValidForSubModule', () => {
  it('treats the sentinel value as always valid', () => {
    expect(isActionValidForSubModule(AUDIT_ALL_SENTINEL, 'academic_calendar')).toBe(true);
    expect(isActionValidForSubModule(AUDIT_ALL_SENTINEL, AUDIT_ALL_SENTINEL)).toBe(true);
  });

  it('treats empty string as always valid (legacy safety)', () => {
    expect(isActionValidForSubModule('', 'academic_calendar')).toBe(true);
    expect(isActionValidForSubModule('', '')).toBe(true);
  });

  it('recognises calendar-specific actions as valid for academic_calendar', () => {
    expect(isActionValidForSubModule('Daydeleted', 'academic_calendar')).toBe(true);
    expect(isActionValidForSubModule('Calendarpublished', 'academic_calendar')).toBe(true);
  });

  it('rejects generic actions that are not in the calendar action set', () => {
    expect(isActionValidForSubModule('deleted', 'academic_calendar')).toBe(false);
    expect(isActionValidForSubModule('created', 'academic_calendar')).toBe(false);
  });

  it('accepts generic actions for sub-modules without curated entries', () => {
    expect(isActionValidForSubModule('deleted', 'subject_creation')).toBe(true);
    expect(isActionValidForSubModule('created', AUDIT_ALL_SENTINEL)).toBe(true);
  });
});
