'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddSubjectMutation,
  useUpdateSubjectMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import { getSubjectInitialValues } from '../initialValues';
import { subjectValidationSchema } from '../validationSchema';

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

  const initialValues = useMemo(() => getSubjectInitialValues(editData), [editData]);

  const formik = useFormik({
    initialValues,
    validationSchema: subjectValidationSchema,
    onSubmit: async (values) => {
      try {
        if (editData) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (editData as ISubject).id,
            body: {
              name: values.subjectName,
              color: values.subjectColor,
              educationMediumId: (currentMedium as Medium).id,
            },
          };
          await updateSubject(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.subjectName}" Subject updated successfully`,
          });
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body: {
              name: values.subjectName,
              color: values.subjectColor,
              educationMediumId: (currentMedium as Medium).id,
            },
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
    isSaveLoading: isUpdateLoading || isAddLoading,
  };
};
