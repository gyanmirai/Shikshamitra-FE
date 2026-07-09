'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { getTimetableSettingStatus } from 'src/utils/timetable-capacity';
import { useGetLectureSlotsQuery } from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';
import { SubjectType } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useGetWeeklyLectureSlotByIdQuery,
  useCreateWeeklyLectureSlotMutation,
  useUpdateWeeklyLectureSlotMutation,
} from 'src/redux/academicAPI/timetableApi/weeklyLecturesApi';

import { getNoOfLectureInitialValues } from '../initialValues';
import { noOfLectureValidationSchema } from '../validationSchema';

import type {
  ISubject,
  IClassOption,
  ISubjectPayload,
  ISubjectFormValues,
  ICreateNoOfLectureProps,
} from '../type';

interface UseWeeklyLectureFormArgs extends Pick<
  ICreateNoOfLectureProps,
  'editData' | 'selectedClass' | 'tableData' | 'onClose'
> {}

interface UseWeeklyLectureFormResult {
  formik: ReturnType<typeof useFormik<ISubjectFormValues>>;
  allClass: IClassOption[];
  isSubjectsLoading: boolean;
  isSubmitting: boolean;
  availableCapacity: number;
  hasSlots: boolean;
  requiredLectures: number;
  status: ReturnType<typeof getTimetableSettingStatus>;
}

/**
 * Encapsulates the formik setup, RTK query/mutation wiring and side-effects
 * required by the "Add / Edit Weekly Lectures" dialog.
 *
 * Splitting this out of the UI component keeps the dialog under the LOC budget,
 * isolates business/data logic, and makes it independently testable.
 */
export function useWeeklyLectureForm({
  editData,
  selectedClass,
  tableData,
  onClose,
}: UseWeeklyLectureFormArgs): UseWeeklyLectureFormResult {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [addWeeklyLectureSlot, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateWeeklyLectureSlotMutation,
  });

  const [updateWeeklyLectureSlot, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateWeeklyLectureSlotMutation,
  });

  const { data: weeklyLectureSlotById } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotByIdQuery,
    params: editData?.id || '',
    options: { skip: !editData?.id },
  });

  const { data: lectureSlotsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id },
  });

  const selectedClassSlot = (lectureSlotsData?.items ?? []).find(
    (item: any) => item.standardId === (editData?.standardId || selectedClass)
  );

  const formik = useFormik<ISubjectFormValues>({
    initialValues: getNoOfLectureInitialValues(
      weeklyLectureSlotById,
      editData?.standardId || selectedClass
    ),
    enableReinitialize: true,
    validationSchema: noOfLectureValidationSchema,
    onSubmit: async (values) => {
      const subjectsPayload: ISubjectPayload[] = values.subjects.map((subject) => ({
        subjectId: subject.subjectId || subject.id,
        weeklyLectures: Number(subject.noOfLecture) || 0,
        electiveGroupId: subject.electiveGroupId || null,
      }));

      const classSlot = (lectureSlotsData?.items ?? []).find(
        (item: any) => item.standardId === values.classId
      );
      const totalRequired = subjectsPayload.reduce((sum, s) => sum + s.weeklyLectures, 0);

      if (classSlot && totalRequired > classSlot.weeklyTeachingCapacity) {
        shikshaMitraToast.error({
          message: `You have assigned ${totalRequired} lectures, but only ${classSlot.weeklyTeachingCapacity} teaching slots are available. Please reduce ${totalRequired - classSlot.weeklyTeachingCapacity} lectures or update Lecture Slots.`,
        });
        return;
      }

      if (editData && editData.id) {
        const res = await updateWeeklyLectureSlot({
          lectureSlotId: editData.id,
          body: { subjects: subjectsPayload },
        });
        if (res.data) {
          shikshaMitraToast.success({
            message: `Weekly No. of lectures updated for ${values.className}`,
          });
          onClose?.(null, true);
        }
        return;
      }

      const res = await addWeeklyLectureSlot({
        academicMediumId: (medium as { id?: string } | undefined)?.id,
        standardId: values.classId,
        subjects: subjectsPayload,
      });
      if (res.data) {
        shikshaMitraToast.success({
          message: `Weekly No. of lectures added for {values.className}`,
        });
        onClose?.(null, true);
      }
    },
  });

  const { data: subjectTableData, isLoading: isSubjectsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      standardId: formik.values.classId,
    },
    options: {
      skip: !medium?.id || !formik.values.classId,
    },
  });

  const createdStandardIds = useMemo<string[]>(
    () => tableData?.map((item) => item.standardId).filter((v): v is string => Boolean(v)) ?? [],
    [tableData]
  );

  // Build the available class list once (intentionally excluded from deps to
  // match the legacy snapshot-on-mount semantics – pre-existing rows stay
  // editable while new-add hides already-configured classes).
  const allClass = useMemo<IClassOption[]>(
    () =>
      editData
        ? (medium?.educationMediumStages?.flatMap(
            (stage: Organization) => stage.standards || []
          ) as IClassOption[]) || []
        : (medium?.educationMediumStages?.flatMap(
            (stage: Organization) =>
              (stage.standards || []).filter(
                (standard: IClassOption) => !createdStandardIds.includes(standard.id)
              ) || []
          ) as IClassOption[]) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Default classId to the first available class once the list is known.
  useEffect(() => {
    formik.setFieldValue('classId', editData?.standardId || allClass?.[0]?.id || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass]);

  // External `selectedClass` (e.g. coming from SubjectPalette) -> sync into form.
  useEffect(() => {
    if (!editData && selectedClass) {
      const matched = allClass.find((c) => c.name === selectedClass || c.id === selectedClass);
      if (matched) {
        formik.setFieldValue('classId', matched.id);
        formik.setFieldValue('className', matched.name);
      }
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('totalLectures', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, editData, allClass]);

  // When subject assignments are loaded (create flow only), seed the rows.
  useEffect(() => {
    if (editData || !subjectTableData?.data?.items) return;

    const rows: ISubject[] = subjectTableData.data.items
      .filter((item: { status: number }) => item.status === 1)
      .map((item: any): ISubject => {
        if (item.subjectType === SubjectType.Elective) {
          return {
            id: item.id,
            name: `${item?.electiveGroupName}`,
            subjectCode: '',
            subjectColor: item.color,
            noOfLecture: '',
            subjectId: item.subjects?.[0]?.subjectId,
            electiveGroupId: item.electiveGroupId,
            subjectType: item.subjectType,
            subjects: item.subjects,
            subjectCount: item.subjects?.length ?? 0,
          };
        }
        return {
          id: item.subjects[0]?.subjectId,
          name: item.subjects[0]?.subjectName,
          subjectCode: item.subjects[0]?.subjectCode,
          subjectColor: item.color,
          noOfLecture: '',
          subjectId: item.subjects[0]?.subjectId,
          electiveGroupId: null,
          subjectType: item.subjectType,
        };
      });

    formik.setFieldValue('subjects', rows);
    formik.setFieldValue('totalLectures', 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectTableData?.data?.items, editData]);

  const requiredLectures = useMemo(
    () => formik.values.subjects.reduce((sum, s) => sum + Number(s.noOfLecture || 0), 0),
    [formik.values.subjects]
  );

  const hasSlots = Boolean(selectedClassSlot);
  const availableCapacity = selectedClassSlot?.weeklyTeachingCapacity ?? 0;
  const status = getTimetableSettingStatus({
    availableCapacity,
    requiredLectures,
    hasSlots,
    hasWeeklyLectures: requiredLectures > 0,
  });

  return {
    formik,
    allClass,
    isSubjectsLoading,
    isSubmitting: isAddLoading || isUpdateLoading,
    availableCapacity,
    hasSlots,
    requiredLectures,
    status,
  };
}
