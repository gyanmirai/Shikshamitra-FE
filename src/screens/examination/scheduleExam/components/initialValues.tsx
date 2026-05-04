import dayjs from 'dayjs';

import type { IExamSubject, IRoomDetails, IExamFormValues } from '../type';

// ---------------------------------------------------------------------------
// Default empty form values — used for CREATE mode
// ---------------------------------------------------------------------------
export const defaultExamFormValues: IExamFormValues = {
  examId: '',
  examType: '',
  examName: '',
  className: '',
  divisions: [],
  subjects: [],
  description: '',
  isRoomAssign: false,
  roomDetails: {},
};

// ---------------------------------------------------------------------------
// Backend → Formik mapper
// Accepts the three separate API responses and returns a single Formik state.
// Works identically for CREATE (all args null) and EDIT (all args populated).
// ---------------------------------------------------------------------------
export function mapBackendToFormik(
  basicData: any = null,
  scheduleData: any = null,
  roomData: any = null,
  examSubjectsData: any = null
): IExamFormValues {
  // Build lookup maps for enrichment: prefer schedule data, fall back to examSubjects
  const scheduleMap: Record<string, any> = {};
  (scheduleData?.subjects ?? []).forEach((s: any) => {
    scheduleMap[s.subjectId] = s;
  });

  // examSubjectsData may be an array or { items: [] } — normalise to array
  const subjectsArr: any[] = Array.isArray(examSubjectsData)
    ? examSubjectsData
    : (examSubjectsData?.items ?? examSubjectsData?.subjects ?? []);

  const examSubjectMap: Record<string, any> = {};
  subjectsArr.forEach((s: any) => {
    examSubjectMap[s.subjectId] = s;
  });

  // Merge identity fields (Step 1) with schedule fields (Step 2) into one array
  const subjects: IExamSubject[] = (basicData?.subjectIds ?? []).map((subjectId: string) => {
    const sched = scheduleMap[subjectId] ?? {};
    const sub = examSubjectMap[subjectId] ?? {};
    return {
      subjectId,
      // Prefer schedule → examSubjects → fallback
      subjectName: sched.subjectName ?? sub.subjectName ?? sub.name ?? '',
      subjectColor: sched.subjectColor ?? sub.subjectColor ?? sub.color ?? '#9E9E9E',
      subjectCode: sched.subjectCode ?? sub.subjectCode ?? sub.code,
      electiveGroupId: sched.electiveGroupId ?? sub.electiveGroupId,
      examDate: sched.examDate ? dayjs(sched.examDate) : null,
      // Backend stores time as "HH:mm:ss" — normalise to a single reference date
      startTime: sched.startTime ? dayjs(`2000-01-01T${sched.startTime}`) : null,
      endTime: sched.endTime ? dayjs(`2000-01-01T${sched.endTime}`) : null,
      totalMarks: sched.totalMarks ?? '',
      passingMarks: sched.passingMarks ?? '',
      notes: sched.notes ?? '',
    };
  });

  // Build roomDetails keyed by subjectId (not subjectName — avoids name collisions)
  const roomDetails: IRoomDetails = {};
  (roomData?.subjects ?? []).forEach((sub: any) => {
    roomDetails[sub.subjectId] = {};
    (sub.divisions ?? []).forEach((div: any) => {
      roomDetails[sub.subjectId][div.divisionId] = {
        roomIds: div.roomIds ?? [],
        capacity: div.capacity ?? 0,
      };
    });
  });

  return {
    examId: basicData?.id ?? '',
    examType: basicData?.examTypeId ?? '',
    examName: basicData?.examName ?? '',
    className: basicData?.standardId ?? '',
    divisions: basicData?.divisionIds ?? [],
    subjects,
    description: basicData?.description ?? '',
    isRoomAssign: roomData?.isRoomAssigned ?? false,
    roomDetails,
  };
}

// ---------------------------------------------------------------------------
// Payload serializers — one per API call, all read from values.subjects
// ---------------------------------------------------------------------------

export function serializeBasicDetailsPayload(values: IExamFormValues) {
  return {
    examTypeId: values.examType,
    examName: values.examName,
    standardId: values.className,
    divisionIds: values.divisions,
    subjectIds: values.subjects.map((s) => s.electiveGroupId || s.subjectId),
  };
}

export function serializeSchedulePayload(values: IExamFormValues) {
  return {
    subjects: values.subjects.map((sub) => ({
      subjectId: sub.subjectId,
      examDate: sub.examDate?.toISOString() ?? null,
      startTime: sub.startTime?.toISOString() ?? null,
      endTime: sub.endTime?.toISOString() ?? null,
      totalMarks: Number(sub.totalMarks),
      passingMarks: Number(sub.passingMarks),
      notes: sub.notes,
    })),
  };
}

export function serializeRoomAssignmentPayload(values: IExamFormValues) {
  return {
    isRoomAssigned: values.isRoomAssign,
    subjects: values.subjects.map((sub) => ({
      subjectId: sub.subjectId,
      examDate: sub.examDate?.toISOString() ?? null,
      divisions: values.divisions.map((divId) => ({
        divisionId: divId,
        roomIds: values.roomDetails[sub.subjectId]?.[divId]?.roomIds ?? [],
        capacity: values.roomDetails[sub.subjectId]?.[divId]?.capacity ?? 0,
      })),
    })),
  };
}

// ---------------------------------------------------------------------------
// Legacy exports — kept for components not yet migrated; remove after migration
// ---------------------------------------------------------------------------

/** @deprecated Use mapBackendToFormik */
export const basicDetailsInitialValues = (editData: any = null) => ({
  examType: editData?.examTypeId || '',
  examName: editData?.examName || '',
  className: editData?.standardId || '',
  divisions: editData?.divisionIds || [],
  selectedSubjects: editData?.subjectIds || [],
  description: editData?.description || '',
});

/** @deprecated Use mapBackendToFormik */
export const scheduleInitialValues = (editData: any = null) => ({
  subjects:
    editData?.subjects?.map((sub: any) => ({
      ...sub,
      subjectId: sub.subjectId,
      examDate: sub.examDate ? dayjs(sub.examDate) : null,
      startTime: sub.startTime ? dayjs(`2000-01-01T${sub.startTime}`) : null,
      endTime: sub.endTime ? dayjs(`2000-01-01T${sub.endTime}`) : null,
      totalMarks: sub.totalMarks || 0,
      passingMarks: sub.passingMarks || 0,
      notes: sub.notes || '',
    })) || [],
});

/** @deprecated Use mapBackendToFormik */
export const roomAssignmentInitialValues = (editData: any = null, formikSubjects: any[] = []) => {
  const reconstructedRoomDetails: IRoomDetails = {};
  const isRoomAssign = editData?.isRoomAssigned ?? false;

  if (editData?.subjects) {
    editData.subjects.forEach((sub: any) => {
      reconstructedRoomDetails[sub.subjectId] = {};
      sub.divisions.forEach((div: any) => {
        reconstructedRoomDetails[sub.subjectId][div.divisionId] = {
          roomIds: div.roomIds,
          capacity: div.capacity,
        };
      });
    });
  }

  if (Object.keys(reconstructedRoomDetails).length === 0 && formikSubjects.length > 0) {
    formikSubjects.forEach((sub: any) => {
      reconstructedRoomDetails[sub.subjectId ?? sub.id] = {};
    });
  }

  return { isRoomAssign, roomDetails: reconstructedRoomDetails };
};
