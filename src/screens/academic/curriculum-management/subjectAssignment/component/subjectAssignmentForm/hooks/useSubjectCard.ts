'use client';

import { getIn } from 'formik';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { useTeacherSelection } from './useTeacherSelection';
import { uploadSubjectFiles } from '../services/uploadSubjectFiles';

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
  const { teacherObjs, setTeacherObjs, fetchTeacherOptions } = useTeacherSelection({
    teacherIds: subject.teacherIds,
    standardId: formik.values.classId,
    initialTeachers: subject.teachers,
  });

  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });
  const [isUploading, setIsUploading] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [localFileNames, setLocalFileNames] = useState<Record<string, string>>({});

  const teacherError =
    formik.status?.subjectId === subject.subjectId ? formik.status.teacherError : undefined;
  const isExpanded = activeSubjectId === subject.subjectNo || Boolean(teacherError);

  const handleChange = useCallback(
    (field: string, value: unknown) => {
      if (!subject?.subjectNo) return;
      onSubjectChange(subject.subjectNo, field, value);
    },
    [subject.subjectNo, onSubjectChange]
  );

  const getError = useCallback(
    (field: string) =>
      (field === 'teacherIds' && teacherError) ||
      (getIn(formik.touched, `subjects[${index}].${field}`) &&
        getIn(formik.errors, `subjects[${index}].${field}`)),
    [formik.touched, formik.errors, index, teacherError]
  );

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

  const handleDropzoneChange = async (droppedFiles: any[]) => {
    // Filter to only new File objects (not already-uploaded strings/objects)
    const newFiles = droppedFiles.filter((f): f is File => f instanceof File);
    const existingFiles = droppedFiles
      .filter((f) => !(f instanceof File))
      .map((f) => (typeof f === 'string' ? f : f?.url || f?.filePath || ''))
      .filter(Boolean);

    if (newFiles.length === 0) {
      formik.setFieldValue(`subjects.${index}.documents`, existingFiles);
      formik.setFieldTouched(`subjects.${index}.documents`, true, false);
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await uploadSubjectFiles(newFiles, async (file) => {
        const formData = new FormData();
        formData.append('File', file);
        const response = await uploadCurriculumFile(formData).unwrap();
        if (response.data) {
          setLocalFileNames((prev) => ({ ...prev, [response.data]: file.name }));
        }
        return response.data as string | undefined;
      });
      const newDocs = [...existingFiles, ...uploaded.filter(Boolean)];
      formik.setFieldValue(`subjects.${index}.documents`, newDocs);
      formik.setFieldTouched(`subjects.${index}.documents`, true, false);
      shikshaMitraToast.success({ message: 'Document(s) uploaded successfully' });
    } catch (error) {
      console.error('Upload failed:', error);
      shikshaMitraToast.error({ message: 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (docIndex: number) => {
    const newDocs = [...(subject.documents || [])];
    newDocs.splice(docIndex, 1);
    formik.setFieldValue(`subjects.${index}.documents`, newDocs);
    formik.setFieldTouched(`subjects.${index}.documents`, true, false);
  };

  return {
    teacherObjs,
    setTeacherObjs,
    fetchTeacherOptions,
    previewDoc,
    setPreviewDoc,
    handleDropzoneChange,
    handleRemoveFile,
    localFileNames,
    isUploading,
    isExpanded,
    handleChange,
    getError,
    hasSubjectError: hasSubjectError || Boolean(teacherError),
  };
};
