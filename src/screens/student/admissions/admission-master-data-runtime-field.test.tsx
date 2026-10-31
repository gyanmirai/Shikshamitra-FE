import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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
  it('loads current configured classes for a class-interest question and saves the selected record ID', () => {
    mocks.result = {
      currentData: [
        {
          value: 'configured-class-id',
          label: 'Preparatory (Gujarati / Primary)',
          isActive: true,
          boardId: 'gseb',
          boardLabel: 'GSEB',
        },
      ],
      isFetching: false,
      isError: false,
    };
    const input = props();
    render(
      <AdmissionMasterDataRuntimeField
        {...input}
        formValues={{}}
        field={{
          ...input.field,
          code: 'CLASS_INTERESTED',
          label: 'Class interested in',
          optionsJson: '{"source":"Standards"}',
        }}
      />
    );
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({ sourceKey: 'Standards', academicYearId: 'year-1' }),
      expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
    );
    expect(screen.getByRole('combobox', { name: 'Class interested in' })).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox', { name: 'Board' }), {
      target: { value: 'gseb' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Class interested in' }), {
      target: { value: 'configured-class-id' },
    });
    expect(input.onChange).toHaveBeenCalledWith('configured-class-id');
  });
  it('filters identical class names by board, clears on board change and restores the board from a saved class ID', () => {
    mocks.result = {
      currentData: [
        {
          value: 'cbse-6',
          label: 'Class 6 (English / Secondary)',
          isActive: true,
          boardId: 'cbse',
          boardLabel: 'CBSE',
        },
        {
          value: 'gseb-6',
          label: 'Class 6 (English / Secondary)',
          isActive: true,
          boardId: 'gseb',
          boardLabel: 'GSEB',
        },
      ],
      isFetching: false,
      isError: false,
    };
    const input = {
      ...props(),
      field: {
        ...props().field,
        code: 'CLASS_INTERESTED',
        label: 'Class interested in',
        optionsJson: '{"source":"Standards"}',
      },
      formValues: {},
      value: 'cbse-6',
    };
    const view = render(<AdmissionMasterDataRuntimeField {...input} />);
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveValue('cbse');
    expect(screen.getAllByRole('option', { name: 'Class 6 (English / Secondary)' })).toHaveLength(
      1
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Board' }), {
      target: { value: 'gseb' },
    });
    expect(input.onChange).toHaveBeenLastCalledWith('');
    view.rerender(<AdmissionMasterDataRuntimeField {...input} value="" />);
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveValue('gseb');
    const classes = screen.getByRole('combobox', { name: 'Class interested in' });
    expect(classes).not.toHaveTextContent('CBSE');
    fireEvent.change(classes, { target: { value: 'gseb-6' } });
    expect(input.onChange).toHaveBeenLastCalledWith('gseb-6');
    view.unmount();
    render(<AdmissionMasterDataRuntimeField {...input} value="gseb-6" disabled />);
    expect(screen.getByRole('combobox', { name: 'Board' })).toHaveValue('gseb');
    expect(screen.getByRole('combobox', { name: 'Board' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Class interested in' })).toHaveValue('gseb-6');
    expect(input.onChange).toHaveBeenCalledTimes(2);
  });
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
  it('keeps saved class answers through pending and failed reloads without selecting another board', () => {
    const input = {
      ...props(),
      field: {
        ...props().field,
        code: 'CLASS_INTERESTED',
        label: 'Class interested in',
        optionsJson: '{"source":"Standards"}',
      },
      value: 'saved-class',
    };
    mocks.result = { currentData: undefined, isFetching: true, isError: false };
    const view = render(<AdmissionMasterDataRuntimeField {...input} />);
    expect(screen.getByRole('combobox', { name: 'Board' })).toBeDisabled();
    mocks.result = { currentData: undefined, isFetching: false, isError: true };
    view.rerender(<AdmissionMasterDataRuntimeField {...input} />);
    expect(screen.getByRole('combobox', { name: 'Class interested in' })).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Saved value unavailable' })).toBeDisabled();
    expect(input.onChange).not.toHaveBeenCalled();
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
