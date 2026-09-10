import type { AcademicAuditEvent } from 'src/redux/academicAPI/AuditApi/academic-audit-api';

import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import AcademicAuditDetailsContent from './AcademicAuditDetailsContent';

const subjectAuditEvent: AcademicAuditEvent = {
  id: 'audit-event-1',
  subModuleCode: 'subject_creation',
  subModuleDisplayName: 'Subject Creation',
  entityType: 'subject',
  entityId: 'subject-1',
  entityName: 'Applied Mathematics',
  action: 'created',
  actionLabel: 'Created',
  summary: 'Created subject',
  actorDisplayName: 'Admin',
  occurredAt: '2026-09-07T12:06:00+05:30',
  changedFields: [],
  changedFieldCount: 0,
  source: 'subject_audit',
};

const calendarAuditEvent: AcademicAuditEvent = {
  ...subjectAuditEvent,
  id: 'audit-event-2',
  subModuleCode: 'academic_calendar',
  subModuleDisplayName: 'Academic Calendar',
  entityType: 'academic calendar',
  entityId: 'calendar-1',
  entityName: 'Gujarati Academic Calendar',
  action: 'calendarpublished',
  actionLabel: 'Calendarpublished',
  summary: 'Calendar Published: Gujarati Academic Calendar',
  changedFields: [
    {
      field: 'PublishedAt',
      displayName: 'Published At',
      oldValue: null,
      newValue: '2026-09-07T11:00:23.271855Z',
      changeType: 'updated',
    },
    {
      field: 'Status',
      displayName: 'Status',
      oldValue: '1',
      newValue: '2',
      changeType: 'updated',
    },
  ],
  changedFieldCount: 2,
  source: 'academic_calendar_audit',
};

describe('AcademicAuditDetailsContent', () => {
  it('shows a readable subject source without exposing the backend identifier', () => {
    render(<AcademicAuditDetailsContent event={subjectAuditEvent} />);

    expect(screen.getByText('Subject Audit')).toBeInTheDocument();
    expect(screen.queryByText('subject_audit')).not.toBeInTheDocument();
  });

  it('renders calendar changes and source as administrator-facing values', () => {
    render(<AcademicAuditDetailsContent event={calendarAuditEvent} />);

    expect(screen.getByText('Academic Calendar Audit')).toBeInTheDocument();
    expect(screen.getByText('Draft → Published')).toBeInTheDocument();
    expect(screen.getByText('— → 07 Sep 2026, 04:30 PM')).toBeInTheDocument();
    expect(screen.queryByText('academic_calendar_audit')).not.toBeInTheDocument();
    expect(screen.queryByText('1 → 2')).not.toBeInTheDocument();
    expect(screen.queryByText('2026-09-07T11:00:23.271855Z')).not.toBeInTheDocument();
  });
});
