import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useAddLibraryTimingMutation } from 'src/redux/library/settingApi';

import { hoursDraft, validHours, hoursSchema, hoursPayload } from './library-hours-model';

import type { LibraryHour, LibraryHoursResponse } from './library-hours-model';

export function useLibraryHoursDraft(
  academicYearId: string,
  source: LibraryHoursResponse | null,
  canEdit: boolean,
  reload: () => void
) {
  const [save] = useAddLibraryTimingMutation();
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<'save' | 'reset' | null>(null);
  const formik = useFormik<{ hours: LibraryHour[] }>({
    initialValues: { hours: [] },
    validationSchema: hoursSchema,
    onSubmit: async (values) => {
      if (!canEdit || !source || !validHours(values.hours)) return;
      setError('');
      try {
        await save({ academicYearId, ...hoursPayload(values.hours) }).unwrap();
        formik.resetForm({
          values: {
            hours: hoursPayload(values.hours).hours.map((row) => ({
              ...row,
              isConfigured: true,
            })),
          },
        });
        setConfirm(null);
        shikshaMitraToast.success({ message: 'Library opening hours saved.' });
      } catch (failure) {
        setConfirm(null);
        setError(parseApiProblemDetail(failure).detail);
      }
    },
  });
  const { resetForm } = formik;
  useEffect(() => {
    if (source) {
      resetForm({ values: hoursDraft(source) });
      setError('');
    }
    // A completed explicit read owns the draft; cache refreshes never replace it.
  }, [source, resetForm]);
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: formik.isSubmitting,
    guardContextChanges: true,
  });
  const requestSave = async () => {
    if (!canEdit || !formik.dirty || formik.isSubmitting) return;
    const errors = await formik.validateForm();
    await formik.setTouched({
      hours: formik.values.hours.map(() => ({
        day: true,
        status: true,
        startTime: true,
        endTime: true,
      })),
    });
    if (!Object.keys(errors).length && validHours(formik.values.hours)) setConfirm('save');
  };
  return {
    formik,
    error,
    confirm,
    setConfirm,
    requestSave,
    invalid: !validHours(formik.values.hours),
    reset: () => {
      formik.resetForm();
      setError('');
      setConfirm(null);
    },
    reload: () =>
      guard.requestNavigation(() => {
        formik.resetForm();
        reload();
      }),
    navigationConfirmation: guard.confirmation,
  };
}
