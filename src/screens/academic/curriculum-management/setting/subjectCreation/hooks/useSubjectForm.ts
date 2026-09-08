'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useConfirmDialog } from 'src/hooks/use-confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddSubjectMutation,
  useUpdateSubjectMutation,
  useCheckSubjectDuplicateMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import { getSubjectInitialValues } from '../initialValues';
import { subjectValidationSchema } from '../validationSchema';

import type { SubjectFormValues } from '../initialValues';
import type { ISubject, ISubjectFormProps } from '../type';

export const useSubjectForm = ({ onClose, editData }: Omit<ISubjectFormProps, 'open'>) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const [addSubject, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddSubjectMutation,
  });

  const [updateSubject, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubjectMutation,
  });
  const [checkDuplicate, { isLoading: isDuplicateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCheckSubjectDuplicateMutation,
  });

  const [confirmPossibleDuplicate, possibleDuplicateDialog] = useConfirmDialog();

  const initialValues = useMemo(() => getSubjectInitialValues(editData), [editData]);

  const formik = useFormik<SubjectFormValues>({
    initialValues,
    validationSchema: subjectValidationSchema,
    onSubmit: async (values) => {
      try {
        const duplicateResult = await checkDuplicate({
          academicMediumId: (currentMedium as Medium).id,
          body: {
            name: values.subjectName.trim(),
            excludeSubjectId: editData?.id,
          },
        }).unwrap();

        if (duplicateResult?.hasExactDuplicate) {
          shikshaMitraToast.error({
            message: `${values.subjectName.trim()} already exists. Please use the existing subject.`,
          });
          return;
        }

        if (duplicateResult?.hasSimilarDuplicate) {
          const matchName = duplicateResult.matches?.[0]?.name || 'another subject';
          const shouldContinue = await confirmPossibleDuplicate({
            title: 'Possible Duplicate Subject',
            message: `"${values.subjectName.trim()}" is similar to the existing subject "${matchName}". Do you want to create it anyway?`,
            icon: 'warning',
            cancelText: 'Review Subject',
            confirmText: 'Create Anyway',
          });
          if (!shouldContinue) return;
        }

        const body = {
          name: values.subjectName.trim(),
          displayName: values.displayName.trim() || null,
          category: values.category,
          color: values.subjectColor,
          icon: values.icon || null,
          description: values.description.trim() || null,
          status: statusToNumber(values.status),
          sortOrder: values.sortOrder === '' ? null : Number(values.sortOrder),
          educationMediumId: (currentMedium as Medium).id,
        };

        if (editData) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (editData as ISubject).id,
            body,
          };
          await updateSubject(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.subjectName}" Subject updated successfully`,
          });
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body,
          };
          await addSubject(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.subjectName}" Subject added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to save subject', error);
      }
    },
  });

  return {
    formik,
    isSaveLoading: isUpdateLoading || isAddLoading || isDuplicateLoading,
    possibleDuplicateDialog,
  };
};

const statusToNumber = (status: string) => {
  if (status === 'Inactive') return 1;
  if (status === 'Archived') return 2;
  return 0;
};
