import { describe, it, expect } from 'vitest';
import { Formik } from 'formik';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { GeneralInfoSection } from './GeneralInfoSection';

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

function renderSection(isDefaultSelectionLocked: boolean) {
  return render(
    <Formik initialValues={values} onSubmit={() => {}}>
      {(formik) => (
        <GeneralInfoSection
          formik={formik}
          boards={boards}
          codeManuallyEdited
          setCodeManuallyEdited={() => {}}
          isDefaultSelectionLocked={isDefaultSelectionLocked}
        />
      )}
    </Formik>
  );
}

describe('GeneralInfoSection default payment term', () => {
  it('does not allow an existing board default to be switched off', () => {
    renderSection(true);

    expect(screen.getByRole('switch', { name: /Default Payment Term/ })).toBeDisabled();
    fireEvent.click(screen.getByTestId('default-payment-term-toggle'));

    expect(screen.getByRole('switch', { name: /Default Payment Term/ })).toBeChecked();
    expect(
      screen.getByText(
        'This is the current board default. Select another payment term as default to replace it.'
      )
    ).toBeInTheDocument();
  });

  it('allows an unlocked default selection to be changed', async () => {
    renderSection(false);

    fireEvent.click(screen.getByTestId('default-payment-term-toggle'));

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: /Default Payment Term/ })).not.toBeChecked();
    });
  });
});
