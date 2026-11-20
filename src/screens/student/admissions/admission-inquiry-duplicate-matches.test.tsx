import type { ComponentProps } from 'react';
import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
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
        onChange={(e) => onChange(e.target.value)}
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
  sourceApplicantId: 'child-1',
  relationship: 'father' as const,
  name: 'Rahul Patel',
  firstName: 'Rahul',
  email: 'parent@example.com',
  mobile: '9876543210',
};
const match: DuplicateMatch = {
  applicantId: 'child-1',
  familyId: 'family-1',
  applicantName: 'Asha Patel',
  existingInquiryNumber: 'INQ-001',
  guardianPhone: parent.mobile,
  guardianEmail: parent.email,
  canLinkFamily: true,
  parents: [parent],
};
const store = configureStore({ reducer: { confirmPopup: () => ({ isChanges: true }) } });
function setup(overrides: Partial<ComponentProps<typeof AdmissionInquiryDuplicateMatches>> = {}) {
  const props = {
    matches: [match],
    guardianPhone: parent.mobile,
    guardianEmail: parent.email,
    applicantName: 'Priya Patel',
    busy: false,
    onUseExisting: vi.fn(),
    ...overrides,
  };
  const content = (next = props) => (
    <Provider store={store}>
      <AdmissionInquiryDuplicateMatches {...next} />
    </Provider>
  );
  return { ...render(content()), props, content };
}
it('confirms a single saved family using a child witness without showing parent fields or contact explanations', async () => {
  const { props } = setup({
    matches: [
      { ...match, dateOfBirth: '2016-04-05' },
      { ...match, applicantId: 'child-2', applicantName: 'Anya Patel' },
    ],
  });
  expect(
    screen.getByText('We found possible siblings. Confirm the children belong to the same family.')
  ).toBeVisible();
  expect(screen.queryByText('Priya Patel')).toBeNull();
  expect(screen.queryByText('Link with')).toBeNull();
  const children = screen.getByRole('list', { name: 'Children in this family' });
  expect(within(children).getAllByRole('listitem')).toHaveLength(2);
  expect(within(children).getByText('Asha Patel')).toBeVisible();
  expect(within(children).getByText('Anya Patel')).toBeVisible();
  expect(screen.getAllByText('INQ-001')).toHaveLength(2);
  expect(within(children).queryByRole('button')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.queryByText(/2016|DOB:/)).not.toBeInTheDocument();
  expect(
    screen.queryByText(
      /Rahul|9876543210|parent@example.com|saved parent|Separate Family|Relationship/i
    )
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await waitFor(() =>
    expect(props.onUseExisting).toHaveBeenCalledExactlyOnceWith('family-1', 'child-1')
  );
});
it('requires explicit family selection for distinct saved family IDs despite identical contacts', async () => {
  const { props } = setup({
    matches: [
      match,
      { ...match, familyId: 'family-2', applicantId: 'child-2', applicantName: 'Riya Shah' },
    ],
  });
  const select = screen.getByLabelText('Family');
  expect(select).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  fireEvent.change(select, { target: { value: 'family-2' } });
  const children = screen.getByRole('list', { name: 'Children in this family' });
  expect(within(children).getByText('Riya Shah')).toBeVisible();
  expect(within(children).queryByText('Asha Patel')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await waitFor(() =>
    expect(props.onUseExisting).toHaveBeenCalledExactlyOnceWith('family-2', 'child-2')
  );
});
it('returns to the draft from a duplicate warning even when a family can be linked', async () => {
  const { props } = setup({
    matches: [
      { ...match, existingInquiryId: 'inquiry-1', existingInquiryAdmissionCycleId: 'cycle' },
    ],
    applicantName: 'Asha Patel',
    admissionCycleId: 'cycle',
    presentation: 'dialog',
  });
  const warning = screen.getByRole('dialog', { name: 'Possible Duplicate Inquiry' });
  expect(within(warning).getByText(/check the name and mobile number/i)).toBeVisible();
  expect(within(warning).queryByRole('button', { name: 'Open Existing Inquiry' })).toBeNull();
  expect(within(warning).queryByRole('button', { name: 'Confirm siblings' })).toBeNull();
  expect(within(warning).queryByRole('button', { name: 'This is a different child' })).toBeNull();
  fireEvent.click(within(warning).getByRole('button', { name: 'Back to form' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(props.onUseExisting).not.toHaveBeenCalled();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});

it('returns to the form without saving from a DOB-only warning without a linkable family', async () => {
  const { props } = setup({
    matches: [
      {
        ...match,
        existingInquiryId: 'inquiry-1',
        existingInquiryAdmissionCycleId: 'cycle',
        dateOfBirth: '2016-04-05',
        canLinkFamily: false,
      },
    ],
    applicantName: 'Asha Patel',
    applicantDateOfBirth: '2016-04-05',
    admissionCycleId: 'cycle',
    presentation: 'dialog',
  });
  const warning = screen.getByRole('dialog', { name: 'Possible Duplicate Inquiry' });
  expect(within(warning).queryByRole('button', { name: 'This is a different child' })).toBeNull();
  fireEvent.click(within(warning).getByRole('button', { name: 'Back to form' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(props.onUseExisting).not.toHaveBeenCalled();
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});
it('disambiguates equal child names in separate families using saved inquiry references', async () => {
  const { props } = setup({
    matches: [
      match,
      { ...match, familyId: 'family-2', applicantId: 'child-2', existingInquiryNumber: 'INQ-002' },
    ],
  });
  expect(screen.getByRole('option', { name: 'Asha Patel · INQ-001' })).toBeVisible();
  const otherFamily = screen.getByRole('option', { name: 'Asha Patel · INQ-002' });
  fireEvent.change(screen.getByLabelText('Family'), {
    target: { value: (otherFamily as HTMLOptionElement).value },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await waitFor(() =>
    expect(props.onUseExisting).toHaveBeenCalledExactlyOnceWith('family-2', 'child-2')
  );
});
it('uses saved family identity to distinguish equal names without inquiry references', () => {
  setup({
    matches: [
      { ...match, existingInquiryNumber: null },
      { ...match, familyId: 'family-2', applicantId: 'child-2', existingInquiryNumber: null },
    ],
  });
  expect(screen.getByRole('option', { name: 'Asha Patel · family-1' })).toBeVisible();
  expect(screen.getByRole('option', { name: 'Asha Patel · family-2' })).toBeVisible();
});
it.each([
  { matches: [{ ...match, canLinkFamily: false }] },
  { guardianPhone: '9876543211', guardianEmail: '' },
])('blocks unavailable or unmatched families %j', (override) => {
  const { props } = setup(override);
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  expect(props.onUseExisting).not.toHaveBeenCalled();
});
it('allows family-only confirmation for guardian entry and legacy records without saved parent details', async () => {
  const { props } = setup({ parentRelationship: 'guardian', matches: [{ ...match, parents: [] }] });
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await waitFor(() =>
    expect(props.onUseExisting).toHaveBeenCalledExactlyOnceWith('family-1', 'child-1')
  );
});
it('cancels locally without changing the parent draft and reopens on a new submission', async () => {
  const view = setup({ presentation: 'dialog', reviewKey: 1 });
  const dialog = screen.getByRole('dialog', { name: 'Confirm Siblings' });
  expect(
    within(dialog).getByText(
      'We found a possible sibling. Confirm both children belong to the same family.'
    )
  ).toBeVisible();
  expect(within(dialog).getByText('Asha Patel')).toBeVisible();
  fireEvent.click(
    within(dialog).getByRole('button', {
      name: 'Cancel',
    })
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  view.rerender(view.content({ ...view.props, reviewKey: 2 }));
  expect(await screen.findByRole('dialog', { name: 'Confirm Siblings' })).toBeVisible();
});
it('locks repeated submits, cancel, and close while confirming', async () => {
  let finish!: () => void;
  const save = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  setup({ presentation: 'dialog', onUseExisting: save });
  const confirm = screen.getByRole('button', { name: 'Confirm siblings' });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(confirm).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  finish();
  await waitFor(() => expect(confirm).toBeEnabled());
});
