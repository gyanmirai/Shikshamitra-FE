import type { BulkAdmissionOfferingResult } from 'src/redux/student/admissions/admission-offerings-api';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';

import { BulkAdmissionOfferingPreview } from './bulk-admission-offering-preview';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const item = {
  standardId: 'class-1',
  code: 'ADM-CLASS-1',
  isValid: true,
  canSaveInactive: true,
  canActivate: true,
  errors: [],
};
const preview = (
  items: BulkAdmissionOfferingResult['items'],
  canCommit = true
): BulkAdmissionOfferingResult => ({
  items,
  canCommit,
  createdCount: 0,
  isPreview: true,
});
const renderPreview = (result: BulkAdmissionOfferingResult | null, canCreate = true) =>
  render(
    <BulkAdmissionOfferingPreview
      preview={result}
      canCreate={canCreate}
      standardNameById={{ 'class-1': 'Class 1', 'class-2': 'Class 2' }}
    />
  );

describe('Bulk offering preview', () => {
  it('uses the existing section card with clear class identity and inactive creation outcome', () => {
    renderPreview(preview([item]));
    expect(
      screen.getByRole('heading', { name: 'Preview offerings' }).closest('section')
    ).not.toBeNull();
    expect(screen.getByText('1 offering ready to create')).toBeVisible();
    expect(screen.getByText('Class 1')).toBeVisible();
    expect(screen.getByText('Offering code')).toBeVisible();
    expect(screen.getByText('ADM-CLASS-1')).toBeVisible();
    expect(screen.getByText(/saved as Inactive/)).toBeVisible();
    expect(screen.queryByText('After creation')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('shows each blocked class issue once in its own row instead of a repeated warning paragraph', () => {
    const duplicate = {
      code: 'OfferingDuplicate',
      message: 'An offering already exists for this class and cycle.',
    };
    renderPreview(
      preview(
        [
          { ...item, canSaveInactive: false, canActivate: false, errors: [duplicate, duplicate] },
          { ...item, standardId: 'class-2', code: 'ADM-CLASS-2' },
        ],
        false
      ),
      false
    );
    expect(screen.getByText('1 of 2 classes need changes')).toBeVisible();
    const row = screen.getByText('Class 1').closest('li')!;
    expect(within(row).getAllByText(duplicate.message)).toHaveLength(1);
    expect(within(row).getByText('Cannot create')).toBeVisible();
    expect(screen.getByText(/Nothing will be created until all class issues/)).toBeVisible();
  });

  it('does not block inactive preparation for activation-only issues', () => {
    renderPreview(
      preview([
        {
          ...item,
          canActivate: false,
          errors: [
            { code: 'WorkflowRequired', message: 'Select a published workflow before activation.' },
          ],
        },
      ])
    );
    expect(screen.getByText('Ready to create')).toBeVisible();
    expect(screen.getByText(/configuration needs attention before activation/)).toBeVisible();
    expect(screen.getByText(/Select a published workflow before activation\./)).toBeVisible();
  });

  it('shows common configuration issues once while keeping duplicate issues attached to each class', () => {
    const errors = [
      { code: 'WorkflowRequired', message: 'Choose a published workflow.' },
      { code: 'OfferingDuplicate', message: 'An offering already exists for this class.' },
    ];
    renderPreview(
      preview(
        [
          { ...item, canSaveInactive: false, errors },
          { ...item, standardId: 'class-2', canSaveInactive: false, errors },
        ],
        false
      ),
      false
    );
    expect(screen.getAllByText(/Choose a published workflow\./)).toHaveLength(1);
    expect(screen.getByText('Configuration checks')).toBeVisible();
    expect(screen.getByText('Published workflow')).toBeVisible();
    expect(screen.getAllByText('An offering already exists for this class.')).toHaveLength(2);
  });

  it('explains missing preview and provides a correction path', () => {
    renderPreview(null, false);
    expect(screen.getByRole('alert')).toHaveTextContent('Go Back and select at least one class');
  });

  it('does not show raw class IDs or a false readiness message for an invalid response', () => {
    renderPreview(
      preview(
        [{ ...item, standardId: 'unknown-private-id', canSaveInactive: false, errors: [] }],
        false
      ),
      false
    );
    expect(screen.getByText('Selected class')).toBeVisible();
    expect(screen.queryByText('unknown-private-id')).not.toBeInTheDocument();
    expect(screen.getByText(/could not be validated/)).toBeVisible();
  });

  it('keeps inquiry feedback beneath its configuration label, not in the class issue list', () => {
    renderPreview(
      preview(
        [
          {
            ...item,
            canSaveInactive: false,
            canActivate: false,
            errors: [
              { code: 'InquiryFormMissing', message: 'Published Inquiry Form is required.' },
              { code: 'Duplicate', message: 'An offering already exists for this class.' },
            ],
          },
        ],
        false
      ),
      false
    );
    const inquiry = screen.getByText('Inquiry form').parentElement!;
    expect(
      within(inquiry).getByText('Before activation: Published Inquiry Form is required.')
    ).toBeVisible();
    const row = screen.getByText('Class 1').closest('li')!;
    expect(within(row).queryByText(/Published Inquiry Form/)).not.toBeInTheDocument();
    expect(within(row).getByText('An offering already exists for this class.')).toBeVisible();
  });

  it('preserves unknown backend issues and deduplicates shared ones', () => {
    const errors = [{ code: 'NewBackendRule', message: 'Review this new server rule.' }];
    renderPreview(
      preview(
        [
          { ...item, canSaveInactive: false, errors },
          { ...item, standardId: 'class-2', canSaveInactive: false, errors },
        ],
        false
      ),
      false
    );
    expect(screen.getAllByText('Review this new server rule.')).toHaveLength(1);
    expect(screen.getByText('Other checks')).toBeVisible();
  });

  it('provides an edit action and disables it during a request', async () => {
    const onEdit = vi.fn();
    const props = { preview: preview([item]), canCreate: true, standardNameById: {}, onEdit };
    const view = render(<BulkAdmissionOfferingPreview {...props} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Edit selection' }));
    expect(onEdit).toHaveBeenCalledOnce();
    view.rerender(<BulkAdmissionOfferingPreview {...props} busy />);
    expect(screen.getByRole('button', { name: 'Edit selection' })).toBeDisabled();
  });
});
