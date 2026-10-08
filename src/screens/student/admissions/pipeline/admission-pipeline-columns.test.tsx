import { fDateTime } from 'src/utils/format-time';
import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, afterEach } from 'vitest';
import { getCellValueForExport } from 'src/components/customizabaleTable/table-export';

import { buildAdmissionPipelineColumns } from './admission-pipeline-columns';

const columns = buildAdmissionPipelineColumns((id) => `/application/${id}`);
const renderCell = (id: string, row: Record<string, unknown>) =>
  render(<>{columns.find((column) => column.id === id)!.render!('-', row)}</>);
const exportCell = (id: string, row: Record<string, unknown>) =>
  getCellValueForExport(
    row,
    columns.find((column) => column.id === id)!
  );

afterEach(() => vi.restoreAllMocks());

describe('Pipeline missing-source recovery', () => {
  it('shows honest fallback labels despite the shared table dash placeholder', () => {
    renderCell('currentStageName', { currentStageName: null });
    renderCell('assignedCounsellorName', { assignedCounsellorName: null });
    renderCell('standardName', { standardName: null, offeringCode: null });
    expect(screen.getByText('No current step')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('Class unavailable')).toBeInTheDocument();
  });
  it('does not describe an unresolved assigned owner as unassigned', () => {
    renderCell('assignedCounsellorName', {
      assignedCounsellorId: 'archived-user',
      assignedCounsellorName: null,
    });
    expect(screen.getByText('Assigned counsellor unavailable')).toBeInTheDocument();
    expect(screen.queryByText('Unassigned')).not.toBeInTheDocument();
  });
  it('does not turn missing dates into invalid dates or artificial deadlines', () => {
    renderCell('nextFollowUpAt', { nextFollowUpAt: null, openFollowUpCount: 0 });
    renderCell('enteredAt', { enteredAt: null, dueAt: null });
    expect(screen.getByText('No open follow-ups')).toBeInTheDocument();
    expect(screen.getByText('Not recorded')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid|deadline passed|Due /)).not.toBeInTheDocument();
  });
  it('keeps current application navigation available when its inquiry is missing', () => {
    renderCell('applicantName', {
      applicantName: 'Legacy applicant',
      applicationNumber: 'APP-1',
      inquiryNumber: null,
    });
    renderCell('actions', { id: 'legacy-app', applicationNumber: 'APP-1' });
    expect(screen.getByText(/Inquiry unavailable/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue APP-1' })).toHaveAttribute(
      'href',
      '/application/legacy-app'
    );
  });
});

describe('Pipeline exported conditional content', () => {
  it('exports only visible follow-up information without a literal false value', () => {
    expect(
      exportCell('nextFollowUpAt', {
        nextFollowUpAt: null,
        openFollowUpCount: 0,
        hasOverdueFollowUp: false,
      })
    ).toBe('No open follow-ups');
    const nextFollowUpAt = '2026-10-09T10:00:00+05:30';
    expect(
      exportCell('nextFollowUpAt', {
        nextFollowUpAt,
        openFollowUpCount: 1,
        hasOverdueFollowUp: false,
      })
    ).toBe(`1 open ${fDateTime(nextFollowUpAt)}`);
  });

  it('exports a future step deadline without a hidden boolean warning', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-07T10:00:00Z'));
    const enteredAt = '2026-10-06T10:00:00Z';
    const dueAt = '2026-10-10T10:00:00Z';
    expect(exportCell('enteredAt', { enteredAt, dueAt })).toBe(
      `${fDateTime(enteredAt)} Due ${fDateTime(dueAt)}`
    );
  });

  it('retains actual overdue warnings in export', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-07T10:00:00Z'));
    expect(
      exportCell('nextFollowUpAt', {
        openFollowUpCount: 1,
        nextFollowUpAt: '2026-10-06T10:00:00Z',
        hasOverdueFollowUp: true,
      })
    ).toContain('Follow-up overdue');
    expect(
      exportCell('enteredAt', {
        enteredAt: '2026-10-05T10:00:00Z',
        dueAt: '2026-10-06T10:00:00Z',
      })
    ).toContain('Step deadline passed');
  });
});
