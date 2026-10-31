import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { shikshaMitraToast } from 'src/components/toast';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { AdmissionInquiryDuplicateMatches } from './admission-inquiry-duplicate-matches';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled, helperText }: any) => (
    <>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select</option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && <span>{helperText}</span>}
    </>
  ),
}));

const parent = {
  sourceApplicantId: 'applicant-1',
  relationship: 'father' as const,
  name: 'Rahul Patel',
  firstName: 'Rahul',
  email: 'parent@example.com',
  mobile: '9876543210',
};

const match: DuplicateMatch = {
  applicantId: 'applicant-1',
  familyId: 'family-1',
  applicantName: 'Asha Patel',
  guardianPhone: '9876543210',
  canLinkFamily: true,
  parents: [parent],
};

it('disables parent linking for an explicitly selected Guardian before any family request', async () => {
  const useFamily = vi.fn();
  render(
    <AdmissionInquiryDuplicateMatches
      matches={[match]}
      guardianPhone="9876543210"
      parentRelationship="guardian"
      busy={false}
      onUseExisting={useFamily}
      onOpenExisting={vi.fn()}
      onCreateSeparate={vi.fn()}
      overrideReason=""
      onOverrideReasonChange={vi.fn()}
    />
  );
  const addSibling = screen.getByRole('button', { name: 'Add sibling' });
  expect(addSibling).toBeDisabled();
  fireEvent.click(addSibling);
  expect(useFamily).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Different family?' })).toBeEnabled();
  expect(addSibling.parentElement!).toHaveAttribute('tabindex', '0');
  fireEvent.mouseOver(addSibling.parentElement!);
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Sibling linking requires Father or Mother as the primary contact.'
  );
});

it('prioritizes an existing current-cycle inquiry while retaining deliberate sibling review', () => {
  const openExisting = vi.fn();
  const useFamily = vi.fn();
  render(
    <AdmissionInquiryDuplicateMatches
      matches={[
        { ...match, existingInquiryId: 'inquiry-1', existingInquiryAdmissionCycleId: 'cycle-1' },
      ]}
      applicantName=" Asha   Patel "
      admissionCycleId="cycle-1"
      guardianPhone="9876543210"
      busy={false}
      onUseExisting={useFamily}
      onOpenExisting={openExisting}
      onCreateSeparate={vi.fn()}
      overrideReason=""
      onOverrideReasonChange={vi.fn()}
    />
  );
  expect(screen.getByRole('heading', { name: 'Possible Duplicate Inquiry' })).toBeVisible();
  expect(screen.queryByLabelText('Parent')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Open existing inquiry' }));
  expect(openExisting).toHaveBeenCalledWith('inquiry-1');
  expect(useFamily).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Different child? Review family' }));
  expect(screen.getByLabelText('Parent')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Add sibling' })).toBeEnabled();
});

it('keeps the review dialog local, reopens after resubmission and locks dismissal during saving', async () => {
  const store = configureStore({ reducer: { confirmPopup: () => ({ isChanges: true }) } });
  const props = {
    matches: [match],
    presentation: 'dialog' as const,
    guardianPhone: '9876543210',
    onUseExisting: vi.fn(),
    onOpenExisting: vi.fn(),
    onCreateSeparate: vi.fn(),
    overrideReason: '',
    onOverrideReasonChange: vi.fn(),
  };
  const view = render(
    <Provider store={store}>
      <AdmissionInquiryDuplicateMatches {...props} reviewKey={1} busy={false} />
    </Provider>
  );
  const review = screen.getByRole('dialog', { name: 'Existing Family Found' });
  fireEvent.click(within(review).getByRole('button', { name: 'Back to form' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  view.rerender(
    <Provider store={store}>
      <AdmissionInquiryDuplicateMatches {...props} reviewKey={2} busy />
    </Provider>
  );
  const busyReview = await screen.findByRole('dialog', { name: 'Existing Family Found' });
  expect(within(busyReview).getByRole('button', { name: 'Back to form' })).toBeDisabled();
  expect(within(busyReview).getByRole('button', { name: /^close$/i })).toBeDisabled();
});

function renderMatches(guardianPhone: string, candidate = match) {
  const onUseExisting = vi.fn();
  render(
    <AdmissionInquiryDuplicateMatches
      matches={[candidate]}
      guardianPhone={guardianPhone}
      busy={false}
      onUseExisting={onUseExisting}
      onOpenExisting={vi.fn()}
      onCreateSeparate={vi.fn()}
      overrideReason=""
      onOverrideReasonChange={vi.fn()}
    />
  );
  return onUseExisting;
}

it('requires parent selection and explicit family confirmation before adding a sibling', async () => {
  const onUseExisting = renderMatches('9876543210');
  fireEvent.change(screen.getByLabelText('Parent'), { target: { value: 'applicant-1:father' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add sibling' }));
  const confirmation = await screen.findByRole('dialog', { name: 'Add Sibling?' });
  expect(onUseExisting).not.toHaveBeenCalled();
  fireEvent.click(within(confirmation).getByRole('button', { name: 'Add sibling' }));
  await waitFor(() => expect(onUseExisting).toHaveBeenCalledWith('family-1', parent));
});

it('offers only the configured parent role without selecting or relabelling another saved parent', () => {
  render(
    <AdmissionInquiryDuplicateMatches
      matches={[
        { ...match, parents: [parent, { ...parent, relationship: 'mother', name: 'Meera Patel' }] },
      ]}
      parentRelationship="father"
      guardianPhone="9876543210"
      busy={false}
      onUseExisting={vi.fn()}
      onOpenExisting={vi.fn()}
      onCreateSeparate={vi.fn()}
      overrideReason=""
      onOverrideReasonChange={vi.fn()}
    />
  );
  expect(screen.getByRole('option', { name: 'Father · Rahul Patel' })).toBeInTheDocument();
  expect(screen.queryByRole('option', { name: /Mother/ })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Parent')).toHaveValue('');
});

it('does not offer family linking for a name-only match with a different mobile', () => {
  const onUseExisting = renderMatches('9876543211');

  expect(screen.getByRole('button', { name: 'Add sibling' })).toBeDisabled();
  expect(screen.getByText(/Parent contact details do not match/)).toBeInTheDocument();
  expect(onUseExisting).not.toHaveBeenCalled();
});

it('allows same-email different-mobile only after deliberate parent and family confirmation', async () => {
  const onUseExisting = renderMatches('9876543211', {
    ...match,
    matchByEmail: true,
    matchByMobile: false,
  });
  fireEvent.change(screen.getByLabelText('Parent'), { target: { value: 'applicant-1:father' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add sibling' }));
  const dialog = await screen.findByRole('dialog', { name: 'Add Sibling?' });
  expect(within(dialog).getByText(/entered mobile differs/)).toBeInTheDocument();
  expect(onUseExisting).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add sibling' }));
  await waitFor(() => expect(onUseExisting).toHaveBeenCalledWith('family-1', parent));
});
it('does not guess a parent when both Father and Mother are available', async () => {
  const onUseExisting = renderMatches('9876543210', {
    ...match,
    parents: [
      parent,
      { ...parent, relationship: 'mother', name: 'Meera Patel', email: 'mother@example.com' },
    ],
  });
  expect(screen.getByLabelText('Parent')).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Add sibling' }));
  await screen.findByText('Select a parent.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onUseExisting).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Parent'), { target: { value: 'applicant-1:mother' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add sibling' }));
  const dialog = await screen.findByRole('dialog', { name: 'Add Sibling?' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(onUseExisting).not.toHaveBeenCalled();
});

it('requires Father or Mother for a legacy generic parent without inventing the relationship', async () => {
  const onUseExisting = renderMatches('9876543210', {
    ...match,
    parents: [{ ...parent, relationship: null }],
  });
  fireEvent.change(screen.getByLabelText('Parent'), { target: { value: 'applicant-1:parent' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add sibling' }));
  await screen.findByText('Select Father or Mother.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Guardian' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: 'mother' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add sibling' }));
  const dialog = await screen.findByRole('dialog', { name: 'Add Sibling?' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add sibling' }));
  await waitFor(() =>
    expect(onUseExisting).toHaveBeenCalledWith('family-1', { ...parent, relationship: 'mother' })
  );
});

it('honors the server decision even when the mobile numbers match', () => {
  const onUseExisting = renderMatches('9876543210', { ...match, canLinkFamily: false });

  expect(screen.getByRole('button', { name: 'Add sibling' })).toBeDisabled();
  expect(screen.getByText(/not available for linking/)).toBeInTheDocument();
  expect(onUseExisting).not.toHaveBeenCalled();
});

it('requires a nonblank reason before creating a separate family for a duplicate', () => {
  const createSeparate = vi.fn();
  const props = {
    matches: [match],
    guardianPhone: '9876543210',
    busy: false,
    onUseExisting: vi.fn(),
    onOpenExisting: vi.fn(),
    onCreateSeparate: createSeparate,
    onOverrideReasonChange: vi.fn(),
  };
  const view = render(<AdmissionInquiryDuplicateMatches {...props} overrideReason="   " />);
  fireEvent.click(screen.getByRole('button', { name: 'Different family?' }));
  expect(screen.getByRole('button', { name: 'Create separate family' })).toBeDisabled();
  view.rerender(
    <AdmissionInquiryDuplicateMatches
      {...props}
      overrideReason="Another family shares this number."
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Create separate family' }));
  expect(createSeparate).toHaveBeenCalledOnce();
});

it('keeps family matching controls in the form without publishing them to a toast', () => {
  vi.mocked(shikshaMitraToast.warning).mockClear();
  renderMatches('9876543210', {
    ...match,
    existingInquiryId: 'inquiry-1',
    existingInquiryNumber: 'INQ-2026-000030',
  });
  expect(screen.getByRole('heading', { name: 'Existing Family Found' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open inquiry' })).toBeInTheDocument();
  expect(screen.getByLabelText('Parent')).toBeInTheDocument();
  expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
});

it('announces newly found matches without moving interactive controls into the live region', () => {
  const props = {
    guardianPhone: '9876543210',
    busy: false,
    onUseExisting: vi.fn(),
    onOpenExisting: vi.fn(),
    onCreateSeparate: vi.fn(),
    overrideReason: '',
    onOverrideReasonChange: vi.fn(),
  };
  const view = render(<AdmissionInquiryDuplicateMatches {...props} matches={[]} />);
  const status = screen.getByRole('status');
  expect(status).toBeEmptyDOMElement();
  view.rerender(<AdmissionInquiryDuplicateMatches {...props} matches={[match]} />);
  expect(status).toHaveTextContent('1 possible existing family found');
  expect(within(status).queryByRole('button')).not.toBeInTheDocument();
});

it('discloses the separate-family reason only on click and retains its draft on collapse', async () => {
  function Draft() {
    const [reason, setReason] = useState('');
    return (
      <AdmissionInquiryDuplicateMatches
        matches={[match]}
        guardianPhone="9876543210"
        busy={false}
        onUseExisting={vi.fn()}
        onOpenExisting={vi.fn()}
        onCreateSeparate={vi.fn()}
        overrideReason={reason}
        onOverrideReasonChange={setReason}
      />
    );
  }
  render(<Draft />);
  const toggle = screen.getByRole('button', { name: 'Different family?' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByLabelText(/Reason for creating a separate family/)).not.toBeInTheDocument();
  fireEvent.click(toggle);
  const field = await screen.findByLabelText(/Reason for creating a separate family/);
  fireEvent.change(field, { target: { value: 'Two different families share this number.' } });
  fireEvent.click(toggle);
  await waitFor(() =>
    expect(screen.queryByLabelText(/Reason for creating a separate family/)).not.toBeInTheDocument()
  );
  fireEvent.click(toggle);
  expect(await screen.findByLabelText(/Reason for creating a separate family/)).toHaveValue(
    'Two different families share this number.'
  );
});

it('locks the disclosed reason and all family actions while the owner is saving', () => {
  const props = {
    matches: [{ ...match, existingInquiryId: 'inquiry-1' }],
    guardianPhone: '9876543210',
    onUseExisting: vi.fn(),
    onOpenExisting: vi.fn(),
    onCreateSeparate: vi.fn(),
    overrideReason: 'A different family.',
    onOverrideReasonChange: vi.fn(),
  };
  const view = render(<AdmissionInquiryDuplicateMatches {...props} busy={false} />);
  fireEvent.click(screen.getByRole('button', { name: 'Different family?' }));
  view.rerender(<AdmissionInquiryDuplicateMatches {...props} busy />);
  expect(screen.getByLabelText(/Reason for creating a separate family/)).toBeDisabled();
  ['Different family?', 'Open inquiry', 'Add sibling', 'Create separate family'].forEach((name) => {
    expect(screen.getByRole('button', { name })).toBeDisabled();
  });
});
