import type { ReservationMember, LibraryReservation } from 'src/redux/library/reservation-types';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  usePreviewLibraryReservationQuery,
  useCreateLibraryReservationMutation,
} from 'src/redux/library/reservations-api';

import {
  reservationSchema,
  emptyReservationValues,
  buildReservationPayload,
} from './reservation-form';

import type { ReservationValues } from './reservation-form';

export function useReservationDraft(
  bookId: string,
  academicYearId: string,
  authorized: boolean,
  onSaved: (item: LibraryReservation) => void
) {
  const [selected, setSelected] = useState<ReservationMember | null>(null);
  const [save, result] = useCreateLibraryReservationMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const formik = useFormik<ReservationValues>({
    initialValues: emptyReservationValues,
    validationSchema: () => reservationSchema(Boolean(preview.currentData?.requiresExplicitExpiry)),
    onSubmit: async (values) => {
      if (inFlight.current || !canSubmit || !selected) return;
      inFlight.current = true;
      setError('');
      try {
        const item = await save({
          bookId,
          academicYearId,
          ...buildReservationPayload(values, selected.id),
        }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({ message: 'Reservation request created.' });
        onSaved(item);
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not create this request. Your draft is retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  const memberValid = Boolean(
    selected?.id === formik.values.memberId && selected?.isEligibleForReservation
  );
  const canPreview = Boolean(
    authorized &&
    bookId &&
    academicYearId &&
    memberValid &&
    formik.values.requestedDate?.isValid() &&
    (!formik.values.requestExpiryDate || formik.values.requestExpiryDate.isValid())
  );
  const preview = usePreviewLibraryReservationQuery(
    {
      bookId,
      academicYearId,
      ...buildReservationPayload(formik.values, selected?.id || ''),
    },
    { skip: !canPreview }
  );
  const canSubmit = Boolean(
    canPreview &&
    !preview.isFetching &&
    preview.currentData?.canCreate &&
    preview.currentData.canonicalMemberId === selected?.id &&
    preview.currentData.academicYearId === academicYearId
  );
  return {
    formik,
    selected,
    setSelected,
    preview,
    canPreview,
    canSubmit,
    error,
    busy: formik.isSubmitting || result.isLoading,
  };
}
