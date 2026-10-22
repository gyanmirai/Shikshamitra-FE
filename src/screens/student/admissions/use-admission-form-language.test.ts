import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAdmissionFormLanguage } from './use-admission-form-language';

it('uses the loaded form default, preserves a choice on refresh, and resets for another attached form', () => {
  const form = {
    id: 'form-1',
    version: 1,
    defaultLanguage: 'gu',
    supportedLanguages: ['en', 'gu', 'hi'],
  };
  const { result, rerender } = renderHook(
    ({ definition, offering }) => useAdmissionFormLanguage(definition, offering),
    { initialProps: { definition: undefined as typeof form | undefined, offering: 'offering-1' } }
  );
  rerender({ definition: form, offering: 'offering-1' });
  expect(result.current.language).toBe('gu');
  act(() => result.current.setLanguage('hi'));
  rerender({ definition: { ...form }, offering: 'offering-1' });
  expect(result.current.language).toBe('hi');
  rerender({ definition: form, offering: 'offering-2' });
  expect(result.current.language).toBe('gu');
  act(() => result.current.setLanguage('hi'));
  rerender({ definition: { ...form, version: 2, defaultLanguage: 'en' }, offering: 'offering-2' });
  expect(result.current.language).toBe('en');
});

it('falls back to the enabled language when the choice or default is unavailable', () => {
  const { result, rerender } = renderHook(
    ({ languages }) =>
      useAdmissionFormLanguage(
        { id: 'form-1', version: 1, defaultLanguage: 'gu', supportedLanguages: languages },
        'inquiry-1'
      ),
    { initialProps: { languages: ['gu', 'hi'] } }
  );
  act(() => result.current.setLanguage('hi'));
  rerender({ languages: ['en'] });
  expect(result.current.language).toBe('en');
  expect(result.current.supportedLanguages).toEqual(['en']);
});
