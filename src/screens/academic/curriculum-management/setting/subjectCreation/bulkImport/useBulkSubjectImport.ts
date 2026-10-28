'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetSubjectLookupQuery,
  useBulkAddSubjectsMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import { parseSubjectImportFile } from './parser';
import { subjectImportFileSchema } from './validation';

import type { SubjectImportFormValues } from './types';

const importSchema = Yup.object({
  file: subjectImportFileSchema,
  rows: Yup.array().min(1, 'The file must contain at least one subject.'),
});

const statusToNumber = (status: string) => {
  if (status === 'Inactive') return 1;
  if (status === 'Archived') return 2;
  return 0;
};

export const useBulkSubjectImport = (onClose: () => void) => {
  const [isParsing, setIsParsing] = useState(false);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const mediumId = (currentMedium as Medium)?.id;
  const { data: existingSubjects = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectLookupQuery,
    params: { academicMediumId: mediumId },
    options: { skip: !mediumId, refetchOnMountOrArgChange: 60 },
  });
  const [bulkAddSubjects, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useBulkAddSubjectsMutation,
  });

  /**
   * Memoization Justification:
   * Parsing can validate up to 200 rows, so a Set avoids rescanning the existing subject list per row.
   */
  const existingNames = useMemo(
    () =>
      new Set<string>(
        (existingSubjects || []).map((subject: any) => subject.name.trim().toLowerCase())
      ),
    [existingSubjects]
  );

  const closeAndReset = () => {
    formik.resetForm();
    onClose();
  };

  const formik = useFormik<SubjectImportFormValues>({
    initialValues: { file: null, rows: [] },
    validationSchema: importSchema,
    onSubmit: async ({ rows }) => {
      if (!mediumId || rows.some((row) => row.issues.length > 0)) {
        shikshaMitraToast.error({ message: 'Fix all file validation errors before importing.' });
        return;
      }
      try {
        await bulkAddSubjects({
          academicMediumId: mediumId,
          body: {
            subjects: rows.map((row) => ({
              name: row.name,
              displayName: row.displayName || null,
              category: row.category,
              color: row.color,
              icon: row.icon || null,
              description: row.description || null,
              status: statusToNumber(row.status),
              sortOrder: row.sortOrder ? Number(row.sortOrder) : null,
              educationMediumId: mediumId,
            })),
          },
        }).unwrap();
        shikshaMitraToast.success({ message: `${rows.length} subjects imported successfully.` });
        closeAndReset();
      } catch (error) {
        console.error('Failed to import subjects', error);
      }
    },
  });

  const handleFileChange = async (file: File) => {
    formik.setFieldTouched('file', true, false);
    formik.setFieldValue('file', file, false);
    formik.setFieldValue('rows', [], false);
    try {
      await subjectImportFileSchema.validate(file);
      setIsParsing(true);
      const result = await parseSubjectImportFile(file, existingNames);
      formik.setFieldValue('rows', result.rows, false);
      formik.setFieldError('file', result.fileError);
    } catch (error) {
      const message =
        error instanceof Yup.ValidationError ? error.message : 'Unable to read this file.';
      formik.setFieldError('file', message);
    } finally {
      setIsParsing(false);
    }
  };

  return { formik, isParsing, isSaving, closeAndReset, handleFileChange };
};
