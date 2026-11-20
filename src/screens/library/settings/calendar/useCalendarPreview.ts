import type { LibraryCalendarCalculation } from 'src/redux/library/calendar-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useCalculateLibraryDateMutation } from 'src/redux/library/calendar-api';

import { calculationSchema } from './calendar-form';

export function useCalendarPreview(academicYearId: string) {
  const [calculate] = useCalculateLibraryDateMutation();
  const [preview, setPreview] = useState<{
    result: LibraryCalendarCalculation;
    input: string;
  } | null>(null);
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: {
      startDate: '',
      days: '',
      dayCountingMode: 0 as 0 | 1,
      sectionId: '',
      moveToNextOpenDay: true,
    },
    validationSchema: calculationSchema,
    onSubmit: async (values) => {
      setError('');
      setPreview(null);
      try {
        const result = await calculate({
          ...values,
          academicYearId,
          days: Number(values.days),
          sectionId: values.sectionId || null,
        }).unwrap();
        setPreview({ result, input: JSON.stringify(values) });
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail || 'Could not calculate a date for these inputs.'
        );
      }
    },
  });
  const result = preview?.input === JSON.stringify(formik.values) ? preview.result : null;
  return { formik, error, result };
}
