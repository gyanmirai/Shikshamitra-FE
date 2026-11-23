import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import AssignmentStudentInputs from './AssignmentStudentInputs';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-date-range-picker', () => ({ CustomDateRangePicker: () => null }));
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
      supportsMonthlyRate: true,
      isOptional: false,
      configuredAmount: null,
    },
    {
      feeHeadId: 'transport',
      feeHeadName: 'Transport',
      isVariable: true,
      supportsMonthlyRate: true,
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

function Harness({
  changed,
  editing = false,
}: {
  changed: (request: AssignmentRequest) => void;
  editing?: boolean;
}) {
  const [request, setRequest] = useState<AssignmentRequest>({
    studentId: 'student',
    academicYearId: 'year',
    standardFeeStructureId: 'structure',
    ...(editing && { editAssignmentId: 'assignment' }),
    selectedOptionalFeeHeadIds: [],
    servicePeriods: [],
    feeHeadDetails: [],
    variableFeeHeads: [],
  });
  return (
    <AssignmentStudentInputs
      candidate={
        editing
          ? {
              ...candidate,
              heads: [
                ...candidate.heads,
                {
                  ...candidate.heads[2],
                  feeHeadId: 'activity',
                  feeHeadName: 'Activity',
                  isOptional: true,
                },
              ],
            }
          : candidate
      }
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
    const hostel = within(screen.getByRole('region', { name: 'Hostel' }));
    const transport = within(screen.getByRole('region', { name: 'Transport' }));
    expect(transport.getByText('Optional', { exact: true })).toBeVisible();
    expect(hostel.getByRole('textbox', { name: 'Monthly amount' })).toHaveAccessibleDescription(
      'Charged for each covered month.'
    );
    expect(hostel.getByRole('textbox', { name: 'Monthly amount' })).toHaveValue('');
    expect(transport.queryByRole('textbox', { name: 'Monthly amount' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/amount override/i)).not.toBeInTheDocument();
    const transportCheckbox = transport.getByRole('checkbox', { name: 'Transport' });
    fireEvent.click(transport.getByText('Transport', { exact: true }));
    expect(transportCheckbox).toBeChecked();
    expect(transport.getByRole('textbox', { name: 'Monthly amount' })).toHaveValue('');
    const tuition = within(screen.getByRole('region', { name: 'Tuition' }));
    expect(tuition.getByText('₹ 5,000')).toBeInTheDocument();
    expect(tuition.getByText('Required')).toBeInTheDocument();
    expect(tuition.queryByRole('textbox')).not.toBeInTheDocument();
    expect(tuition.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Transport service' })).not.toBeInTheDocument();
  });

  it('keeps blank distinct from zero and clears a deselected optional amount', () => {
    const changed = vi.fn();
    render(<Harness changed={changed} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Transport' }));
    const transport = within(screen.getByRole('region', { name: 'Transport' }));
    const field = transport.getByRole('textbox', { name: 'Monthly amount' });
    fireEvent.change(field, { target: { value: '1200.01' } });
    expect(changed.mock.lastCall?.[0].variableFeeHeads[0].amount).toBe(1200.01);
    expect(changed.mock.lastCall?.[0].variableFeeHeads[0].isMonthlyRate).toBe(true);
    expect(field).toHaveValue('₹ 1,200.01');
    fireEvent.change(field, { target: { value: '' } });
    expect(changed.mock.lastCall?.[0].variableFeeHeads[0].amount).toBeNull();
    fireEvent.change(field, { target: { value: '0' } });
    expect(screen.getByLabelText(/reason for zero/i)).toBeRequired();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Transport' }));
    expect(changed.mock.lastCall?.[0].variableFeeHeads).toEqual([]);
    expect(transport.queryByRole('textbox', { name: 'Monthly amount' })).not.toBeInTheDocument();
  });

  it('uses a monthly amount directly for a variable fee with a monthly term', () => {
    const changed = vi.fn();
    render(<Harness changed={changed} />);
    const hostel = within(screen.getByRole('region', { name: 'Hostel' }));
    expect(hostel.queryByRole('checkbox', { name: 'Charge per month' })).not.toBeInTheDocument();
    fireEvent.change(hostel.getByRole('textbox', { name: 'Monthly amount' }), {
      target: { value: '5000' },
    });
    expect(changed.mock.lastCall?.[0].variableFeeHeads[0]).toMatchObject({
      amount: 5000,
      isMonthlyRate: true,
    });
  });

  it('keeps the fixed optional amount read-only while allowing selection during correction', () => {
    const changed = vi.fn();
    render(<Harness changed={changed} editing />);
    const optional = screen.getByRole('checkbox', { name: 'Activity' });
    fireEvent.click(optional);
    const activity = within(screen.getByRole('region', { name: 'Activity' }));
    expect(activity.getByText('₹ 5,000')).toBeVisible();
    expect(activity.queryByLabelText(/Activity amount/)).not.toBeInTheDocument();
    expect(changed.mock.lastCall?.[0].feeHeadDetails).toEqual([]);
    fireEvent.click(optional);
    expect(changed.mock.lastCall?.[0].selectedOptionalFeeHeadIds).toEqual([]);
    expect(changed.mock.lastCall?.[0].feeHeadDetails).toEqual([]);
  });

  it('blocks a value above the server limit while typing', () => {
    const changed = vi.fn();
    render(<Harness changed={changed} />);
    const hostel = within(screen.getByRole('region', { name: 'Hostel' }));
    const field = hostel.getByRole('textbox', { name: 'Monthly amount' });
    fireEvent.change(field, { target: { value: '1300000000000000000' } });
    expect(field).toHaveValue('');
    expect(changed).not.toHaveBeenCalled();
  });
});
