import type { AdmissionFormField } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionInquiryCaptureContext } from 'src/redux/student/admissions/admission-inquiries-api';

import { act, renderHook } from '@testing-library/react';
import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, describe, afterEach } from 'vitest';

import { useAdmissionInquiryAge } from './use-admission-inquiry-age';

import type { AdmissionInquiryFormSection } from './admission-inquiry-model';

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    warning: vi.fn(),
  },
}));

const field = {
  id: 'dob',
  code: 'BIRTH',
  label: 'DOB',
  fieldType: 5,
  bindingType: 0,
  displayOrder: 0,
  bindingKey: 'Applicant.DateOfBirth',
  required: false,
  readOnly: false,
  helpText: 'As recorded.',
} satisfies AdmissionFormField;
const sections = [{ id: 'student', fields: [field] }] as AdmissionInquiryFormSection[];
const context = {
  offering: { id: 'offering-1' },
  academicYearStartDate: '2026-04-01',
  minimumAgeYears: 5,
} as AdmissionInquiryCaptureContext;

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('Inquiry age feedback', () => {
  it('keeps age guidance compact while preserving configured help and cutoff details', () => {
    const { result } = renderHook(() =>
      useAdmissionInquiryAge({ sections, values: { BIRTH: '2022-01-01' }, context })
    );
    const decorated = result.current.withAgeHelp(field);
    expect(decorated.helpText).toBe('Age: 4y 3m · Minimum: 5y');
    expect(decorated).toEqual(expect.objectContaining({
      helpTextDetails: expect.stringContaining('As recorded.'),
    }));
    expect(decorated).toEqual(expect.objectContaining({
      helpTextDetails: expect.stringContaining('01-04-2026'),
    }));
  });
  it.each(['', 'DATE_OF_BIRTH', 'date_of_birth'])(
    'supports published legacy DOB bindings (%s)',
    (bindingKey) => {
      vi.useFakeTimers();
      const legacy = { ...field, code: 'DATE_OF_BIRTH', bindingKey };
      const { result } = renderHook(() =>
        useAdmissionInquiryAge({
          sections: [{ ...sections[0], fields: [legacy] }],
          values: { DATE_OF_BIRTH: '2022-01-01' },
          context,
        })
      );
      expect(result.current.withAgeHelp(legacy).helpText).toContain('4 years 3 months');
      act(() => vi.advanceTimersByTime(500));
      expect(shikshaMitraToast.warning).toHaveBeenCalledTimes(1);
    }
  );
  it('preserves configured guidance and warns once after DOB settles, including blur/submit', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(() =>
      useAdmissionInquiryAge({ sections, values: { BIRTH: '2022-01-01' }, context })
    );
    expect(result.current.withAgeHelp(field).helpText).toContain(
      'As recorded. Age at academic year start'
    );
    act(() => {
      vi.advanceTimersByTime(500);
      result.current.notify();
    });
    rerender();
    act(() => vi.advanceTimersByTime(500));
    expect(shikshaMitraToast.warning).toHaveBeenCalledTimes(1);
  });

  it('recalculates for DOB, offering/class minimum and academic year changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ dob, settings }) =>
        useAdmissionInquiryAge({ sections, values: { BIRTH: dob }, context: settings }),
      { initialProps: { dob: '2021-04-01', settings: context } }
    );
    act(() => vi.advanceTimersByTime(500));
    expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
    rerender({ dob: '2022-01-01', settings: context });
    act(() => vi.advanceTimersByTime(500));
    expect(shikshaMitraToast.warning).toHaveBeenCalledTimes(1);
    rerender({
      dob: '2022-01-01',
      settings: {
        ...context,
        offering: { ...context.offering, id: 'offering-2' },
        minimumAgeYears: 6,
      },
    });
    act(() => vi.advanceTimersByTime(500));
    expect(shikshaMitraToast.warning).toHaveBeenCalledTimes(2);
    rerender({ dob: '2022-01-01', settings: { ...context, academicYearStartDate: '2028-04-01' } });
    expect(result.current.withAgeHelp(field).helpText).toContain('6 years 3 months');
    act(() => vi.advanceTimersByTime(500));
    expect(shikshaMitraToast.warning).toHaveBeenCalledTimes(2);
  });

  it('ignores parent DOB, hidden fields/sections, and disabled/loading feedback', () => {
    vi.useFakeTimers();
    const hidden = {
      ...field,
      visibilityRuleJson: JSON.stringify({ operator: 'equals', field: 'SHOW', value: 'yes' }),
    };
    const { result, rerender } = renderHook(
      ({ fields, enabled }) =>
        useAdmissionInquiryAge({
          sections: [{ ...sections[0], fields }],
          values: { BIRTH: '2022-01-01' },
          context,
          enabled,
        }),
      { initialProps: { fields: [hidden], enabled: true } }
    );
    expect(result.current.withAgeHelp(field)).toBe(field);
    rerender({
      fields: [{ ...hidden, bindingKey: 'Guardian.DateOfBirth', visibilityRuleJson: '' }],
      enabled: true,
    });
    expect(result.current.withAgeHelp(field)).toBe(field);
    rerender({ fields: [{ ...hidden, visibilityRuleJson: '' }], enabled: false });
    act(() => {
      vi.advanceTimersByTime(500);
      result.current.notify();
    });
    expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
  });
});
