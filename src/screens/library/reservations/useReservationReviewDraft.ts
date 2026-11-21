import type { ReservationMember, LibraryReservation } from 'src/redux/library/reservation-types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { parseDateOnly } from 'src/utils/date-only';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useReviewLibraryReservationMutation } from 'src/redux/library/reservations-api';
import { usePreviewLibraryReservationReviewQuery } from 'src/redux/library/reservation-review-api';

import { reservationSchema, buildReservationPayload } from './reservation-form';

import type { ReservationValues } from './reservation-form';

type ReviewValues = ReservationValues & { reason: string };
export function useReservationReviewDraft(
  snapshot: LibraryReservation,
  academicYearId: string,
  authorized: boolean,
  onClose: () => void
) {
  const [selected, setSelected] = useState<ReservationMember | null>(null);
  const [save, result] = useReviewLibraryReservationMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const formik = useFormik<ReviewValues>({
    initialValues: {
      memberId: '',
      memberScan: snapshot.memberIdentifier || snapshot.memberId,
      reason: '',
      requestedDate:
        snapshot.requestedDateProvenance === 0 ? null : parseDateOnly(snapshot.requestedDate),
      requestExpiryDate:
        snapshot.requestExpiryDateProvenance === 0
          ? null
          : parseDateOnly(snapshot.requestExpiryDate),
    },
    validationSchema: () =>
      reservationSchema(Boolean(preview.currentData?.requiresExplicitExpiry)).shape({
        reason: Yup.string()
          .trim()
          .required('Explain the member or school-date review')
          .max(500, 'Use at most 500 characters'),
      }),
    onSubmit: async (values) => {
      if (inFlight.current || !canSubmit || !selected) return;
      inFlight.current = true;
      setError('');
      try {
        await save({
          reservationId: snapshot.id,
          body: {
            academicYearId,
            ...buildReservationPayload(values, selected.id),
            reason: values.reason,
            revision: snapshot.revision,
          },
        }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({
          message: 'Reservation review saved. Original evidence is retained.',
        });
        onClose();
      } catch (cause) {
        setError(parseApiProblemDetail(cause).detail || 'Could not save the reservation review.');
      } finally {
        inFlight.current = false;
      }
    },
  });
  const canPreview = Boolean(
    authorized &&
    snapshot.canReview &&
    snapshot.revision &&
    academicYearId &&
    selected?.isEligibleForReservation &&
    selected.id === formik.values.memberId &&
    formik.values.requestedDate?.isValid() &&
    (!formik.values.requestExpiryDate || formik.values.requestExpiryDate.isValid())
  );
  const preview = usePreviewLibraryReservationReviewQuery(
    {
      reservationId: snapshot.id,
      body: {
        academicYearId,
        ...buildReservationPayload(formik.values, selected?.id || ''),
        revision: snapshot.revision,
      },
    },
    { skip: !canPreview }
  );
  const canSubmit = Boolean(
    canPreview &&
    !preview.isFetching &&
    preview.currentData?.canReview &&
    preview.currentData.reservationId === snapshot.id &&
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
