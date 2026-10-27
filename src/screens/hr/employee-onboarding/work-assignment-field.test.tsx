import { useState } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { WorkAssignmentField } from './work-assignment-field';
import { emptyWorkAssignment, type EmployeeWorkAssignment } from './work-assignment';

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
}: {
  initial?: EmployeeWorkAssignment;
  year?: { id: string; name: string } | null;
}) {
  const [value, setValue] = useState(initial);
  const [valid, setValid] = useState(false);
  return (
    <>
      <WorkAssignmentField
        value={value}
        onChange={setValue}
        currentYear={year}
        onValidityChange={setValid}
      />
      <output aria-label="Draft">{JSON.stringify(value)}</output>
      <button type="button" disabled={!valid}>
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
  expect(screen.getByText(/No academic organizations are available/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Use current year' }));
  expect(JSON.parse(screen.getByLabelText('Draft').textContent!)).toMatchObject({
    academicYearId: 'year',
    organizationIds: [],
  });
  await act(async () => {});
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
});
