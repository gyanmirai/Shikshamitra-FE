import { useFormik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { defaultSettings } from 'src/components/settings/config-settings';

import RequestEnteredInstallments from './RequestEnteredInstallments';
import { policy, context } from '../../../../../../e2e/fixtures/concession-request-ui/data';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
const theme = createTheme(defaultSettings);

function Editor({
  initialEntries = {} as Record<string, string>,
  percentage = false,
  busy = false,
  studentId = 'student-1',
  zeroEligible = false,
}) {
  const formik = useFormik({
    initialValues: {
      concessionTypeId: 'sibling',
      selectedFeeHeads: { sibling: ['tuition', 'school'] },
      dueFeeEntries: initialEntries,
    },
    onSubmit: vi.fn(),
  });
  return (
    <ThemeProvider theme={theme}>
      <FormBusyRegion busy={busy}>
        <RequestEnteredInstallments
          formik={formik}
          feeHeadId="tuition"
          policy={{ ...policy, calculationMethod: percentage ? 'Percentage' : 'FixedAmount' }}
          requestContext={{
            ...context,
            studentId,
            eligibleDueFees: [
              ...['June', 'July', 'August'].map((month, index) => ({
                ...context.eligibleDueFees[0],
                dueFeeId: `due-${index + 1}`,
                installmentLabel: month,
                eligibleConcessionAmount: zeroEligible ? 0 : 1000,
              })),
              { ...context.eligibleDueFees[0], dueFeeId: 'school', feeHeadId: 'school' },
            ],
          }}
        />
      </FormBusyRegion>
      <output aria-label="Raw entries">{JSON.stringify(formik.values.dueFeeEntries)}</output>
    </ThemeProvider>
  );
}

const entries = () => JSON.parse(screen.getByLabelText('Raw entries').textContent || '{}');
const apply = () => screen.getByRole('button', { name: /^Apply to all installments$/ });
const distribute = () => screen.getByRole('button', { name: /^Auto-distribute equal$/ });

describe('concession bulk installment entry', () => {
  it('starts with eligible rows checked and shows mixed/select-all states without changing amounts', () => {
    render(<Editor initialEntries={{ 'due-2': '111' }} />);
    const all = screen.getByRole('checkbox', { name: 'Select all installments for bulk actions' });
    expect(all).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: /Select July 2026.*bulk actions/ }));
    expect(all).not.toBeChecked();
    expect(all).toHaveAttribute('data-indeterminate', 'true');
    expect(all).toHaveAttribute('aria-checked', 'mixed');
    expect(entries()).toEqual({ 'due-2': '111' });
    fireEvent.click(all);
    expect(all).toBeChecked();
    fireEvent.click(all);
    expect(apply()).toBeDisabled();
    expect(distribute()).toBeDisabled();
  });

  it('applies the amount only to checked rows, preserves other heads, and permits manual edits and repeat Apply', () => {
    render(<Editor initialEntries={{ 'due-2': '111', school: '200' }} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Select July 2026.*bulk actions/ }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount per installment' }), {
      target: { value: '100' },
    });
    fireEvent.click(apply());
    expect(entries()).toEqual({ 'due-1': '100', 'due-2': '111', 'due-3': '100', school: '200' });
    fireEvent.change(
      screen.getByRole('textbox', { name: 'June School tuition concession amount' }),
      { target: { value: '150' } }
    );
    expect(entries()['due-1']).toBe('150');
    fireEvent.click(apply());
    expect(entries()['due-1']).toBe('100');
    expect(apply()).toHaveAttribute('type', 'button');
  });

  it('splits an exact total across selected installments and reuses the target budget on subsequent allocation', () => {
    render(<Editor initialEntries={{ 'due-1': '100', school: '100' }} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Total concession amount' }), {
      target: { value: '900' },
    });
    fireEvent.click(distribute());
    expect(entries()).toEqual({ 'due-1': '300', 'due-2': '300', 'due-3': '300', school: '100' });
    fireEvent.click(distribute());
    expect(entries()).toEqual({ 'due-1': '300', 'due-2': '300', 'due-3': '300', school: '100' });
    expect(distribute()).toHaveAttribute('type', 'button');
  });

  it('rejects an entire batch exceeding the shared policy cap without clamping or modifying the draft', () => {
    render(<Editor initialEntries={{ school: '800', 'due-1': '50' }} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount per installment' }), {
      target: { value: '100' },
    });
    fireEvent.click(apply());
    expect(entries()).toEqual({ school: '800', 'due-1': '50' });
    expect(screen.getByRole('textbox', { name: 'Amount per installment' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(
      screen.getByRole('textbox', { name: 'Amount per installment' })
    ).toHaveAccessibleDescription(/Total concession exceeds the request allowance/);
  });

  it('supports percentage allocation while preserving the request-wide percentage allowance', () => {
    render(<Editor percentage initialEntries={{ school: '10' }} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Total concession percentage' }), {
      target: { value: '15' },
    });
    fireEvent.click(distribute());
    expect(entries()).toEqual({ school: '10', 'due-1': '5', 'due-2': '5', 'due-3': '5' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Percentage per installment' }), {
      target: { value: '6' },
    });
    fireEvent.click(apply());
    expect(entries()).toEqual({ school: '10', 'due-1': '5', 'due-2': '5', 'due-3': '5' });
  });

  it('resets bulk drafts and targets when the student changes', () => {
    const view = render(<Editor />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Amount per installment' }), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Select July 2026.*bulk actions/ }));
    view.rerender(<Editor studentId="student-2" />);
    expect(screen.getByRole('textbox', { name: 'Amount per installment' })).toHaveValue('');
    expect(
      screen.getByRole('checkbox', { name: 'Select all installments for bulk actions' })
    ).toBeChecked();
  });

  it('disables bulk controls during saving and omits them without eligible installments', () => {
    const view = render(<Editor busy />);
    expect(screen.getByRole('textbox', { name: 'Amount per installment' })).toBeDisabled();
    expect(apply()).toBeDisabled();
    expect(
      screen.getByRole('checkbox', { name: 'Select all installments for bulk actions' })
    ).toBeDisabled();
    view.rerender(<Editor zeroEligible />);
    expect(screen.queryByRole('button', { name: 'Apply to all installments' })).toBeNull();
  });
});
