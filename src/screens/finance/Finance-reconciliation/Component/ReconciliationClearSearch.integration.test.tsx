import { it, vi, expect, beforeEach, afterEach } from 'vitest';
import { act, screen, within, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { renderWithProviders } from 'src/test/test-utils';
import CustomizableTable from 'src/components/customizabaleTable';
import { useReconciliationTableQuery } from './useReconciliationTableQuery';
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });
function Harness({ method }: { method: number }) {
    const { params, tableProps } = useReconciliationTableQuery({ academicYearId: 'year', paymentMethod: method, month: 10, year: 2026 });
    const rows = params?.search ? [] : [{ id: 'existing', name: 'Existing receipt' }];
    return <ThemeProvider theme={createTheme(defaultSettings)}><CustomizableTable tableId='reconciliation_table' {...tableProps} columns={[{ id: 'name', label: 'Name' }]} data={rows} totalCount={rows.length} /><output data-testid="server-search">{params?.search ?? ''}</output></ThemeProvider>;
}
it.each([1, 2, 3, 4, 5, 6])('method %s clears empty-state search atomically in the real shared table', (method) => {
    renderWithProviders(<Harness method={method} />);
    act(() => vi.advanceTimersByTime(500));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search table' }), { target: { value: 'zz-no-match' } });
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByTestId('server-search')).toHaveTextContent('zz-no-match');
    expect(screen.getByText(/No results found for/)).toBeVisible();
    fireEvent.click(within(screen.getByRole('table', { name: 'Table View table' })).getByRole('button', { name: 'Clear search' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('textbox', { name: 'Search table' })).toHaveValue('');
    expect(screen.getByTestId('server-search')).toBeEmptyDOMElement();
    expect(screen.getByText('Existing receipt')).toBeVisible();
});
