import type { Dayjs } from 'dayjs';

import type { IExamSubject } from '../type';

export type ElectiveReadiness = {
  isReady: boolean;
  message?: string;
  assignedCounts: Record<string, number>;
};

export type SubjectSelectionOption = {
  id?: string;
  name?: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  subjectColor?: string;
  color?: string;
  selectedElectiveSubjectId?: string;
  electiveGroupId?: string;
  electiveGroupName?: string;
  optionGroup?: string;
  schedulingMode?: 'combined' | 'separate';
  examDate?: Dayjs | null;
  startTime?: Dayjs | null;
  endTime?: Dayjs | null;
  totalMarks?: number | '';
  passingMarks?: number | '';
  notes?: string;
  gradeScalingId?: string | null;
  subjects?: SubjectSelectionOption[];
};

type SubjectDefaults = {
  totalMarks: number | '';
  passingMarks: number | '';
  gradeScalingId: string | null;
};

export const normalizeSubjectId = (value?: string | null) => value?.trim().toLowerCase() ?? '';

export const getSubjectSelectionKey = (subject: SubjectSelectionOption) =>
  normalizeSubjectId(
    subject.selectedElectiveSubjectId ??
      subject.subjects?.[0]?.subjectId ??
      subject.subjectId ??
      subject.id ??
      subject.electiveGroupId
  );

export const deduplicateSubjectOptions = (subjects: SubjectSelectionOption[]) => {
  const seen = new Set<string>();
  return subjects.filter((subject) => {
    const key = getSubjectSelectionKey(subject);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizeNestedElectiveSubjects = (
  option: SubjectSelectionOption,
  defaults: SubjectDefaults,
  readiness?: ElectiveReadiness
) =>
  (option.subjects ?? [])
    .filter((subject) => {
      if (!readiness) return true;
      const subjectId = normalizeSubjectId(subject.subjectId ?? subject.id);
      return (readiness.assignedCounts[subjectId] ?? 0) > 0;
    })
    .map((subject): IExamSubject => {
      const subjectId = subject.subjectId ?? subject.id ?? '';
      const normalizedId = normalizeSubjectId(subjectId);
      return {
        subjectId,
        subjectName: subject.subjectName ?? subject.name ?? '',
        subjectCode: subject.subjectCode,
        subjectColor: subject.color ?? subject.subjectColor ?? '#9E9E9E',
        electiveGroupId: option.electiveGroupId,
        electiveGroupName: option.electiveGroupName ?? option.optionGroup,
        assignedStudentCount: readiness?.assignedCounts[normalizedId],
        isExamSelectionDisabled: false,
        examDate: subject.examDate ?? null,
        startTime: subject.startTime ?? null,
        endTime: subject.endTime ?? null,
        totalMarks: subject.totalMarks || defaults.totalMarks,
        passingMarks: subject.passingMarks || defaults.passingMarks,
        notes: subject.notes ?? '',
        gradeScalingId: subject.gradeScalingId || defaults.gradeScalingId,
      };
    });

export const normalizeSelectedExamSubjects = (
  options: SubjectSelectionOption[],
  defaults: SubjectDefaults,
  readinessByGroup: Readonly<Record<string, ElectiveReadiness>>
): IExamSubject[] =>
  deduplicateSubjectOptions(options).map((option) => {
    const isElective = Boolean(option.electiveGroupId);
    const readiness = option.electiveGroupId ? readinessByGroup[option.electiveGroupId] : undefined;
    const subjectId =
      option.selectedElectiveSubjectId ??
      option.subjects?.[0]?.subjectId ??
      option.subjectId ??
      option.electiveGroupId ??
      '';

    return {
      subjectId,
      subjectName:
        option.subjects?.[0]?.subjectName ?? option.subjectName ?? option.electiveGroupName ?? '',
      subjectCode: isElective
        ? ''
        : (option.subjects?.[0]?.subjectCode ?? option.subjectCode ?? ''),
      subjectColor: option.color ?? option.subjectColor ?? '#9E9E9E',
      electiveGroupId: option.electiveGroupId,
      electiveGroupName: isElective ? (option.electiveGroupName ?? option.optionGroup) : undefined,
      schedulingMode: option.schedulingMode ?? (isElective ? 'separate' : undefined),
      examDate: option.examDate ?? null,
      startTime: option.startTime ?? null,
      endTime: option.endTime ?? null,
      totalMarks: option.totalMarks || defaults.totalMarks,
      passingMarks: option.passingMarks || defaults.passingMarks,
      notes: option.notes ?? '',
      gradeScalingId: option.gradeScalingId || defaults.gradeScalingId,
      subjects: isElective
        ? normalizeNestedElectiveSubjects(option, defaults, readiness)
        : option.subjects?.map((subject) => ({
            subjectId: subject.subjectId ?? subject.id ?? '',
            subjectName: subject.subjectName ?? subject.name ?? '',
            subjectCode: subject.subjectCode,
            subjectColor: subject.color ?? subject.subjectColor ?? '#9E9E9E',
            examDate: subject.examDate ?? null,
            startTime: subject.startTime ?? null,
            endTime: subject.endTime ?? null,
            totalMarks: subject.totalMarks || defaults.totalMarks,
            passingMarks: subject.passingMarks || defaults.passingMarks,
            notes: subject.notes ?? '',
            gradeScalingId: subject.gradeScalingId || defaults.gradeScalingId,
          })),
    };
  });

export const getUncachedElectiveGroupIds = (
  options: SubjectSelectionOption[],
  readinessByGroup: Readonly<Record<string, ElectiveReadiness>>
) =>
  Array.from(
    new Set(
      options
        .map((option) => option.electiveGroupId)
        .filter(
          (groupId): groupId is string => Boolean(groupId) && readinessByGroup[groupId!] == null
        )
    )
  );
