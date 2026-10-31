import { useFormik } from 'formik';
import { it, vi, expect } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import ConcessionRequestWorkspace from './ConcessionRequestWorkspace';
import RequestEnteredInstallments from './ConcessionSteps/RequestEnteredInstallments';
import { policy, context } from '../../../../../e2e/fixtures/concession-request-ui/data';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const theme = createTheme(defaultSettings);

function Editor() {
  const heads = [
    { feeHeadId: 'tuition', feeHeadName: 'School tuition', amount: 5000 },
    { feeHeadId: 'school', feeHeadName: 'School fees', amount: 5000 },
  ];
  const requestContext = {
    ...context,
    eligibleDueFees: heads.flatMap((head) =>
      context.eligibleDueFees.map((line) => ({
        ...line,
        feeHeadId: head.feeHeadId,
        feeHeadName: head.feeHeadName,
        dueFeeId: `${head.feeHeadId}-${line.dueFeeId}`,
      }))
    ),
  };
  const fixedPolicy = { ...policy, calculationMethod: 'FixedAmount' as const };
  const formik = useFormik({
    initialValues: {
      concessionTypeId: 'sibling',
      selectedFeeHeads: { sibling: heads.map((head) => head.feeHeadId) },
      dueFeeEntries: {},
    },
    onSubmit: () => undefined,
  });
  return (
    <ThemeProvider theme={theme}>
      <ConcessionRequestWorkspace
        policyFields={<span>Policy</span>}
        feeHeads={heads}
        installments={requestContext.eligibleDueFees}
        selectedIds={formik.values.selectedFeeHeads.sibling}
        onToggle={(id) =>
          formik.setFieldValue(
            'selectedFeeHeads.sibling',
            formik.values.selectedFeeHeads.sibling.filter((value) => value !== id)
          )
        }
        renderFeeValueFields={(feeHeadId) => (
          <RequestEnteredInstallments
            formik={formik}
            requestContext={requestContext}
            policy={fixedPolicy}
            feeHeadId={feeHeadId}
          />
        )}
      />
    </ThemeProvider>
  );
}

it('edits only inside each fee breakdown and shares the fixed request maximum across fees', () => {
  render(<Editor />);
  const tuitionCard = screen.getByLabelText('School tuition').closest('li')!;
  const schoolCard = screen.getByLabelText('School fees').closest('li')!;
  expect(within(tuitionCard).getAllByRole('textbox', { hidden: true })).toHaveLength(2);
  expect(within(schoolCard).getAllByRole('textbox', { hidden: true })).toHaveLength(2);
  expect(screen.getAllByRole('textbox', { hidden: true })).toHaveLength(4);
  const tuition = within(tuitionCard).getByLabelText(/Half-Yearly 1.*amount/);
  const school = within(schoolCard).getByLabelText(/Half-Yearly 1.*amount/);
  fireEvent.change(tuition, { target: { value: '750' } });
  expect(school).toHaveAccessibleDescription(/Available for this installment: ₹\s*250/);
  fireEvent.change(school, { target: { value: '251' } });
  expect(school).toHaveValue('');
  fireEvent.change(school, { target: { value: '250' } });
  expect(school).toHaveValue('₹ 250');
  fireEvent.click(screen.getByLabelText('School fees'));
  expect(within(schoolCard).queryByRole('textbox', { hidden: true })).not.toBeInTheDocument();
  expect(tuition).toHaveValue('₹ 750');
});

it('keeps other fee editors expanded when inspecting and collapsing one breakdown', () => {
  render(<Editor />);
  const schoolCard = screen.getByRole('checkbox', { name: 'School fees' }).closest('li')!;
  const tuitionCard = screen.getByRole('checkbox', { name: 'School tuition' }).closest('li')!;
  fireEvent.click(within(tuitionCard).getByRole('button', { name: 'Fee Breakdown' }));
  expect(within(schoolCard).getAllByRole('textbox')[0]).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Inspect School tuition' }));
  expect(within(tuitionCard).getAllByRole('textbox')[0]).toBeVisible();
});
