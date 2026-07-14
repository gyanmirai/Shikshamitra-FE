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
  useGetElectiveGroupsQuery,
  useAddElectiveGroupMutation,
  useUpdateElectiveGroupMutation,
  useCheckElectiveGroupDuplicateMutation,
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

  const [checkElectiveGroupDuplicate, { isLoading: isDuplicateCheckLoading }] = useQueryAndMutation(
    {
      type: 'mutation',
      currentQueryAndMutation: useCheckElectiveGroupDuplicateMutation,
    }
  );

  const { data: subjectData, isLoading: isSubjectLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const { data: electiveGroupsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetElectiveGroupsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (electiveGroupsData ?? [])
          .filter((group: any) => group.id !== editData?.id)
          .map((group: any) => group.name.trim().toLowerCase())
      ),
    [editData?.id, electiveGroupsData]
  );

  const activeSubjectData = useMemo(
    () =>
      (subjectData || []).filter((subject: any) => {
        const selectedInEdit = editData?.subjects?.some((item) => item.id === subject.id);
        return (
          selectedInEdit ||
          subject.status === 0 ||
          subject.status === 'Active' ||
          subject.status == null
        );
      }),
    [editData?.subjects, subjectData]
  );

  const initialValues = useMemo(() => getElectiveSubjectInitialValues(editData), [editData]);

  const formik = useFormik({
    initialValues,
    validationSchema: electiveSubjectValidationSchema(existingNames, editData),
    onSubmit: async (values) => {
      try {
        const duplicateResult = await checkElectiveGroupDuplicate({
          academicMediumId: (currentMedium as Medium).id,
          body: {
            name: values.name.trim(),
            subjectIds: values.subjectIds,
            excludeElectiveGroupId: editData?.id,
          },
        }).unwrap();

        if (duplicateResult?.hasExactDuplicate || duplicateResult?.hasSameSubjectCombination) {
          const duplicateMessage = duplicateResult?.hasExactDuplicate
            ? 'An elective group with this name already exists.'
            : 'An elective group with the same subject combination already exists.';
          shikshaMitraToast.warning({
            message: duplicateMessage,
          });
          return;
        }

        if (editData) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (editData as IElectiveSubject).id,
            body: {
              name: values.name.trim(),
              color: values.color,
              subjectIds: values.subjectIds,
              groupType: values.groupType,
              description: values.description,
              status: statusToNumber(values.status),
              sortOrder: values.sortOrder === '' ? null : Number(values.sortOrder),
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
              name: values.name.trim(),
              color: values.color,
              subjectIds: values.subjectIds,
              groupType: values.groupType,
              description: values.description,
              status: statusToNumber(values.status),
              sortOrder: values.sortOrder === '' ? null : Number(values.sortOrder),
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
    subjectData: activeSubjectData,
    isSubjectLoading,
    isSaveLoading: isUpdateLoading || isAddLoading || isDuplicateCheckLoading,
  };
};

const statusToNumber = (status: string) => {
  if (status === 'Inactive') return 1;
  if (status === 'Archived') return 2;
  return 0;
};
