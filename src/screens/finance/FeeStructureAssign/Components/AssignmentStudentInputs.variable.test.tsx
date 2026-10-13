import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import AssignmentStudentInputs from './AssignmentStudentInputs';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/finance/studentFeeAssignment', () => ({
  useAssignmentTransportSourcesQuery: () => ({}),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, value }: any) => (
    <select aria-label={label} value={value} onChange={() => {}}>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

const candidate = {
  heads: [
    {
      feeHeadId: 'hostel',
      feeHeadName: 'Hostel',
      isVariable: true,
      isOptional: false,
      configuredAmount: null,
    },
    {
      feeHeadId: 'transport',
      feeHeadName: 'Transport',
      isVariable: true,
      isOptional: true,
      configuredAmount: null,
      supportsTransportSource: true,
    },
    {
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition',
      isVariable: false,
      isOptional: false,
      configuredAmount: 5000,
    },
  ],
} as AssignmentCandidate;

function Harness({ changed }: { changed: (request: AssignmentRequest) => void }) {
  const [request, setRequest] = useState<AssignmentRequest>({
    studentId: 'student',
    academicYearId: 'year',
    standardFeeStructureId: 'structure',
    selectedOptionalFeeHeadIds: [],
    servicePeriods: [],
    feeHeadDetails: [],
    variableFeeHeads: [],
  });
  return (
    <AssignmentStudentInputs
      candidate={candidate}
      request={request}
      onChange={(value) => {
        changed(value);
        setRequest(value);
      }}
      canOverrideDates={false}
      disabled={false}
    />
  );
}

describe('variable student inputs', () => {
  it('shows mandatory variable entry with assignment access and requires optional selection first', () => {
    render(<Harness changed={vi.fn()} />);
    expect(screen.getByLabelText(/Hostel student amount/)).toHaveValue('');
    expect(screen.queryByLabelText(/Transport student amount/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/amount override/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /Transport.*Optional/ }));
    expect(screen.getByLabelText(/Transport student amount/)).toHaveValue('');
    const tuition = within(screen.getByRole('region', { name: 'Tuition' }));
    expect(tuition.getByText('₹ 5,000')).toBeInTheDocument();
    expect(tuition.getByText('Mandatory')).toBeInTheDocument();
    expect(tuition.queryByRole('textbox')).not.toBeInTheDocument();
    expect(tuition.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Verified transport service' })
    ).not.toBeInTheDocument();
  });

  it('keeps blank distinct from zero and clears a deselected optional amount', () => {
    const changed = vi.fn();
    render(<Harness changed={changed} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Transport.*Optional/ }));
    const field = screen.getByLabelText(/Transport student amount/);
    fireEvent.change(field, { target: { value: '1200.01' } });
    expect(changed.mock.lastCall?.[0].variableFeeHeads[0].amount).toBe(1200.01);
    expect(field).toHaveValue('₹ 1,200.01');
    fireEvent.change(field, { target: { value: '' } });
    expect(changed.mock.lastCall?.[0].variableFeeHeads[0].amount).toBeNull();
    fireEvent.change(field, { target: { value: '0' } });
    expect(screen.getByLabelText(/reason for zero/i)).toBeRequired();
    fireEvent.click(screen.getByRole('checkbox', { name: /Transport.*Optional/ }));
    expect(changed.mock.lastCall?.[0].variableFeeHeads).toEqual([]);
    expect(screen.queryByLabelText(/Transport student amount/)).not.toBeInTheDocument();
  });

  it('blocks a value above the server limit while typing', () => {
    const changed = vi.fn();
    render(<Harness changed={changed} />);
    const field = screen.getByLabelText(/Hostel student amount/);
    fireEvent.change(field, { target: { value: '1300000000000000000' } });
    expect(field).toHaveValue('');
    expect(changed).not.toHaveBeenCalled();
  });
});
