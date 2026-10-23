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
  it('shows a publish badge and readiness details without a warning icon', () => {
    const callbacks = props();
    render(<AdmissionFormPublishDialog {...callbacks} />);

    expect(screen.getByRole('dialog', { name: 'Publish Admission inquiry?' })).toBeVisible();
    expect(screen.getAllByTestId('mdi:publish')).toHaveLength(2);
    expect(screen.queryByTestId('WarningAmberIcon')).not.toBeInTheDocument();
    expect(
      screen.getByText('All publish-readiness checks passed.', { exact: false })
    ).toBeVisible();
    expect(screen.getByText(/linked to 0 offerings and 0 applications/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Publish form' }));
    expect(callbacks.onPublish).toHaveBeenCalledOnce();
  });

  it.each(['validating', 'publishing'] as const)('locks confirmation while %s', (state) => {
    const callbacks = { ...props(), [state]: true };
    render(<AdmissionFormPublishDialog {...callbacks} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Publish form' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(callbacks.onClose).not.toHaveBeenCalled();
  });

  it('keeps failed readiness checks visible and offers Edit instead of Publish', () => {
    const callbacks = { ...props(), issues: ['Add a required student name field.'] };
    render(<AdmissionFormPublishDialog {...callbacks} />);

    expect(screen.getByRole('dialog', { name: 'Form needs changes' })).toBeVisible();
    expect(screen.getByText('Add a required student name field.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Publish form' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
    expect(callbacks.onEdit).toHaveBeenCalledOnce();
  });
});
