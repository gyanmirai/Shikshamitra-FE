import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useAdmissionPrintOptions } from './use-admission-print-options';

import type { AdmissionPrintDefinition } from './form-print-model';

const mocks = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormOptionsQuery: () => [mocks.load],
}));
const definition: AdmissionPrintDefinition = {
  name: 'Registration',
  sections: [
    {
      id: 'section',
      code: 'SECTION',
      name: 'Class',
      displayOrder: 0,
      fields: ['CLASS_ONE', 'CLASS_TWO'].map((code) => ({
        id: code,
        sectionId: 'section',
        code,
        label: code,
        fieldType: 6,
        bindingType: 1,
        readOnly: false,
        required: true,
        displayOrder: 0,
        optionsJson: JSON.stringify({ source: 'StandardsByMedium', parentField: 'MEDIUM' }),
      })),
    },
  ],
};
const values = { CLASS_ONE: '"class-1"', CLASS_TWO: '"class-2"', MEDIUM: '"medium-1"' };

describe('Registration print choice labels', () => {
  it('keeps other answers printable when sibling catalogue access is restricted', async () => {
    mocks.load.mockReturnValue({
      unwrap: () => Promise.reject(Object.assign(new Error('Not permitted'), { status: 403 })),
    });
    const siblingForm = {
      ...definition,
      sections: [
        {
          ...definition.sections[0],
          fields: [
            {
              ...definition.sections[0].fields[0],
              code: 'SIBLINGS',
              optionsJson: '{"source":"StudentSiblings"}',
            },
          ],
        },
      ],
    };
    const { result } = renderHook(() =>
      useAdmissionPrintOptions(siblingForm, { SIBLINGS: JSON.stringify('["sibling-999"]') }, true)
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(false);
    expect(result.current.unavailable).toBe(true);
    expect(result.current.labels).toEqual({ SIBLINGS: {} });
  });

  it('never requests choices from excluded steps or hidden questions', () => {
    const { result } = renderHook(() =>
      useAdmissionPrintOptions(definition, values, true, 'year-1', [])
    );
    expect(mocks.load).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.unavailable).toBe(false);
  });
  it.each([false, true])(
    'requests saved siblings with serialized storage = %s',
    async (serialized) => {
      mocks.load.mockReturnValue({
        unwrap: () => Promise.resolve([{ value: 'sibling-999', label: 'Selected sibling' }]),
      });
      const siblingForm = {
        ...definition,
        sections: [
          {
            ...definition.sections[0],
            fields: [
              {
                ...definition.sections[0].fields[0],
                code: 'SIBLINGS',
                optionsJson: '{"source":"StudentSiblings"}',
              },
            ],
          },
        ],
      };
      const { result } = renderHook(() =>
        useAdmissionPrintOptions(
          siblingForm,
          { SIBLINGS: serialized ? JSON.stringify('["sibling-999"]') : '["sibling-999"]' },
          true,
          'year-1'
        )
      );
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mocks.load).toHaveBeenCalledWith(
        expect.objectContaining({ selectedIds: ['sibling-999'] }),
        true
      );
      expect(result.current.labels.SIBLINGS['sibling-999']).toBe('Selected sibling');
    }
  );

  it.each([false, true])(
    'resolves repeatable parent choices with serialized storage = %s',
    async (serialized) => {
      mocks.load.mockImplementation(({ parentId }: { parentId: string }) => ({
        unwrap: () =>
          Promise.resolve([{ value: `class-${parentId}`, label: `Class for ${parentId}` }]),
      }));
      const repeated = {
        ...definition,
        sections: [
          {
            ...definition.sections[0],
            isRepeatable: true,
            fields: [definition.sections[0].fields[0]],
          },
        ],
      };
      const { result } = renderHook(() =>
        useAdmissionPrintOptions(
          repeated,
          {
            CLASS_ONE: serialized
              ? JSON.stringify('["class-medium-1","class-medium-2"]')
              : '["class-medium-1","class-medium-2"]',
            MEDIUM: serialized
              ? JSON.stringify('["medium-1","medium-2"]')
              : '["medium-1","medium-2"]',
          },
          true
        )
      );
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mocks.load).toHaveBeenCalledTimes(2);
      expect(result.current.labels.CLASS_ONE).toEqual({
        'class-medium-1': 'Class for medium-1',
        'class-medium-2': 'Class for medium-2',
      });
    }
  );
  beforeEach(() => {
    mocks.load.mockReset();
  });

  it('loads selected values using their parent and academic scope, sharing equivalent requests', async () => {
    mocks.load.mockReturnValue({
      unwrap: () =>
        Promise.resolve([
          { value: 'class-1', label: 'Class 1' },
          { value: 'class-2', label: 'Class 2' },
        ]),
    });
    const { result } = renderHook(() =>
      useAdmissionPrintOptions(definition, values, true, 'year-1')
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mocks.load).toHaveBeenCalledOnce();
    expect(mocks.load).toHaveBeenCalledWith(
      { sourceKey: 'StandardsByMedium', parentId: 'medium-1', academicYearId: 'year-1' },
      true
    );
    expect(result.current.labels).toEqual({
      CLASS_ONE: { 'class-1': 'Class 1', 'class-2': 'Class 2' },
      CLASS_TWO: { 'class-1': 'Class 1', 'class-2': 'Class 2' },
    });
  });

  it('skips label lookups in blank mode and hides filled-mode labels immediately on switch', async () => {
    mocks.load.mockReturnValue({
      unwrap: () => Promise.resolve([{ value: 'class-1', label: 'Class 1' }]),
    });
    const { result, rerender } = renderHook(
      ({ enabled }) => useAdmissionPrintOptions(definition, values, enabled),
      { initialProps: { enabled: false } }
    );
    expect(mocks.load).not.toHaveBeenCalled();
    expect(result.current.labels).toEqual({});
    rerender({ enabled: true });
    await waitFor(() => expect(result.current.labels.CLASS_ONE).toEqual({ 'class-1': 'Class 1' }));
    rerender({ enabled: false });
    expect(result.current.labels).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it('ignores stale parent-scope labels when an older request completes last', async () => {
    let finishOld!: (value: { value: string; label: string }[]) => void;
    mocks.load
      .mockReturnValueOnce({
        unwrap: () =>
          new Promise((resolve) => {
            finishOld = resolve;
          }),
      })
      .mockReturnValueOnce({
        unwrap: () => Promise.resolve([{ value: 'class-1', label: 'Current medium class' }]),
      });
    const { result, rerender } = renderHook(
      ({ medium }) =>
        useAdmissionPrintOptions(
          definition,
          { ...values, MEDIUM: JSON.stringify(medium) },
          true,
          'year-1'
        ),
      { initialProps: { medium: 'medium-1' } }
    );
    rerender({ medium: 'medium-2' });
    await waitFor(() =>
      expect(result.current.labels.CLASS_ONE).toEqual({ 'class-1': 'Current medium class' })
    );
    await act(async () => finishOld([{ value: 'class-1', label: 'Stale class' }]));
    expect(result.current.labels.CLASS_ONE).toEqual({ 'class-1': 'Current medium class' });
    expect(mocks.load).toHaveBeenLastCalledWith(
      expect.objectContaining({ parentId: 'medium-2' }),
      true
    );
  });

  it('blocks preview on failed labels and loads them again after explicit retry', async () => {
    mocks.load
      .mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Options unavailable')) })
      .mockReturnValueOnce({
        unwrap: () => Promise.resolve([{ value: 'class-1', label: 'Class 1' }]),
      });
    const { result } = renderHook(() => useAdmissionPrintOptions(definition, values, true));
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.labels).toEqual({});
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.labels.CLASS_ONE).toEqual({ 'class-1': 'Class 1' }));
    expect(result.current.error).toBe(false);
    expect(mocks.load).toHaveBeenCalledTimes(2);
  });
});
