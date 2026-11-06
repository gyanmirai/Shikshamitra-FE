import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { it, vi, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { readOfferingConfigurationErrors } from './admission-offering-recovery';
import { AdmissionOfferingActionDialog } from './admission-offering-action-dialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
afterEach(cleanup);
const props = {
  pendingAction: {
    type: 'activate' as const,
    row: { id: 'offering-1', name: 'Class 1' } as AdmissionOfferingListItem,
  },
  commanding: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  onEdit: vi.fn(),
  activationErrors: [
    {
      code: 'FormNotPublished',
      message: 'Registration 2026 is archived. Restore it or choose a published form.',
      formDefinitionId: 'form-1',
      formName: 'Registration 2026',
      workflowDefinitionId: 'workflow-1',
      workflowStageName: 'Registration',
    },
  ],
};
it('shows exact form/workflow recovery destinations with access', () => {
  render(
    <AdmissionOfferingActionDialog {...props} canReviewForms canRestoreForms canReviewWorkflows />
  );
  expect(screen.getByRole('dialog', { name: 'Cannot Activate Offering' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Restore archived form' })).toHaveAttribute(
    'href',
    expect.stringContaining('restoreForm=form-1')
  );
  expect(screen.getByRole('link', { name: /Review workflow/ })).toHaveAttribute(
    'href',
    expect.stringContaining('/workflows/workflow-1')
  );
  expect(screen.getByRole('button', { name: 'Edit offering' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
});
it('hides recovery links without the related feature permissions', () => {
  render(<AdmissionOfferingActionDialog {...props} />);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Registration 2026');
});
it.each(['Cancel', 'Close'])(
  'allows %s during requirement reads while preventing activation',
  (control) => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <AdmissionOfferingActionDialog
        {...props}
        checkingRequirements
        activationErrors={[]}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
    expect(screen.getByRole('status', { name: 'Checking offering requirements' })).toBeVisible();
    expect(screen.queryByText('Activating Offering…')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: control })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: control }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  }
);
it('reads a race-time configuration failure from the ABP and ProblemDetails envelopes', () => {
  const errors = [{ Code: 'Archived', Message: 'Form archived', FormDefinitionId: 'form-1' }];
  [
    { error: { data: { ConfigurationErrors: errors } } },
    { data: { ConfigurationErrors: errors } },
  ].forEach((body) => {
    expect(readOfferingConfigurationErrors({ data: body })).toMatchObject([
      { code: 'Archived', message: 'Form archived', formDefinitionId: 'form-1' },
    ]);
  });
  expect(
    readOfferingConfigurationErrors({ data: { data: { ConfigurationErrors: [{}] } } })
  ).toEqual([]);
});
