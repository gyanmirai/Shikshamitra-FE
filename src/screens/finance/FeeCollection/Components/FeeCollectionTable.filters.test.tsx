import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { financePermissions } from 'src/constants/finance-menu';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';

import FeeCollectionTable from './FeeCollectionTable';

const requests = vi.hoisted(() => ({
  calls: [] as any[],
  completed: [] as any[],
  slowA: false,
  releaseA: undefined as (() => void) | undefined,
}));

// Use the real generated query hooks and endpoint definitions with a controlled transport.
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      endpoints: () => ({}),
      baseQuery: async (args: any) => {
        requests.calls.push(args);
        if (requests.slowA && args.params?.DivisionId === 'division-a') {
          await new Promise<void>((resolve) => {
            requests.releaseA = resolve;
          });
        }
        requests.completed.push(args);
        if (args.url.includes('/standards')) {
          return {
            data: [
              {
                id: 'class-3',
                name: 'Class 3',
                divisions: [
                  { id: 'division-a', name: 'A' },
                  { id: 'division-b', name: 'B' },
                ],
              },
            ],
          };
        }
        return {
          data: {
            totalCount: 1,
            items: [
              {
                studentId: 'student',
                studentName: 'Test Student',
                standardDivision: args.params.DivisionId
                  ? `Class 3-${args.params.DivisionId === 'division-a' ? 'A' : 'B'}`
                  : 'Class 3',
                status: 0,
              },
            ],
          },
        };
      },
    }),
  };
});

vi.mock('src/components/adaptive-three-dots-actions', () => ({ default: () => null }));
vi.mock('@mui/material', () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  Card: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));
vi.mock('src/components/empty-content', () => ({
  EmptyContent: ({ title }: any) => <div>{title}</div>,
}));
// The in-app browser smoke test exercises the real MUI selects. Here the
// native control isolates filter state and request ordering from animations.
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, value, onChange, disabled, valueKey, labelKey }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option[valueKey]} value={option[valueKey]}>
          {option[labelKey]}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, isLoading, page, onServerPagination }: any) => (
    <div>
      <div role="status">{isLoading ? 'Loading collections' : 'Collections loaded'}</div>
      <div>Page {page === undefined ? 'uncontrolled' : page + 1}</div>
      <button type="button" onClick={() => onServerPagination(2, 10)}>
        Next page
      </button>
      {!isLoading && data.map((row: any) => <div key={row.studentId}>{row.standardDivision}</div>)}
    </div>
  ),
}));

const initialYear = {
  id: 'year',
  boards: [{ id: 'gseb', name: 'GSEB', educationMediums: [{ id: 'english', name: 'English' }] }],
};

function setup() {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: (state = { permissionsInitialized: true, loading: false, permissions: [{ name: `${financePermissions.fees.collections}.View`, isGranted: true }] }) => state,
      globalState: (state: { currentYear: typeof initialYear } | undefined, action: any) =>
        action.type === 'refreshYear'
          ? { currentYear: { ...initialYear, boards: [...initialYear.boards] } }
          : (state ?? { currentYear: initialYear }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
    // Deliver query state immediately in the test environment; the race case
    // controls its pending response explicitly instead of relying on timers.
    enhancers: (getDefault) => getDefault({ autoBatch: false }),
  });
  function FilterOwner({ visible = true }) {
    const academicFilters = useFinanceAcademicFilters();
    return visible ? (
      <FeeCollectionTable
        academicFilters={academicFilters}
        onAddFee={{} as any}
        onDelete={vi.fn()}
        onCollectFee={vi.fn()}
        onView={vi.fn()}
        onGiveAdjustment={vi.fn()}
      />
    ) : null;
  }
  const view = render(
    <Provider store={store}>
      <FilterOwner />
    </Provider>
  );
  const rerender = (visible: boolean) =>
    view.rerender(
      <Provider store={store}>
        <FilterOwner visible={visible} />
      </Provider>
    );
  return { store, rerender };
}

async function selectClass() {
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Class' })).toBeEnabled());
  fireEvent.change(screen.getByRole('combobox', { name: 'Class' }), {
    target: { value: 'class-3' },
  });
}

function selectDivision(divisionId: string) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Division' }), {
    target: { value: divisionId },
  });
}

describe('Collections academic filter requests', () => {
  beforeEach(() => {
    requests.calls = [];
    requests.completed = [];
    requests.slowA = false;
    requests.releaseA = undefined;
  });

  afterEach(() => {
    requests.releaseA?.();
  });

  it('preserves Class 3 and Division A while the collection request settles and the year refreshes', async () => {
    const { store } = setup();
    await selectClass();
    selectDivision('division-a');
    act(() => {
      store.dispatch({ type: 'refreshYear' });
    });

    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('class-3');
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveValue('division-a');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Collections loaded'));
    expect(screen.getByText('Class 3-A')).toBeVisible();
    expect(requests.calls.filter((call) => call.url.includes('/standards'))).toHaveLength(1);
    expect(
      requests.calls.filter((call) => call.url === '/fee-collections').at(-1)?.params
    ).toMatchObject({
      AcademicYearId: 'year',
      BoardId: 'gseb',
      EducationMediumId: 'english',
      StandardId: 'class-3',
      DivisionId: 'division-a',
      SkipCount: 0,
    });
  });

  it('retains filter context without fetching standards again when returning to the table', async () => {
    const { rerender } = setup();
    await selectClass();
    selectDivision('division-a');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Collections loaded'));
    rerender(false);
    rerender(true);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Collections loaded'));
    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('class-3');
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveValue('division-a');
    expect(requests.calls.filter((call) => call.url.includes('/standards'))).toHaveLength(1);
  });

  it('requests only the first page of the new division when filtering from a later page', async () => {
    setup();
    await selectClass();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Collections loaded'));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Collections loaded'));
    selectDivision('division-a');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Collections loaded'));
    expect(
      requests.calls
        .filter((call) => call.params?.DivisionId === 'division-a')
        .map((call) => call.params.SkipCount)
    ).toEqual([0]);
    expect(screen.getByText('Page 1')).toBeVisible();
  });

  it('keeps the latest division when an older response arrives after it', async () => {
    requests.slowA = true;
    setup();
    await selectClass();
    selectDivision('division-a');
    expect(screen.getByRole('status')).toHaveTextContent('Loading collections');
    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('class-3');
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveValue('division-a');
    selectDivision('division-b');
    await waitFor(() => expect(screen.getByText('Class 3-B')).toBeVisible());
    act(() => {
      requests.releaseA?.();
    });
    await waitFor(() =>
      expect(requests.completed.some((call) => call.params?.DivisionId === 'division-a')).toBe(true)
    );
    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('class-3');
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveValue('division-b');
    expect(screen.getByText('Class 3-B')).toBeVisible();
    expect(screen.queryByText('Class 3-A')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Collections loaded');
  });

  it('clears only the division when selecting All Divisions', async () => {
    setup();
    await selectClass();
    selectDivision('division-a');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Collections loaded'));
    selectDivision('All Divisions');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Collections loaded'));
    expect(screen.getByRole('combobox', { name: 'Class' })).toHaveValue('class-3');
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveValue('All Divisions');
    expect(
      requests.calls.filter((call) => call.url === '/fee-collections').at(-1)?.params
    ).toMatchObject({
      StandardId: 'class-3',
      DivisionId: undefined,
    });
  });
});
