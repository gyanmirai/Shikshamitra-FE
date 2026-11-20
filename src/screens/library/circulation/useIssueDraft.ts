import type { LibraryCheckoutRequest } from 'src/redux/library/circulation-commands';
import type { IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useCheckoutLibraryLoanMutation } from 'src/redux/library/circulation-api';
import { useResolveCirculationMemberQuery } from 'src/redux/library/circulation-members-api';

import { schoolDate } from './school-date';
import { useIssuePlan } from './useIssuePlan';
import { issueFingerprint } from './issue-form';
import { useBookLookup } from './useBookLookup';
import { useCommandAttempt } from './useCommandAttempt';
import { getIssueBookSchema } from '../BookList/Components/BookView/getBookIssueValidatonSchema';

import type { IssueValues } from './issue-form';

export type { IssueValues } from './issue-form';
export function useIssueDraft(
  editData: IBookCopyWithBook | null,
  canIssue: boolean,
  onClose: (event: unknown, submitted: boolean) => void
) {
  const [save, result] = useCheckoutLibraryLoanMutation();
  const attempt = useCommandAttempt<Omit<LibraryCheckoutRequest, 'idempotencyKey'>>();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const formik = useFormik<IssueValues>({
    initialValues: {
      accessionNumber: editData?.accessionNo || '',
      memberId: '',
      memberScan: '',
      academicYearId: '',
      issueDate: null,
      dueDate: null,
    },
    validationSchema: () =>
      getIssueBookSchema(undefined, plan.manual, member.currentData?.role === 1),
    onSubmit: async (values) => {
      if (inFlight.current) return;
      const key = issueFingerprint(values);
      const retry = attempt.retry(key);
      if (
        !canIssue ||
        (!retry &&
          (!request ||
            !plan.currentData?.canIssue ||
            !plan.currentData.dueDate ||
            (plan.manual && !schoolDate(values.dueDate)) ||
            book.pending ||
            member.isFetching ||
            member.isError ||
            attempt.conflict))
      ) {
        setError('Review a current checkout preview for the saved copy, borrower and dates.');
        return;
      }
      inFlight.current = true;
      setError('');
      try {
        const body =
          retry ||
          attempt.prepare(key, {
            ...request!,
            requestedDueDate: plan.manual ? request!.requestedDueDate : null,
            revision: plan.currentData!.revision,
          });
        const saved = await save(body).unwrap();
        shikshaMitraToast.success({
          message: saved.wasReplay
            ? 'The previously submitted issue was recovered.'
            : 'Book issued successfully.',
        });
        formik.resetForm({ values });
        onClose(null, true);
      } catch (cause) {
        attempt.failed(key, cause);
        setError(
          parseApiProblemDetail(cause).detail ||
            'The issue could not be confirmed. Your draft and submission attempt are retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  const book = useBookLookup(formik.values.accessionNumber, canIssue);
  const member = useResolveCirculationMemberQuery(
    { identifier: formik.values.memberId },
    { skip: !canIssue || !formik.values.memberId, refetchOnMountOrArgChange: true }
  );
  const issueDate = schoolDate(formik.values.issueDate);
  const year =
    member.currentData?.role === 0
      ? member.currentData.academicYearId
      : formik.values.academicYearId;
  const request =
    book.currentData?.copyId &&
    member.currentData?.isEligibleForIssue &&
    !book.pending &&
    !member.isFetching &&
    !member.isError &&
    issueDate &&
    year
      ? {
          copyId: book.currentData.copyId,
          memberId: member.currentData.id,
          academicYearId: year,
          issueDate,
          requestedDueDate: schoolDate(formik.values.dueDate),
        }
      : null;
  const plan = useIssuePlan(request);
  const retry = attempt.retry(issueFingerprint(formik.values));
  return {
    formik,
    book,
    member,
    plan,
    error,
    busy: formik.isSubmitting || result.isLoading,
    uncertain: Boolean(retry),
    conflict: attempt.conflict,
    review: () => {
      attempt.reviewed();
      plan.refetch();
    },
    canSubmit:
      canIssue &&
      Boolean(
        retry ||
        (request &&
          plan.currentData?.canIssue &&
          (!plan.manual || schoolDate(formik.values.dueDate)) &&
          !attempt.conflict)
      ),
  };
}
