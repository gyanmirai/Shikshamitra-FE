import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AssessmentScope,
  AssessmentSession,
  AssessmentBookingPreview,
  AssessmentSharedSessionInput,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  usePreviewAssessmentSessionMutation,
  useConfirmAssessmentSessionMutation,
  useLazyGetAssessmentSessionByIdQuery,
  useGetAssessmentSessionWorkbenchQuery,
} from 'src/redux/student/admissions/admission-assessment-planning-api';

import { assessmentErrorMessage } from './assessment-utils';
import {
  sessionBookingInput,
  studentBookingReason,
  reviewStudentBooking,
  confirmStudentBooking,
} from './assessment-student-booking-model';

import type { StudentBookingRetry } from './assessment-student-booking-model';

export type StudentBookingProps = {
  rows: AssessmentRosterItem[];
  scopes: AssessmentScope[];
  academicYearId?: string;
  initialSession?: AssessmentSession | null;
  canBook: boolean;
  onClose: () => void;
  onBooked: () => void;
  onViewBooking?: (row: AssessmentRosterItem) => void;
};

export function useAssessmentStudentBooking(props: StudentBookingProps) {
  const [rows, setRows] = useState(props.rows);
  const [session, setSession] = useState<AssessmentSession | null>(props.initialSession ?? null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const [review, setReview] = useState<ReturnType<typeof reviewStudentBooking> | null>(null);
  const [preview, setPreview] = useState<AssessmentBookingPreview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [input, setInput] = useState<AssessmentSharedSessionInput | null>(null);
  const request = useRef(0);
  const submitting = useRef(false);
  const retry = useRef<StudentBookingRetry>({});
  const hasBookableStudents = rows.some((row) => !studentBookingReason(row));
  const sessions = useGetAssessmentSessionWorkbenchQuery(
    {
      academicYearId: props.academicYearId,
      includeCancelled: false,
      skipCount: page * 25,
      maxResultCount: 25,
      search: query || undefined,
    },
    {
      skip: !props.canBook || !props.academicYearId || !hasBookableStudents,
      refetchOnMountOrArgChange: true,
    }
  );
  const [getSession] = useLazyGetAssessmentSessionByIdQuery();
  const [getPreview] = usePreviewAssessmentSessionMutation();
  const [confirm] = useConfirmAssessmentSessionMutation();
  const clearReview = () => {
    request.current += 1;
    setReview(null);
    setPreview(null);
    setInput(null);
    setError('');
    retry.current = {};
  };
  async function loadPreview(
    setup: AssessmentSharedSessionInput,
    existing: AssessmentSession | null
  ) {
    request.current += 1;
    const { current } = request;
    setBusy(true);
    setError('');
    setReview(null);
    setPreview(null);
    retry.current = {};
    try {
      const result = await getPreview({
        session: setup,
        sessionId: existing?.id,
        sessionConcurrencyStamp: existing?.concurrencyStamp,
        stageInstanceIds: rows.map((row) => row.stageInstanceId),
        skipCount: 0,
        maxResultCount: 100,
      }).unwrap();
      if (current !== request.current) return undefined;
      const checked = reviewStudentBooking(rows, setup, result);
      setInput(setup);
      setPreview(result);
      setReview(checked);
      return { preview: result, review: checked };
    } catch (failure) {
      if (current === request.current) setError(assessmentErrorMessage(failure));
    } finally {
      if (current === request.current) setBusy(false);
    }
    return undefined;
  }
  const chooseSession = async (chosen: AssessmentSession) => {
    if (busy || submitting.current || retry.current.command || !props.canBook) return;
    if (rows.some((row) => studentBookingReason(row))) return;
    clearReview();
    setSession(chosen);
    setBusy(true);
    request.current += 1;
    const { current } = request;
    try {
      const fresh = await getSession(chosen.id, false).unwrap();
      if (current !== request.current) return;
      setSession(fresh);
      await loadPreview(sessionBookingInput(fresh), fresh);
    } catch (failure) {
      if (current === request.current) {
        setError(assessmentErrorMessage(failure));
        setBusy(false);
      }
    }
  };
  async function submit(command: Parameters<typeof confirmStudentBooking>[0]) {
    if (submitting.current || !props.canBook) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await confirmStudentBooking(
        command,
        (body) => confirm(body).unwrap(),
        retry.current
      );
      shikshaMitraToast.success({
        message: `${result.bookedCount} ${result.bookedCount === 1 ? 'student' : 'students'} booked${result.session.roomReservationStatus === 2 ? ' · Room approval pending' : ''}`,
      });
      props.onBooked();
    } catch (failure) {
      setError(assessmentErrorMessage(failure));
      if (!retry.current.command) {
        setReview(null);
        setPreview(null);
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  const book = async () => {
    if (busy || !props.canBook) return;
    if (retry.current.command) {
      await submit(retry.current.command);
      return;
    }
    if (!session || !input || !preview || !review?.canConfirm) return;
    await submit({
      session: input,
      sessionId: session.id,
      sessionConcurrencyStamp: session.concurrencyStamp,
      previewFingerprint: preview.previewFingerprint,
      bookings: review.bookings,
    });
  };
  const remove = (id: string) => {
    if (busy || retry.current.command) return;
    const next = rows.filter((row) => row.stageInstanceId !== id);
    setRows(next);
    setPage(0);
    retry.current = {};
    if (preview && input) setReview(reviewStudentBooking(next, input, preview));
  };
  const navigate = () => {
    if (busy || submitting.current) return;
    if (retry.current.command || session) setDiscard(true);
    else props.onClose();
  };
  const discardChanges = () => {
    setDiscard(false);
    props.onClose();
  };
  const initialLoad = useRef(false);
  useEffect(() => {
    if (props.initialSession && !initialLoad.current) {
      initialLoad.current = true;
      chooseSession(props.initialSession);
    }
  });
  useEffect(
    () => () => {
      request.current += 1;
    },
    []
  );
  const available = (sessions.currentData?.items ?? []).filter(
    (item) =>
      !item.isCancelled &&
      item.canManage !== false &&
      item.roomId &&
      item.bookedCount < item.capacity &&
      Date.parse(item.sessionType === 'individualInterview' ? item.endsAt : item.startsAt) >
        Date.now()
  );
  const sessionReason = (choice: AssessmentSession) => {
    if (rows.some((row) => studentBookingReason(row))) return 'Remove unavailable students first.';
    const setup = sessionBookingInput(choice);
    const unsupported = rows.filter(
      (row) =>
        !setup.scopes.some(
          (scope) =>
            row.admissionOfferingId === scope.admissionOfferingId &&
            row.workflowStageDefinitionId === scope.workflowStageDefinitionId
        )
    );
    if (!rows.length) return 'Select students first.';
    if (!unsupported.length) return '';
    const classes = [...new Set(unsupported.map((row) => row.className).filter(Boolean))];
    return classes.length ? `${classes.join(', ')} not supported.` : 'Different assessment.';
  };
  return {
    rows,
    session,
    page,
    setPage,
    search,
    setSearch,
    sessions,
    available,
    hasBookableStudents,
    sessionReason,
    review,
    preview,
    input,
    error,
    busy,
    discard,
    setDiscard,
    discardChanges,
    navigate,
    chooseSession,
    book,
    remove,
    refresh: () =>
      retry.current.command
        ? submit(retry.current.command)
        : session
          ? chooseSession(session)
          : undefined,
    retryPending: Boolean(retry.current.command),
  };
}
