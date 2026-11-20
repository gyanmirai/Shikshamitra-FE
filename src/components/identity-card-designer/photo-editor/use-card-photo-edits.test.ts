import { StrictMode } from 'react';
import { it, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useCardPhotoEdits } from './use-card-photo-edits';

const edit = { recordId: 'one', sourceHash: 'hash', imageData: 'data:image/png;base64,AAAA' };

describe('cardholder photo draft scope', () => {
  it('replaces an edit by record and removes deselected records', () => {
    const { result, rerender } = renderHook(({ ids }) => useCardPhotoEdits('school-1', ids), { initialProps: { ids: ['one', 'two'] } });
    act(() => result.current.onPhotoEdit(edit));
    act(() => result.current.onPhotoEdit({ ...edit, imageData: 'data:image/png;base64,BBBB' }));
    expect(result.current.photoEdits).toHaveLength(1);
    rerender({ ids: ['two'] });
    expect(result.current.photoEdits).toEqual([]);
    rerender({ ids: ['one', 'two'] });
    expect(result.current.photoEdits).toEqual([]);
  });
  it('ignores late callbacks after the school scope changes', () => {
    const { result, rerender } = renderHook(({ scope }) => useCardPhotoEdits(scope, ['one']), { initialProps: { scope: 'school-1' } });
    const late = result.current.onPhotoEdit;
    act(() => result.current.onPhotoEdit(edit));
    rerender({ scope: 'school-2' });
    expect(result.current.photoEdits).toEqual([]);
    act(() => late(edit));
    expect(result.current.photoEdits).toEqual([]);
  });
  it('rejects edits outside the selected cohort', () => {
    const { result } = renderHook(() => useCardPhotoEdits('school-1', ['two']));
    act(() => result.current.onPhotoEdit(edit));
    expect(result.current.photoEdits).toEqual([]);
  });
  it('accepts an edit after Strict Mode effect replay and rejects a previous scope session', () => {
    const { result, rerender } = renderHook(({ scope }) => useCardPhotoEdits(scope, ['one']), {
      initialProps: { scope: 'school-1' }, wrapper: StrictMode,
    });
    const late = result.current.onPhotoEdit;
    act(() => result.current.onPhotoEdit(edit));
    expect(result.current.photoEdits).toHaveLength(1);
    rerender({ scope: 'school-2' });
    rerender({ scope: 'school-1' });
    act(() => late(edit));
    expect(result.current.photoEdits).toEqual([]);
  });
});
