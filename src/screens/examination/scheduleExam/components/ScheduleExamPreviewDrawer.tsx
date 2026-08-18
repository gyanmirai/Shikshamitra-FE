import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTheme, alpha } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { Box, Chip, Stack, Button, Typography, Grid, Drawer, IconButton } from '@mui/material';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
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
  const subjectRows = getSubjectRows(hydratedExam?.subjects ?? []);

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
  const startDateStr = previewExam?.startDate
    ? dayjs(previewExam.startDate).format('DD-MM-YYYY')
    : '';
  const endDateStr = previewExam?.endDate
    ? dayjs(previewExam.endDate).format('DD-MM-YYYY')
    : startDateStr;
  const dateRange = startDateStr
    ? startDateStr === endDateStr
      ? startDateStr
      : `${startDateStr} - ${endDateStr}`
    : '';

  const gradingScaleId = previewExam?.gradingScaleId || exam?.gradingScaleId;
  const gradeScalingsList = gradeScalingsData?.items ?? gradeScalingsData?.data ?? [];
  const gradingScaleName = gradingScaleId
    ? gradeScalingsList.find((item: any) => item.id === gradingScaleId)?.name || '-'
    : '-';

  const dialogTitle = (
    <Box
      component="span"
      sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontWeight: 'normal' }}
    >
      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
          {previewExam?.examName || 'Exam Preview'}
        </Box>
        <CustomTooltip
          arrow
          placement="right"
          title="View scheduled exam subjects, dates, times, and planning issues."
        >
          <Iconify
            icon={GlobalIcons.info}
            sx={{ cursor: 'pointer' }}
            color="info.main"
            width={16}
            height={16}
          />
        </CustomTooltip>
      </Box>
      <Box
        component="span"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: 'text.secondary',
          fontSize: '0.85rem',
        }}
      >
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.44)',
            backdropFilter: 'blur(3px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 560 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {previewExam?.examName || 'Exam Preview'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="View scheduled exam subjects, dates, times, and planning issues."
            >
              <Iconify
                icon={GlobalIcons.info}
                sx={{ cursor: 'pointer' }}
                color="info.main"
                width={16}
                height={16}
              />
            </CustomTooltip>
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ color: 'text.secondary', typography: 'caption' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon={GlobalIcons.calendar} width={14} height={14} />
              <span>{dateRange}</span>
            </Box>
            <Label color={meta.color} variant="soft">
              {meta.label}
            </Label>
          </Stack>
        </Stack>

        <IconButton onClick={onClose} sx={{ p: 0.5, color: 'text.secondary' }}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Box>

      {/* Content wrapper with scrollbar */}
      <Scrollbar sx={{ flex: 1, '& .simplebar-content': { p: 2 }, p: 1.5 }}>
        {isDetailsLoading && <LoadingScreen sx={{ minHeight: 180 }} />}
        {!isDetailsLoading && (
          <Stack spacing={1}>
            {/* Metadata Horizontal Section - Beautifully Boxed */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: (t) => alpha(t.palette.grey[500], 0.03),
                border: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
                    >
                      Exam Type
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {previewExam?.examTypeName || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
                    >
                      Class
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {previewExam?.standardName || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
                    >
                      Grading Scale
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {gradingScaleName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
                    >
                      Created By
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {previewExam?.creatorName || '-'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
                    >
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
            </Box>

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

            {readiness && (readiness.blocking.length > 0 || readiness.warnings.length > 0) && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.main, 0.24),
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
                  <Iconify icon={GlobalIcons.bell} color="warning.main" width={20} height={20} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Warnings &amp; Issues
                  </Typography>
                  <Chip
                    size="small"
                    color="warning"
                    variant="soft"
                    label={`${readiness.blocking.length + readiness.warnings.length} item${readiness.blocking.length + readiness.warnings.length === 1 ? '' : 's'}`}
                  />
                </Stack>
                <Stack spacing={1} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                  {[...readiness.blocking, ...readiness.warnings].map((issue) => {
                    const stepLabels = ['Basic Details', 'Subject Schedule', 'Room Allocation'];
                    const isBlocking = issue.severity === 'blocking';

                    return (
                      <Box
                        component="li"
                        key={issue.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: isBlocking
                            ? alpha(theme.palette.error.main, 0.2)
                            : alpha(theme.palette.warning.main, 0.2),
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          gap={0.75}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {issue.title}
                          </Typography>
                          <Chip
                            size="small"
                            color={isBlocking ? 'error' : 'warning'}
                            variant="soft"
                            label={isBlocking ? 'Issue' : 'Warning'}
                          />
                        </Stack>
                        {issue.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.5 }}
                          >
                            {issue.description}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          Step: {stepLabels[issue.step] || 'Exam setup'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Missing Room Assignment Banner */}
            {previewExam?.missingRoomAssignmentCount > 0 && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  color: theme.palette.text.secondary,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.main, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Iconify icon={GlobalIcons.info} color="warning.main" width={20} height={20} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {previewExam.missingRoomAssignmentCount} room assignment gap
                    {previewExam.missingRoomAssignmentCount > 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Room assignment is optional. You can publish now and assign rooms later.
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
                <Stack spacing={1.25}>
                  {subjectRows.map((subject: any) => (
                    <Box
                      key={subject.subjectId}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 1.5,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
                        transition: theme.transitions.create(
                          ['background-color', 'border-color', 'box-shadow', 'transform'],
                          {
                            duration: theme.transitions.duration.shorter,
                          }
                        ),
                        '&:hover': {
                          transform: 'translateX(4px)',
                          bgcolor: 'background.neutral',
                          borderColor: 'primary.light',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                          {subject.subjectName || '-'}
                        </Typography>
                        {subject.groupName && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.25 }}
                          >
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
                            px: 1.25,
                            borderRadius: 1,
                            bgcolor: subject.examDate
                              ? alpha(theme.palette.success.main, 0.08)
                              : alpha(theme.palette.error.main, 0.08),
                            color: subject.examDate
                              ? theme.palette.success.dark
                              : theme.palette.error.dark,
                            typography: 'caption',
                            fontWeight: 700,
                            border: '1px solid',
                            borderColor: subject.examDate
                              ? alpha(theme.palette.success.main, 0.15)
                              : alpha(theme.palette.error.main, 0.15),
                          }}
                        >
                          <Iconify icon={GlobalIcons.calendar} width={14} height={14} />
                          {subject.examDate
                            ? dayjs(subject.examDate).format('DD-MM-YYYY')
                            : 'Date not set'}
                        </Box>
                        {subject.startTime && subject.endTime && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              py: 0.5,
                              px: 1.25,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.info.main, 0.08),
                              color: theme.palette.info.dark,
                              typography: 'caption',
                              fontWeight: 700,
                              border: '1px solid',
                              borderColor: alpha(theme.palette.info.main, 0.15),
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
      </Scrollbar>

      {/* Drawer Footer Actions */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.neutral',
        }}
      >
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
            onClick={() => onPublish(previewExam)}
            size="small"
          >
            Publish Exam
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
          bg: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
          color: theme.palette.error.dark,
          borderColor: alpha(theme.palette.error.main, 0.16),
          iconBg: alpha(theme.palette.error.main, 0.12),
          iconColor: theme.palette.error.main,
          shadowColor: alpha(theme.palette.error.main, 0.12),
        };
      case 'warning':
        return {
          bg: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
          color: theme.palette.warning.dark,
          borderColor: alpha(theme.palette.warning.main, 0.16),
          iconBg: alpha(theme.palette.warning.main, 0.12),
          iconColor: theme.palette.warning.main,
          shadowColor: alpha(theme.palette.warning.main, 0.12),
        };
      default:
        return {
          bg: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          color: theme.palette.primary.dark,
          borderColor: alpha(theme.palette.primary.main, 0.16),
          iconBg: alpha(theme.palette.primary.main, 0.12),
          iconColor: theme.palette.primary.main,
          shadowColor: alpha(theme.palette.primary.main, 0.12),
        };
    }
  };

  const styles = getColorStyles();

  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: styles.bg,
        color: styles.color,
        border: '1px solid',
        borderColor: styles.borderColor,
        boxShadow: 'none',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px 0 ${styles.shadowColor}`,
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: styles.iconBg,
          color: styles.iconColor,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Iconify icon={icon} width={24} height={24} />
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
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
