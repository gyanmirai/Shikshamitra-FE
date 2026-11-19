import type { FinanceReportOptions, FinanceReportRequest } from 'src/redux/finance/reports/financeReportsApi';

import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import { FinanceReportBuilder } from './FinanceReportBuilder';

const { preview, queue } = vi.hoisted(() => ({ preview: vi.fn(), queue: vi.fn() }));

vi.mock('src/redux/finance/reports/financeReportsApi', () => ({
  usePreviewFinanceReportMutation: () => [preview, { isLoading: false }],
  useCreateFinanceReportExportMutation: () => [queue, { isLoading: false }],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const report = { id: 'Fee demand and collection summary', label: 'Fee demand and collection summary' };
const options: FinanceReportOptions = {
  reportTypes: [report],
  academicYears: [
    { id: 'year', label: '2026–2027' },
    { id: 'old-year', label: '2025–2026' },
  ],
  feeHeads: [],
  receiptBooks: [],
  paymentMethods: [],
  scope: [
    {
      academicYearId: 'year',
      board: { id: 'cbse', label: 'CBSE' },
      medium: { id: 'english', label: 'English' },
      stage: { id: 'primary', label: 'Primary' },
      class: { id: 'class-1', label: 'Class 1' },
      divisions: [{ id: 'division-a', label: 'A' }],
    },
    {
      academicYearId: 'year',
      board: { id: 'state', label: 'State Board' },
      medium: { id: 'regional', label: 'Regional' },
      stage: { id: 'state-primary', label: 'State Primary' },
      class: { id: 'class-2', label: 'Class 2' },
      divisions: [{ id: 'division-b', label: 'B' }],
    },
  ],
};

const select = (label: string) =>
  screen.getByRole('combobox', { name: new RegExp(`^${label}(?: |$)`) });

function choose(label: string, value: string) {
  fireEvent.mouseDown(select(label));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: value }));
}

function renderBuilder() {
  preview.mockReset().mockImplementation((request: FinanceReportRequest) => ({
    unwrap: () => Promise.resolve({ normalizedFilters: request.filters }),
  }));
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FinanceReportBuilder report={report} options={options} onQueued={vi.fn()} />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

describe('Finance report filters', () => {
  it('disables Medium and Division for All and clears selected child filters', async () => {
    renderBuilder();
    expect(select('Medium')).toHaveAttribute('aria-disabled', 'true');
    expect(select('Division')).toHaveAttribute('aria-disabled', 'true');

    choose('Board', 'CBSE');
    fireEvent.mouseDown(select('Medium'));
    expect(screen.queryByRole('option', { name: 'Regional' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'English' }));
    choose('Class', 'Class 1');
    choose('Division', 'A');
    choose('Class', 'All');
    expect(select('Division')).toHaveAttribute('aria-disabled', 'true');
    expect(select('Division')).toHaveTextContent('All');

    choose('Board', 'All');
    expect(select('Medium')).toHaveAttribute('aria-disabled', 'true');
    expect(select('Medium')).toHaveTextContent('All');
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    await waitFor(() => expect(preview).toHaveBeenCalledTimes(1));
    expect(preview.mock.calls[0][0].filters).toMatchObject({ academicYearIds: ['year'] });
    expect(preview.mock.calls[0][0].filters.mediumId).toBeUndefined();
    expect(preview.mock.calls[0][0].filters.divisionIds).toBeUndefined();
  });

  it('blocks invalid optional date drafts and submits a valid range as date-only values', async () => {
    renderBuilder();
    const date = screen.getByRole('textbox', { name: 'Date range' });
    const previewButton = screen.getByRole('button', { name: 'Preview' });
    expect(previewButton).toBeEnabled();

    ['01/11/2026', '31/02/2026 - 18/11/2026', '18/11/2026 - 01/11/2026', '01/11/2026 - 01/01/2201'].forEach((value) => {
      fireEvent.change(date, { target: { value } });
      expect(date).toHaveAttribute('aria-invalid', 'true');
      expect(previewButton).toBeDisabled();
      fireEvent.submit(screen.getByRole('form', { name: report.label }));
      expect(preview).not.toHaveBeenCalled();
    });

    fireEvent.change(date, { target: { value: '18/11/2026 - 18/11/2026' } });
    await waitFor(() => expect(previewButton).toBeEnabled());
    fireEvent.click(previewButton);
    await waitFor(() => expect(preview).toHaveBeenCalledWith(expect.objectContaining({
      filters: { academicYearIds: ['year'], fromDate: '2026-11-18', toDate: '2026-11-18' },
    })));

    fireEvent.change(date, { target: { value: '' } });
    await waitFor(() => expect(previewButton).toBeEnabled());
    fireEvent.click(previewButton);
    await waitFor(() => expect(preview).toHaveBeenCalledTimes(2));
    expect(preview.mock.calls[1][0].filters.fromDate).toBeUndefined();
    expect(preview.mock.calls[1][0].filters.toDate).toBeUndefined();
  });
});
