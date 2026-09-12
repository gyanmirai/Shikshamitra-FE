import type { ReactNode } from 'react';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import StudentAssignmentDialog from './student-assignment-dialog';
import { studentOnboardingPreviewData } from './student-onboarding-preview-data';
import { useOnboardingSettings, OnboardingSettingsProvider } from '../onboarding-settings-context';
import {
  defaultOnboardingSettings,
  defaultGrNumberConfiguration,
  defaultRollNumberConfiguration,
} from '../onboarding-settings-model';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ title, children }: { title: string; children: ReactNode }) => (
    <div role="dialog" aria-label={title}>
      <h2>{title}</h2>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('Student assignment dialog', () => {
  it('reacts to an identifier series saved through the onboarding settings provider', () => {
    function ConnectedAssignmentProbe() {
      const { settings, saveGrNumberConfiguration } = useOnboardingSettings();

      return (
        <>
          <button
            type="button"
            onClick={() =>
              saveGrNumberConfiguration({
                ...defaultGrNumberConfiguration,
                name: 'Applied settings series',
                prefix: 'LIVE-',
                startingNumber: 75,
                padding: 3,
              })
            }
          >
            Apply GR settings
          </button>
          <StudentAssignmentDialog
            assignmentType="gr-number"
            students={[studentOnboardingPreviewData[3]]}
            configuration={settings}
            onClose={vi.fn()}
          />
        </>
      );
    }

    render(
      <OnboardingSettingsProvider>
        <ConnectedAssignmentProbe />
      </OnboardingSettingsProvider>
    );

    expect(screen.getAllByText(/GR-000001/).length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole('button', { name: 'Apply GR settings' }));
    expect(screen.getAllByText(/LIVE-075/).length).toBeGreaterThanOrEqual(1);
  });

  it('supports automatic and student-wise manual roll-number previews', () => {
    render(
      <StudentAssignmentDialog
        assignmentType="roll-number"
        students={[studentOnboardingPreviewData[0], studentOnboardingPreviewData[3]]}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('2 students selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Automatic' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('table', { name: 'Assign Roll No. preview' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Manual' }));
    expect(screen.getByLabelText('Roll No. for Aanya Sharma')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll No. for Arjun Desai')).toBeInTheDocument();
    expect(
      screen.getByText(/requires approval for manual identifier assignment/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Roll No. for Aanya Sharma'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Roll No. for Arjun Desai'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Reason for manual assignment/i }), {
      target: { value: 'Initial roll assignment' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm preview' }));

    expect(
      screen.getByText(/Preview confirmed.*No student records were changed/i)
    ).toBeInTheDocument();
  });

  it('shows individual division assignment controls', () => {
    render(
      <StudentAssignmentDialog
        assignmentType="division"
        students={[studentOnboardingPreviewData[0]]}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Assign Division' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Manual' }));
    expect(screen.getByLabelText('Division for Aanya Sharma')).toBeInTheDocument();
  });

  it('enforces the applied division assignment method and reason policy', () => {
    render(
      <StudentAssignmentDialog
        assignmentType="division"
        students={[studentOnboardingPreviewData[0]]}
        configuration={{
          ...defaultOnboardingSettings,
          onboardingProfiles: defaultOnboardingSettings.onboardingProfiles.map((profile) => ({
            ...profile,
            rules: { ...profile.rules, approvalMode: 'none', requireApproval: false },
          })),
          divisionChange: {
            ...defaultOnboardingSettings.divisionChange,
            configurations: defaultOnboardingSettings.divisionChange.configurations.map(
              (configuration) => ({
                ...configuration,
                assignmentMode: 'manual',
                requireReason: false,
                requireApproval: false,
                recalculateRollNumber: false,
              })
            ),
          },
        }}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Automatic' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manual' })).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.queryByRole('textbox', { name: /Reason for manual assignment/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm preview' })).toBeEnabled();
    expect(screen.getByText(/without a separate approval/i)).toBeInTheDocument();
    expect(screen.getByText(/resolved rules preserve the existing roll number/i)).toBeInTheDocument();
  });

  it('uses the applied GR series for automatic assignment', () => {
    render(
      <StudentAssignmentDialog
        assignmentType="gr-number"
        students={[studentOnboardingPreviewData[3]]}
        configuration={{
          ...defaultOnboardingSettings,
          grNumber: {
            assignmentMode: 'automatic',
            configurations: [
              {
                ...defaultGrNumberConfiguration,
                id: 'test-series',
                name: 'Test GR series',
                prefix: 'TEST-',
                startingNumber: 50,
                padding: 3,
                suffix: '',
                formatPattern: '{PREFIX}{YEAR_SHORT}-{SEQUENCE}{SUFFIX}',
              },
            ],
          },
        }}
        configurationScope={{
          level: 'academic-year',
          key: 'school:current:academic-year:test',
          label: 'Academic year — 2026-27',
          schoolName: 'Test school',
          academicYearName: '2026-27',
        }}
        onClose={vi.fn()}
      />
    );

    expect(screen.getAllByText(/TEST-26-27-050/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('button', { name: 'Manual' })).not.toBeInTheDocument();
  });

  it('hides GR series that do not apply to the selected onboarding profile', () => {
    render(
      <StudentAssignmentDialog
        assignmentType="gr-number"
        students={[studentOnboardingPreviewData[3]]}
        configuration={{
          ...defaultOnboardingSettings,
          grNumber: {
            assignmentMode: 'both',
            configurations: [
              {
                ...defaultGrNumberConfiguration,
                id: 'fresh-only',
                name: 'Fresh admission only',
                applicableProfileIds: ['fresh-admission'],
              },
            ],
          },
        }}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.getByText(/No active GR series applies to every selected student/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm preview' })).toBeDisabled();
  });

  it('enforces the selected GR series manual-entry controls', () => {
    render(
      <StudentAssignmentDialog
        assignmentType="gr-number"
        students={[studentOnboardingPreviewData[3]]}
        configuration={{
          ...defaultOnboardingSettings,
          grNumber: {
            assignmentMode: 'both',
            configurations: [
              {
                ...defaultGrNumberConfiguration,
                manualEntryAllowed: false,
              },
            ],
          },
        }}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Automatic' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manual' })).not.toBeInTheDocument();
  });

  it('blocks automatic GR assignment when the configured range is exhausted', () => {
    const firstStudent = studentOnboardingPreviewData[3];
    const secondStudent = {
      ...studentOnboardingPreviewData[0],
      id: 'preview-range-002',
      grNo: null,
      grPreview: null,
    };

    render(
      <StudentAssignmentDialog
        assignmentType="gr-number"
        students={[firstStudent, secondStudent]}
        configuration={{
          ...defaultOnboardingSettings,
          grNumber: {
            assignmentMode: 'automatic',
            configurations: [
              {
                ...defaultGrNumberConfiguration,
                startingNumber: 1,
                maximumNumber: 1,
              },
            ],
          },
        }}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/does not have enough numbers remaining/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm preview' })).toBeDisabled();
  });

  it('applies entire-class Roll scope, ordering rules, and individual locks', () => {
    const zoya = {
      ...studentOnboardingPreviewData[0],
      id: 'roll-zoya',
      studentName: 'Zoya Shah',
      standardName: 'Grade 6',
      divisionName: 'A',
      rollNo: null,
      rollNumberLocked: false,
    };
    const aarav = {
      ...studentOnboardingPreviewData[2],
      id: 'roll-aarav',
      studentName: 'Aarav Shah',
      standardName: 'Grade 6',
      divisionName: 'B',
      rollNo: 9,
      rollNumberLocked: true,
    };

    render(
      <StudentAssignmentDialog
        assignmentType="roll-number"
        students={[zoya, aarav]}
        configuration={{
          ...defaultOnboardingSettings,
          rollNumber: {
            assignmentMode: 'automatic',
            configurations: [
              {
                ...defaultRollNumberConfiguration,
                numberingScope: 'class',
                preserveExisting: false,
                orderingRules: [{ field: 'studentName', direction: 'ascending' }],
              },
            ],
          },
        }}
        onClose={vi.fn()}
      />
    );

    const zoyaRow = screen.getByText('Zoya Shah').closest('tr');
    const aaravRow = screen.getByText('Aarav Shah').closest('tr');
    expect(zoyaRow).not.toBeNull();
    expect(aaravRow).not.toBeNull();
    expect(within(zoyaRow as HTMLElement).getByText('1')).toBeInTheDocument();
    expect(within(aaravRow as HTMLElement).getAllByText('9').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText('Lock Roll No. for Aarav Shah')).toBeChecked();
  });

  it('blocks automatic Roll assignment when the mid-year policy requires manual entry', () => {
    render(
      <StudentAssignmentDialog
        assignmentType="roll-number"
        students={[studentOnboardingPreviewData[3]]}
        configuration={{
          ...defaultOnboardingSettings,
          rollNumber: {
            assignmentMode: 'both',
            configurations: [
              {
                ...defaultRollNumberConfiguration,
                midYearHandling: 'manual',
              },
            ],
          },
        }}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.getByText(/mid-year policy requires manual Roll-number assignment/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Manual required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm preview' })).toBeDisabled();
  });

  it('blocks Division assignment when every target is over capacity', () => {
    const student = {
      ...studentOnboardingPreviewData[3],
      divisionPlacementOptions: [
        { divisionName: 'A', currentStudentCount: 30, capacity: 30 },
        { divisionName: 'B', currentStudentCount: 30, capacity: 30 },
        { divisionName: 'C', currentStudentCount: 30, capacity: 30 },
      ],
    };

    render(
      <StudentAssignmentDialog
        assignmentType="division"
        students={[student]}
        configuration={{
          ...defaultOnboardingSettings,
          divisionChange: {
            ...defaultOnboardingSettings.divisionChange,
            configurations: defaultOnboardingSettings.divisionChange.configurations.map(
              (configuration) => ({
                ...configuration,
                capacityRequired: true,
                overCapacityBehavior: 'block',
              })
            ),
          },
        }}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/blocked by missing or exhausted capacity/i)).toBeInTheDocument();
    expect(screen.getByText('Capacity blocked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm preview' })).toBeDisabled();
  });
});
