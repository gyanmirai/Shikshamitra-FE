import { Provider } from 'react-redux';
import { vi, it, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionNumberingHistoryDialog } from './admission-numbering-history-dialog';

const query = vi.hoisted(() => vi.fn());
vi.mock('src/redux/student/admissions/admission-numbering-api', () => ({
  useGetAdmissionNumberingHistoryQuery: query,
}));

const entry = {
  version: 2,
  creationTime: '2026-11-27T10:00:00Z',
  changedByName: 'School Admin',
  prefix: '',
  suffix: '',
  separator: '-',
  yearFormat: 0,
  resetPolicy: 0,
  digits: 3,
  startingNumber: 1,
};
const store = configureStore({ reducer: { confirmPopup } });
const show = () =>
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionNumberingHistoryDialog onClose={vi.fn()} />
      </ThemeProvider>
    </Provider>
  );

describe('numbering history', () => {
  it('shows who changed the numbering and both previous and new settings', () => {
    query.mockReturnValue({
      currentData: [
        entry,
        { ...entry, version: 1, prefix: 'APP', yearFormat: 1, resetPolicy: 1, digits: 6 },
      ],
      isFetching: false,
      isError: false,
    });
    show();
    expect(screen.getAllByText(/School Admin/)).toHaveLength(2);
    const [latest, first] = screen.getAllByRole('listitem');
    const previous = within(latest).getByRole('region', { name: 'Previous Settings' });
    const updated = within(latest).getByRole('region', { name: 'New Settings' });
    expect(previous).toHaveTextContent('APP');
    expect(previous).toHaveTextContent('Calendar year');
    expect(updated).toHaveTextContent('No year');
    expect(within(first).queryByRole('region', { name: 'Previous Settings' })).not.toBeInTheDocument();
    expect(within(first).getByText('First recorded version')).toBeVisible();
  });
  it('offers a retry when history cannot load', async () => {
    const refetch = vi.fn();
    query.mockReturnValue({ isFetching: false, isError: true, refetch });
    show();
    expect(screen.getByRole('button', { name: 'Numbering History information' })).toBeVisible();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Unable to load numbering history.');
    await userEvent.setup().click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
