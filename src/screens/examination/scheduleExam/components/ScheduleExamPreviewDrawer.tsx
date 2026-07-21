import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import {
  Box,
  Chip,
  Stack,
  Drawer,
  Button,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import {
  useGetExamScheduleQuery,
  useGetExamSubjectsQuery,
  useGetExamBasicDetailsQuery,
  useGetExamRoomAssignmentsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import { mapBackendToFormik } from './initialValues';
import { getReadinessSummary, buildExamPlanningIssues } from './scheduleExamPlanningUtils';

type ScheduleExamPreviewDrawerProps = {
  open: boolean;
  exam: any;
  canEdit?: boolean;
  onClose: () => void;
  onEdit: (exam: any) => void;
  onViewTimetable: (exam: any) => void;
  onPublish: (exam: any) => void;
};

const statusMeta: Record<number, { label: string; color: 'warning' | 'info' | 'success' }> = {
  [examScheduledStatus.Pending]: { label: 'Draft', color: 'warning' },
  [examScheduledStatus.Published]: { label: 'Published', color: 'info' },
  [examScheduledStatus.Completed]: { label: 'Completed', color: 'success' },
};

const infoRows = [
  ['Exam Type', 'examTypeName'],
  ['Class', 'standardName'],
  ['Created By', 'creatorName'],
];

const getSubjectRows = (subjects: any[] = []) =>
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
  const examId = exam?.examId;
  const meta = statusMeta[Number(exam?.status)] || statusMeta[examScheduledStatus.Pending];
  const { data: examTypeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExaminationTypesQuery,
    params: { academicMediumId: (medium as any)?.id },
    options: { skip: !open || !(medium as any)?.id },
  });
  const { data: basicDetails, isLoading: basicLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamBasicDetailsQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });
  const { data: scheduleDetails, isLoading: scheduleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamScheduleQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });
  const { data: roomAssignmentData, isLoading: roomLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomAssignmentsQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });
  const { data: examSubjectsData, isLoading: subjectsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamSubjectsQuery,
    params: { examId },
    options: { skip: !open || !examId },
  });

  const isDetailsLoading = basicLoading || scheduleLoading || roomLoading || subjectsLoading;
  const hydratedExam = basicDetails
    ? mapBackendToFormik(
        basicDetails,
        scheduleDetails ?? null,
        roomAssignmentData ?? null,
        examSubjectsData ?? null,
        examTypeData?.items ?? []
      )
    : null;
  const subjectRows = getSubjectRows(hydratedExam?.subjects ?? []);
  const scheduledDates = subjectRows
    .map((subject: any) => subject.examDate)
    .filter((date: any) => date && dayjs(date).isValid())
    .map((date: any) => dayjs(date));
  const readiness = hydratedExam
    ? getReadinessSummary(buildExamPlanningIssues(hydratedExam))
    : null;
  const issueCount = readiness ? readiness.blocking.length : (exam?.issueCount ?? 0);
  const warningCount = readiness ? readiness.warnings.length : (exam?.warningCount ?? 0);
  const previewExam = hydratedExam
    ? {
        ...exam,
        ...hydratedExam,
        examId,
        examTypeName: hydratedExam.examTypeName || exam?.examTypeName,
        standardName: exam?.standardName,
        divisions: exam?.divisions,
        subjectCount: subjectRows.length,
        issueCount,
        warningCount,
      }
    : exam;
  const dateRange =
    scheduledDates.length > 0
      ? `${scheduledDates
          .reduce((min, date) => (date.isBefore(min) ? date : min), scheduledDates[0])
          .format('DD MMM YYYY')} - ${scheduledDates
          .reduce((max, date) => (date.isAfter(max) ? date : max), scheduledDates[0])
          .format('DD MMM YYYY')}`
      : previewExam?.startDate && previewExam?.endDate
        ? `${dayjs(previewExam.startDate).format('DD MMM YYYY')} - ${dayjs(previewExam.endDate).format('DD MMM YYYY')}`
      : 'Not scheduled';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 430 }, p: 0 } }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {previewExam?.examName || 'Exam Preview'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dateRange}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close preview">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
        <Box sx={{ mt: 1 }}>
          <Label color={meta.color}>{meta.label}</Label>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        {isDetailsLoading && <LoadingScreen sx={{ minHeight: 180 }} />}
        {!isDetailsLoading && (
        <Stack spacing={1}>
          {infoRows.map(([label, key]) => (
            <Box key={key}>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="subtitle2">{previewExam?.[key] || '-'}</Typography>
            </Box>
          ))}

          <Box>
            <Typography variant="caption" color="text.secondary">
              Divisions
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
              {(previewExam?.divisions || []).length ? (
                previewExam.divisions.map((division: string) => (
                  <Chip key={division} label={division} size="small" variant="soft" />
                ))
              ) : (
                <Typography variant="subtitle2">-</Typography>
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" spacing={1}>
            <PreviewMetric label="Subjects" value={previewExam?.subjectCount ?? 0} />
            <PreviewMetric label="Issues" value={issueCount} tone="error" />
            <PreviewMetric label="Warnings" value={warningCount} tone="warning" />
          </Stack>

          {subjectRows.length > 0 && (
            <>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Subjects & Schedule
                </Typography>
                <Stack spacing={1}>
                  {subjectRows.slice(0, 6).map((subject: any) => (
                    <Box
                      key={subject.subjectId}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {subject.subjectName || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subject.examDate ? dayjs(subject.examDate).format('DD MMM YYYY') : 'Date not set'}
                        {subject.startTime && subject.endTime
                          ? ` · ${dayjs(subject.startTime).format('hh:mm A')} - ${dayjs(subject.endTime).format('hh:mm A')}`
                          : ''}
                        {subject.groupName ? ` · ${subject.groupName}` : ''}
                      </Typography>
                    </Box>
                  ))}
                  {subjectRows.length > 6 && (
                    <Typography variant="caption" color="text.secondary">
                      +{subjectRows.length - 6} more subjects
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {previewExam?.missingRoomAssignmentCount > 0 && (
            <Box
              sx={{
                p: 1.25,
                borderRadius: 1,
                bgcolor: 'error.lighter',
                color: 'error.darker',
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                {previewExam.missingRoomAssignmentCount} room assignment gap
                {previewExam.missingRoomAssignmentCount > 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption">
                Review room planning before publishing this exam.
              </Typography>
            </Box>
          )}
        </Stack>
        )}
      </Box>

      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={() => onViewTimetable(previewExam)}
          >
            Timetable
          </Button>
          {canEdit && Number(previewExam?.status) === examScheduledStatus.Pending && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={() => onEdit(previewExam)}
            >
              Edit
            </Button>
          )}
        </Stack>
        {Number(previewExam?.status) === examScheduledStatus.Pending && (
          <Button
            fullWidth
            sx={{ mt: 1 }}
            color="success"
            variant="contained"
            startIcon={<Iconify icon="solar:cloud-upload-outline" />}
            disabled={issueCount > 0}
            onClick={() => onPublish(previewExam)}
          >
            Publish
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

const PreviewMetric = ({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'error' | 'warning';
}) => (
  <Box
    sx={{
      flex: 1,
      p: 1,
      borderRadius: 1,
      bgcolor: tone === 'default' ? 'background.neutral' : `${tone}.lighter`,
    }}
  >
    <Typography variant="h6">{value}</Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default ScheduleExamPreviewDrawer;
