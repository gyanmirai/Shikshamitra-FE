import type { ComponentProps } from 'react';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import {
  isAdmissionSiblingField,
  AdmissionSiblingRuntimeField,
} from './admission-sibling-runtime-field';

const requests = vi.hoisted(() => ({ load: vi.fn(), searchResult: undefined as unknown }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormOptionsQuery: () => [requests.load],
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('src/components/paginated-search-select', () => ({
  PaginatedSearchSelect: ({
    disabled,
    helperText,
    value,
    fetchOptions,
    onChange,
  }: {
    disabled: boolean;
    helperText: string;
    value: { id: string; label: string }[];
    fetchOptions: (query: string, page: number) => Promise<unknown>;
    onChange: (event: unknown, selected: { id: string; label: string }[]) => void;
  }) => (
    <div>
      <p>{helperText}</p>
      {value.map((student) => (
        <span key={student.id}>{student.label}</span>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={async () => {
          requests.searchResult = await fetchOptions('Zoya', 1);
        }}
      >
        Search siblings
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={async () => {
          requests.searchResult = await fetchOptions('Zoya', 2);
        }}
      >
        Next results
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(null, [{ id: 'student-900', label: 'Zoya Shah' }])}
      >
        Select sibling
      </button>
      <button type="button" disabled={disabled} onClick={() => onChange(null, [])}>
        Clear siblings
      </button>
    </div>
  ),
}));

type Props = ComponentProps<typeof AdmissionSiblingRuntimeField>;
const field: Props['field'] = {
  code: 'siblings',
  label: 'Sibling students',
  bindingKey: 'Family.SiblingStudentIds',
  optionsJson: '{"source":"StudentSiblings"}',
  fieldType: 7,
  required: false,
  readOnly: false,
};
function renderField(overrides: Partial<Props> = {}) {
  const onChange = vi.fn();
  render(
    <AdmissionSiblingRuntimeField
      field={field}
      value="[]"
      disabled={false}
      onChange={onChange}
      {...overrides}
    />
  );
  return onChange;
}

describe('admission sibling lookup', () => {
  beforeEach(() => {
    requests.load.mockReset();
    requests.searchResult = undefined;
    requests.load.mockImplementation(() => ({ unwrap: () => Promise.resolve([]) }));
  });

  it('routes only sibling bindings or the exact sibling source into remote search', () => {
    expect(isAdmissionSiblingField(field)).toBe(true);
    expect(isAdmissionSiblingField({ ...field, bindingKey: undefined })).toBe(true);
    expect(
      isAdmissionSiblingField({
        ...field,
        bindingKey: undefined,
        optionsJson: '{"source":"EducationBoards"}',
      })
    ).toBe(false);
    expect(
      isAdmissionSiblingField({ ...field, bindingKey: undefined, optionsJson: 'broken' })
    ).toBe(false);
  });

  it('searches beyond the initial school list with bounded pages and a sentinel', async () => {
    const page = Array.from({ length: 21 }, (_, index) => ({
      value: `student-${900 + index}`,
      label: `Zoya ${index}`,
    }));
    requests.load.mockImplementation(() => ({ unwrap: () => Promise.resolve(page) }));
    renderField();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Search siblings' }));
    });
    expect(requests.load).toHaveBeenLastCalledWith({
      sourceKey: 'StudentSiblings',
      searchTerm: 'Zoya',
      skipCount: 0,
      maxResultCount: 21,
    });
    expect(requests.searchResult).toEqual({
      data: page.slice(0, 20).map((student) => ({ id: student.value, label: student.label })),
      hasMore: true,
    });
    requests.load.mockImplementation(() => ({ unwrap: () => Promise.resolve(page.slice(0, 3)) }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next results' }));
    });
    expect(requests.load).toHaveBeenLastCalledWith({
      sourceKey: 'StudentSiblings',
      searchTerm: 'Zoya',
      skipCount: 20,
      maxResultCount: 21,
    });
    expect(requests.searchResult).toMatchObject({ hasMore: false });
  });

  it('hydrates saved IDs without replacing the answer, then writes selected GUID arrays', async () => {
    requests.load.mockImplementation(() => ({
      unwrap: () => Promise.resolve([{ value: 'student-900', label: 'Zoya Shah' }]),
    }));
    const onChange = renderField({ value: '["student-900"]' });
    await screen.findByText('Zoya Shah');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Select sibling' })).toBeEnabled()
    );
    expect(requests.load).toHaveBeenCalledWith({
      sourceKey: 'StudentSiblings',
      selectedIds: ['student-900'],
      maxResultCount: 20,
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Select sibling' }));
    expect(onChange).toHaveBeenLastCalledWith('["student-900"]');
    fireEvent.click(screen.getByRole('button', { name: 'Clear siblings' }));
    expect(onChange).toHaveBeenLastCalledWith('[]');
  });

  it('preserves a saved answer when label hydration fails and respects the form lock', async () => {
    requests.load.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('unavailable')),
    }));
    const onChange = renderField({ value: '["student-900"]', disabled: true });
    await screen.findByText('Selected students could not be loaded. Search again to retry.');
    expect(screen.getByText('Student unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select sibling' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
