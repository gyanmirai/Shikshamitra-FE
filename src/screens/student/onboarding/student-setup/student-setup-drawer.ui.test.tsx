import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentSetupDrawer from './student-setup-drawer';
import { studentOnboardingPreviewData } from './student-onboarding-preview-data';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const student = studentOnboardingPreviewData[0];

describe('Student Setup drawer readiness UI', () => {
  it('shows the focused onboarding sections and keeps preview actions disabled', () => {
    const onAssignDivision = vi.fn();
    const onAssignGrNumber = vi.fn();
    const onAssignRollNumber = vi.fn();
    render(
      <StudentSetupDrawer
        open
        student={student}
        onClose={vi.fn()}
        onAssignDivision={onAssignDivision}
        onAssignGrNumber={onAssignGrNumber}
        onAssignRollNumber={onAssignRollNumber}
      />
    );

    expect(screen.getByRole('heading', { name: student.studentName })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Admission handoff' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Placement' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Identifiers' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Accounts & access' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Readiness & activation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Activity & audit' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Change Division' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assign GR No.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assign Roll No.' }));
    expect(onAssignDivision).toHaveBeenCalledOnce();
    expect(onAssignGrNumber).toHaveBeenCalledOnce();
    expect(onAssignRollNumber).toHaveBeenCalledOnce();

    expect(screen.getByRole('button', { name: 'Run Readiness Check' })).toBeDisabled();
    expect(screen.getByText(/preview changes are not persisted/i)).toBeInTheDocument();
  });

  it('does not render a drawer when no student is selected', () => {
    render(<StudentSetupDrawer open student={null} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
