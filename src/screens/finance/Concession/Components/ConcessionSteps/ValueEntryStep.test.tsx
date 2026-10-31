import { useFormik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import ValueEntryStep from './ValueEntryStep';
import ConcessionImpactSummary from '../ConcessionImpactSummary';
import {
  policy,
  context,
  preview,
} from '../../../../../../e2e/fixtures/concession-request-ui/data';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const theme = createTheme(defaultSettings);

function Editor({
  fixed = false,
  policyFixed = false,
  empty = false,
  compact = false,
  maximumPercentage = 25,
  maximumFixedAmount = 1000 as number | null,
  eligibleAmount = 2500,
  initialEntries = {} as Record<string, number | string>,
}) {
  const formik = useFormik({
    initialValues: {
      concessionTypeId: 'sibling',
      concessionTypeIds: ['sibling'],
      selectedFeeHeads: { sibling: empty ? [] : ['tuition'] },
      dueFeeEntries: initialEntries,
      valueEntries: {},
    },
    onSubmit: () => undefined,
    validateOnChange: false,
  });
  return (
    <ThemeProvider theme={theme}>
      <ValueEntryStep
        compact={compact}
        showPolicyFixedDetails={!compact}
        formik={formik}
        concessionTypes={[{ id: 'sibling', name: 'Sibling tuition concession' }]}
        requestContext={{
          ...context,
          eligibleDueFees: context.eligibleDueFees.map((line) => ({
            ...line,
            eligibleConcessionAmount: eligibleAmount,
          })),
        }}
        preview={preview}
        policy={{
          ...policy,
          valueSource: policyFixed ? 'PolicyFixed' : policy.valueSource,
          calculationMethod: fixed ? 'FixedAmount' : 'Percentage',
          percentageValue: 8,
          maximumFixedAmount,
          maximumPercentage,
        }}
      />
      <output aria-label="Raw entries">{JSON.stringify(formik.values.dueFeeEntries)}</output>
      <output aria-label="Policy entries">{JSON.stringify(formik.values.valueEntries)}</output>
      <button
        type="button"
        onClick={() =>
          formik.setFieldValue('selectedFeeHeads', {
            sibling: formik.values.selectedFeeHeads.sibling.length ? [] : ['tuition'],
          })
        }
      >
        Toggle tuition selection
      </button>
    </ThemeProvider>
  );
}

describe('concession values and review', () => {
  it('uses the common embedded table for installment entry without extra record controls', () => {
    render(<Editor />);
    const table = screen.getByRole('table', { name: 'Installment concessions table' });
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getByRole('columnheader', { name: 'Installment / fee' })).toBeVisible();
    expect(within(table).getByRole('columnheader', { name: 'Eligible' })).toBeVisible();
    expect(within(table).getAllByRole('textbox')).toHaveLength(2);
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
  });
  it('shares a 50% allowance across installments and releases it when an entry is reduced', () => {
    render(<Editor maximumPercentage={50} />);
    const first = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession percentage',
    });
    const second = screen.getByRole('textbox', {
      name: 'Half-Yearly 2 School tuition concession percentage',
    });
    fireEvent.change(first, { target: { value: '30' } });
    fireEvent.change(second, { target: { value: '30' } });
    expect(screen.getByLabelText('Raw entries')).not.toHaveTextContent('"due-2":"30"');
    fireEvent.change(second, { target: { value: '20' } });
    const allowance = screen.getByRole('status', { name: 'Concession request allowance' });
    expect(allowance).toHaveTextContent('Maximum concession allowed: 50%');
    expect(allowance).toHaveTextContent('Entered: 50%');
    expect(allowance).toHaveTextContent('Remaining: 0%');
    fireEvent.change(first, { target: { value: '20' } });
    fireEvent.change(second, { target: { value: '30' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-2":"30"');
  });
  it('keeps raw values and validation in the minimal installment layout', () => {
    render(<Editor fixed compact />);
    const input = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    fireEvent.change(input, { target: { value: '0.1' } });
    expect(input).toHaveValue('₹ 0.1');
    expect(input).toHaveAccessibleDescription(/whole rupee/);
    expect(screen.queryByText('Calculated')).not.toBeInTheDocument();
    expect(screen.queryByText('Estimated reduction')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: '100' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-1":"100"');
  });
  it('marks restored percentage totals over the request limit invalid', () => {
    render(<Editor maximumPercentage={50} initialEntries={{ 'due-1': '30', 'due-2': '30' }} />);
    expect(screen.getByRole('status', { name: 'Concession request allowance' })).toHaveTextContent(
      'Remaining: —'
    );
    expect(
      screen.getByRole('textbox', { name: 'Half-Yearly 1 School tuition concession percentage' })
    ).toHaveAccessibleDescription(/total concession percentage exceeds the 50% request limit/);
    expect(
      screen.getByRole('textbox', { name: 'Half-Yearly 2 School tuition concession percentage' })
    ).toHaveAccessibleDescription(/total concession percentage exceeds the 50% request limit/);
  });
  it('shows fractional money as invalid without rounding its reduction to a rupee', () => {
    render(<Editor fixed />);
    const input = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    fireEvent.change(input, { target: { value: '0.1' } });
    expect(input).toHaveValue('₹ 0.1');
    expect(input).toHaveAccessibleDescription(/whole rupee/);
    const row = input.closest('tr') as HTMLElement;
    expect(within(row).getByText('—')).toBeVisible();
    const allowance = screen.getByRole('status', { name: 'Concession request allowance' });
    expect(allowance).toHaveTextContent(/Entered: —/);
    expect(allowance).toHaveTextContent(/Remaining: —/);
    fireEvent.change(input, { target: { value: '1' } });
    expect(input).not.toHaveAccessibleDescription(/whole rupee/);
  });
  it('keeps decimal percentage text, clears to empty, and enforces the policy limit', () => {
    render(<Editor />);
    const input = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession percentage',
    });
    expect(input).toHaveAccessibleDescription(/Maximum: 25%/);
    fireEvent.change(input, { target: { value: '8.' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-1":"8."');
    fireEvent.change(input, { target: { value: '8.25' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-1":"8.25"');
    fireEvent.change(input, { target: { value: '26' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-1":"8.25"');
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-1":""');
  });
  it('preserves decimal fixed amounts and the maximum across installments', () => {
    render(<Editor fixed />);
    const first = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    const second = screen.getByRole('textbox', {
      name: 'Half-Yearly 2 School tuition concession amount',
    });
    fireEvent.change(first, { target: { value: '750.25' } });
    fireEvent.change(second, { target: { value: '250' } });
    expect(screen.getByLabelText('Raw entries')).not.toHaveTextContent('"due-2":"250"');
    fireEvent.change(second, { target: { value: '249.75' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-2":"249.75"');
  });
  it('shows the live shared cap and allows reallocating amounts after reaching it', () => {
    render(<Editor fixed />);
    const allowance = screen.getByRole('status', { name: 'Concession request allowance' });
    expect(allowance).toHaveTextContent(/Maximum concession allowed: ₹\s*1,000/);
    expect(allowance).toHaveTextContent(/Entered: ₹\s*0/);
    expect(allowance).toHaveTextContent(/Remaining: ₹\s*1,000/);
    const first = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    const second = screen.getByRole('textbox', {
      name: 'Half-Yearly 2 School tuition concession amount',
    });
    fireEvent.change(first, { target: { value: '1000' } });
    expect(allowance).toHaveTextContent(/Entered: ₹\s*1,000/);
    expect(allowance).toHaveTextContent(/Remaining: ₹\s*0/);
    expect(allowance).toHaveTextContent(/Maximum concession reached/);
    fireEvent.change(second, { target: { value: '1' } });
    expect(screen.getByLabelText('Raw entries')).not.toHaveTextContent('"due-2":"1"');
    fireEvent.change(first, { target: { value: '900' } });
    expect(allowance).toHaveTextContent(/Remaining: ₹\s*100/);
    expect(allowance).not.toHaveTextContent(/Maximum concession reached/);
    fireEvent.change(second, { target: { value: '100' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-2":"100"');
    expect(allowance).toHaveTextContent(/Maximum concession reached/);
  });
  it('updates the policy allowance immediately for the reported ₹11,111 cap', () => {
    render(<Editor fixed compact maximumFixedAmount={11111} eligibleAmount={15000} />);
    const allowance = screen.getByRole('status', { name: 'Concession request allowance' });
    const first = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    const second = screen.getByRole('textbox', {
      name: 'Half-Yearly 2 School tuition concession amount',
    });
    fireEvent.change(first, { target: { value: '10111' } });
    expect(allowance).toHaveTextContent(/Maximum concession allowed: ₹\s*11,111/);
    expect(allowance).toHaveTextContent(/Entered: ₹\s*10,111/);
    expect(allowance).toHaveTextContent(/Remaining: ₹\s*1,000/);
    fireEvent.change(second, { target: { value: '1001' } });
    expect(screen.getByLabelText('Raw entries')).not.toHaveTextContent('"due-2":"1001"');
    fireEvent.change(second, { target: { value: '1000' } });
    expect(allowance).toHaveTextContent(/Entered: ₹\s*11,111/);
    expect(allowance).toHaveTextContent(/Remaining: ₹\s*0/);
    expect(allowance).toHaveTextContent(/Maximum concession reached/);
    fireEvent.change(first, { target: { value: '10112' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-1":"10111"');
    fireEvent.change(second, { target: { value: '' } });
    expect(allowance).toHaveTextContent(/Remaining: ₹\s*1,000/);
    expect(allowance).not.toHaveTextContent(/Maximum concession reached/);
  });
  it('omits an uncapped fixed allowance and shows the percentage request allowance', () => {
    const { unmount } = render(<Editor fixed maximumFixedAmount={null} />);
    expect(screen.queryByRole('status', { name: 'Concession request allowance' })).toBeNull();
    unmount();
    render(<Editor />);
    expect(screen.getByRole('status', { name: 'Concession request allowance' })).toHaveTextContent(
      'Maximum concession allowed: 25%'
    );
  });
  it('recalculates restored entries when the selected fees or cap changes', () => {
    const { rerender } = render(
      <Editor fixed initialEntries={{ 'due-1': '800', 'unselected-due': '500' }} />
    );
    expect(screen.getByRole('status', { name: 'Concession request allowance' })).toHaveTextContent(
      /Remaining: ₹\s*200/
    );
    rerender(<Editor fixed maximumFixedAmount={900} />);
    expect(screen.getByRole('status', { name: 'Concession request allowance' })).toHaveTextContent(
      /Remaining: ₹\s*100/
    );
    fireEvent.click(screen.getByRole('button', { name: 'Toggle tuition selection' }));
    expect(screen.queryByRole('status', { name: 'Concession request allowance' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle tuition selection' }));
    expect(screen.getByRole('status', { name: 'Concession request allowance' })).toHaveTextContent(
      /Entered: ₹\s*800/
    );
  });
  it('marks restored over-limit entries invalid instead of announcing that the cap is reached', () => {
    render(<Editor fixed initialEntries={{ 'due-1': '1100' }} />);
    const allowance = screen.getByRole('status', { name: 'Concession request allowance' });
    expect(allowance).not.toHaveTextContent(/Maximum concession reached/);
    expect(allowance).toHaveTextContent(/Remaining: —/);
    expect(
      screen.getByRole('textbox', {
        name: 'Half-Yearly 1 School tuition concession amount',
      })
    ).toHaveAccessibleDescription(/total concession exceeds the policy limit/);
  });
  it('announces a zero allowance and prevents a positive entry', () => {
    render(<Editor fixed maximumFixedAmount={0} />);
    const allowance = screen.getByRole('status', { name: 'Concession request allowance' });
    expect(allowance).toHaveTextContent(/Maximum concession allowed: ₹\s*0/);
    expect(allowance).toHaveTextContent(/Remaining: ₹\s*0/);
    expect(allowance).toHaveTextContent(/Maximum concession reached/);
    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Half-Yearly 1 School tuition concession amount',
      }),
      { target: { value: '1' } }
    );
    expect(screen.getByLabelText('Raw entries')).not.toHaveTextContent('"due-1":"1"');
  });
  it('shows each installment year once and groups the calculated reduction beside its input', () => {
    render(<Editor fixed />);
    expect(screen.getByText('Half-Yearly 1 2026')).toBeVisible();
    const first = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    const row = first.closest('tr');
    expect(row).toBeTruthy();
    expect(within(row as HTMLElement).getByText(/−₹\s*0/)).toBeInTheDocument();
    expect(screen.queryByText('Calculated')).not.toBeInTheDocument();
  });
  it('keeps policy values read-only and uses the server result', () => {
    render(<Editor policyFixed />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText(/calculated automatically/i)).toBeInTheDocument();
    expect(screen.getByText(/4,600/)).toBeInTheDocument();
  });
  it('preserves policy command defaults when the side panel presents the fee impact', () => {
    render(<Editor policyFixed compact />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/calculated automatically/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Policy entries')).toHaveTextContent(
      '"tuition":{"basedOn":1,"amount":0,"netAmount":5000}'
    );
  });
  it('explains an empty selection without referring to nonexistent steps', () => {
    render(<Editor empty />);
    expect(
      screen.getByText('Select fee heads above to enter concession values.')
    ).toBeInTheDocument();
  });
  it('retains all summary metrics during recalculation and shows server totals when ready', () => {
    const { rerender } = render(<ConcessionImpactSummary selectedFeeHeadCount={1} loading />);
    expect(screen.getByRole('status')).toHaveTextContent('Calculating fee impact');
    expect(screen.getByText('Before concession')).toBeInTheDocument();
    expect(screen.getByText('Concession')).toBeInTheDocument();
    expect(screen.getByText('After concession')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(3);
    rerender(<ConcessionImpactSummary selectedFeeHeadCount={1} preview={preview} />);
    expect(screen.getByText(/400/)).toBeInTheDocument();
    expect(screen.getByText(/4,600/)).toBeInTheDocument();
  });
});
