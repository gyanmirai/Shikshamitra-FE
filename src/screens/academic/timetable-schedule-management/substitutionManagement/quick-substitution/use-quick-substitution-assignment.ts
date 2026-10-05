import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useCreateSubstitutionMutation,
  useGetSuggestedTeachersByContextQuery,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import {
  getCoverageWindow,
  getQuickSubstitutionError,
  buildQuickSubstitutionPayload,
} from './quick-substitution-context';

import type { QuickSubstitutionContext, QuickSubstitutionLecture } from './types';

export function useQuickSubstitutionAssignment(
  context: QuickSubstitutionContext,
  lecture: QuickSubstitutionLecture,
  onSaved: () => void
) {
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const [create, { isLoading: saving }] = useCreateSubstitutionMutation();
  const suggestions = useGetSuggestedTeachersByContextQuery(
    {
      date: context.date,
      ...getCoverageWindow(context, lecture),
      academicMediumId: context.academicMediumId,
      standardId: lecture.standardId || undefined,
      subjectId: lecture.subjectId || undefined,
      originalTeacherId: context.teacherId || lecture.teacherId || undefined,
      originalTeacherName: context.teacherName,
      departmentName: context.departmentName,
    },
    { refetchOnMountOrArgChange: true }
  );
  const formik = useFormik({
    initialValues: { teacherId: '', acknowledgementRequired: true },
    validationSchema: Yup.object({
      teacherId: Yup.string().required('Select a substitute teacher.'),
    }),
    onSubmit: async (values) => {
      if (submitting.current || suggestions.isFetching || suggestions.isError) return;
      const teacher = suggestions.currentData?.find((row) => row.teacherId === values.teacherId);
      if (!teacher || teacher.hasConflict || !teacher.isFullSlotCoverage) {
        setError('Select a teacher available for the entire coverage window.');
        return;
      }
      submitting.current = true;
      setError('');
      try {
        await create(
          buildQuickSubstitutionPayload(context, lecture, teacher, values.acknowledgementRequired)
        ).unwrap();
        formik.resetForm();
        shikshaMitraToast.success({
          message: `${lecture.period} assigned to ${teacher.teacherName}.`,
        });
        onSaved();
      } catch (failure) {
        setError(getQuickSubstitutionError(failure));
      } finally {
        submitting.current = false;
      }
    },
  });
  useEffect(() => {
    if (!formik.dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [formik.dirty]);
  return { formik, suggestions, saving: saving || formik.isSubmitting, error };
}
