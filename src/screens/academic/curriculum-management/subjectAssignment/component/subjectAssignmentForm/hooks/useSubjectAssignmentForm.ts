'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddSubjectAssignmentMutation,
  useUploadCurriculumFileMutation,
  useGetCoreElectiveSubjectsQuery,
  useGetSubjectAssignmentByIdQuery,
  useUpdateSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { SubjectType } from '../../../enum/subjectType';
import { validationSchema, getSubjectAssignmentInitialValues } from '../initialValues';

import type { ISubjectAssignmentFormProps, ISubjectAssignmentFormValues } from '../type';

interface UseSubjectAssignmentFormParams {
  onClose: ISubjectAssignmentFormProps['onClose'];
  data?: ISubjectAssignmentFormProps['data'];
  isEdit?: boolean;
  selectedClass: string;
  classId: string;
  subjectTableData: ISubjectAssignmentFormProps['subjectTableData'];
}

export function useSubjectAssignmentForm({
  onClose,
  data,
  isEdit = false,
  selectedClass,
  classId,
  subjectTableData,
}: UseSubjectAssignmentFormParams) {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { data: subjectAssignmentData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentByIdQuery,
    params: { assignmentId: data?.id },
    options: { skip: !data?.id },
  });

  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  const { data: subjectOptionsData, isLoading: isSubjectOptionsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreElectiveSubjectsQuery,
    params: { academicMediumId: (medium as Medium).id },
  });

  const [addSubjectAssignment, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddSubjectAssignmentMutation,
  });

  const [updateSubjectAssignment, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubjectAssignmentMutation,
  });

  /**
   * Memoization Justification:
   * Checks if a subject/group already exists in the table to prevent duplicates.
   * Depends on subjectTableData which changes on refetch — memoizing avoids
   * recalculating the filter closure on every render.
   */
  const checkIfSubjectExists = useCallback(
    (currentId: string) =>
      subjectTableData?.some(
        (subject: {
          subjectType?: number;
          subjects?: Array<{ subjectId?: string }>;
          electiveGroupId?: string;
        }) => {
          if (subject.subjectType === SubjectType.Core) {
            return subject.subjects?.[0]?.subjectId === currentId;
          }
          return subject.electiveGroupId === currentId;
        }
      ),
    [subjectTableData]
  );

  /**
   * Memoization Justification:
   * Transforms raw API response into dropdown-compatible option objects.
   * Prevents re-mapping on every render when source data hasn't changed.
   */
  const subjectsOptions = useMemo(
    () =>
      (!isEdit
        ? subjectOptionsData?.data?.filter((item: { id: string }) => checkIfSubjectExists(item.id))
        : subjectOptionsData?.data
      )?.map(
        (item: {
          id: string;
          name: string;
          subjectType: number;
          color: string;
          subjects: unknown[];
        }) => ({
          ...item,
          label: item.name,
          value: item.id,
          type: item.subjectType,
          color: item.color,
          subjects: item.subjects,
        })
      ) || [],
    [isEdit, subjectOptionsData?.data, checkIfSubjectExists]
  );

  /**
   * Memoization Justification:
   * Flattens medium stages into class dropdown options.
   * Only recalculates when medium changes, avoiding repeated flatMap on each render.
   */
  const classOptions = useMemo(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    return allClasses.map((cls: { name: string; id: string }) => ({
      label: cls.name,
      value: cls.id,
    }));
  }, [medium]);

  const formik = useFormik<ISubjectAssignmentFormValues>({
    enableReinitialize: true,
    initialValues: getSubjectAssignmentInitialValues(
      subjectAssignmentData?.data || {},
      selectedClass,
      classId
    ),
    validationSchema,
    onSubmit: async (values) => {
      try {
        const subjectsPayload = values.subjects.map((subj) => ({
          subjectId: subj.subjectId,
          electiveGroupId: subj.electiveGroupId || null,
          subjectCode: subj.subjectCode,
          documents: subj.documents || [],
          learningGoal: subj.learningGoal,
          prerequisites: subj.prerequisites,
          description: subj.description,
          primaryTeacherId: subj.primaryTeacher || null,
          secondaryTeacherId: subj.secondaryTeacher || [],
        }));

        const payload = {
          classId: values.classId,
          status: values.status,
          subjects: subjectsPayload,
        };

        if (isEdit && data?.id) {
          await updateSubjectAssignment({ assignmentId: data.id, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `Subject Assignment updated successfully for class ${values.className}`,
          });
        } else {
          await addSubjectAssignment({
            academicMediumId: (medium as Medium).id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message:
              values.status === 0
                ? `Subject Assignment saved as draft for class ${values.className}`
                : `Subject Assignment published successfully for class ${values.className}`,
          });
        }

        onClose(null, true);
      } catch (error) {
        console.error('Failed to save subject assignment', error);
        shikshaMitraToast.error({ message: 'Failed to save subject assignment' });
      }
    },
  });

  const handleSubjectChange = (
    newValue: Array<{
      type: number;
      value: string;
      label: string;
      color?: string;
      subjects?: Array<{ id: string; name: string; color?: string }>;
    }>
  ) => {
    if (!newValue || newValue.length === 0) {
      formik.setFieldValue('subjectType', 0);
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('selectedSubjects', []);
      return;
    }

    formik.setFieldValue('selectedSubjects', newValue);
    formik.setFieldTouched('subjectName', false);

    const allSubjects: ISubjectAssignmentFormValues['subjects'] = [];

    newValue.forEach((option) => {
      if (option.type === 0) {
        allSubjects.push({
          subjectId: option.value,
          subjectName: option.label,
          subjectCode: '',
          subjectType: 0,
          primaryTeacher: '',
          secondaryTeacher: [],
          description: '',
          isSubjectOpen: true,
          learningGoal: '',
          prerequisites: '',
          subjectColor: option.color || '#4169E1',
          documents: [],
          subjectNo: option.value,
        });
      } else if (option.type === 1) {
        const electives = (option.subjects || []).map((subject) => ({
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: '',
          subjectType: 1,
          electiveGroupId: option.value,
          primaryTeacher: '',
          secondaryTeacher: [],
          isSubjectOpen: true,
          description: '',
          learningGoal: '',
          prerequisites: '',
          subjectColor: subject.color || '#FFA726',
          documents: [],
          subjectNo: subject.id,
        }));
        allSubjects.push(...electives);
      }
    });

    formik.setFieldValue('subjects', allSubjects);
    const hasCore = newValue.some((v) => v.type === 0);
    formik.setFieldValue('subjectType', hasCore ? 0 : 1);
  };

  const handleSubjectFieldChange = (subjectId: string, field: string, value: unknown) => {
    if (!subjectId) return;
    const updatedSubjects = formik.values.subjects?.map((subject) =>
      subject.subjectNo === subjectId ? { ...subject, [field]: value } : subject
    );
    formik.setFieldValue('subjects', updatedSubjects);
  };

  const handleFileUpload = async (files: (File | string)[], index: number | null) => {
    const formData = new FormData();
    formData.append('FileName', (files[0] as File)?.name);
    formData.append('File', files[0] as File);
    const response = await uploadCurriculumFile(formData).unwrap();
    formik.setFieldValue(`subjects.${index}.documents`, [response.data]);
  };

  return {
    formik,
    isLoading,
    isAddLoading,
    isUpdateLoading,
    isSubjectOptionsLoading,
    subjectsOptions,
    classOptions,
    handleSubjectChange,
    handleSubjectFieldChange,
    handleFileUpload,
  };
}
