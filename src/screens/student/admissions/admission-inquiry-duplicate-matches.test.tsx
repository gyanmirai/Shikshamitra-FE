import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { it, vi, expect } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { AdmissionInquiryDuplicateMatches } from './admission-inquiry-duplicate-matches';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
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
