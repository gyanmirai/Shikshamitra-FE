import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import ChargeForm from './ChargeForm';

const state = vi.hoisted(() => ({
  categories: {} as any,
  year: { id: 'year', boards: [] },
  trigger: vi.fn(),
}));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: state.year }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation, params, options }: any) =>
    currentQueryAndMutation(params, options),
}));
vi.mock('framer-motion', () => ({ motion: { div: ({ children }: any) => <div>{children}</div> } }));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/screens/finance/components/FinancePrerequisiteState', () => ({
  default: ({ requirements }: any) => <div>{requirements[0].key}</div>,
}));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/redux/student', () => ({ useLazyGetStudentsByScopeQuery: () => [state.trigger, {}] }));
vi.mock('src/redux/class/classApi', () => ({
  useLazyGetClassByMediumQuery: () => [state.trigger, {}],
}));
vi.mock('src/redux/finance/chargeCategory', () => ({
  useGetChargeCategoriesQuery: () => state.categories,
}));
vi.mock('src/redux/finance/ChargeManagement/chargeApi', () => ({
  usePostChargeMutation: () => [vi.fn(), {}],
  useUpdateChargeMutation: () => [vi.fn(), {}],
}));

beforeEach(() => {
  state.categories = { data: { items: [] }, currentData: { items: [] }, refetch: vi.fn() };
});

it('replaces the charge fields with setup and keeps Cancel reachable after a resolved empty lookup', () => {
  render(<ChargeForm open={{ value: true } as any} onClose={vi.fn()} />);
  expect(screen.getByText('charge-category')).toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Amount *' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
});

it('does not interpret a loading or failed category lookup as missing setup', () => {
  state.categories = { currentData: undefined, isFetching: true, refetch: vi.fn() };
  const view = render(<ChargeForm open={{ value: true } as any} onClose={vi.fn()} />);
  expect(screen.queryByText('charge-category')).not.toBeInTheDocument();
  state.categories = { currentData: { items: [] }, isError: true, refetch: vi.fn() };
  view.rerender(<ChargeForm open={{ value: true } as any} onClose={vi.fn()} />);
  expect(screen.queryByText('charge-category')).not.toBeInTheDocument();
});
