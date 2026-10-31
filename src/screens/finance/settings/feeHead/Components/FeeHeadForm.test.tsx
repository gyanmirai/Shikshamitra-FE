import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import FeeHeadForm from './FeeHeadForm';

vi.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('../../../hooks/useFinancePermissions', () => ({
  useFinancePermissions: () => ({ canAdd: true }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type, params }: any) => {
    if (type === 'mutation') return [vi.fn(), { isLoading: false }];
    const items = params?.operation
      ? [
          { id: 'income', name: 'AAA income' },
          { id: 'none', name: 'None' },
        ]
      : [{ id: 'fees', name: 'Fee category' }];
    return { data: { items }, currentData: { items }, isLoading: false, isFetching: false };
  },
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: any) => children,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/finance/settings/components/DownstreamUsageWarning', () => ({
  default: () => null,
}));

it('offers stored None first in the standalone Fee Head editor and keeps it selected after blur', async () => {
  render(<FeeHeadForm open={{ value: true } as never} onClose={vi.fn()} editData={null} />);
  const category = screen.getByRole('combobox', { name: 'Income Category *' });
  fireEvent.mouseDown(category);
  const options = await screen.findAllByRole('option');
  expect(options[0]).toHaveTextContent('None');
  fireEvent.click(options[0]);
  fireEvent.blur(category);
  expect(category).toHaveTextContent('None');
  expect(screen.queryByText('Income Category is required')).not.toBeInTheDocument();
});
