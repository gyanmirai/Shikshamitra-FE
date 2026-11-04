import type {
  AdmissionForm,
  AdmissionFormArchiveImpact,
} from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { FormLifecycleDialog } from './form-lifecycle-dialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

const form = { id: 'form-1', name: 'Inquiry 2026', purpose: 0, status: 1 } as AdmissionForm;
const impact: AdmissionFormArchiveImpact = {
  formDefinitionId: form.id,
  formName: form.name,
  purpose: 0,
  status: 1,
  concurrencyStamp: 'latest',
  inquiryCount: 10,
  applicationCount: 3,
  offeringCount: 1,
  workflowCount: 1,
  publicLinkCount: 0,
  hasRestrictedOfferings: false,
  dependencies: [
    { kind: 'offering' as const, id: 'offering-1', name: 'Class 1 English' },
    {
      kind: 'workflow' as const,
      id: 'workflow-1',
      name: 'Standard admission',
      workflowStageName: 'Registration',
    },
  ],
};
const props = {
  pending: { action: 'archive' as const, form },
  impact,
  loading: false,
  busy: false,
  canConfirm: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
};

describe('form lifecycle decision', () => {
  it('shows linked dependencies and preserved historical data before archiving', () => {
    render(<FormLifecycleDialog {...props} />);
    expect(screen.getByRole('dialog', { name: 'Archive Inquiry Form?' })).toBeInTheDocument();
    expect(screen.getByText(/Class 1 English/)).toBeInTheDocument();
    expect(screen.getByText(/Standard admission/)).toBeInTheDocument();
    expect(screen.getByText(/10 Existing Inquiries/)).toBeInTheDocument();
    expect(screen.getByText(/saved answers and history/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    expect(props.onConfirm).toHaveBeenCalledOnce();
    cleanup();
  });
  it('does not offer archive before dependency verification finishes', () => {
    render(<FormLifecycleDialog {...props} impact={undefined} loading canConfirm={false} />);
    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    cleanup();
  });
  it('locks both actions during a write and explains restoration without deleting links', () => {
    render(
      <FormLifecycleDialog
        {...props}
        pending={{ action: 'restore', form: { ...form, status: 2 } }}
        busy
      />
    );
    expect(screen.getByRole('dialog', { name: 'Restore Inquiry Form?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restore' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByText(/same form version/i)).toBeInTheDocument();
    cleanup();
  });
  it('explains workflow consequences for a registration form', () => {
    render(
      <FormLifecycleDialog
        {...props}
        pending={{ action: 'archive', form: { ...form, purpose: 1 } }}
      />
    );
    expect(screen.getByRole('dialog', { name: 'Archive Registration Form?' })).toBeInTheDocument();
    expect(screen.getByText(/registration submissions/i)).toBeInTheDocument();
    cleanup();
  });
});
