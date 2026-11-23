import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import AssignmentStudentInputs from './AssignmentStudentInputs';
import { assignmentYearBounds, assignmentServiceDateError } from './assignmentServiceDates';

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
vi.mock('src/components/custom-date-range-picker', () => ({
  CustomDateRangePicker: ({
    label,
    value,
    minDate,
    maxDate,
    disabled,
    readOnly,
    helperText,
    onChange,
  }: any) => (
    <>
      <input
        aria-label={label}
        disabled={disabled}
        readOnly={readOnly}
        value={value.map((date: any) => date?.format('YYYY-MM-DD') ?? '').join(' to ')}
        data-min={minDate?.format('YYYY-MM-DD')}
        data-max={maxDate?.format('YYYY-MM-DD')}
        onChange={(event) =>
          onChange(
            event.target.value === 'invalid' || !event.target.value
              ? [null, null]
              : event.target.value.split(' to ').map((date) => dayjs(date))
          )
        }
      />
      {helperText && <span>{helperText}</span>}
    </>
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
      flat
      allowTransportSource={allowTransportSource}
      yearBounds={available ? assignmentYearBounds(year, 'year') : undefined}
      onChange={(value) => {
        changed(value);
        setRequest(value);
      }}
    />
  );
}
describe('shared assignment date picker', () => {
  it('summarizes required service dates and only shows a picker for optional fees during correction', () => {
    render(
      <AssignmentStudentInputs
        candidate={{
          ...candidate,
          heads: [
            ...candidate.heads,
            { ...candidate.heads[0], feeHeadId: 'bus', feeHeadName: 'Bus', isOptional: true },
          ],
        }}
        request={{
          studentId: 'student',
          academicYearId: 'year',
          standardFeeStructureId: 'structure',
          editAssignmentId: 'saved',
          selectedOptionalFeeHeadIds: ['bus'],
          feeHeadDetails: [],
          servicePeriods: [],
        }}
        disabled={false}
        canOverrideDates
        onChange={vi.fn()}
        yearBounds={assignmentYearBounds(year, 'year')}
        flat
      />
    );
    const required = within(screen.getByRole('region', { name: 'Tuition' }));
    expect(required.getByText('Service dates')).toBeVisible();
    expect(required.queryByLabelText('Effective start – end date')).not.toBeInTheDocument();
    expect(required.queryByRole('button', { name: 'Use transport dates' })).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Bus' })).getByLabelText(
        'Effective start – end date'
      )
    ).not.toHaveAttribute('readonly');
  });

  it('shows verified admission dates without allowing an academic-year bypass', () => {
    const period = {
      feeHeadId: 'tuition',
      source: 'Registration',
      sourceReferenceId: 'application',
      startDate: '2026-08-20T00:00:00Z',
      endDate: '2027-05-14T00:00:00Z',
    } as any;
    render(
      <AssignmentStudentInputs
        candidate={{ ...candidate, heads: [{ ...candidate.heads[0], servicePeriod: period }] }}
        request={{
          studentId: 'student',
          academicYearId: 'year',
          standardFeeStructureId: 'structure',
          selectedOptionalFeeHeadIds: [],
          feeHeadDetails: [],
          servicePeriods: [period],
        }}
        disabled={false}
        canOverrideDates={false}
        onChange={vi.fn()}
        yearBounds={assignmentYearBounds(year, 'year')}
        flat
      />
    );
    expect(screen.getByLabelText('Effective start – end date')).toHaveValue(
      '2026-08-20 to 2027-05-14'
    );
    expect(screen.getByLabelText('Effective start – end date')).toHaveAttribute('readonly');
    expect(screen.queryByRole('combobox', { name: 'Service period' })).not.toBeInTheDocument();
  });

  it('only offers a verified transport record for individual assignments', () => {
    const view = render(<Harness changed={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use transport dates' }));
    expect(screen.getByRole('combobox', { name: 'Transport record' })).toBeInTheDocument();
    view.rerender(<Harness changed={vi.fn()} allowTransportSource={false} />);
    expect(screen.queryByRole('combobox', { name: 'Transport record' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Use transport dates' })).not.toBeInTheDocument();
  });

  it('starts on the academic-year range and accepts a custom range without a reason', () => {
    const changed = vi.fn();
    render(<Harness changed={changed} />);
    const dates = screen.getByLabelText('Effective start – end date');
    expect(dates).toHaveValue('2026-06-15 to 2027-05-14');
    expect(dates).toHaveAttribute('data-min', year.startDate);
    expect(dates).toHaveAttribute('data-max', year.endDate);
    expect(screen.queryByLabelText(/Reason for changing dates/)).not.toBeInTheDocument();

    fireEvent.change(dates, { target: { value: '2026-08-01 to 2026-10-31' } });
    expect(changed.mock.lastCall?.[0].servicePeriods).toEqual([
      {
        feeHeadId: 'tuition',
        source: 'ManualOverride',
        startDate: '2026-08-01T00:00:00Z',
        endDate: '2026-10-31T00:00:00Z',
      },
    ]);
    expect(screen.queryByLabelText(/Reason for changing dates/)).not.toBeInTheDocument();

    fireEvent.change(dates, { target: { value: '2026-06-15 to 2027-05-14' } });
    expect(changed.mock.lastCall?.[0].servicePeriods).toEqual([
      { feeHeadId: 'tuition', source: 'AcademicYear' },
    ]);
    expect(screen.queryByLabelText(/Reason for changing dates/)).not.toBeInTheDocument();
  });

  it('disables the picker when dates are unavailable', () => {
    render(<Harness changed={vi.fn()} available={false} />);
    expect(screen.getByLabelText('Effective start – end date')).toBeDisabled();
    expect(screen.getByText('Selected academic year dates are unavailable.')).toBeVisible();
  });

  it.each(['invalid', ''])('blocks preview for an invalid or cleared date draft (%s)', (draft) => {
    const changed = vi.fn();
    render(<Harness changed={changed} />);
    const dates = screen.getByLabelText('Effective start – end date');
    fireEvent.change(dates, { target: { value: '2026-08-01 to 2026-10-31' } });
    fireEvent.change(dates, { target: { value: draft } });
    expect(
      assignmentServiceDateError(
        candidate,
        changed.mock.lastCall?.[0],
        assignmentYearBounds(year, 'year')
      )
    ).toBe('Tuition: Enter a valid start date.');
    fireEvent.change(dates, { target: { value: '2026-08-01 to 2026-10-31' } });
    expect(
      assignmentServiceDateError(
        candidate,
        changed.mock.lastCall?.[0],
        assignmentYearBounds(year, 'year')
      )
    ).toBeUndefined();
  });
});

it('shows saved transport dates in a bulk correction without sharing a student transport picker', () => {
  render(
    <AssignmentStudentInputs
      candidate={candidate}
      request={{
        studentId: 'student',
        academicYearId: 'year',
        standardFeeStructureId: 'structure',
        selectedOptionalFeeHeadIds: [],
        feeHeadDetails: [],
        servicePeriods: [
          {
            feeHeadId: 'tuition',
            source: 'TransportService',
            sourceReferenceId: 'saved-route',
            startDate: '2026-08-01',
            endDate: '2027-05-14',
          },
        ],
      }}
      disabled={false}
      canOverrideDates
      allowTransportSource={false}
      onChange={vi.fn()}
      yearBounds={assignmentYearBounds(year, 'year')}
      flat
    />
  );
  expect(screen.getByLabelText('Effective start – end date')).toHaveValue(
    '2026-08-01 to 2027-05-14'
  );
  expect(screen.queryByRole('combobox', { name: 'Transport record' })).not.toBeInTheDocument();
});
