import type { LibraryLoan } from 'src/redux/library/circulation-types';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useRef, useMemo } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { useRenewalInput } from './useRenewalInput';
import { renewalSchema } from './loan-maintenance-schema';
import { useRenewalSnapshot } from './useRenewalSnapshot';
import { useLoanMaintenanceCommand } from './useLoanMaintenanceCommand';

import type { ExactLoanSession } from './useExactLoanSession';
import type { RenewalValues } from './loan-maintenance-types';

export function useRenewalDraft(
  loan: LibraryLoan,
  session: ExactLoanSession,
  allowed: boolean,
  onClose: (event: unknown, submitted: boolean) => void
) {
  const inFlight = useRef(false);
  /** Memoization Justification: Formik validation remains bound to the opening loan while request and error state changes. */
  const schema = useMemo(() => renewalSchema(loan), [loan]);
  const command = useLoanMaintenanceCommand(() => {
    formik.resetForm();
    onClose(null, true);
  });
  const confirmed =
    loan.schoolContext?.isConfirmed &&
    loan.schoolContext.schoolToday &&
    loan.schoolContext.confirmedTimeZoneId;
  const formik = useFormik<RenewalValues>({
    initialValues: {
      academicYearId: '',
      schoolRenewalDate: confirmed ? dayjs(loan.schoolContext!.schoolToday) : null,
      requestedDueDate: null,
      reason: '',
      calendarChangeReason: '',
    },
    validateOnMount: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      if (inFlight.current || !allowed) return;
      inFlight.current = true;
      try {
        if (command.uncertain) {
          await command.submit();
          return;
        }
        if (command.conflict || session.changed)
          throw new Error('Reload the changed saved loan for review before submitting.');
        const fresh = await session.verify();
        if (fresh.canRenew !== true)
          throw new Error(
            'The current saved record does not permit renewal. Your draft is retained.'
          );
        const reviewed = await preview.verify();
        if (!reviewed.canRenew || !reviewed.newSchoolDueDate)
          throw new Error(
            reviewed.blockedReasons.join(' ') || 'The renewal preview does not permit renewal.'
          );
        if (
          !fresh.schoolContext?.academicYears.some(
            (year) => year.id === reviewed.currentAcademicYearId
          )
        )
          throw new Error(
            'The renewal academic year is no longer available. Reload the saved loan for review.'
          );
        if (reviewed.requiresCalendarChangeAcknowledgment && !values.calendarChangeReason.trim()) {
          formik.setFieldError('calendarChangeReason', 'Explain the current calendar change.');
          return;
        }
        await command.submit({
          kind: 'renew',
          loanId: loan.id,
          body: {
            ...input!,
            revision: reviewed.revision,
            reason: values.reason || null,
            calendarChangeReason: values.calendarChangeReason || null,
          },
        });
      } catch (cause) {
        command.setError(
          parseApiProblemDetail(cause).detail ||
            (cause instanceof Error ? cause.message : 'The renewal could not be verified.')
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  const input = useRenewalInput(loan, formik.values);
  const preview = useRenewalSnapshot(
    loan,
    loan.canRenew === true && loan.schoolContext ? input : null
  );
  const current =
    Boolean(loan.schoolContext) &&
    loan.canRenew === true &&
    session.latest?.canRenew === true &&
    !session.changed &&
    !session.error &&
    !session.fetching;
  const canSubmit =
    allowed &&
    (command.uncertain ||
      (current &&
        !command.conflict &&
        formik.isValid &&
        !preview.fetching &&
        !preview.changed &&
        !preview.error &&
        preview.plan?.canRenew &&
        preview.plan.newSchoolDueDate &&
        (!preview.plan.requiresCalendarChangeAcknowledgment ||
          Boolean(formik.values.calendarChangeReason.trim()))));
  return {
    formik,
    command,
    preview,
    canSubmit: Boolean(canSubmit),
    busy: formik.isSubmitting || command.busy,
    error: command.error || session.error,
    current,
  };
}
