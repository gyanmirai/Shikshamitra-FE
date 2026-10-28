import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdmissionMasterDataRuntimeField } from './admission-master-data-runtime-field';

const mocks = vi.hoisted(() => ({ query: vi.fn(), result: {} as Record<string, unknown> }));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ globalState: { currentYear: { id: 'year-1' } } }),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormOptionsQuery: mocks.query,
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ params, options }: { params: unknown; options: unknown }) => {
    mocks.query(params, options);
    return mocks.result;
  },
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled, disabledValues = [], isLoading }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled || isLoading}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="" />
      {options.map((option: any) => (
        <option
          key={option.value}
          value={option.value}
          disabled={disabledValues.includes(option.value)}
        >
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const props = () => ({
  field: {
    code: 'DIVISION',
    label: 'Division',
    fieldType: 6,
    required: true,
    readOnly: false,
    optionsJson: '{"source":"DivisionsByStandard","parentField":"CLASS"}',
  },
  value: '',
  disabled: false,
  formValues: { CLASS: 'class-1' },
  onChange: vi.fn(),
});

describe('Institute Setup runtime choices', () => {
  it('keeps a frozen historical class label visible but unavailable for a new selection', () => {
    const input = props();
    render(
      <AdmissionMasterDataRuntimeField
        {...input}
        disabled
        value="old-class"
        field={{
          ...input.field,
          code: 'CLASS_INTERESTED',
          label: 'Class',
          optionsJson: '[{"value":"old-class","label":"Previous class name"}]',
        }}
      />
    );
    expect(screen.getByRole('option', { name: 'Previous class name' })).toBeDisabled();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.result = {
      currentData: [{ value: 'division-lotus', label: 'Lotus', isActive: true }],
      isFetching: false,
      isError: false,
    };
  });

  it('loads the selected year and class and returns a configured division ID', () => {
    const input = props();
    render(<AdmissionMasterDataRuntimeField {...input} />);
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKey: 'DivisionsByStandard',
        parentId: 'class-1',
        academicYearId: 'year-1',
      }),
      expect.objectContaining({ skip: false })
    );
    fireEvent.change(screen.getByLabelText('Division'), { target: { value: 'division-lotus' } });
    expect(input.onChange).toHaveBeenCalledWith('division-lotus');
    expect(screen.queryByRole('option', { name: 'A' })).toBeNull();
  });

  it('does not query or show old divisions before a class is selected', () => {
    render(<AdmissionMasterDataRuntimeField {...props()} formValues={{ CLASS: '' }} />);
    expect(mocks.query).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
    expect(screen.getByLabelText('Division')).toBeDisabled();
    expect(screen.queryByRole('option', { name: 'Lotus' })).toBeNull();
  });

  it('keeps an unavailable saved value disabled and blocks failed or pending requests', () => {
    const input = { ...props(), value: 'old-division' };
    mocks.result = { currentData: undefined, isFetching: true, isError: false };
    const view = render(<AdmissionMasterDataRuntimeField {...input} />);
    expect(screen.getByLabelText('Division')).toBeDisabled();
    mocks.result = { currentData: undefined, isFetching: false, isError: true };
    view.rerender(<AdmissionMasterDataRuntimeField {...input} />);
    expect(screen.getByLabelText('Division')).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Saved value unavailable' })).toBeDisabled();
    expect(input.onChange).not.toHaveBeenCalled();
  });
});
