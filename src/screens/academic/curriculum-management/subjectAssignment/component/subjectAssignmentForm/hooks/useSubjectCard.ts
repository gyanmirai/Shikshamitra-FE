'use client';

import { getIn } from 'formik';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useCallback } from 'react';

import { useTeacherSelection } from './useTeacherSelection';

import type { ISubjectCardProps } from '../../type';

export const useSubjectCard = ({
  formik,
  subject,
  index,
  onSubjectChange,
  activeSubjectId,
}: Omit<
  ISubjectCardProps,
  'isPublished' | 'onFileUpload' | 'onAccordionToggle' | 'onRemove' | 'isCore'
>) => {
  const {
    primaryTeacherObj,
    setPrimaryTeacherObj,
    secondaryTeacherObjs,
    setSecondaryTeacherObjs,
    fetchPrimaryTeacherOptions,
    fetchSecondaryTeacherOptions,
  } = useTeacherSelection({
    primaryTeacherId: subject.primaryTeacherId,
    secondaryTeacherIds: subject.secondaryTeacherIds,
  });

  const [previewFile, setPreviewFile] = useState<File | string | null>(null);
  const previewDialog = useBoolean();

  const isExpanded = activeSubjectId === subject.subjectNo;

  const handleChange = useCallback(
    (field: string, value: unknown) => {
      if (!subject?.subjectNo) return;
      onSubjectChange(subject.subjectNo, field, value);
    },
    [subject.subjectNo, onSubjectChange]
  );

  const getError = useCallback(
    (field: string) =>
      getIn(formik.touched, `subjects[${index}].${field}`) &&
      getIn(formik.errors, `subjects[${index}].${field}`),
    [formik.touched, formik.errors, index]
  );

  /**
   * Memoization Justification:
   * Re-evaluating errors and touched states for individual subject fields on every typing event is slow.
   * This memoization checks for nested Formik error/touched updates only when formik's errors/touched values change.
   */
  const hasSubjectError = useMemo(() => {
    const subjectErrors = getIn(formik.errors, `subjects[${index}]`);
    const subjectTouched = getIn(formik.touched, `subjects[${index}]`);
    if (!subjectErrors || typeof subjectErrors !== 'object') return false;
    if (!subjectTouched || typeof subjectTouched !== 'object') return false;
    return Object.keys(subjectErrors as object).some(
      (field) =>
        !!(subjectTouched as Record<string, unknown>)[field] &&
        !!(subjectErrors as Record<string, unknown>)[field]
    );
  }, [formik.errors, formik.touched, index]);

  return {
    primaryTeacherObj,
    setPrimaryTeacherObj,
    secondaryTeacherObjs,
    setSecondaryTeacherObjs,
    fetchPrimaryTeacherOptions,
    fetchSecondaryTeacherOptions,
    previewFile,
    setPreviewFile,
    previewDialog,
    isExpanded,
    handleChange,
    getError,
    hasSubjectError,
  };
};
