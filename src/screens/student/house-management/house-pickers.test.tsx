import type { HouseQuery } from 'src/redux/student/house-management/house-management-types';

import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

import { HousePicker, LeaderStudentPicker } from './house-pickers';

const fixture = vi.hoisted(() => ({ houses: vi.fn(), students: vi.fn() }));
vi.mock('src/redux/student/house-management/house-management-api', () => ({
  useLazyGetManagedHousesQuery: () => [fixture.houses],
  useLazyGetHouseStudentsQuery: () => [fixture.students],
}));

const house = (id: string, name: string) => ({
  id,
  name,
  color: '#123456',
  memberCount: 0,
  leader: null,
  concurrencyStamp: 'v1',
  canManage: true,
});
const student = (id: string, admissionNumber: string | null) => ({
  enrollmentId: id,
  studentId: id,
  studentName: 'Riya',
  standardId: 'c1',
  standardName: '6',
  divisionId: 'd1',
  divisionName: 'A',
  admissionNumber,
  isHouseLeader: false,
  isDivisionLeader: false,
  concurrencyStamp: 'v1',
});
beforeEach(() => {
  vi.useFakeTimers();
  fixture.houses.mockReset();
  fixture.students.mockReset();
  fixture.houses.mockImplementation((input: HouseQuery) => ({
    unwrap: async () => ({
      items: [house(input.skipCount ? 'h2' : 'h1', input.skipCount ? 'Falcon second' : 'Falcon')],
      totalCount: 26,
      canManage: true,
    }),
  }));
  fixture.students.mockImplementation(() => ({
    unwrap: async () => ({ items: [student('e1', 'GR001'), student('e2', null)], totalCount: 2 }),
  }));
});
afterEach(() => vi.useRealTimers());

it('uses the shared 400ms debounce, minimum query length and appended server page mapping', async () => {
  await act(async () => {
    render(<HousePicker academicMediumId="m1" value={null} onChange={vi.fn()} />);
  });
  expect(fixture.houses).toHaveBeenLastCalledWith(
    expect.objectContaining({
      academicMediumId: 'm1',
      filter: '',
      skipCount: 0,
      maxResultCount: 25,
    })
  );
  const input = screen.getByRole('combobox', { name: 'House' });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'F' } });
  await act(() => vi.advanceTimersByTimeAsync(400));
  expect(fixture.houses.mock.calls.map(([request]) => request.filter)).toEqual(['']);
  fireEvent.change(input, { target: { value: 'Fa' } });
  await act(() => vi.advanceTimersByTimeAsync(399));
  expect(fixture.houses).toHaveBeenCalledTimes(1);
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(fixture.houses).toHaveBeenLastCalledWith(
    expect.objectContaining({ filter: 'Fa', skipCount: 0 })
  );
  fireEvent.mouseDown(input);
  await act(async () => {
    fireEvent.scroll(screen.getByRole('listbox'));
  });
  expect(fixture.houses).toHaveBeenLastCalledWith(
    expect.objectContaining({ filter: 'Fa', skipCount: 25 })
  );
  expect(screen.getByRole('option', { name: 'Falcon' })).toBeVisible();
  expect(screen.getByRole('option', { name: 'Falcon second' })).toBeVisible();
});

it('clears search and rejects late old-medium results when the medium changes', async () => {
  let resolveOld!: (value: unknown) => void;
  const oldResult = new Promise((resolve) => {
    resolveOld = resolve;
  });
  fixture.houses.mockImplementation((input: HouseQuery) => ({
    unwrap: () =>
      input.filter === 'Old'
        ? oldResult
        : Promise.resolve({
            items: [
              house(input.academicMediumId, input.academicMediumId === 'm1' ? 'Falcon' : 'Ocean'),
            ],
            totalCount: 1,
            canManage: true,
          }),
  }));
  const onChange = vi.fn();
  const view = render(<HousePicker academicMediumId="m1" value={null} onChange={onChange} />);
  await act(async () => {});
  fireEvent.focus(screen.getByRole('combobox', { name: 'House' }));
  fireEvent.change(screen.getByRole('combobox', { name: 'House' }), { target: { value: 'Old' } });
  await act(() => vi.advanceTimersByTimeAsync(400));
  await act(async () => {
    view.rerender(<HousePicker academicMediumId="m2" value={null} onChange={onChange} />);
  });
  expect(fixture.houses).toHaveBeenLastCalledWith(
    expect.objectContaining({ academicMediumId: 'm2', filter: '', skipCount: 0 })
  );
  await act(async () => {
    resolveOld({ items: [house('old', 'Stale house')], totalCount: 1, canManage: true });
  });
  const input = screen.getByRole('combobox', { name: 'House' });
  expect(input).toHaveValue('');
  fireEvent.mouseDown(input);
  expect(screen.getByRole('option', { name: 'Ocean' })).toBeVisible();
  expect(screen.queryByRole('option', { name: 'Stale house' })).toBeNull();
});

it('reloads leader choices for a changed division and includes only permitted GR labels', async () => {
  const onChange = vi.fn();
  const view = render(
    <LeaderStudentPicker
      input={{ academicMediumId: 'm1', divisionId: 'd1' }}
      value={null}
      onChange={onChange}
      disabled={false}
    />
  );
  await act(async () => {});
  const input = screen.getByRole('combobox', { name: 'Leader' });
  fireEvent.focus(input);
  fireEvent.mouseDown(input);
  expect(screen.getByRole('option', { name: 'Riya · 6 / A · GR GR001' })).toBeVisible();
  expect(screen.getByRole('option', { name: 'Riya · 6 / A' })).toBeVisible();
  fireEvent.change(input, { target: { value: 'Ri' } });
  await act(() => vi.advanceTimersByTimeAsync(400));
  await act(async () => {
    view.rerender(
      <LeaderStudentPicker
        input={{ academicMediumId: 'm1', divisionId: 'd2' }}
        value={null}
        onChange={onChange}
        disabled={false}
      />
    );
  });
  expect(fixture.students).toHaveBeenLastCalledWith(
    expect.objectContaining({ academicMediumId: 'm1', divisionId: 'd2', filter: '', skipCount: 0 })
  );
  expect(screen.getByRole('combobox', { name: 'Leader' })).toHaveValue('');
});

it('retains the saved house label and associated required-field feedback outside the result page', async () => {
  await act(async () => {
    render(
      <HousePicker
        academicMediumId="m1"
        value={house('saved', 'Saved house')}
        onChange={vi.fn()}
        required
        error
        helperText="Choose a permitted house."
      />
    );
  });
  const input = screen.getByRole('combobox', { name: /House/ });
  expect(input).toHaveValue('Saved house');
  expect(input).toBeRequired();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Choose a permitted house.');
});
