import { it, expect, describe } from 'vitest';

import { ACADEMIC_AUDIT_SOURCE_LABELS } from '../academicAudit.constants';
import {
  formatActionLabel,
  formatAcademicAuditSource,
  formatAcademicAuditChangedValue,
} from './academicAuditFormatters';

const calendarContext = {
  subModuleCode: 'academic_calendar',
  entityType: 'academic calendar',
};

describe('formatAcademicAuditSource', () => {
  it('maps the subject audit provenance code used by the table and drawer', () => {
    expect(ACADEMIC_AUDIT_SOURCE_LABELS.subject_audit).toBe('Subject Audit');
    expect(formatAcademicAuditSource('subject_audit')).toBe('Subject Audit');
  });

  it('preserves curated labels for other audit sources', () => {
    expect(formatAcademicAuditSource('academic_calendar_audit')).toBe('Academic Calendar Audit');
    expect(formatAcademicAuditSource('elective_group_entity')).toBe('Elective metadata');
    expect(formatAcademicAuditSource('seating_plan_audit')).toBe('Seating plan audit');
  });

  it('formats unknown identifiers instead of exposing backend casing', () => {
    expect(formatAcademicAuditSource('curriculum_import_job')).toBe('Curriculum import job');
    expect(formatAcademicAuditSource('LearningResourceAudit')).toBe('Learning resource audit');
  });

  it('uses a placeholder for missing source values', () => {
    expect(formatAcademicAuditSource()).toBe('-');
    expect(formatAcademicAuditSource('   ')).toBe('-');
  });
});

describe('formatAcademicAuditChangedValue', () => {
  it('maps academic calendar lifecycle statuses using the calendar enum', () => {
    const field = { field: 'Status', displayName: 'Status' };

    expect(formatAcademicAuditChangedValue(calendarContext, field, '1')).toBe('Draft');
    expect(formatAcademicAuditChangedValue(calendarContext, field, '2')).toBe('Published');
    expect(formatAcademicAuditChangedValue(calendarContext, field, '3')).toBe('Archived');
  });

  it('does not apply calendar status semantics to another audit entity', () => {
    const field = { field: 'Status', displayName: 'Status' };
    const subjectContext = { subModuleCode: 'subject_creation', entityType: 'subject' };

    expect(formatAcademicAuditChangedValue(subjectContext, field, '1')).toBe('1');
  });

  it('formats UTC timestamps in the institution time zone', () => {
    const field = { field: 'PublishedAt', displayName: 'Published At' };

    expect(
      formatAcademicAuditChangedValue(calendarContext, field, '2026-09-07T11:00:23.271855Z')
    ).toBe('07 Sep 2026, 04:30 PM');
  });
});

describe('formatActionLabel', () => {
  it('keeps the existing compact backend action formatting behavior', () => {
    expect(formatActionLabel('Calendarpublished')).toBe('Calendar Published');
    expect(formatActionLabel('subjectCreated')).toBe('Subject Created');
  });
});
