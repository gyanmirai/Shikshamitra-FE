import { useFormik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import { InstallmentSection } from './InstallmentSection';
import { getInitialPaymentTermData } from '../PaymentTermInitialValues';
import { paymentTermValidationSchema } from '../PaymentTermValidationSchema';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../InstallmentTemplateDialog', () => ({ InstallmentTemplateDialog: () => null }));

const board = {
  id: 'board-1',
  name: 'GSEB',
  academicYearId: 'year-1',
  startDate: '2026-06-01',
  endDate: '2027-05-31',
};

function renderSection(specificDate = false) {
  const onSubmit = vi.fn();
  function Form() {
    const formik = useFormik({
      initialValues: getInitialPaymentTermData({
        boardId: board.id,
        paymentTermName: 'Annual fees',
        paymentTermCode: 'ANNUAL',
        demandGenerationRule: specificDate ? 'SpecificDate' : 'OnInstallmentStartDate',
        installments: [
          {
            installmentName: 'First',
            sequence: 1,
            allocationPercentage: 50,
            dueDate: '2026-06-15',
          },
          {
            installmentName: 'Second',
            sequence: 2,
            allocationPercentage: 50,
            dueDate: '2027-01-15',
          },
        ].map((item) => ({
          ...item,
          startDate: null,
          endDate: null,
          demandDate: null,
          description: '',
          reminderDate: null,
          gracePeriod: null,
          allowPartialOverride: null,
          demandEnabled: true,
          reminderEnabled: false,
        })),
      }),
      validationSchema: paymentTermValidationSchema([board]),
      onSubmit,
    });
    return (
      <form onSubmit={formik.handleSubmit}>
        <InstallmentSection formik={formik} board={board} onAdd={vi.fn()} onRemove={vi.fn()} />
        <output data-testid="schedule">{JSON.stringify(formik.values.installments)}</output>
        <button type="submit">Save</button>
      </form>
    );
  }
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Form />
      </LocalizationProvider>
    </ThemeProvider>
  );
  return onSubmit;
}

describe('Payment Term installment date entry', () => {
  it('stores typed ranges independently, calculates invoice dates, and blocks invalid saves', async () => {
    const onSubmit = renderSection();
    const inputs = screen.getAllByRole('textbox', { name: 'Installment Start–End Date *' });
    fireEvent.change(inputs[0], { target: { value: '01/06/2026 - 30/06/2026' } });
    fireEvent.change(inputs[1], { target: { value: '01/01/2027 - 31/01/2027' } });
    expect(inputs[0]).toHaveValue('01/06/2026 - 30/06/2026');
    expect(inputs[1]).toHaveValue('01/01/2027 - 31/01/2027');
    expect(screen.getByTestId('schedule')).toHaveTextContent('"startDate":"2026-06-01"');
    expect(screen.getByTestId('schedule')).toHaveTextContent('"endDate":"2027-01-31"');
    const invoiceFields = screen.getAllByRole('group', { name: 'Invoice Date' });
    expect(within(invoiceFields[0]).getByRole('spinbutton', { name: 'Day' })).toHaveTextContent(
      '01'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    onSubmit.mockClear();
    fireEvent.change(inputs[0], { target: { value: '31/02/2026 - 30/06/2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(inputs[0]).toHaveAttribute('aria-invalid', 'true'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(inputs[1]).toHaveValue('01/01/2027 - 31/01/2027');
  });

  it('allows typing due and specific invoice dates through their date sections', async () => {
    renderSection(true);
    const invoice = screen.getAllByRole('group', { name: 'Invoice Date *' })[0];
    const due = screen.getAllByRole('group', { name: 'Payment Due Date *' })[0];
    [invoice, due].forEach((field) => {
      [
        ['Day', '10'],
        ['Month', '06'],
        ['Year', '2026'],
      ].forEach(([name, text]) => {
        const section = within(field).getByRole('spinbutton', { name });
        fireEvent.focus(section);
        [...text].forEach((key) => fireEvent.keyDown(section, { key }));
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId('schedule')).toHaveTextContent('"demandDate":"2026-06-10"');
      expect(screen.getByTestId('schedule')).toHaveTextContent('"dueDate":"2026-06-10"');
    });
  });
});
