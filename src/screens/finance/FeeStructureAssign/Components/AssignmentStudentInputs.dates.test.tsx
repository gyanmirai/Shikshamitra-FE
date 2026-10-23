import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AssignmentStudentInputs from './AssignmentStudentInputs';
import { assignmentYearBounds } from './assignmentServiceDates';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/finance/studentFeeAssignment', () => ({
  useAssignmentTransportSourcesQuery: () => ({}),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange }: any) => (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, minDate, maxDate, disabled, slotProps, onChange }: any) => (
    <div>
      {label}
      <input
        id={`date-${label}`}
        aria-label={label}
        disabled={disabled}
        value={value?.format('YYYY-MM-DD') ?? ''}
        data-min={minDate?.format('YYYY-MM-DD')}
        data-max={maxDate?.format('YYYY-MM-DD')}
        onChange={(e) => onChange(e.target.value ? dayjs(e.target.value) : null)}
      />
      {slotProps.textField.helperText && <span role="alert">{slotProps.textField.helperText}</span>}
    </div>
  ),
}));

const year = { id: 'year', startDate: '2026-06-15', endDate: '2027-05-14' };
const candidate = {
  heads: [
    {
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition',
      isOptional: false,
      configuredAmount: 1200,
      supportsTransportSource: true,
    },
  ],
} as AssignmentCandidate;
function Harness({
  changed,
  available = true,
  allowTransportSource = true,
}: {
  changed: (value: AssignmentRequest) => void;
  available?: boolean;
  allowTransportSource?: boolean;
}) {
  const [request, setRequest] = useState<AssignmentRequest>({
    studentId: 'student',
    academicYearId: 'year',
    standardFeeStructureId: 'structure',
    selectedOptionalFeeHeadIds: [],
    feeHeadDetails: [],
    servicePeriods: [],
  });
  return (
    <AssignmentStudentInputs
      candidate={candidate}
      request={request}
      disabled={false}
      canOverrideDates
      allowTransportSource={allowTransportSource}
      yearBounds={available ? assignmentYearBounds(year, 'year') : undefined}
      onChange={(value) => {
        changed(value);
        setRequest(value);
      }}
    />
  );
}
const openDates = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Expand Tuition' }));
  fireEvent.change(screen.getByRole('combobox', { name: 'Service period' }), {
    target: { value: 'ManualOverride' },
  });
};

describe('shared assignment date pickers', () => {
  it('keeps individual transport sources out of the common bulk editor', () => {
    const view = render(<Harness changed={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand Tuition' }));
    expect(screen.getByRole('option', { name: 'Transport service' })).toBeInTheDocument();
    view.rerender(<Harness changed={vi.fn()} allowTransportSource={false} />);
    expect(screen.queryByRole('option', { name: 'Transport service' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Academic year' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Custom dates' })).toBeInTheDocument();
  });
  it('passes configured global bounds and preserves typed out-of-year values with an error', () => {
    const changed = vi.fn();
    render(<Harness changed={changed} />);
    openDates();
    expect(screen.getByLabelText('Start date')).toHaveAttribute('data-min', year.startDate);
    expect(screen.getByLabelText('Start date')).toHaveAttribute('data-max', year.endDate);
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-06-14' } });
    expect(screen.getByRole('alert')).toHaveTextContent('within the selected academic year');
    expect(changed.mock.lastCall?.[0].servicePeriods[0].startDate).toBe('2026-06-14T00:00:00Z');
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-08-01' } });
    expect(screen.getByLabelText('End date')).toHaveAttribute('data-min', '2026-08-01');
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-07-01' } });
    expect(screen.getByRole('alert')).toHaveTextContent('on or after start date');
  });
  it('keeps date entry disabled when the selected year has no configured bounds', () => {
    render(<Harness changed={vi.fn()} available={false} />);
    openDates();
    expect(screen.getByLabelText('Start date')).toBeDisabled();
    expect(screen.getByLabelText('End date')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Selected academic year dates are unavailable'
    );
  });
});
