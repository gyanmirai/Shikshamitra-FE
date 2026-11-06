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
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
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
    busy: false,
    onUseExisting: vi.fn(),
    onOpenExisting: vi.fn(),
    ...overrides,
  };
  const content = (next = props) => (
    <Provider store={store}>
      <AdmissionInquiryDuplicateMatches {...next} />
    </Provider>
  );
  return { ...render(content()), props, content };
}
it('shows one saved parent with read-only children and no separate-family bypass', async () => {
  const { props } = setup({
    matches: [
      match,
      {
        ...match,
        applicantId: 'child-2',
        applicantName: 'Anya Patel',
        parents: [{ ...parent, sourceApplicantId: 'child-2' }],
      },
    ],
  });
  expect(screen.getByText('Rahul Patel')).toBeVisible();
  const children = screen.getByRole('list', { name: 'Children in this family' });
  expect(within(children).getAllByRole('listitem')).toHaveLength(2);
  expect(within(children).queryByRole('button')).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(
    screen.queryByText(/Separate Family|Different Family|Match Details/i)
  ).not.toBeInTheDocument();
  expect(screen.getByText('This mobile number and email match a saved parent.')).toBeVisible();
  expect(props.onUseExisting).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() =>
    expect(props.onUseExisting).toHaveBeenCalledExactlyOnceWith('family-1', parent)
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('never combines different family IDs because the contacts match', async () => {
  const { props } = setup({
    matches: [
      match,
      {
        ...match,
        familyId: 'family-2',
        applicantId: 'child-2',
        applicantName: 'Riya Shah',
        parents: [{ ...parent, name: 'Other Parent', sourceApplicantId: 'child-2' }],
      },
    ],
  });
  const select = screen.getByLabelText('Parent');
  expect(select).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  fireEvent.change(select, {
    target: {
      value: (screen.getByRole('option', { name: /Other Parent/ }) as HTMLOptionElement).value,
    },
  });
  const children = screen.getByRole('list', { name: 'Children in this family' });
  expect(within(children).getByText('Riya Shah')).toBeVisible();
  expect(within(children).queryByText('Asha Patel')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() =>
    expect(props.onUseExisting).toHaveBeenCalledWith(
      'family-2',
      expect.objectContaining({ sourceApplicantId: 'child-2' })
    )
  );
});
it('retains exact-child duplicate review before allowing sibling creation', async () => {
  const { props } = setup({
    matches: [
      { ...match, existingInquiryId: 'inquiry-1', existingInquiryAdmissionCycleId: 'cycle' },
    ],
    applicantName: 'Asha Patel',
    admissionCycleId: 'cycle',
  });
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Open Existing Inquiry' }));
  expect(props.onOpenExisting).toHaveBeenCalledWith('inquiry-1');
  fireEvent.click(screen.getByRole('button', { name: 'Different Child? Review Parent' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() => expect(props.onUseExisting).toHaveBeenCalledOnce());
});
it.each([
  { parentRelationship: 'guardian' as const },
  { matches: [{ ...match, canLinkFamily: false }] },
  { guardianPhone: '9876543211', guardianEmail: '' },
])('blocks unsafe/unmatched linking %j', (override) => {
  const { props } = setup(override);
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  expect(props.onUseExisting).not.toHaveBeenCalled();
});
it('explains email-only matching and different saved mobile without a nested dialog', async () => {
  const { props } = setup({
    guardianPhone: '9876543211',
    matches: [{ ...match, matchByEmail: true, matchByMobile: false }],
  });
  expect(screen.getByText('This email matches a saved parent.')).toBeVisible();
  expect(screen.getByText(/saved mobile is different/i)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() => expect(props.onUseExisting).toHaveBeenCalledOnce());
});
it('requires explicit Father/Mother for a legacy generic parent', async () => {
  const { props } = setup({
    matches: [{ ...match, parents: [{ ...parent, relationship: null }] }],
  });
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Relationship to Student'), {
    target: { value: 'mother' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() =>
    expect(props.onUseExisting).toHaveBeenCalledWith('family-1', {
      ...parent,
      relationship: 'mother',
    })
  );
});
it('closes locally to edit contact details and reopens on new submission', async () => {
  const view = setup({ presentation: 'dialog', reviewKey: 1 });
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Check Parent Details' })).getByRole('button', {
      name: 'Edit Contact Details',
    })
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(store.getState().confirmPopup.isChanges).toBe(true);
  view.rerender(view.content({ ...view.props, reviewKey: 2 }));
  expect(await screen.findByRole('dialog', { name: 'Check Parent Details' })).toBeVisible();
});
it('prevents repeated writes and locks close while confirming', async () => {
  let finish!: () => void;
  const save = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  setup({ presentation: 'dialog', onUseExisting: save });
  const add = screen.getByRole('button', { name: 'Add as Sibling' });
  fireEvent.click(add);
  fireEvent.click(add);
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(add).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Edit Contact Details' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  finish();
  await waitFor(() => expect(add).toBeEnabled());
});

it('keeps children informational without exposing their birth dates in parent match review', () => {
  render(
    <AdmissionInquiryDuplicateMatches
      matches={[{ ...match, dateOfBirth: '2016-04-05' }]}
      guardianPhone="9876543210"
      parentRelationship="father"
      busy={false}
      onUseExisting={vi.fn()}
      onOpenExisting={vi.fn()}
    />
  );
  expect(screen.getByRole('list', { name: 'Children in this family' })).toHaveTextContent(
    'Asha Patel'
  );
  expect(screen.queryByText(/DOB:/)).not.toBeInTheDocument();
  expect(screen.queryByText(/2016/)).not.toBeInTheDocument();
});
