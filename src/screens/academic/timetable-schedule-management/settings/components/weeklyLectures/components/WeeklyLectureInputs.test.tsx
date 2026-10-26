import type { FormikProps } from 'formik';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { SubjectLectureField } from './SubjectLectureField';
import { WeeklyLectureBulkApply } from './WeeklyLectureBulkApply';

import type { ISubjectFormValues } from '../type';

const OVERSIZED_VALUE = '6100000000000000000000000000';

function createFormik(noOfLecture: number | string): FormikProps<ISubjectFormValues> {
  return {
    values: {
      classId: 'class-11',
      className: 'Class 11',
      subjects: [{ id: 'subject-1', subjectColor: '#000000', noOfLecture }],
      totalLectures: 0,
    },
    touched: {},
    errors: {},
    setFieldValue: vi.fn(),
    handleBlur: vi.fn(),
  } as unknown as FormikProps<ISubjectFormValues>;
}

describe('weekly lecture inputs', () => {
  it('caps an oversized bulk value before applying it to subjects', () => {
    const onApply = vi.fn();
    render(<WeeklyLectureBulkApply onApply={onApply} />);

    const input = screen.getByRole('spinbutton', {
      name: 'Apply lecture count to all subjects',
    });
    expect(input).toHaveAttribute('max', '20');

    fireEvent.change(input, { target: { value: OVERSIZED_VALUE } });
    expect(input).toHaveValue(20);

    fireEvent.click(screen.getByRole('button', { name: 'Apply to all' }));
    expect(onApply).toHaveBeenCalledWith(20);
  });

  it('caps an oversized individual value before it enters Formik state', () => {
    const formik = createFormik('');
    render(<SubjectLectureField index={0} formik={formik} isEdit={false} />);

    const input = screen.getByRole('spinbutton', { name: 'Weekly lectures count for subject 1' });
    expect(input).toHaveAttribute('max', '20');

    fireEvent.change(input, { target: { value: OVERSIZED_VALUE } });
    expect(formik.setFieldValue).toHaveBeenCalledWith('subjects[0].noOfLecture', 20);
  });

  it('disables the increment control at the domain maximum', () => {
    const formik = createFormik(20);
    render(<SubjectLectureField index={0} formik={formik} isEdit={false} />);

    expect(
      screen.getByRole('button', { name: 'Increase lecture count for subject 1' })
    ).toBeDisabled();
  });
});
