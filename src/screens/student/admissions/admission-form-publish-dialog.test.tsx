import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AdmissionFormPublishDialog } from './admission-form-publish-dialog';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-testid={icon} />,
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormUsageQuery: () => ({
    data: { offeringCount: 0, applicationCount: 0 },
    isError: false,
  }),
}));

const props = () => ({
  form: { id: 'draft', name: 'Admission inquiry', version: 1 } as AdmissionForm,
  issues: [] as string[] | null,
  validating: false,
  publishing: false,
  onClose: vi.fn(),
  onEdit: vi.fn(),
  onPublish: vi.fn(),
});

describe('Admission form publish confirmation', () => {
  it('uses the shared information icon and shows the publish consequence', () => {
    const callbacks = props();
    render(<AdmissionFormPublishDialog {...callbacks} />);

    expect(screen.getByRole('dialog', { name: 'Publish Admission inquiry?' })).toBeVisible();
    expect(screen.getByTestId('InfoIcon')).toBeVisible();
    expect(screen.getAllByTestId('mdi:publish')).toHaveLength(1);
    expect(screen.queryByTestId('WarningAmberIcon')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Version 1 will become available for new admission offerings/)
    ).toBeVisible();
    expect(screen.getByText(/Published versions cannot be edited/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Publish Form' }));
    expect(callbacks.onPublish).toHaveBeenCalledOnce();
  });

  it.each(['validating', 'publishing'] as const)('locks confirmation while %s', (state) => {
    const callbacks = { ...props(), [state]: true };
    render(<AdmissionFormPublishDialog {...callbacks} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    const publish = screen.getByRole('button', { name: 'Publish Form' });
    expect(publish).toBeDisabled();
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(publish).toContainElement(screen.getByRole('progressbar'));
    expect(screen.queryByText(/Checking every field/)).not.toBeInTheDocument();
    expect(screen.getByText(/Version 1 will become available/)).toBeVisible();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(callbacks.onClose).not.toHaveBeenCalled();
  });

  it('keeps failed readiness checks visible and offers Edit instead of Publish', () => {
    const callbacks = { ...props(), issues: ['Add a required student name field.'] };
    render(<AdmissionFormPublishDialog {...callbacks} />);

    expect(screen.getByRole('dialog', { name: 'Form Needs Changes' })).toBeVisible();
    expect(screen.getByText('Add a required student name field.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Publish Form' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Draft' }));
    expect(callbacks.onEdit).toHaveBeenCalledOnce();
  });
});
