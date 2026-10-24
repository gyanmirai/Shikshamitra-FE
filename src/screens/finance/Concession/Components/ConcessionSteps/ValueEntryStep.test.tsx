import { useFormik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import ValueEntryStep from './ValueEntryStep';
import ConcessionImpactSummary from '../ConcessionImpactSummary';
import {
  policy,
  context,
  preview,
} from '../../../../../../e2e/fixtures/concession-request-ui/data';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function Editor({ fixed = false, policyFixed = false, empty = false, compact = false }) {
  const formik = useFormik({
    initialValues: {
      concessionTypeId: 'sibling',
      concessionTypeIds: ['sibling'],
      selectedFeeHeads: { sibling: empty ? [] : ['tuition'] },
      dueFeeEntries: {},
      valueEntries: {},
    },
    onSubmit: () => undefined,
  });
  return (
    <>
      <ValueEntryStep
        showPolicyFixedDetails={!compact}
        formik={formik}
        concessionTypes={[{ id: 'sibling', name: 'Sibling tuition concession' }]}
        requestContext={context}
        preview={preview}
        policy={{
          ...policy,
          valueSource: policyFixed ? 'PolicyFixed' : policy.valueSource,
          calculationMethod: fixed ? 'FixedAmount' : 'Percentage',
          percentageValue: 8,
        }}
      />
      <output aria-label="Raw entries">{JSON.stringify(formik.values.dueFeeEntries)}</output>
      <output aria-label="Policy entries">{JSON.stringify(formik.values.valueEntries)}</output>
    </>
  );
}

describe('concession values and review', () => {
  it('shows fractional money as invalid without rounding its reduction to a rupee', () => {
    render(<Editor fixed />);
    const input = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    fireEvent.change(input, { target: { value: '0.1' } });
    expect(input).toHaveValue('₹ 0.1');
    expect(input).toHaveAccessibleDescription(/whole rupee/);
    const row = input.closest('.MuiTextField-root')?.parentElement as HTMLElement;
    expect(within(row).getByText('—')).toBeVisible();
    expect(screen.getByRole('status', { name: 'Concession request allowance' })).toHaveTextContent(
      'Correct the invalid installment amounts'
    );
    fireEvent.change(input, { target: { value: '1' } });
    expect(input).not.toHaveAccessibleDescription(/whole rupee/);
  });
  it('keeps decimal percentage text, clears to empty, and enforces the policy limit', () => {
    render(<Editor />);
    const input = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession percentage',
    });
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
  it('explains the shared request cap, rejects excess input, and restores allowance when another value decreases', () => {
    render(<Editor fixed />);
    expect(screen.getByText(/Maximum concession for this request:/)).toHaveTextContent('1,000');
    expect(screen.getByText(/shared across all selected installments/)).toBeVisible();
    const first = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    const second = screen.getByRole('textbox', {
      name: 'Half-Yearly 2 School tuition concession amount',
    });
    fireEvent.change(first, { target: { value: '1000' } });
    expect(screen.getByRole('status', { name: 'Concession request allowance' })).toHaveTextContent(
      /Entered:.*1,000.*Remaining:.*0/
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Reduce another concession value before entering an amount here.'
    );
    expect(second).toHaveAccessibleDescription(/Available:.*0/);
    fireEvent.change(second, { target: { value: '1' } });
    expect(screen.getByLabelText('Raw entries')).not.toHaveTextContent('"due-2":"1"');
    fireEvent.change(first, { target: { value: '900' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(second).toHaveAccessibleDescription(/Available:.*100/);
    fireEvent.change(second, { target: { value: '100' } });
    expect(screen.getByLabelText('Raw entries')).toHaveTextContent('"due-2":"100"');
  });
  it('shows each installment year once and groups the calculated reduction beside its input', () => {
    render(<Editor fixed />);
    expect(screen.getByText('Half-Yearly 1 2026')).toBeVisible();
    const first = screen.getByRole('textbox', {
      name: 'Half-Yearly 1 School tuition concession amount',
    });
    const row = first.closest('.MuiTextField-root')?.parentElement;
    expect(row).toBeTruthy();
    expect(within(row as HTMLElement).getByText('Calculated')).toBeInTheDocument();
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
    expect(screen.getByText('Eligible fee amount')).toBeInTheDocument();
    expect(screen.getByText('Concession reduction')).toBeInTheDocument();
    expect(screen.getByText('Net payable')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(3);
    rerender(<ConcessionImpactSummary selectedFeeHeadCount={1} preview={preview} />);
    expect(screen.getByRole('status')).toHaveTextContent('8.0% reduction');
    expect(screen.getByText(/4,600/)).toBeInTheDocument();
  });
});
