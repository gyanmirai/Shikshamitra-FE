import type { GrantedPermission } from 'src/utils/permissions';
import type {
  ApiAffectedLecture,
  ApiSuggestedTeacher,
  CreateSubstitutionPayload,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';

import type { QuickSubstitutionContext } from './types';

export const canArrangeSubstitution = (permissions?: GrantedPermission[]) =>
  hasGrantedPermission(
    permissions,
    `${academicPermissions.timetable.substitutionManagement}.View`
  ) &&
  hasGrantedPermission(permissions, `${academicPermissions.timetable.substitutionManagement}.Add`);

export const getCoverageWindow = (
  context: QuickSubstitutionContext,
  lecture: ApiAffectedLecture
) => ({
  startTime: lecture.startTime > context.startTime ? lecture.startTime : context.startTime,
  endTime: lecture.endTime < context.endTime ? lecture.endTime : context.endTime,
});

export function buildQuickSubstitutionPayload(
  context: QuickSubstitutionContext,
  lecture: ApiAffectedLecture,
  teacher: ApiSuggestedTeacher,
  acknowledgementRequired: boolean
): CreateSubstitutionPayload {
  return {
    academicYearId: context.academicYearId,
    academicMediumId: context.academicMediumId,
    date: context.date,
    standardId: lecture.standardId,
    divisionId: lecture.divisionId,
    timetableId: lecture.timetableId,
    timetableSlotId: lecture.timetableSlotId,
    timetableSlotSubjectId: lecture.slotSubjectId,
    subjectId: lecture.subjectId,
    className: lecture.className,
    divisionName: lecture.divisionName,
    subjectName: lecture.subjectName,
    period: lecture.period,
    ...getCoverageWindow(context, lecture),
    originalTeacherId: context.teacherId || lecture.teacherId || null,
    originalTeacherName: context.teacherName,
    originalRoomId: lecture.roomId,
    roomName: lecture.roomName,
    substituteTeacherId: teacher.teacherId,
    substituteTeacherName: teacher.teacherName,
    reason: context.reason,
    remarks: context.remarks,
    priority: 1,
    source: context.source,
    acknowledgementRequired,
    sendNotification: true,
  };
}

export function getQuickSubstitutionError(error: unknown): string {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = error.data as { detail?: string; error?: { message?: string } } | undefined;
    return (
      data?.detail || data?.error?.message || 'Unable to arrange substitution. Please try again.'
    );
  }
  return 'Unable to arrange substitution. Please try again.';
}
