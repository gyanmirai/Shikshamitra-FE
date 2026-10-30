import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AdmissionOfferingDetailsDrawer } from './admission-offering-details-drawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useGetAdmissionClassCapacityQuery: () => ({
    data: null,
    isError: false,
    isLoading: false,
  }),
  useGetAdmissionRoomChoicesQuery: () => ({
    data: [],
    isError: false,
    isFetching: false,
  }),
  useUpdateAdmissionClassRoomsMutation: () => [vi.fn(), { isLoading: false }],
}));

const offering: AdmissionOffering = {
  id: 'offering-1',
  name: 'Class 1 Admission',
  code: 'ADM-CLASS-1',
  admissionCycleId: 'cycle-1',
  admissionCycleName: 'Regular Admission',
  boardId: 'board-1',
  boardName: 'CBSE',
  mediumId: 'medium-1',
  mediumName: 'English',
  stageId: 'stage-1',
  stageName: 'Primary',
  standardId: 'standard-1',
  standardName: 'Class 1',
  track: 0,
  entryMode: 0,
  effectiveOpenDate: '2026-09-28',
  effectiveCloseDate: '2026-09-30',
  workflowName: 'Regular',
  workflowVersion: 1,
  inquiryFormName: 'Inquiry',
  inquiryFormVersion: 1,
  applicationFormName: 'Application',
  applicationFormVersion: 1,
  isActive: false,
  availabilityStatus: 0,
  configurationStatus: 1,
  canActivate: false,
  applicationCount: 0,
  canEditIdentity: true,
  canDelete: true,
  useCycleDates: true,
  configuration: { isValid: false, status: 1, errors: [] },
  concurrencyStamp: 'stamp',
  creationTime: '2026-09-28',
};

describe('Admission offering details drawer', () => {
  it('groups offering details in a right drawer and keeps read-only access', () => {
    const onClose = vi.fn();
    render(
      <AdmissionOfferingDetailsDrawer
        open
        offering={offering}
        canManage={false}
        onClose={onClose}
      />
    );

    expect(
      screen.getByRole('presentation').querySelector('.MuiDrawer-paperAnchorRight')
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Class 1 Admission' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Academic scope' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Admission window' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Process and forms' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Admission capacity' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Configuration readiness' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Assign class rooms' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
