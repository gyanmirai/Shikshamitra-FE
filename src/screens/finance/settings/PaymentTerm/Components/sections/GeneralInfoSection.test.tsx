import { Formik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { GeneralInfoSection } from './GeneralInfoSection';
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

import type { IPaymentTerm } from '../../type';

const values: IPaymentTerm = {
  id: 'term-1',
  paymentTermName: 'Monthly',
  paymentTermCode: 'PT-MONTHLY',
  boardId: 'board-1',
  description: '',
  status: 'Draft',
  academicYearId: 'year-1',
  installments: [],
  invoiceCreationEnabled: true,
  isDefaultTerm: true,
  holidayShiftingMethod: 'None',
  demandGenerationRule: 'OnInstallmentStartDate',
  demandOffsetDays: null,
  initialDemandStatus: 'Draft',
};

const boards = [
  {
    id: 'board-1',
    name: 'GSEB',
    academicYearId: 'year-1',
    startDate: '2026-06-01',
    endDate: '2027-05-31',
  },
];

function renderSection(status: 'Draft' | 'Active', isDefaultTerm = false) {
  return render(
    <Formik<IPaymentTerm> initialValues={{ ...values, status, isDefaultTerm }} onSubmit={() => {}}>
      {(formik) => <GeneralInfoSection formik={formik} boards={boards} />}
    </Formik>
  );
}

describe('GeneralInfoSection default payment term', () => {
  it('shows the server name conflict inline and removes it after the name changes', async () => {
    const message = 'A payment term named Monthly already exists for GSEB. Use a different name.';
    render(
      <Formik<IPaymentTerm>
        initialValues={values}
        initialStatus={{ nameConflict: { name: 'Monthly', boardId: 'board-1', message } }}
        onSubmit={() => {}}
      >
        {(formik) => <GeneralInfoSection formik={formik} boards={boards} />}
      </Formik>
    );
    const name = screen.getByRole('textbox', { name: 'Payment term name *' });
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(message)).toBeInTheDocument();
    fireEvent.change(name, { target: { value: 'Quarterly' } });
    await waitFor(() => expect(screen.queryByText(message)).not.toBeInTheDocument());
    expect(name).toHaveAttribute('aria-invalid', 'false');
  });
  it('does not expose the internal payment term code', () => {
    renderSection('Draft');

    expect(screen.queryByLabelText(/Payment Term Code/i)).not.toBeInTheDocument();
  });

  it('disables default selection for a Draft payment term', () => {
    renderSection('Draft');

    expect(screen.getByRole('switch', { name: /Default Payment Term/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('switch', { name: /Default Payment Term/ }));

    expect(screen.getByRole('switch', { name: /Default Payment Term/ })).not.toBeChecked();
    expect(
      screen.queryByText('Only an Active payment term can be the default.')
    ).not.toBeInTheDocument();
  });

  it('allows an Active term to replace the board default', async () => {
    renderSection('Active');

    fireEvent.click(screen.getByRole('switch', { name: /Default Payment Term/ }));

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /Default Payment Term/ })).toBeChecked();
    });
    expect(
      screen.queryByText(
        'Only one default is allowed per board. Selecting this replaces that board’s previous default.'
      )
    ).not.toBeInTheDocument();
  });

  it('clears the default when status changes back to Draft', async () => {
    renderSection('Active', true);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Status *' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Draft' }));

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /Default Payment Term/ })).not.toBeChecked();
      expect(screen.getByRole('switch', { name: /Default Payment Term/ })).toBeDisabled();
    });
  });
});
