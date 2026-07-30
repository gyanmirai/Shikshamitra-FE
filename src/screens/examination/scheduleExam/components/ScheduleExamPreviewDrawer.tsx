import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import {
  Box,
  Chip,
  Stack,
  Button,
  Divider,
  Typography,
  Grid,
  DialogActions,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
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
  const theme = useTheme();
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

  const dialogTitle = (
    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontWeight: 'normal' }}>
      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
          {previewExam?.examName || 'Exam Preview'}
        </Box>
        <CustomTooltip
          arrow
          placement="right"
          title="View scheduled exam subjects, dates, times, and planning issues."
        >
          <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" width={16} height={16} />
        </CustomTooltip>
      </Box>
      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', fontSize: '0.85rem' }}>
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Iconify icon={GlobalIcons.calendar} width={16} height={16} />
          <span>{dateRange}</span>
        </Box>
        <Label color={meta.color} variant="soft">
          {meta.label}
        </Label>
      </Box>
    </Box>
  );

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={dialogTitle}
      maxWidth="md"
      hasForm={false}
      paperProps={{ sx: { p: 0 } }}
    >
      <DialogScrollContent>
        {isDetailsLoading && <LoadingScreen sx={{ minHeight: 180 }} />}
        {!isDetailsLoading && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Metadata Horizontal Grid */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Exam Type
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {previewExam?.examTypeName || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Class
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {previewExam?.standardName || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Created By
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {previewExam?.creatorName || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Divisions
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {(previewExam?.divisions || []).length ? (
                      previewExam.divisions.map((division: string) => (
                        <Chip key={division} label={division} size="small" variant="soft" />
                      ))
                    ) : (
                      <Typography variant="subtitle2">-</Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Stat Summary Metrics Grid */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PreviewMetric
                  label="Subjects"
                  value={previewExam?.subjectCount ?? 0}
                  icon={GlobalIcons.notebook}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PreviewMetric
                  label="Issues"
                  value={issueCount}
                  tone="error"
                  icon={GlobalIcons.info}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PreviewMetric
                  label="Warnings"
                  value={warningCount}
                  tone="warning"
                  icon={GlobalIcons.bell}
                />
              </Grid>
            </Grid>

            {/* Missing Room Assignment Banner */}
            {previewExam?.missingRoomAssignmentCount > 0 && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  color: theme.palette.error.dark,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.error.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Iconify icon={GlobalIcons.info} color="error.main" width={20} height={20} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {previewExam.missingRoomAssignmentCount} room assignment gap
                    {previewExam.missingRoomAssignmentCount > 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Review room planning before publishing this exam.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Subjects & Schedule Section */}
            {subjectRows.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                  Subjects & Schedule
                </Typography>
                <Stack spacing={1}>
                  {subjectRows.map((subject: any) => (
                    <Box
                      key={subject.subjectId}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'background.neutral',
                          borderColor: 'primary.light',
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {subject.subjectName || '-'}
                        </Typography>
                        {subject.groupName && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Group: {subject.groupName}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            py: 0.5,
                            px: 1,
                            borderRadius: 0.75,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.dark,
                            typography: 'caption',
                            fontWeight: 600,
                          }}
                        >
                          <Iconify icon={GlobalIcons.calendar} width={14} height={14} />
                          {subject.examDate ? dayjs(subject.examDate).format('DD-MM-YYYY') : 'Date not set'}
                        </Box>
                        {subject.startTime && subject.endTime && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              py: 0.5,
                              px: 1,
                              borderRadius: 0.75,
                              bgcolor: alpha(theme.palette.info.main, 0.08),
                              color: theme.palette.info.dark,
                              typography: 'caption',
                              fontWeight: 600,
                            }}
                          >
                            <Iconify icon={GlobalIcons.clock} width={14} height={14} />
                            {`${dayjs(subject.startTime).format('hh:mm A')} - ${dayjs(subject.endTime).format('hh:mm A')}`}
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.eye} />}
          onClick={() => onViewTimetable(previewExam)}
          size="small"
        >
          View Timetable
        </Button>
        {canEdit && Number(previewExam?.status) === examScheduledStatus.Pending && (
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.edit} />}
            onClick={() => onEdit(previewExam)}
            size="small"
          >
            Edit
          </Button>
        )}
        {Number(previewExam?.status) === examScheduledStatus.Pending && (
          <Button
            color="primary"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            disabled={issueCount > 0}
            onClick={() => onPublish(previewExam)}
            size="small"
          >
            Publish Exam
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
};

const PreviewMetric = ({
  label,
  value,
  tone = 'default',
  icon,
}: {
  label: string;
  value: number;
  tone?: 'default' | 'error' | 'warning';
  icon: string;
}) => {
  const theme = useTheme();
  const getColorStyles = () => {
    switch (tone) {
      case 'error':
        return {
          bgcolor: alpha(theme.palette.error.main, 0.08),
          color: theme.palette.error.dark,
          borderColor: alpha(theme.palette.error.main, 0.2),
          iconColor: theme.palette.error.main,
          iconBg: alpha(theme.palette.error.main, 0.12),
        };
      case 'warning':
        return {
          bgcolor: alpha(theme.palette.warning.main, 0.08),
          color: theme.palette.warning.dark,
          borderColor: alpha(theme.palette.warning.main, 0.2),
          iconColor: theme.palette.warning.main,
          iconBg: alpha(theme.palette.warning.main, 0.12),
        };
      default:
        return {
          bgcolor: theme.palette.background.neutral,
          color: theme.palette.text.primary,
          borderColor: alpha(theme.palette.divider, 0.8),
          iconColor: theme.palette.primary.main,
          iconBg: alpha(theme.palette.primary.main, 0.08),
        };
    }
  };

  const styles = getColorStyles();

  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: styles.bgcolor,
        color: styles.color,
        border: '1px solid',
        borderColor: styles.borderColor,
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.customShadows?.card || theme.shadows[2],
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: styles.iconBg,
          color: styles.iconColor,
        }}
      >
        <Iconify icon={icon} width={22} height={22} />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default ScheduleExamPreviewDrawer;
