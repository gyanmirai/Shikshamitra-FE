'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  useAddElectiveGroupMutation,
  useUpdateElectiveGroupMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';

import { getElectiveSubjectInitialValues } from '../components/initialValues';
import { electiveSubjectValidationSchema } from '../components/validationSchema';

import type { IElectiveSubject, IElectiveSubjectFormProps } from '../type';

export const useElectiveSubjectForm = ({
  onClose,
  editData,
}: Omit<IElectiveSubjectFormProps, 'open'>) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const [addElectiveGroup, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddElectiveGroupMutation,
  });

  const [updateElectiveGroup, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateElectiveGroupMutation,
  });

  const { data: subjectData, isLoading: isSubjectLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const initialValues = useMemo(() => getElectiveSubjectInitialValues(editData), [editData]);

  const formik = useFormik({
    initialValues,
    validationSchema: electiveSubjectValidationSchema,
    onSubmit: async (values) => {
      try {
        if (editData) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (editData as IElectiveSubject).id,
            body: {
              name: values.name,
              color: values.color,
              subjectIds: values.subjectIds,
            },
          };
          await updateElectiveGroup(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.name}" Elective Group updated successfully`,
          });
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body: {
              name: values.name,
              color: values.color,
              subjectIds: values.subjectIds,
            },
          };
          await addElectiveGroup(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.name}" Elective Group added successfully`,
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
    subjectData,
    isSubjectLoading,
    isSaveLoading: isUpdateLoading || isAddLoading,
  };
};
