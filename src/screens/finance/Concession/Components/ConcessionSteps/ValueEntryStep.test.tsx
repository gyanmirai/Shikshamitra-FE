import { useFormik } from 'formik';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import ValueEntryStep from './ValueEntryStep';
import ConcessionImpactSummary from '../ConcessionImpactSummary';
import {
  policy,
  context,
  preview,
} from '../../../../../../e2e/fixtures/concession-request-ui/data';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function Editor({ fixed = false, policyFixed = false, empty = false }) {
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
    </>
  );
}

describe('concession values and review', () => {
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
  it('keeps policy values read-only and uses the server result', () => {
    render(<Editor policyFixed />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText(/calculated automatically/i)).toBeInTheDocument();
    expect(screen.getByText(/4,600/)).toBeInTheDocument();
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
