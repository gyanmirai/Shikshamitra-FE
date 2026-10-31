import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { it, vi, expect } from 'vitest';
import { render } from '@testing-library/react';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';
import {
  getExportableColumns,
  getColumnDisplayText,
} from 'src/components/customizabaleTable/utils';

import { AssessmentApplicantTable } from './assessment-applicant-table';

const capture = vi.hoisted(() => ({ props: null as ICustomizableTableProps | null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: ICustomizableTableProps) => {
    capture.props = props;
    return null;
  },
}));
vi.mock('src/hooks/use-responsive', () => ({ useResponsive: () => false }));
vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => ({ view: true }),
}));

it('exports exactly the displayed merged Status/Attendance, excludes Result/Action and preserves the progress group', () => {
  const row = {
    applicationId: 'app',
    stageInstanceId: 'stage',
    applicantName: 'Waived applicant',
    status: 'complete',
    displayStatus: 'waived',
    displayAttendance: 'notRequired',
    queue: 'completed',
    isActive: false,
    assessment: assessmentResponse,
  } as AssessmentRosterItem;
  render(
    <AssessmentApplicantTable
      items={[row]}
      canAdvance={false}
      onAction={vi.fn()}
      onDetails={vi.fn()}
    />
  );
  expect(capture.props!.exportLabel).toBe('Export');
  const { columns, data } = capture.props!;
  const exported = getExportableColumns(
    columns,
    Object.fromEntries(columns.map((column) => [column.id, true]))
  );
  expect(exported.map((column) => column.id)).not.toContain('result');
  expect(exported.map((column) => column.id)).not.toContain('actions');
  expect(
    getColumnDisplayText(
      data[0],
      columns.find((column) => column.id === 'status')
    )
  ).toBe('Waived');
  expect(
    getColumnDisplayText(
      data[0],
      columns.find((column) => column.id === 'attendance')
    )
  ).toBe('Not required');
  expect(data[0].status).toBe('complete');
  expect(columns.slice(-2).map((column) => column.label)).toEqual(['Status', 'Action']);
  expect(columns.slice(-2)).toEqual([
    expect.objectContaining({ id: 'status', sticky: true, stickyPosition: 'right', width: 160 }),
    expect.objectContaining({ id: 'actions', sticky: true, stickyPosition: 'right', width: 180 }),
  ]);
});
