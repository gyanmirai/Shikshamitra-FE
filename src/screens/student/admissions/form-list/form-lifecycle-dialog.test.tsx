import type {
  AdmissionForm,
  AdmissionFormArchiveImpact,
} from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react';

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
  it.each([
    {
      type: 'Inquiry',
      purpose: 0,
      name: 'Inquiry 2026',
      offeringCount: 2,
      workflowCount: 1,
      counts: '2 offerings and 1 workflow',
    },
    {
      type: 'Registration',
      purpose: 1,
      name: 'QA Advanced Print QAP66436004',
      offeringCount: 1,
      workflowCount: 4,
      counts: '1 offering and 4 workflows',
    },
  ] as const)(
    'shows the compact $type archive confirmation',
    ({ type, purpose, name, offeringCount, workflowCount, counts }) => {
      const onConfirm = vi.fn();
      render(
        <FormLifecycleDialog
          {...props}
          pending={{ action: 'archive', form: { ...form, name, purpose } }}
          impact={{ ...impact, formName: name, purpose, offeringCount, workflowCount }}
          onConfirm={onConfirm}
        />
      );
      const dialog = screen.getByRole('dialog', { name: `Archive ${type} Form?` });
      const message = within(dialog).getByText(name).closest('p');
      expect(message).toHaveTextContent(
        `Are you sure you want to archive ${name}? This form is linked to ${counts}.`
      );
      expect(dialog).not.toHaveTextContent(
        /blocked|Linked Items|Public Inquiry Links|Class 1 English/
      );
      fireEvent.click(within(dialog).getByRole('button', { name: 'Archive' }));
      expect(onConfirm).toHaveBeenCalledOnce();
      cleanup();
    }
  );
  it('shows zero counts without implying that restricted links are visible', () => {
    render(
      <FormLifecycleDialog
        {...props}
        impact={{ ...impact, offeringCount: 0, workflowCount: 0, hasRestrictedDependencies: true }}
      />
    );
    expect(screen.getByText(form.name).closest('p')).toHaveTextContent(
      'This form is linked to 0 offerings and 0 workflows in your permitted scope.'
    );
    cleanup();
  });
  it('does not offer archive before dependency verification finishes', () => {
    render(<FormLifecycleDialog {...props} impact={undefined} loading canConfirm={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Checking Form Usage');
    expect(screen.getByText(form.name).closest('p')).not.toHaveTextContent('linked to');
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
  it('offers reload after a stale archive check and keeps archive disabled', () => {
    const onReload = vi.fn();
    render(
      <FormLifecycleDialog
        {...props}
        canConfirm={false}
        error="This form has changed."
        requiresReload
        onReload={onReload}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('This form has changed.');
    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reload Latest' }));
    expect(onReload).toHaveBeenCalledOnce();
    cleanup();
  });
});
