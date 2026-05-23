'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRef, useMemo, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetSubjectAssignmentsQuery,
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
          primaryTeacherId: subj.primaryTeacherId || null,
          secondaryTeacherIds: subj.secondaryTeacherIds || [],
        }));

        const payload = {
          classId: values.classId,
          status: values.status,
          subjects: subjectsPayload,
        };

        if (isEdit && data?.id) {
          await updateSubjectAssignment({ assignmentId: data.id, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `Subject Assignment updated successfully for  ${values.className}`,
          });
        } else {
          await addSubjectAssignment({
            academicMediumId: (medium as Medium).id,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message:
              values.status === 0
                ? `Subject Assignment saved as draft for  ${values.className}`
                : `Subject Assignment published successfully for  ${values.className}`,
          });
        }

        onClose(null, true);
      } catch (error) {
        console.error('Failed to save subject assignment', error);
        shikshaMitraToast.error({ message: 'Failed to save subject assignment' });
      }
    },
  });

  const {
    data: subjectTableData = [],
    isLoading: isSubjectLoading,
    refetch,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: formik?.values?.classId || classId, page: 0, pageSize: 20 },
    options: { skip: !classId },
  });

  const latestSubjectsRef = useRef<ISubjectAssignmentFormValues['subjects']>([]);
  latestSubjectsRef.current = formik.values.subjects || [];

  console.log(subjectOptionsData, '[][][][');

  /**
   * Memoization Justification:
   * Checks if a subject/group already exists in the table to prevent duplicates.
   * Depends on subjectTableData which changes on refetch — memoizing avoids
   * recalculating the filter closure on every render.
   */
  const checkIfSubjectExists = useCallback(
    (currentId: string) =>
      subjectTableData?.data?.items?.some(
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
    [subjectTableData?.data?.items]
  );

  /**
   * Memoization Justification:
   * Transforms raw API response into dropdown-compatible option objects.
   * Prevents re-mapping on every render when source data hasn't changed.
   */
  const subjectsOptions = useMemo(
    () =>
      (!isEdit
        ? subjectOptionsData?.data?.filter((item: { id: string }) => !checkIfSubjectExists(item.id))
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

  const handleSubjectChange = (newValue: any) => {
    if (!newValue || newValue.length === 0) {
      formik.setFieldValue('subjectType', 0);
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('selectedSubjects', []);
      return;
    }

    const currentSelected: any[] = formik.values.selectedSubjects || [];
    const addedOption = newValue.find(
      (opt: any) => !currentSelected.some((cur: any) => cur.value === opt.value)
    );
    if (addedOption) {
      const coreSubjectIds = new Set<string>(
        currentSelected.filter((opt: any) => opt.type === 0).map((opt: any) => opt.value)
      );
      const electiveSubjectIds = new Set<string>(
        currentSelected
          .filter((opt: any) => opt.type === 1)
          .flatMap((opt: any) => (opt.subjects || []).map((s: any) => s.id))
      );

      if (addedOption.type === 0) {
        if (electiveSubjectIds.has(addedOption.value)) {
          shikshaMitraToast.error({
            message: `"${addedOption.label}" is already selected in Elective Subjects. Please remove it from the Elective selection before adding it as a Core Subject.`,
          });
          return;
        }
      } else if (addedOption.type === 1) {
        const conflicting = (addedOption.subjects || []).filter((s: any) =>
          coreSubjectIds.has(s.id)
        );
        if (conflicting.length > 0) {
          const names = conflicting.map((s: any) => `"${s.name}"`).join(', ');
          const plural = conflicting.length > 1;
          shikshaMitraToast.error({
            message: `${names} ${plural ? 'are' : 'is'} already selected as a Core Subject${plural ? 's' : ''}. Please remove ${plural ? 'them' : 'it'} before selecting in Elective Subjects.`,
          });
          return;
        }
      }
    }

    formik.setFieldValue('selectedSubjects', newValue);
    formik.setFieldTouched('subjectName', false);
    const existingSubjectsMap = new Map(latestSubjectsRef.current.map((s) => [s.subjectId, s]));

    const allSubjects: ISubjectAssignmentFormValues['subjects'] = [];

    newValue.forEach((option: any) => {
      if (option.type === 0) {
        allSubjects.push({
          subjectCode: '',
          subjectType: 0,
          primaryTeacher: { id: '', name: '' },
          primaryTeacherId: option.primaryTeacherId || '',
          secondaryTeacher: [],
          secondaryTeacherIds: option.secondaryTeacherIds || [],
          description: '',
          isSubjectOpen: false,
          learningGoal: '',
          prerequisites: '',
          subjectColor: option.color || '#4169E1',
          documents: [],
          ...existingSubjectsMap.get(option.value),
          subjectId: option.value,
          subjectName: option.label,
          subjectNo: option.value,
        });
      } else if (option.type === 1) {
        const electives = (option.subjects || []).map((subject: any) => ({
          subjectCode: '',
          subjectType: 1,
          electiveGroupId: option.value,
          primaryTeacher: { id: '', name: '' },
          primaryTeacherId: '',
          secondaryTeacher: [],
          secondaryTeacherIds: [],
          isSubjectOpen: false,
          description: '',
          learningGoal: '',
          prerequisites: '',
          subjectColor: subject.color || '#FFA726',
          documents: [],
          // --- preserved user-entered values (override defaults) ---
          ...existingSubjectsMap.get(subject.id),
          // --- stable identifiers always sourced from option (highest priority) ---
          subjectId: subject.id,
          subjectName: subject.name,
          subjectNo: subject.id,
        }));
        allSubjects.push(...electives);
      }
    });

    const seenSubjectIds = new Set<string>();
    const deduplicatedSubjects = allSubjects.filter((subject) => {
      if (seenSubjectIds.has(subject.subjectId)) return false;
      seenSubjectIds.add(subject.subjectId);
      return true;
    });

    formik.setFieldValue('subjects', deduplicatedSubjects);
    const hasCore = newValue.some((v: any) => v.type === 0);
    formik.setFieldValue('subjectType', hasCore ? 0 : 1);
  };

  const handleSubjectFieldChange = (subjectId: string, field: string, value: unknown) => {
    if (!subjectId) return;
    const idx = latestSubjectsRef.current.findIndex((s) => s.subjectNo === subjectId);
    if (idx === -1) return;
    formik.setFieldValue(`subjects.${idx}.${field}`, value);
  };

  const handleFileUpload = async (files: (File | string)[], index: number | null) => {
    if (!files || files.length === 0 || index === null) return;
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
