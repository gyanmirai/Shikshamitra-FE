import type { LibraryCalendarClosure } from 'src/redux/library/calendar-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useCreateLibraryCalendarClosureMutation,
  useUpdateLibraryCalendarClosureMutation,
} from 'src/redux/library/calendar-api';

import { closureSchema } from './calendar-form';

export function useClosureEditor(
  academicYearId: string,
  onClose: () => void,
  item?: LibraryCalendarClosure
) {
  const [create] = useCreateLibraryCalendarClosureMutation();
  const [update] = useUpdateLibraryCalendarClosureMutation();
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: {
      fromDate: item?.fromDate || '',
      toDate: item?.toDate || '',
      reason: item?.reason || '',
      sectionId: item?.sectionId || '',
    },
    validationSchema: closureSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        const body = {
          ...values,
          reason: values.reason.trim(),
          sectionId: values.sectionId || null,
          concurrencyStamp: item?.concurrencyStamp,
        };
        if (item) await update({ closureId: item.id, body }).unwrap();
        else await create({ academicYearId, body }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({ message: 'Library closure saved.' });
        onClose();
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not save this closure. Your entries are retained.'
        );
      }
    },
  });
  return { formik, error };
}
