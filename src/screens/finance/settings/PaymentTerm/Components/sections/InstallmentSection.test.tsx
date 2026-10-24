import { useFormik } from 'formik';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

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
        <InstallmentSection
          formik={formik}
          board={board}
          onAdd={() =>
            formik.setFieldValue('installments', [
              ...formik.values.installments,
              {
                ...formik.values.installments[0],
                installmentName: 'Third',
                sequence: 3,
                allocationPercentage: 0,
              },
            ])
          }
          onRemove={vi.fn()}
        />
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
  it('scrolls only the installment list and focuses the newly added name', async () => {
    renderSection();
    const list = screen.getByRole('region', { name: 'Installments' });
    const scrollTo = vi.fn();
    Object.defineProperty(list, 'scrollTo', { value: scrollTo, configurable: true });
    expect(within(list).queryByRole('button', { name: 'Add Installment' })).toBeNull();
    expect(within(list).queryByRole('button', { name: 'Apply Template' })).toBeNull();
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Add Installment' }));
    await waitFor(() => expect(screen.getByDisplayValue('Third')).toHaveFocus());
    expect(scrollTo).toHaveBeenCalledOnce();
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByDisplayValue('First')).toBeInTheDocument();
  });

  it('shows required range errors after leaving that field, without marking other rows', async () => {
    renderSection();
    const ranges = screen.getAllByRole('textbox', { name: 'Installment Start–End Date *' });
    expect(ranges[0]).toHaveAttribute('aria-invalid', 'false');
    fireEvent.blur(ranges[0]);
    await waitFor(() => expect(ranges[0]).toHaveAttribute('aria-invalid', 'true'));
    expect(screen.getByText('Start date is required')).toBeInTheDocument();
    expect(ranges[1]).toHaveAttribute('aria-invalid', 'false');
  });

  it('shows one allocation error and marks allocation fields when the total exceeds 100%', async () => {
    renderSection();
    const allocations = screen.getAllByRole('textbox', { name: 'Allocation % *' });
    fireEvent.change(allocations[0], { target: { value: '51.63' } });
    await waitFor(() =>
      expect(
        screen.getByText(
          'Allocation total is 101.63%. Reduce the allocation by 1.63% so the total equals 100%.'
        )
      ).toBeInTheDocument()
    );
    expect(screen.queryByText('Percentage allocations must total 100%')).not.toBeInTheDocument();
    allocations.forEach((input) => expect(input).toHaveAttribute('aria-invalid', 'true'));
  });

  it('does not show an allocation alert when allocations total 100%', () => {
    renderSection();
    expect(screen.queryByText(/Allocation totals/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete installment 1' })).toBeInTheDocument();
  });
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
    const user = userEvent.setup();
    renderSection(true);
    const invoice = screen.getAllByRole('group', { name: 'Invoice Date *' })[0];
    const due = screen.getAllByRole('group', { name: 'Payment Due Date *' })[0];
    const enterDate = async (field: HTMLElement) => {
      await user.click(within(field).getByRole('spinbutton', { name: 'Day' }));
      await user.keyboard('10');
      await user.click(within(field).getByRole('spinbutton', { name: 'Month' }));
      await user.keyboard('06');
      await user.click(within(field).getByRole('spinbutton', { name: 'Year' }));
      await user.keyboard('2026');
    };
    await enterDate(invoice);
    await enterDate(due);
    await waitFor(() => {
      expect(screen.getByTestId('schedule')).toHaveTextContent('"demandDate":"2026-06-10"');
      expect(screen.getByTestId('schedule')).toHaveTextContent('"dueDate":"2026-06-10"');
    });
  });
});
