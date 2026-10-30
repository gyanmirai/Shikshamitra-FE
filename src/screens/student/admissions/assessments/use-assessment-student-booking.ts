import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AssessmentScope,
  AssessmentSession,
  AssessmentBookingPreview,
  AssessmentSharedSessionInput,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  usePreviewAssessmentSessionMutation,
  useConfirmAssessmentSessionMutation,
  useLazyGetAssessmentSessionByIdQuery,
  useGetAssessmentSessionWorkbenchQuery,
  useGetAssessmentSessionResourcesQuery,
  useLazyGetAssessmentInterviewersQuery,
} from 'src/redux/student/admissions/admission-assessment-planning-api';

import { assessmentErrorMessage } from './assessment-utils';
import {
  sessionSetupSchema,
  serializeSessionSetup,
  sessionSetupInitialValues,
} from './assessment-session-setup-model';
import {
  sessionBookingInput,
  reviewStudentBooking,
  studentBookingReason,
  selectedStudentScopes,
  confirmStudentBooking,
} from './assessment-student-booking-model';

import type { SessionSetupValues } from './assessment-session-setup-model';
import type { StudentBookingRetry } from './assessment-student-booking-model';

export type StudentBookingProps = {
  rows: AssessmentRosterItem[];
  scopes: AssessmentScope[];
  academicYearId?: string;
  initialSession?: AssessmentSession | null;
  canBook: boolean;
  canCreate: boolean;
  onClose: () => void;
  onBooked: () => void;
};

export function useAssessmentStudentBooking(props: StudentBookingProps) {
  const [rows, setRows] = useState(props.rows);
  const [mode, setMode] = useState<'book' | 'create'>('book');
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
  const [discard, setDiscard] = useState<'close' | 'back' | null>(null);
  const [input, setInput] = useState<AssessmentSharedSessionInput | null>(null);
  const request = useRef(0);
  const submitting = useRef(false);
  const retry = useRef<StudentBookingRetry>({});
  const selectedScopes = selectedStudentScopes(rows, props.scopes);
  const sessions = useGetAssessmentSessionWorkbenchQuery(
    {
      academicYearId: props.academicYearId,
      includeCancelled: false,
      skipCount: page * 25,
      maxResultCount: 25,
      search: query || undefined,
      ...(selectedScopes.length === 1
        ? {
            admissionOfferingId: selectedScopes[0].admissionOfferingId,
            workflowStageDefinitionId: selectedScopes[0].workflowStageDefinitionId,
          }
        : {}),
    },
    { skip: !props.canBook || !props.academicYearId, refetchOnMountOrArgChange: true }
  );
  const resources = useGetAssessmentSessionResourcesQuery(undefined, {
    skip: mode !== 'create' || !props.canCreate,
  });
  const rooms = resources.currentData?.rooms ?? [];
  const [getSession] = useLazyGetAssessmentSessionByIdQuery();
  const [getPreview] = usePreviewAssessmentSessionMutation();
  const [confirm] = useConfirmAssessmentSessionMutation();
  const [searchInterviewers] = useLazyGetAssessmentInterviewersQuery();
  const initial = sessionSetupInitialValues();
  initial.offeringIds = [...new Set(selectedScopes.map((item) => item.admissionOfferingId))];
  initial.stageIds = Object.fromEntries(
    selectedScopes.map((item) => [item.admissionOfferingId, item.workflowStageDefinitionId])
  );
  initial.name = `${[...new Set(rows.map((row) => row.className).filter(Boolean))].join(' / ')} Entrance Exam`;
  const form = useFormik<SessionSetupValues>({
    initialValues: initial,
    validationSchema: sessionSetupSchema(selectedScopes, rooms),
    onSubmit: async (values) => {
      if (
        busy ||
        submitting.current ||
        !props.canCreate ||
        !props.canBook ||
        resources.isError ||
        resources.isFetching
      )
        return;
      const setup = {
        ...serializeSessionSetup(values, rooms),
        scopes: selectedScopes.map(({ admissionOfferingId, workflowStageDefinitionId }) => ({
          admissionOfferingId,
          workflowStageDefinitionId,
        })),
      };
      // Confirmation retries after an uncertain response must replay the original durable command.
      const replay =
        retry.current.command &&
        JSON.stringify(retry.current.command.session) === JSON.stringify(setup);
      if (replay) await submit(retry.current.command!);
      else if (
        input &&
        JSON.stringify(input) === JSON.stringify(setup) &&
        review?.canConfirm &&
        preview
      )
        await submit({
          session: setup,
          previewFingerprint: preview.previewFingerprint,
          bookings: review.bookings,
        });
      else {
        const checked = await loadPreview(setup, null);
        if (checked?.review.canConfirm && setup.sessionType !== 'individualInterview')
          await submit({
            session: setup,
            previewFingerprint: checked.preview.previewFingerprint,
            bookings: checked.review.bookings,
          });
      }
    },
  });
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
    if (busy || submitting.current) return;
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
    if (submitting.current || !props.canBook || (mode === 'create' && !props.canCreate)) return;
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
        message: `${result.bookedCount} students booked${result.session.roomReservationStatus === 2 ? ' · Room approval pending' : ''}`,
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
    const nextScopes = selectedStudentScopes(next, props.scopes);
    form.setValues(
      {
        ...form.values,
        offeringIds: [...new Set(nextScopes.map((item) => item.admissionOfferingId))],
        stageIds: Object.fromEntries(
          nextScopes.map((item) => [item.admissionOfferingId, item.workflowStageDefinitionId])
        ),
      },
      false
    );
    if (preview && input) setReview(reviewStudentBooking(next, input, preview));
  };
  const navigate = (target: 'close' | 'back') => {
    if (busy || form.isSubmitting) return;
    if (form.dirty || retry.current.command || session) setDiscard(target);
    else if (target === 'close') props.onClose();
    else {
      setMode('book');
      clearReview();
    }
  };
  const discardChanges = () => {
    const target = discard;
    setDiscard(null);
    if (target === 'close') props.onClose();
    else {
      form.resetForm({ values: initial });
      setMode('book');
      clearReview();
    }
  };
  const beginCreate = () => {
    if (busy || retry.current.command) return;
    clearReview();
    setMode('create');
    setSession(null);
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
        Date.now() &&
      rows.some((row) => !studentBookingReason(row, sessionBookingInput(item)))
  );
  const createBlocked =
    !rows.length ||
    rows.some((row) => studentBookingReason(row)) ||
    selectedScopes.length > 20 ||
    rows.some(
      (row) =>
        !selectedScopes.some(
          (scope) =>
            row.admissionOfferingId === scope.admissionOfferingId &&
            row.workflowStageDefinitionId === scope.workflowStageDefinitionId
        )
    );
  const currentSetup =
    form.values.startsAt?.isValid() && form.values.endsAt?.isValid()
      ? {
          ...serializeSessionSetup(form.values, rooms),
          scopes: selectedScopes.map(({ admissionOfferingId, workflowStageDefinitionId }) => ({
            admissionOfferingId,
            workflowStageDefinitionId,
          })),
        }
      : null;
  const reviewCurrent = mode === 'book' || JSON.stringify(currentSetup) === JSON.stringify(input);
  return {
    rows,
    mode,
    session,
    page,
    setPage,
    search,
    setSearch,
    sessions,
    available,
    resources,
    rooms,
    form,
    review: reviewCurrent ? review : null,
    preview: reviewCurrent ? preview : null,
    input,
    error,
    busy: busy || form.isSubmitting,
    discard,
    setDiscard,
    discardChanges,
    navigate,
    createBlocked: Boolean(createBlocked),
    beginCreate,
    chooseSession,
    book,
    remove,
    refresh: () =>
      retry.current.command
        ? submit(retry.current.command)
        : mode === 'book' && session
          ? chooseSession(session)
          : form.submitForm(),
    searchInterviewers: (value: string) => searchInterviewers(value, false).unwrap(),
    retryPending: Boolean(retry.current.command),
  };
}
