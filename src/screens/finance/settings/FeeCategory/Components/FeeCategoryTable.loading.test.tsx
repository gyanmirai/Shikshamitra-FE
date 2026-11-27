import { vi, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { ThemeProvider } from '@mui/material/styles';

import { createTheme } from 'src/theme/create-theme';
import { useBoolean } from 'src/hooks/use-boolean';
import { defaultSettings } from 'src/components/settings';

import FeeCategoryTable from './FeeCategoryTable';

const query = vi.hoisted(() => ({
  currentData: {
    totalCount: 1,
    items: [
      { id: 'category-1', name: 'Academic fees', isActive: true, feeHeads: [], totalFeeHeads: 0 },
    ],
  },
  isLoading: false,
  isFetching: false,
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (state: unknown) => unknown) =>
    select({ globalState: { currentYear: { id: 'year-1' } }, auth: { permissions: [] } }),
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: { type: string }) => (type === 'query' ? query : [vi.fn(), {}]),
}));

vi.mock('src/redux/feeCategory/feeCategoryApi', () => ({
  feeCategoryApi: {},
  useGetFeeCategoriesQuery: vi.fn(),
  useGetFeeCategoryByIdQuery: () => ({}),
  useDeleteFeeCategoryMutation: () => [vi.fn()],
  usePatchFeeCategoryStatusMutation: vi.fn(),
}));

const theme = createTheme(defaultSettings);

function FeeCategoriesFixture() {
  const onAddFeeCategory = useBoolean();

  return (
    <ThemeProvider theme={theme}>
      <FeeCategoryTable
        onAddFeeCategory={onAddFeeCategory}
        setEditData={vi.fn()}
        onView={vi.fn()}
      />
    </ThemeProvider>
  );
}

it('renders table skeleton rows while saved fee categories refresh and restores the results', () => {
  const { rerender } = render(<FeeCategoriesFixture />);
  expect(screen.getByText('Academic fees')).toBeVisible();

  query.isFetching = true;
  rerender(<FeeCategoriesFixture />);

  const categories = screen.getByRole('table', { name: 'Fee categories table' });
  expect(within(categories).getByRole('columnheader', { name: /category name/i })).toBeVisible();
  expect(categories).toHaveAttribute('aria-busy', 'true');
  expect(categories.querySelector('tbody .MuiSkeleton-root')).toBeInTheDocument();
  expect(within(categories).queryByText('Academic fees')).not.toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

  query.isFetching = false;
  rerender(<FeeCategoriesFixture />);
  const refreshedCategories = screen.getByRole('table', { name: 'Fee categories table' });
  expect(within(refreshedCategories).getByText('Academic fees')).toBeVisible();
  expect(refreshedCategories).not.toHaveAttribute('aria-busy');
});
