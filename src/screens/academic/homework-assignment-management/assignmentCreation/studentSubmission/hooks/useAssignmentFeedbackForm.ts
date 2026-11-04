import type { FormEvent } from 'react';
import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUpdateSubmissionFeedbackMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';

import type { IAssignGradeProps } from '../../../homeworkCreation/type';

export type AssignmentFeedbackFormProps = IAssignGradeProps & {
  onBusyChange?: (busy: boolean) => void;
};
export type AssignmentFeedbackFormState = ReturnType<typeof useAssignmentFeedbackForm>;

export function useAssignmentFeedbackForm({
  isEdit = true,
  data,
  onClose,
  assignmentId,
  onNext,
  hasNext,
  requiresMarks = true,
  onBusyChange,
}: AssignmentFeedbackFormProps) {
  const submitAndNextRef = useRef(false);
  const submissionInFlightRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resolveTotalMarks = (value: unknown): number => {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return 25;
  };

  const [updateSubmissionFeedback, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubmissionFeedbackMutation,
  });

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      marks: typeof data?.marks === 'number' ? data.marks : '',
      totalMarks: resolveTotalMarks(data?.totalMarks),
      feedback: data?.feedback || '',
    },
    validationSchema: Yup.object({
      marks: requiresMarks
        ? Yup.number()
            .required('Obtained Marks is required')
            .max(Yup.ref('totalMarks'), 'Obtained Marks cannot exceed Total Marks')
        : Yup.number().nullable().optional(),
    }),
    async onSubmit(values) {
      if (submissionInFlightRef.current || !isEdit) return;

      submissionInFlightRef.current = true;
      setIsSubmitting(true);
      onBusyChange?.(true);
      const isUpdate = typeof data?.marks === 'number' || Boolean(data?.feedback);
      try {
        await updateSubmissionFeedback({
          assignmentId: assignmentId || data?.id,
          studentId: data?.studentId,
          academicMediumId: medium?.id,
          body: {
            marks: requiresMarks ? values.marks : null,
            totalMarks: requiresMarks ? resolveTotalMarks(values.totalMarks) : null,
            feedback: values.feedback,
            status: 4,
          },
        }).unwrap();

        shikshaMitraToast.success({
          message: `Feedback and marks have been ${
            isUpdate ? 'updated' : 'added'
          } successfully for ${data?.studentName ?? 'the student'}.`,
        });
        if (submitAndNextRef.current && hasNext && onNext) {
          submitAndNextRef.current = false;
          onNext();
        } else {
          submitAndNextRef.current = false;
          onClose(null, true);
        }
      } catch (error) {
        console.error('Failed to submit feedback and marks', error);
      } finally {
        submissionInFlightRef.current = false;
        setIsSubmitting(false);
        onBusyChange?.(false);
      }
    },
  });

  const totalMarks = Number(formik.values.totalMarks) || 25;
  const obtainedMarks =
    typeof formik.values.marks === 'number'
      ? formik.values.marks
      : typeof data?.marks === 'number'
        ? data.marks
        : null;
  const percentage =
    obtainedMarks !== null && totalMarks > 0
      ? Math.round((obtainedMarks / totalMarks) * 100)
      : null;

  return {
    handleSubmit: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!submissionInFlightRef.current) formik.handleSubmit(event);
    },
    formik,
    totalMarks,
    obtainedMarks,
    percentage,
    submitAndNextRef,
    busy: isSubmitting || isUpdateLoading,
  };
}
