import { vi, it, expect, describe, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { getCellValueForExport } from 'src/components/customizabaleTable/table-export';

import { buildAdmissionPipelineColumns } from './admission-pipeline-columns';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const columns = buildAdmissionPipelineColumns((id) => `/application/${id}`);
const renderCell = (id: string, row: Record<string, unknown>) =>
  render(<>{columns.find((column) => column.id === id)!.render!(row[id] ?? '-', row)}</>);
const exportCell = (id: string, row: Record<string, unknown>) =>
  getCellValueForExport(
    row,
    columns.find((column) => column.id === id)!
  );

afterEach(() => vi.restoreAllMocks());

describe('Pipeline missing-source recovery', () => {
  it('keeps direct application identity and navigation without requiring an Inquiry', () => {
    const row = {
      id: 'direct-app',
      applicationNumber: 'APP-7',
      applicantName: 'QA direct applicant',
      inquiryId: null,
      inquiryNumber: null,
      openFollowUpCount: 0,
    };
    renderCell('applicantName', row);
    renderCell('nextFollowUpAt', row);
    renderCell('actions', row);
    expect(screen.getByText('QA direct applicant')).toBeInTheDocument();
    expect(screen.getByText('No inquiry follow-ups')).toBeInTheDocument();
    expect(screen.queryByText(/Inquiry unavailable/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue APP-7' })).toHaveAttribute(
      'href',
      '/application/direct-app'
    );
  });
  it('shows honest fallback labels despite the shared table dash placeholder', () => {
    renderCell('currentStageName', { currentStageName: null });
    renderCell('standardName', { standardName: null, offeringCode: null });
    expect(screen.getByText('No current step')).toBeInTheDocument();
    expect(screen.getByText('Class unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  it('keeps only the approved compact visible columns and excludes actions from export', () => {
    expect(columns.filter((column) => !column.defaultHidden).map((column) => column.label)).toEqual(
      ['Student name', 'Class', 'Current step', 'Follow-ups', 'Status', 'Actions']
    );
    expect(
      columns.some((column) =>
        ['nextRequiredAction', 'enteredAt', 'assignedCounsellorName'].includes(column.id)
      )
    ).toBe(false);
    expect(columns.find((column) => column.id === 'actions')?.excludeFromExport).toBe(true);
  });
  it('does not turn missing dates into invalid dates or artificial deadlines', () => {
    renderCell('nextFollowUpAt', { nextFollowUpAt: null, openFollowUpCount: 0 });
    expect(screen.getByText('No open follow-ups')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid|deadline passed|Due /)).not.toBeInTheDocument();
  });
  it('keeps current application navigation available when its inquiry is missing', () => {
    renderCell('applicantName', {
      applicantName: 'Legacy applicant',
      applicationNumber: 'APP-1',
      inquiryNumber: null,
    });
    renderCell('actions', { id: 'legacy-app', applicationNumber: 'APP-1' });
    expect(screen.getByText('Legacy applicant')).toBeInTheDocument();
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
    ).toBe('1 open Follow up with family');
  });

  it('exports the actual overdue count and saved purpose without dates or a false count', () => {
    expect(
      exportCell('nextFollowUpAt', {
        openFollowUpCount: 3,
        overdueFollowUpCount: 1,
        nextFollowUpPurpose: 'Confirm document visit',
        nextFollowUpAt: '2026-10-06T10:00:00Z',
        hasOverdueFollowUp: true,
      })
    ).toBe('1 overdue Confirm document visit');
    expect(exportCell('nextFollowUpAt', { openFollowUpCount: 3, hasOverdueFollowUp: true })).toBe(
      'Overdue Follow up with family'
    );
  });
});

describe('Pipeline runtime progress and contextual actions', () => {
  const progress = [
    { id: 'form', name: 'Admission form', status: 2 },
    { id: 'exam', name: 'Assessment', status: 3 },
    { id: 'payment', name: 'Payment', status: 1 },
    { id: 'review', name: 'Review', status: 0 },
  ];
  it('uses the configured position and actual statuses, including a skipped earlier stage', () => {
    const row = {
      currentStageName: 'Payment',
      currentStageInstanceId: 'payment',
      stageProgress: progress,
    };
    renderCell('currentStageName', row);
    const indicator = screen.getByRole('progressbar', { name: 'Admission journey' });
    expect(indicator).toHaveAttribute('aria-valuenow', '3');
    expect(indicator).toHaveAttribute('aria-valuemax', '4');
    expect(indicator).toHaveAttribute('aria-valuetext', 'Step 3 of 4: Payment');
    expect(screen.getByRole('img', { name: 'Assessment: Skipped' })).toBeInTheDocument();
    expect(exportCell('currentStageName', row)).toBe('Payment 3 of 4');
  });
  it('does not fabricate progress for older servers or an unknown current stage', () => {
    const view = renderCell('currentStageName', { currentStageName: 'Assessment' });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    view.unmount();
    renderCell('currentStageName', {
      currentStageName: 'Assessment',
      currentStageInstanceId: 'missing',
      stageProgress: progress,
    });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  it.each([
    [2, 'Book assessment'],
    [4, 'Collect fees'],
    [1, 'Complete form'],
    [5, 'Verify documents'],
  ])(
    'opens the existing workspace for stage %s without executing its mutation',
    (stageType, label) => {
      const onOpen = vi.fn();
      const actions = buildAdmissionPipelineColumns(
        (id) => `/application/${id}?returnTo=pipeline`,
        onOpen
      ).find((column) => column.id === 'actions')!;
      render(<>{actions.render!('', { id: 'app-1', applicationNumber: 'APP-1', stageType })}</>);
      const action = screen.getByRole('link', { name: `${label} APP-1` });
      expect(action).toHaveAttribute('href', '/application/app-1?returnTo=pipeline');
      fireEvent.click(action);
      expect(onOpen).toHaveBeenCalledExactlyOnceWith('app-1');
    }
  );
  it.each(progress)('shows the custom tooltip for $name on hover', async (stage) => {
    renderCell('currentStageName', {
      currentStageName: 'Payment',
      currentStageInstanceId: 'payment',
      stageProgress: progress,
    });
    const segment = screen.getByRole('img', { name: new RegExp(`^${stage.name}:`) });
    fireEvent.mouseOver(segment);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(stage.name);
    expect(segment).not.toHaveAttribute('title');
  });
  it('shows stage names on keyboard focus without navigating or advancing', async () => {
    const onOpen = vi.fn();
    render(
      <div role="row" tabIndex={0} onKeyDown={onOpen}>
        {columns.find((column) => column.id === 'currentStageName')!.render!('', {
          currentStageName: 'Payment',
          currentStageInstanceId: 'payment',
          stageProgress: progress,
        })}
      </div>
    );
    const segment = screen.getByRole('img', { name: 'Assessment: Skipped' });
    segment.focus();
    expect(segment).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Assessment');
    expect(onOpen).not.toHaveBeenCalled();
  });
  it('preserves modified-link navigation and exposes only the plain workspace action', () => {
    const onOpen = vi.fn();
    const actions = buildAdmissionPipelineColumns((id) => `/application/${id}`, onOpen).find(
      (column) => column.id === 'actions'
    )!;
    const rowClick = vi.fn();
    render(
      <div role="row" tabIndex={0} onClick={rowClick} onKeyDown={rowClick}>
        {actions.render!('', { id: 'app-1', applicationNumber: 'APP-1', stageType: 4 })}
      </div>
    );
    const modifiedLink = screen.getByRole('link', { name: 'Collect fees APP-1' });
    // Keep Happy DOM from following a real URL; the production handler still receives Ctrl.
    modifiedLink.addEventListener('click', (event) => event.preventDefault(), { once: true });
    fireEvent.click(modifiedLink, { ctrlKey: true });
    expect(onOpen).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /More actions/ })).not.toBeInTheDocument();
    expect(modifiedLink.querySelector('.MuiButton-endIcon')).toBeNull();
    expect(rowClick).not.toHaveBeenCalled();
    fireEvent.click(modifiedLink);
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('app-1');
  });
});
