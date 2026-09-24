import type { AcademicReportExportJobResponse } from 'src/redux/academicAPI/AcademicReportApi';

import { describe, expect, it, vi } from 'vitest';

import { getCurriculumReportActions } from './curriculumReportActions';

const report: AcademicReportExportJobResponse = {
  id: 'report-1',
  reportType: 'SubjectAllocation',
  status: 'Completed',
  isDynamic: false,
};

function createOptions(downloadingJobId: string | null = null) {
  return {
    downloadingJobId,
    onView: vi.fn(),
    onDownload: vi.fn(),
  };
}

describe('getCurriculumReportActions', () => {
  it('shows view and download directly for a standard report', () => {
    const actions = getCurriculumReportActions(report, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['view', 'download']);
    expect(actions[1].disabled).toBe(false);
  });

  it('shows only download for a dynamic report', () => {
    const actions = getCurriculumReportActions({ ...report, isDynamic: true }, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['download']);
  });

  it('disables failed downloads and exposes the failure reason', () => {
    const actions = getCurriculumReportActions(
      { ...report, status: 'Failed', errorMessage: 'Generation failed' },
      createOptions()
    );
    const downloadAction = actions.find((action) => action.id === 'download');

    expect(downloadAction).toMatchObject({ disabled: true, tooltip: 'Generation failed' });
  });
});
