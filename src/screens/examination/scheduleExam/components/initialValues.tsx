import dayjs from 'dayjs';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import type { IExamSubject, IRoomDetails, IExamFormValues } from '../type';

function combineDateAndTime(dateObj: any, timeObj: any): string | null {
  if (!dateObj || !timeObj) return null;
  const d = dayjs(dateObj);
  const t = dayjs(timeObj);
  if (!d.isValid() || !t.isValid()) return null;
  return d.hour(t.hour()).minute(t.minute()).second(0).millisecond(0).toISOString();
}

function toApiDateTime(value: any): string | null {
  return value?.format?.(dateFormat) ? dateConvertor(value.format(dateFormat)) : null;
}

function toNullableNumber(value: any): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function hasCompleteSchedule(value: any): boolean {
  return Boolean(
    value?.examDate &&
    value?.startTime &&
    value?.endTime &&
    value?.gradeScalingId &&
    value?.totalMarks !== '' &&
    value?.totalMarks !== undefined &&
    value?.totalMarks !== null &&
    value?.passingMarks !== '' &&
    value?.passingMarks !== undefined &&
    value?.passingMarks !== null
  );
}

// ---------------------------------------------------------------------------
// Default empty form values — used for CREATE mode
// ---------------------------------------------------------------------------
export const defaultExamFormValues: IExamFormValues = {
  examId: '',
  examType: '',
  examTypeName: '',
  examName: '',
  className: '',
  gradingScaleId: '',
  gradeScaleRequired: true,
  divisions: [],
  subjects: [],
  description: '',
  isRoomAssign: false,
  syncToAcademicCalendar: false,
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
  examSubjectsData: any = null,
  examTypes: any[] = []
): IExamFormValues {
  const scheduleMap: Record<string, any> = {};
  const rawScheduleSubjects: any[] = scheduleData?.subjects ?? scheduleData?.data?.subjects ?? [];
  const scheduleSubjectIds = new Set<string>();
  rawScheduleSubjects.forEach((s: any) => {
    if (s?.subjectId) {
      scheduleMap[s.subjectId] = s;
      scheduleSubjectIds.add(s.subjectId);
      // Schedule API stores individual elective subjects in electiveGroupSubjects (not subjects).
      // Populate scheduleMap for each so per-subject schedule lookup works in separate mode.
      if (s.electiveGroupId && Array.isArray(s.electiveGroupSubjects)) {
        s.electiveGroupSubjects.forEach((sub: any) => {
          if (sub?.subjectId) {
            scheduleSubjectIds.add(sub.subjectId);
            scheduleMap[sub.subjectId] = {
              ...sub,
              electiveGroupId: s.electiveGroupId,
              examDate: sub.examDate ?? s.examDate ?? null,
              startTime: sub.startTime ?? s.startTime ?? null,
              endTime: sub.endTime ?? s.endTime ?? null,
              totalMarks: sub.totalMarks ?? s.totalMarks ?? null,
              passingMarks: sub.passingMarks ?? s.passingMarks ?? null,
              notes: sub.notes ?? s.notes ?? null,
              gradeScalingId: sub.gradeScalingId ?? s.gradeScalingId ?? null,
            };
          }
        });
      }
    }
  });

  const subjectsArr: any[] = (() => {
    if (!examSubjectsData) return [];
    if (Array.isArray(examSubjectsData)) return examSubjectsData;
    return (
      examSubjectsData?.items ??
      examSubjectsData?.data?.items ??
      examSubjectsData?.subjects ??
      examSubjectsData?.data?.subjects ??
      []
    );
  })();

  const isAssignmentFormat =
    subjectsArr.length > 0 && Array.isArray((subjectsArr[0] as any)?.subjects);

  const examSubjectMap: Record<string, any> = {};
  const electiveGroupMap: Record<
    string,
    { name: string; color: string; subjects: IExamSubject[] }
  > = {};

  if (isAssignmentFormat) {
    subjectsArr.forEach((item: any) => {
      if (item?.electiveGroupId) {
        // Elective group item: key by electiveGroupId
        electiveGroupMap[item.electiveGroupId] = {
          name: item.electiveGroupName ?? '',
          color: item.color ?? '#9E9E9E',
          subjects: (item.subjects ?? []).map((s: any) => ({
            ...s,
            subjectColor: s.color ?? s.subjectColor ?? item.color ?? '#9E9E9E',
          })),
        };
      } else {
        // Core subject item: map each nested subject by its subjectId
        (item.subjects ?? []).forEach((s: any) => {
          if (s?.subjectId) {
            examSubjectMap[s.subjectId] = {
              ...s,
              subjectColor: s.color ?? s.subjectColor ?? item.color ?? '#9E9E9E',
            };
          }
        });
      }
    });
  } else {
    // Flat format — each item is an individual subject
    subjectsArr.forEach((s: any) => {
      if (!s?.subjectId) return;
      const subjectColor = s.color ?? s.subjectColor ?? '#9E9E9E';
      examSubjectMap[s.subjectId] = { ...s, subjectColor };

      if (s.electiveGroupId) {
        if (!electiveGroupMap[s.electiveGroupId]) {
          electiveGroupMap[s.electiveGroupId] = {
            name: s.electiveGroupName ?? '',
            color: subjectColor,
            subjects: [],
          };
        }
        electiveGroupMap[s.electiveGroupId].subjects.push({ ...s, subjectColor } as any);
      }
    });
  }

  // Step 3a — resolve raw metadata for every subjectId in basicData
  interface RawEntry {
    subjectId: string;
    sched: any;
    sub: any;
    electiveData: { name: string; color: string; subjects: IExamSubject[] } | undefined;
    resolvedElectiveGroupId: string | undefined;
    resolvedSubjectName: string;
    resolvedSubjectColor: string;
  }

  const rawEntrySubjectIds: string[] =
    scheduleSubjectIds.size > 0
      ? Array.from(
          new Set([
            ...(basicData?.subjectIds ?? []).filter((subjectId: string) =>
              scheduleSubjectIds.has(subjectId)
            ),
            ...Array.from(scheduleSubjectIds),
          ])
        )
      : (basicData?.subjectIds ?? []);

  const rawEntries: RawEntry[] = rawEntrySubjectIds.map((subjectId: string) => {
    const sched = scheduleMap[subjectId] ?? {};
    const sub = examSubjectMap[subjectId] ?? {};
    // Look up by subjectId first; if basicData already uses group IDs this hits directly
    const electiveData = electiveGroupMap[subjectId];

    const resolvedElectiveGroupId: string | undefined =
      sched.electiveGroupId ?? sub.electiveGroupId ?? (electiveData ? subjectId : undefined);

    const resolvedSubjectName: string =
      sched.electiveGroupName ??
      sched.subjectName ??
      sub.subjectName ??
      electiveData?.name ??
      sub.name ??
      '';

    const resolvedSubjectColor: string =
      sched.subjectColor ??
      sched.electiveGroupColor ??
      sched.color ??
      sub.subjectColor ??
      sub.color ??
      electiveData?.color ??
      '#9E9E9E';

    return {
      subjectId,
      sched,
      sub,
      electiveData,
      resolvedElectiveGroupId,
      resolvedSubjectName,
      resolvedSubjectColor,
    };
  });

  // Helper — enrich a subject object with its per-subject schedule fields
  const withSchedule = (s: any, fallbackColor: string) => {
    const subSched = scheduleMap[s.subjectId] ?? {};
    return {
      ...s,
      subjectColor: s.color || s.subjectColor || fallbackColor,
      examDate: subSched.examDate ? dayjs(subSched.examDate) : null,
      startTime: subSched.startTime ? dayjs(subSched.startTime) : null,
      endTime: subSched.endTime ? dayjs(subSched.endTime) : null,
      totalMarks: subSched.totalMarks ?? '',
      passingMarks: subSched.passingMarks ?? '',
      notes: subSched.notes ?? '',
      gradeScalingId: subSched.gradeScalingId ?? null,
    };
  };

  // Step 3b — emit one entry per core subject; one consolidated entry per elective group
  const emittedGroupIds = new Set<string>();

  const subjects: IExamSubject[] = rawEntries.flatMap((entry) => {
    const {
      subjectId,
      sched,
      sub,
      electiveData,
      resolvedElectiveGroupId,
      resolvedSubjectName,
      resolvedSubjectColor,
    } = entry;

    // ── Core subject ────────────────────────────────────────────────────────
    if (!resolvedElectiveGroupId) {
      return [
        {
          subjectId,
          subjectName: resolvedSubjectName,
          subjectColor: resolvedSubjectColor,
          subjectCode: sched.subjectCode ?? sub.subjectCode ?? sub.code ?? '',
          electiveGroupId: undefined,
          subjects: undefined,
          schedulingMode: undefined,
          examDate: sched.examDate ? dayjs(sched.examDate) : null,
          startTime: sched.startTime ? dayjs(sched.startTime) : null,
          endTime: sched.endTime ? dayjs(sched.endTime) : null,
          totalMarks: sched.totalMarks ?? '',
          passingMarks: sched.passingMarks ?? '',
          notes: sched.notes ?? '',
          gradeScalingId: sched.gradeScalingId ?? null,
        } as IExamSubject,
      ];
    }

    // ── Elective subject — consolidate all siblings under one group entry ──
    // Skip if we have already emitted this group
    if (emittedGroupIds.has(resolvedElectiveGroupId)) return [];
    emittedGroupIds.add(resolvedElectiveGroupId);

    // All rawEntries that belong to this elective group
    const siblingEntries = rawEntries.filter(
      (e) => e.resolvedElectiveGroupId === resolvedElectiveGroupId
    );

    // Group-level metadata: prefer the schedule API's group entry (subjectId === electiveGroupId)
    const groupSched = scheduleMap[resolvedElectiveGroupId] ?? {};
    const groupName = groupSched.electiveGroupName ?? electiveData?.name ?? resolvedSubjectName;
    const groupColor =
      groupSched.electiveGroupColor ??
      groupSched.color ??
      electiveData?.color ??
      resolvedSubjectColor;

    let restoredSubjects: any[];
    if (electiveData?.subjects?.length) {
      restoredSubjects = electiveData.subjects.map((s: any) => withSchedule(s, groupColor));
    } else if (
      Array.isArray(groupSched.electiveGroupSubjects) &&
      groupSched.electiveGroupSubjects.length > 0
    ) {
      restoredSubjects = groupSched.electiveGroupSubjects.map((s: any) =>
        withSchedule({ ...s, subjectColor: s.color || s.subjectColor || groupColor }, groupColor)
      );
    } else {
      restoredSubjects = siblingEntries.map(
        ({ subjectId: sid, sched: sSched, sub: sSub, resolvedSubjectColor: sColor }) =>
          withSchedule(
            {
              ...sSub,
              ...sSched,
              subjectId: sid,
              subjectName: sSched.subjectName ?? sSub.subjectName ?? '',
              subjectColor: sColor,
            },
            sColor
          )
      );
    }

    const hasGroupSchedule = !!groupSched.examDate;
    const schedulingMode: 'combined' | 'separate' = hasGroupSchedule ? 'combined' : 'separate';

    return [
      {
        // Use the group ID as subjectId — mirrors how Create flow stores elective entries
        subjectId: resolvedElectiveGroupId,
        subjectName: groupName,
        subjectColor: groupColor,
        subjectCode: groupSched.subjectCode ?? '',
        electiveGroupId: resolvedElectiveGroupId,
        subjects: restoredSubjects,
        schedulingMode,
        examDate: groupSched.examDate ? dayjs(groupSched.examDate) : null,
        startTime: groupSched.startTime ? dayjs(groupSched.startTime) : null,
        endTime: groupSched.endTime ? dayjs(groupSched.endTime) : null,
        totalMarks: groupSched.totalMarks ?? '',
        passingMarks: groupSched.passingMarks ?? '',
        notes: groupSched.notes ?? '',
        gradeScalingId: groupSched.gradeScalingId ?? null,
      } as IExamSubject,
    ];
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
    examTypeName:
      examTypes.find((t: any) => t.id === basicData?.examTypeId)?.examType ??
      basicData?.examTypeName ??
      basicData?.examType ??
      '',
    examName: basicData?.examName ?? '',
    className: basicData?.standardId ?? '',
    gradingScaleId: basicData?.gradingScaleId ?? '',
    gradeScaleRequired:
      examTypes.find((t: any) => t.id === basicData?.examTypeId)?.gradeScaleRequired ?? true,
    divisions: basicData?.divisionIds ?? [],
    subjects,
    description: basicData?.description ?? '',
    isRoomAssign: roomData?.isRoomAssigned ?? false,
    syncToAcademicCalendar: false,
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
    gradingScaleId: values.gradingScaleId || null,
    divisionIds: values.divisions.filter((id) => id !== 'all'),
    subjectIds: values.subjects.flatMap((s: any) => {
      // Elective group: send each individual subject's ID, not the group ID
      if (s.electiveGroupId && Array.isArray(s.subjects) && s.subjects.length > 0) {
        return s.subjects
          .filter((sub: any) => !sub.isExamSelectionDisabled)
          .map((sub: any) => sub.subjectId || sub.id);
      }
      // Core subject (or individual elective entry): send subjectId directly
      return [s.subjectId];
    }),
  };
}

export function serializeSchedulePayload(values: IExamFormValues) {
  const subjects: Array<{
    subjectId: string;
    electiveGroupId?: string | null;
    examDate: string | null;
    startTime: string | null;
    endTime: string | null;
    gradeScalingId: string | null;
    totalMarks: number | null;
    passingMarks: number | null;
    notes: string;
  }> = [];

  values.subjects.forEach((sub) => {
    // Elective group in Separate mode: expand individual subjects into entries
    if (sub.electiveGroupId && sub.schedulingMode === 'separate' && (sub as any).subjects?.length) {
      ((sub as any).subjects as any[])
        .filter((s: any) => !s.isExamSelectionDisabled)
        .forEach((s: any) => {
          subjects.push({
            subjectId: s.subjectId || s.id,
            electiveGroupId: sub.electiveGroupId,
            examDate: toApiDateTime(s.examDate),
            startTime: toApiDateTime(s.startTime),
            endTime: toApiDateTime(s.endTime),
            gradeScalingId: s.gradeScalingId ?? null,
            totalMarks: toNullableNumber(s.totalMarks),
            passingMarks: toNullableNumber(s.passingMarks),
            notes: s.notes ?? '',
          });
        });
    } else {
      // Core subject or elective group in Combined mode
      subjects.push({
        subjectId: sub.subjectId,
        electiveGroupId: sub.electiveGroupId ?? null,
        examDate: toApiDateTime(sub.examDate),
        startTime: toApiDateTime(sub.startTime),
        endTime: toApiDateTime(sub.endTime),
        gradeScalingId: sub.gradeScalingId ?? null,
        totalMarks: toNullableNumber(sub.totalMarks),
        passingMarks: toNullableNumber(sub.passingMarks),
        notes: sub.notes,
      });
    }
  });

  return { subjects, syncToAcademicCalendar: values.syncToAcademicCalendar };
}

export function serializeRoomAssignmentPayload(values: IExamFormValues) {
  // Exclude the 'all' placeholder — mirrors serializeBasicDetailsPayload
  const validDivisionIds = values.divisions.filter((id) => id !== 'all');

  const subjectEntries: Array<{
    subjectId: string;
    electiveGroupId: string | null;
    examDate: string | null;
    divisions: Array<{ divisionId: string; roomIds: string[]; capacity: number }>;
  }> = [];

  values.subjects.forEach((sub) => {
    if (sub.electiveGroupId && (sub as any).subjects?.length) {
      // Elective group: expand into one entry per individual subject
      ((sub as any).subjects as any[])
        .filter((s: any) => !s.isExamSelectionDisabled)
        .forEach((s: any) => {
          const sId = s.subjectId || s.id;
          const shouldAssignRooms = hasCompleteSchedule(s);
          const mappedDivisions = validDivisionIds.map((divId) => ({
            divisionId: divId,
            roomIds: values.roomDetails[sId]?.[divId]?.roomIds ?? [],
            capacity: values.roomDetails[sId]?.[divId]?.capacity ?? 0,
          }));
          subjectEntries.push({
            subjectId: sId,
            electiveGroupId: sub.electiveGroupId ?? null,
            examDate: toApiDateTime(s.examDate),
            divisions: values.isRoomAssign
              ? shouldAssignRooms
                ? mappedDivisions.filter((div) => div.roomIds.length > 0)
                : []
              : mappedDivisions,
          });
        });
    } else {
      // Core subject
      const mappedDivisions = validDivisionIds.map((divId) => ({
        divisionId: divId,
        roomIds: values.roomDetails[sub.subjectId]?.[divId]?.roomIds ?? [],
        capacity: values.roomDetails[sub.subjectId]?.[divId]?.capacity ?? 0,
      }));
      subjectEntries.push({
        subjectId: sub.subjectId,
        electiveGroupId: null,
        examDate: toApiDateTime(sub.examDate),
        divisions: values.isRoomAssign
          ? mappedDivisions.filter((div) => div.roomIds.length > 0)
          : mappedDivisions,
      });
    }
  });

  return {
    isRoomAssigned: values.isRoomAssign,
    subjects: subjectEntries,
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
