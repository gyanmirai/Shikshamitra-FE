import { it, vi, expect } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { studentPaths } from 'src/constants/student-menu';
import { screen, fireEvent } from '@testing-library/react';

import { InquiryHandoffIssueDialog } from './inquiry-handoff-issue-dialog';

import type { InquiryHandoffIssue } from './inquiry-handoff-issue';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));

const issue: InquiryHandoffIssue = {
  inquiry: { applicantName: 'Ritika Sinha', inquiryNumber: 'INQ-2026-000006' },
  formName: 'DM 8th INQ FORM',
  formDefinitionId: 'form-1',
};

it('opens the existing restore confirmation destination for staff with both view and manage access', () => {
  renderWithProviders(
    <InquiryHandoffIssueDialog
      issue={issue}
      access={{ canView: true, canManage: true }}
      onClose={vi.fn()}
    />
  );
  expect(screen.getByRole('dialog', { name: 'Inquiry Form Archived' })).toBeInTheDocument();
  expect(screen.getByText(/Ritika Sinha/)).toHaveTextContent('INQ-2026-000006');
  expect(screen.getByText(/DM 8th INQ FORM/)).toHaveTextContent('is archived');
  expect(screen.getByRole('link', { name: 'Restore form' })).toHaveAttribute(
    'href',
    `${studentPaths.enrollment.settings.forms}?restoreForm=form-1&search=DM+8th+INQ+FORM`
  );
  expect(screen.getByText(/Restoring also makes/)).toBeInTheDocument();
  expect(screen.queryByText(/Change form/i)).not.toBeInTheDocument();
});

it('offers a form preview and administrator guidance for view-only staff', () => {
  renderWithProviders(
    <InquiryHandoffIssueDialog
      issue={issue}
      access={{ canView: true, canManage: false }}
      onClose={vi.fn()}
    />
  );
  expect(screen.queryByRole('link', { name: 'Restore form' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View form' })).toHaveAttribute(
    'href',
    expect.stringContaining('/form-1/preview?')
  );
  expect(screen.getByText(/Ask your admission administrator/)).toBeInTheDocument();
});

it.each([
  { canView: false, canManage: false },
  { canView: false, canManage: true },
])('does not expose inaccessible settings routes with access %j', (access) => {
  renderWithProviders(
    <InquiryHandoffIssueDialog issue={issue} access={access} onClose={vi.fn()} />
  );
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText(/Ask your admission administrator/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Back to inquiries' })).toBeInTheDocument();
});

it('does not claim to restore a specific form when an older response has no form ID', () => {
  renderWithProviders(
    <InquiryHandoffIssueDialog
      issue={{ ...issue, formDefinitionId: undefined }}
      access={{ canView: true, canManage: true }}
      onClose={vi.fn()}
    />
  );
  expect(screen.queryByRole('link', { name: 'Restore form' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open admission forms' })).toHaveAttribute(
    'href',
    studentPaths.enrollment.settings.forms
  );
});

it('stays open until dismissed and supports the shared Escape/close and footer actions', () => {
  const onClose = vi.fn();
  const view = renderWithProviders(
    <InquiryHandoffIssueDialog
      issue={issue}
      access={{ canView: false, canManage: false }}
      onClose={onClose}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back to inquiries' }));
  fireEvent.click(screen.getByRole('button', { name: 'close' }));
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(3);
  view.rerender(
    <InquiryHandoffIssueDialog
      issue={null}
      access={{ canView: true, canManage: true }}
      onClose={onClose}
    />
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
