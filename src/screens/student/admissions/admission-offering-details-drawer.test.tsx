import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { AdmissionOfferingDetailsDrawer } from './admission-offering-details-drawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

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
    render(<AdmissionOfferingDetailsDrawer open offering={offering} onClose={onClose} />);

    expect(
      screen.getByRole('presentation').querySelector('.MuiDrawer-paperAnchorRight')
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Class 1 Admission' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Admission Offering Details information' })
    ).toBeVisible();
    ['Academic Scope', 'Admission Window', 'Process and Forms', 'Configuration Readiness'].forEach(
      (title) => {
        expect(screen.getByRole('button', { name: `${title} information` })).toBeVisible();
      }
    );
    expect(screen.getByRole('region', { name: 'Academic Scope' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Admission Window' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Process and Forms' })).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Admission Capacity' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Configuration Readiness' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Assign Class Rooms' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not offer room assignment in offering details', () => {
    render(<AdmissionOfferingDetailsDrawer open offering={offering} onClose={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Assign Class Rooms' })).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No rooms are assigned for admission capacity/)
    ).not.toBeInTheDocument();
  });

  it('keeps saved scope, dates, zero counts and linked versions visible when ready', () => {
    render(
      <AdmissionOfferingDetailsDrawer
        open
        offering={{
          ...offering,
          isActive: true,
          campusName: 'Main campus',
          configuration: { isValid: true, status: 0, errors: [] },
        }}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Active', { exact: true })).toBeVisible();
    const scope = within(screen.getByRole('region', { name: 'Academic Scope' }));
    ['Class 1', 'General', 'CBSE', 'English', 'Primary', 'Inquiry First', 'Main campus'].forEach(
      (value) => {
        expect(scope.getByText(value, { exact: true })).toBeVisible();
      }
    );
    const admissionWindow = within(screen.getByRole('region', { name: 'Admission Window' }));
    expect(admissionWindow.getByText('28/09/2026')).toBeVisible();
    expect(admissionWindow.getByText('30/09/2026')).toBeVisible();
    expect(admissionWindow.getByText('0', { exact: true })).toBeVisible();
    const forms = within(screen.getByRole('region', { name: 'Process and Forms' }));
    ['Regular v1', 'Inquiry v1', 'Application v1'].forEach((value) => {
      expect(forms.getByText(value)).toBeVisible();
    });
    expect(
      within(screen.getByRole('region', { name: 'Configuration Readiness' })).getByText('Ready')
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Edit|Submit|Activate/ })).not.toBeInTheDocument();
  });

  it('preserves direct-entry form visibility and missing configuration fallbacks', () => {
    render(
      <AdmissionOfferingDetailsDrawer
        open
        offering={{ ...offering, entryMode: 1, workflowName: null, applicationFormName: null }}
        onClose={vi.fn()}
      />
    );
    const forms = within(screen.getByRole('region', { name: 'Process and Forms' }));
    expect(forms.queryByText('Inquiry form')).not.toBeInTheDocument();
    expect(forms.getByText('Application form')).toBeVisible();
    expect(forms.getAllByText('Not configured')).toHaveLength(2);
    expect(screen.getByText('Direct Registration')).toBeVisible();
    expect(screen.queryByText('Campus')).not.toBeInTheDocument();
    expect(screen.getByText('Inactive', { exact: true })).toBeVisible();
  });

  it('keeps incomplete configuration guidance in its owning section', () => {
    render(
      <AdmissionOfferingDetailsDrawer
        open
        offering={{
          ...offering,
          configuration: {
            isValid: false,
            status: 1,
            errors: [{ code: 'workflow', message: 'Choose a published workflow.' }],
          },
        }}
        onClose={vi.fn()}
      />
    );
    const readiness = within(screen.getByRole('region', { name: 'Configuration Readiness' }));
    expect(readiness.getByText('Configuration incomplete')).toBeVisible();
    expect(readiness.getByText('Choose a published workflow.')).toBeVisible();
    expect(readiness.queryByText('Ready', { exact: true })).not.toBeInTheDocument();
  });

  it('retains the loading state and both close controls before details arrive', () => {
    const onClose = vi.fn();
    render(<AdmissionOfferingDetailsDrawer open offering={null} loadingDetail onClose={onClose} />);
    expect(screen.getByRole('status', { name: 'Loading Offering Details' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.queryByRole('region', { name: 'Academic Scope' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close Admission Offering Details' }));
    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
