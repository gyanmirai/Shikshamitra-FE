import { useState } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { WorkAssignmentField } from './work-assignment-field';
import { emptyWorkAssignment, type EmployeeWorkAssignment } from './work-assignment';

// The section's decorative icon must not make network requests in DOM tests.
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const query = vi.hoisted(() => ({
  currentData: undefined as { items: { id: string; label: string }[] } | undefined,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
}));
vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => query,
}));

function Form({
  initial = emptyWorkAssignment(),
  year = { id: 'year', name: '2026-27' },
  review = false,
  disabled = false,
  legacyDepartment,
}: {
  initial?: EmployeeWorkAssignment;
  year?: { id: string; name: string } | null;
  review?: boolean;
  disabled?: boolean;
  legacyDepartment?: string;
}) {
  const [value, setValue] = useState(initial);
  const [valid, setValid] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <>
      <WorkAssignmentField
        value={value}
        onChange={(next) => {
          setValue(next);
          setConfirmed(false);
        }}
        currentYear={year}
        onValidityChange={setValid}
        disabled={disabled}
        legacyDepartment={legacyDepartment}
        confirmation={review ? { checked: confirmed, onChange: setConfirmed } : undefined}
      />
      <output aria-label="Draft">{JSON.stringify(value)}</output>
      <button type="button" disabled={!valid || (review && !confirmed)}>
        Continue
      </button>
    </>
  );
}
beforeEach(() => {
  query.currentData = undefined;
  query.isFetching = false;
  query.isError = false;
  query.refetch.mockReset();
});

it('offers every mode without role restrictions and supports no academic setup', async () => {
  render(<Form year={null} />);
  expect(screen.getByRole('radio', { name: 'Decide later' })).toBeChecked();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  fireEvent.click(screen.getByRole('radio', { name: /School-wide/ }));
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!)).toEqual({
    mode: 'schoolWide',
    academicYearId: null,
    organizationIds: [],
  });
  fireEvent.click(screen.getByRole('radio', { name: 'Specific organization(s)' }));
  expect(screen.getByText(/Choose an academic year in the school context/)).toBeVisible();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled());
});

it('retains saved IDs on failed lookup, provides retry and revalidates after recovery', async () => {
  query.isError = true;
  const initial: EmployeeWorkAssignment = {
    mode: 'specificOrganizations',
    academicYearId: 'year',
    academicYearName: '2026-27',
    organizationIds: ['a', 'b'],
    organizationLabels: ['CBSE - English - Primary', 'GSEB - Gujarati - Secondary'],
  };
  const view = render(<Form initial={initial} />);
  expect(screen.getByText(/Could not load organizations/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationIds).toEqual([
    'a',
    'b',
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(query.refetch).toHaveBeenCalledOnce();
  query.isError = false;
  query.currentData = {
    items: [
      { id: 'a', label: 'CBSE - English - Primary' },
      { id: 'b', label: 'GSEB - Gujarati - Secondary' },
    ],
  };
  view.rerender(<Form initial={initial} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());
  query.currentData = { items: [{ id: 'a', label: 'CBSE - English - Primary' }] };
  view.rerender(<Form initial={initial} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled());
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationIds).toEqual([
    'a',
    'b',
  ]);
});

it('opens the shared searchable multiselect by keyboard and preserves selection when Escape closes it', async () => {
  query.currentData = {
    items: [
      { id: 'a', label: 'CBSE - English - Primary' },
      { id: 'b', label: 'GSEB - Gujarati - Secondary' },
    ],
  };
  render(
    <Form
      initial={{ mode: 'specificOrganizations', academicYearId: 'year', organizationIds: ['a'] }}
    />
  );
  const select = screen.getByRole('combobox', { name: /Academic organizations/ });
  act(() => select.focus());
  fireEvent.keyDown(select, { key: 'ArrowDown' });
  await waitFor(() => expect(screen.getByRole('listbox')).toBeVisible());
  fireEvent.change(screen.getByRole('textbox', { name: 'Search Academic organizations' }), {
    target: { value: 'Gujarati' },
  });
  fireEvent.click(screen.getByRole('option', { name: /GSEB - Gujarati - Secondary/ }));
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationIds).toEqual([
    'a',
    'b',
  ]);
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationIds).toEqual([
    'a',
    'b',
  ]);
});

it('distinguishes an empty scope from failure and requires deliberate year replacement', async () => {
  query.currentData = { items: [] };
  render(
    <Form
      initial={{
        mode: 'specificOrganizations',
        academicYearId: 'old-year',
        academicYearName: '2025-26',
        organizationIds: ['a'],
      }}
    />
  );
  expect(screen.getByText(/A saved organization is unavailable/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Use current year' }));
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!)).toMatchObject({
    academicYearId: 'year',
    organizationIds: [],
  });
  await act(async () => {});
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
});

it('keeps an untouched empty selection neutral and shows a precise error after blur', async () => {
  query.currentData = { items: [{ id: 'a', label: 'CBSE - English - Primary' }] };
  render(
    <Form
      initial={{ mode: 'specificOrganizations', academicYearId: 'year', organizationIds: [] }}
    />
  );
  expect(screen.queryByText('Select at least one organization.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  fireEvent.blur(screen.getByRole('combobox', { name: /Academic organizations/ }));
  expect(await screen.findByText('Select at least one organization.')).toBeVisible();
});

it('makes mode-card descriptions clickable and clears only dependent assignment data', async () => {
  query.currentData = { items: [{ id: 'a', label: 'CBSE - English - Primary' }] };
  render(
    <Form
      initial={{
        mode: 'specificOrganizations',
        academicYearId: 'year',
        organizationIds: ['a'],
        organizationLabels: ['CBSE - English - Primary'],
      }}
    />
  );
  fireEvent.click(screen.getByText('Not tied to an academic organization'));
  expect(screen.getByRole('radio', { name: 'School-wide' })).toBeChecked();
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!)).toEqual({
    mode: 'schoolWide',
    academicYearId: null,
    organizationIds: [],
  });
  fireEvent.click(screen.getByText('One or more academic units'));
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!)).toMatchObject({
    mode: 'specificOrganizations',
    academicYearId: 'year',
    organizationIds: [],
  });
  expect(screen.queryByText('Select at least one organization.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
});

it('does not label a saved year with the current year and keeps legacy text separate', () => {
  query.currentData = { items: [{ id: 'a', label: 'Verified organization' }] };
  render(
    <Form
      legacyDepartment="CBSE"
      initial={{
        mode: 'specificOrganizations',
        academicYearId: 'old-year',
        organizationIds: ['a'],
      }}
    />
  );
  expect(screen.getByText(/Saved academic year \(name unavailable\)/)).toBeVisible();
  expect(screen.getByText(/Previous department: CBSE/)).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Organization / Work Assignment' })).toBeVisible();
  expect(screen.getByText('Verified organization')).toBeVisible();
  expect(screen.queryByRole('alert', { name: /Previous department/ })).not.toBeInTheDocument();
});

it('invalidates confirmation on refresh and requires a deliberate new confirmation after recovery', async () => {
  query.currentData = { items: [{ id: 'a', label: 'Verified organization' }] };
  const initial: EmployeeWorkAssignment = {
    mode: 'specificOrganizations',
    academicYearId: 'year',
    organizationIds: ['a'],
    organizationLabels: ['Saved organization label'],
  };
  const view = render(<Form review initial={initial} />);
  const confirm = screen.getByRole('checkbox', { name: 'I confirm this work assignment' });
  fireEvent.click(confirm);
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationLabels).toEqual([
    'Verified organization',
  ]);
  query.isFetching = true;
  view.rerender(<Form review initial={initial} />);
  await waitFor(() => expect(confirm).not.toBeChecked());
  expect(confirm).toBeDisabled();
  query.isFetching = false;
  query.isError = true;
  view.rerender(<Form review initial={initial} />);
  expect(screen.queryByText(/A saved organization is unavailable/)).not.toBeInTheDocument();
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationIds).toEqual(['a']);
  query.isError = false;
  query.currentData = { items: [{ id: 'a', label: 'Renamed verified organization' }] };
  view.rerender(<Form review initial={initial} />);
  await waitFor(() => expect(confirm).toBeEnabled());
  expect(confirm).not.toBeChecked();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  expect(screen.getByText('Renamed verified organization')).toBeVisible();
  fireEvent.click(confirm);
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationLabels).toEqual([
    'Renamed verified organization',
  ]);
});

it('locks the entire assignment and confirmation during a blocking operation', () => {
  query.currentData = { items: [{ id: 'a', label: 'Verified organization' }] };
  render(
    <Form
      disabled
      review
      initial={{ mode: 'specificOrganizations', academicYearId: 'year', organizationIds: ['a'] }}
    />
  );
  screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
  expect(screen.getByRole('combobox', { name: /Academic organizations/ })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.getByRole('checkbox', { name: 'I confirm this work assignment' })).toBeDisabled();
});

it('requires reconfirmation when cached catalogue labels change even without a loading transition', async () => {
  query.currentData = { items: [{ id: 'a', label: 'Original organization' }] };
  const initial: EmployeeWorkAssignment = {
    mode: 'specificOrganizations',
    academicYearId: 'year',
    organizationIds: ['a'],
  };
  const view = render(<Form review initial={initial} />);
  const confirm = screen.getByRole('checkbox', { name: 'I confirm this work assignment' });
  fireEvent.click(confirm);
  expect(confirm).toBeChecked();
  query.currentData = { items: [{ id: 'a', label: 'Renamed organization' }] };
  view.rerender(<Form review initial={initial} />);
  await waitFor(() => expect(confirm).not.toBeChecked());
  expect(confirm).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationIds).toEqual(['a']);
  fireEvent.click(confirm);
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!).organizationLabels).toEqual([
    'Renamed organization',
  ]);
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
});
