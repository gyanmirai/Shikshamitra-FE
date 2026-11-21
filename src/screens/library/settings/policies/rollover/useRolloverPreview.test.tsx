import { it, vi, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useRolloverPreview } from './useRolloverPreview';

const preview = vi.hoisted(() => vi.fn());
vi.mock('src/redux/library/rollover-api', () => ({
  useGetLibraryRolloverYearsQuery: () => ({
    currentData: [
      { id: 'source', name: '2025/26', startsOn: '2025-04-01', endsOn: '2026-03-31' },
      { id: 'target', name: '2026/27', startsOn: '2026-04-01', endsOn: '2027-03-31' },
    ],
  }),
  usePreviewLibraryRolloverMutation: () => [preview],
}));

it('previews the chosen years and removes the result after changing the school date', async () => {
  const resultData = { schoolDate: '2026-04-01', loans: { sourceYearOpenCount: 1 } };
  preview.mockReturnValue({ unwrap: async () => resultData });
  const { result } = renderHook(() => useRolloverPreview('source'));
  await act(async () => {
    await result.current.formik.setFieldValue('targetAcademicYearId', 'target');
  });
  await act(async () => {
    await result.current.runPreview();
  });
  expect(preview).toHaveBeenCalledWith({
    sourceAcademicYearId: 'source',
    targetAcademicYearId: 'target',
    schoolDate: null,
  });
  expect(result.current.result).toBe(resultData);
  await act(async () => {
    await result.current.formik.setFieldValue('schoolDate', '2026-05-01');
  });
  expect(result.current.result).toBeUndefined();
});
