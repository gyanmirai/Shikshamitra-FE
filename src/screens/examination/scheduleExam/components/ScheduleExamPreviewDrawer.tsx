import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Stack, Drawer } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import {
  useGetExamScheduleQuery,
  useGetExamSubjectsQuery,
  useGetExamBasicDetailsQuery,
  useGetExamRoomAssignmentsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import { mapBackendToFormik } from './initialValues';
import { getExamStatusMeta } from '../scheduleExamStatus';
import { formatExamDateRange } from '../schedule-exam-date-range';
import { ScheduleExamPreviewHeader } from './ScheduleExamPreviewHeader';
import { ScheduleExamPreviewAlerts } from './ScheduleExamPreviewAlerts';
import { ScheduleExamPreviewActions } from './ScheduleExamPreviewActions';
import { getReadinessSummary, buildExamPlanningIssues } from './scheduleExamPlanningUtils';
import {
  ScheduleExamStatusSummary,
  ScheduleExamPreviewOverview,
} from './ScheduleExamPreviewOverview';
import {
  type DateGroup,
  type SubjectRowItem,
  ScheduleExamScheduleSection,
} from './ScheduleExamScheduleSection';

type ScheduleExamPreviewDrawerProps = {
  open: boolean;
  exam: any;
  canEdit?: boolean;
  onClose: () => void;
  onEdit?: (exam: any) => void;
  onViewTimetable?: (exam: any) => void;
  onPublish?: (exam: any) => void;
};

const getSubjectRows = (subjects: any[] = []): SubjectRowItem[] =>
  subjects.flatMap((subject) => {
    if (subject.electiveGroupId && Array.isArray(subject.subjects)) {
      return subject.subjects.map((item: any) => ({
        ...item,
        subjectName: item.subjectName || item.name,
        groupName: subject.subjectName,
      }));
    }
    return [subject];
  });

const ScheduleExamPreviewDrawer = ({
  open,
  exam,
  canEdit,
  onClose,
  onEdit,
  onViewTimetable,
  onPublish,
}: ScheduleExamPreviewDrawerProps) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const examId = exam?.examId || exam?.id;

  const { data: examTypeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExaminationTypesQuery,
    params: { academicMediumId: (medium as any)?.id },
    options: { skip: !open || !(medium as any)?.id },
  });
  const { data: gradeScalingsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (medium as any)?.id },
    options: { skip: !open || !(medium as any)?.id },
  });
  const {
    data: basicDetails,
    isLoading: basicLoading,
    isFetching: basicFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamBasicDetailsQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });
  const {
    data: scheduleDetails,
    isLoading: scheduleLoading,
    isFetching: scheduleFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamScheduleQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });
  const {
    data: roomAssignmentData,
    isLoading: roomLoading,
    isFetching: roomFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomAssignmentsQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });
  const {
    data: examSubjectsData,
    isLoading: subjectsLoading,
    isFetching: subjectsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamSubjectsQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });

  const isDetailsLoading =
    basicLoading ||
    scheduleLoading ||
    roomLoading ||
    subjectsLoading ||
    basicFetching ||
    scheduleFetching ||
    roomFetching ||
    subjectsFetching;

  const hydratedExam = basicDetails
    ? mapBackendToFormik(
        basicDetails,
        scheduleDetails ?? null,
        roomAssignmentData ?? null,
        examSubjectsData ?? null,
        examTypeData?.items ?? []
      )
    : null;

  const rawSubjectRows = getSubjectRows(hydratedExam?.subjects ?? []);

  // Strict chronological sorting: Date ascending, then start time ascending
  const sortedSubjectRows = useMemo(
    () =>
      [...rawSubjectRows].sort((a, b) => {
        if (!a.examDate && !b.examDate) {
          return (a.subjectName || '').localeCompare(b.subjectName || '');
        }
        if (!a.examDate) return 1;
        if (!b.examDate) return -1;

        const dateA = dayjs(a.examDate);
        const dateB = dayjs(b.examDate);
        if (!dateA.isSame(dateB, 'day')) {
          return dateA.isBefore(dateB) ? -1 : 1;
        }

        if (a.startTime && b.startTime) {
          const timeA = dayjs(a.startTime);
          const timeB = dayjs(b.startTime);
          if (!timeA.isSame(timeB, 'minute')) {
            return timeA.isBefore(timeB) ? -1 : 1;
          }
        }

        return (a.subjectName || '').localeCompare(b.subjectName || '');
      }),
    [rawSubjectRows]
  );

  // Clean date grouping
  const dateGroups: DateGroup[] = useMemo(() => {
    const groups: DateGroup[] = [];
    const map = new Map<string, SubjectRowItem[]>();
    const unscheduled: SubjectRowItem[] = [];

    sortedSubjectRows.forEach((subject) => {
      if (!subject.examDate || !dayjs(subject.examDate).isValid()) {
        unscheduled.push(subject);
        return;
      }
      const key = dayjs(subject.examDate).format('YYYY-MM-DD');
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(subject);
    });

    map.forEach((subjects, key) => {
      const d = dayjs(key);
      groups.push({
        dateKey: key,
        formattedDate: d.format('DD-MM-YYYY'),
        dayOfWeek: d.format('dddd'),
        subjects,
      });
    });

    if (unscheduled.length > 0) {
      groups.push({
        dateKey: 'unscheduled',
        formattedDate: 'Date Not Set',
        dayOfWeek: '',
        subjects: unscheduled,
      });
    }

    return groups;
  }, [sortedSubjectRows]);

  const readiness = hydratedExam
    ? getReadinessSummary(buildExamPlanningIssues(hydratedExam))
    : null;
  const issueCount = readiness ? readiness.blocking.length : (exam?.issueCount ?? 0);
  const hasListWarningCount =
    exam?.warningCount !== null &&
    exam?.warningCount !== undefined &&
    Number.isFinite(Number(exam.warningCount));
  const warningCount = hasListWarningCount
    ? Number(exam.warningCount)
    : readiness
      ? readiness.warnings.length
      : 0;

  const previewExam = hydratedExam
    ? {
        ...exam,
        ...hydratedExam,
        examId,
        examTypeName: hydratedExam.examTypeName || exam?.examTypeName,
        standardName: exam?.standardName,
        divisions: exam?.divisions,
        subjectCount: sortedSubjectRows.length,
        issueCount,
        warningCount,
      }
    : exam;

  const meta = getExamStatusMeta(previewExam || exam || {});

  const dateRange = formatExamDateRange(previewExam?.startDate, previewExam?.endDate);

  const allStandards: any[] = useMemo(
    () =>
      (medium as any)?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

  const allDivisionsInMedium = useMemo(() => {
    const map = new Map<string, string>();
    allStandards.forEach((std) => {
      (std.divisions || []).forEach((div: any) => {
        if (div.id && div.name) {
          map.set(div.id, div.name);
        }
      });
    });
    return map;
  }, [allStandards]);

  const targetStandardId =
    previewExam?.standardId ||
    previewExam?.className ||
    basicDetails?.standardId ||
    exam?.standardId ||
    exam?.className;

  const matchedStandard = useMemo(
    () => allStandards.find((s) => s.id === targetStandardId),
    [allStandards, targetStandardId]
  );

  const resolvedStandardName =
    previewExam?.standardName ||
    exam?.standardName ||
    previewExam?.standard ||
    exam?.standard ||
    matchedStandard?.name ||
    '-';

  const resolvedDivisions: string[] = useMemo(() => {
    const rawDivisions =
      previewExam?.divisions ||
      basicDetails?.divisionIds ||
      exam?.divisions ||
      exam?.divisionIds ||
      [];
    const list = Array.isArray(rawDivisions) ? rawDivisions : rawDivisions ? [rawDivisions] : [];
    return list
      .map((item: any) => {
        if (!item) return '';
        if (typeof item === 'object' && item.name) return item.name;
        const str = String(item);
        if (allDivisionsInMedium.has(str)) {
          return allDivisionsInMedium.get(str)!;
        }
        return str;
      })
      .filter((d: string) => Boolean(d) && d !== 'all');
  }, [
    allDivisionsInMedium,
    basicDetails?.divisionIds,
    exam?.divisionIds,
    exam?.divisions,
    previewExam?.divisions,
  ]);

  const resolvedCreatedBy =
    previewExam?.creatorName ||
    previewExam?.createdByName ||
    basicDetails?.creatorName ||
    basicDetails?.createdByName ||
    basicDetails?.createdBy ||
    basicDetails?.createdByUser ||
    exam?.creatorName ||
    exam?.createdByName ||
    exam?.createdBy ||
    '-';

  const gradingScaleId = previewExam?.gradingScaleId || exam?.gradingScaleId;
  const gradeScalingsList = gradeScalingsData?.items ?? gradeScalingsData?.data ?? [];
  const gradingScaleName = gradingScaleId
    ? gradeScalingsList.find((item: any) => item.id === gradingScaleId)?.name || '-'
    : '-';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.52)',
            backdropFilter: 'blur(2px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 620, lg: 680 },
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.neutral',
          boxShadow: (theme) => theme.shadows[24],
        },
      }}
    >
      <ScheduleExamPreviewHeader
        dateRange={dateRange}
        examName={previewExam?.examName || 'Exam preview'}
        onClose={onClose}
        statusColor={meta.color}
        statusLabel={meta.label}
      />

      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ p: 1.5 }}>
          {isDetailsLoading && <LoadingScreen sx={{ minHeight: 200 }} />}
          {!isDetailsLoading && (
            <Stack spacing={1}>
              <ScheduleExamPreviewOverview
                className={resolvedStandardName}
                createdBy={resolvedCreatedBy}
                divisions={resolvedDivisions}
                examType={previewExam?.examTypeName || '-'}
                gradingScale={gradingScaleName}
              />
              <ScheduleExamStatusSummary
                issueCount={issueCount}
                subjectCount={sortedSubjectRows.length}
                warningCount={warningCount}
              />
              <ScheduleExamPreviewAlerts
                missingRoomAssignmentCount={previewExam?.missingRoomAssignmentCount}
                readiness={readiness}
                warningCount={warningCount}
              />
              <ScheduleExamScheduleSection
                dateGroups={dateGroups}
                subjectCount={sortedSubjectRows.length}
              />
            </Stack>
          )}
        </Box>
      </Scrollbar>

      <ScheduleExamPreviewActions
        canEdit={canEdit}
        exam={previewExam}
        onClose={onClose}
        onEdit={onEdit}
        onPublish={onPublish}
        onViewTimetable={onViewTimetable}
      />
    </Drawer>
  );
};

export default ScheduleExamPreviewDrawer;
