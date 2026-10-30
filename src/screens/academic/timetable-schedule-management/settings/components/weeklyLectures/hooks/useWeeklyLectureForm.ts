'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRef, useMemo, useEffect } from 'react';
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
import { toWeeklyLectureCount, getWeeklyLectureTotal } from '../weeklyLectureValue';

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
  isDetailsLoading: boolean;
  isCapacityLoading: boolean;
  detailsError: boolean;
  capacityError: boolean;
  subjectsError: boolean;
  classContext: string;
  refetchDetails: () => unknown;
  refetchCapacity: () => unknown;
  refetchSubjects: () => unknown;
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
  const {
    currentMedium: medium,
    currentYear,
    currentBoard,
  } = useSelector((state: RootState) => state.globalState);

  const [addWeeklyLectureSlot, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateWeeklyLectureSlotMutation,
  });

  const [updateWeeklyLectureSlot, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateWeeklyLectureSlotMutation,
  });

  const {
    data: weeklyLectureSlotById,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
    isError: detailsError,
    refetch: refetchDetails,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotByIdQuery,
    params: editData?.id || '',
    options: { skip: !editData?.id },
  });

  const {
    currentData: lectureSlotsData,
    isLoading: isCapacityLoading,
    isFetching: isCapacityFetching,
    isError: capacityError,
    refetch: refetchCapacity,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id },
  });

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
        weeklyLectures: toWeeklyLectureCount(subject.noOfLecture),
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
          message: `Weekly No. of lectures added for ${values.className}`,
        });
        onClose?.(null, true);
      }
    },
  });

  const {
    currentData: subjectTableData,
    isFetching: isSubjectsLoading,
    isError: subjectsError,
    refetch: refetchSubjects,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      standardId: formik.values.classId,
    },
    options: {
      skip: !!editData || !medium?.id || !formik.values.classId,
    },
  });

  const createdStandardIds = useMemo<string[]>(
    () => tableData?.map((item) => item.standardId).filter((v): v is string => Boolean(v)) ?? [],
    [tableData]
  );

  // Stable options let context loading initialize the form without resetting ordinary field edits.
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
    [medium?.educationMediumStages, editData, createdStandardIds]
  );

  const { setValues } = formik;
  const { classId } = formik.values;
  useEffect(() => {
    if (!allClass.length || allClass.some((item) => item.id === classId)) return;
    setValues((values) => {
      const firstClass = allClass[0];
      return {
        ...values,
        classId: firstClass.id,
        className: firstClass.name,
        subjects: [],
        totalLectures: 0,
      };
    }, false);
  }, [allClass, classId, setValues]);

  // External `selectedClass` (e.g. coming from SubjectPalette) -> sync into form.
  const appliedSelectedClass = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (editData || !selectedClass) {
      appliedSelectedClass.current = undefined;
      return;
    }
    const matched = allClass.find(
      (item) => item.name === selectedClass || item.id === selectedClass
    );
    if (!matched || appliedSelectedClass.current === matched.id) return;
    appliedSelectedClass.current = matched.id;
    setValues(
      (values) =>
        values.classId === matched.id
          ? values
          : {
              ...values,
              classId: matched.id,
              className: matched.name,
              subjects: [],
              totalLectures: 0,
            },
      false
    );
  }, [selectedClass, editData, allClass, setValues]);

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
    () => getWeeklyLectureTotal(formik.values.subjects),
    [formik.values.subjects]
  );

  const selectedClassSlot = (lectureSlotsData?.items ?? []).find(
    (item: { standardId: string }) => item.standardId === formik.values.classId
  );
  const className = allClass.find((item) => item.id === formik.values.classId)?.name;
  const classContext = [
    className || formik.values.classId,
    currentYear?.name,
    currentBoard?.name,
    medium?.name,
  ]
    .filter(Boolean)
    .join(' / ');
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
    isDetailsLoading: Boolean(editData?.id && (isDetailsLoading || isDetailsFetching)),
    isCapacityLoading: Boolean(isCapacityLoading || isCapacityFetching),
    detailsError: Boolean(detailsError),
    capacityError: Boolean(capacityError),
    subjectsError: Boolean(subjectsError),
    classContext,
    refetchDetails,
    refetchCapacity,
    refetchSubjects,
    isSubmitting: isAddLoading || isUpdateLoading,
    availableCapacity,
    hasSlots,
    requiredLectures,
    status,
  };
}
