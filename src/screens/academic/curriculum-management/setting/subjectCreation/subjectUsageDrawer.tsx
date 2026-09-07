'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CancelButton from 'src/components/cancel-button';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { academicPaths } from 'src/constants/academic-menu';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Avatar,
  Skeleton,
  Typography,
  DialogActions,
} from '@mui/material';

import { getSubjectIcon, type ISubject } from './type';

// ----------------------------------------------------------------------

interface SubjectUsageData {
  canDelete?: boolean;
  subjectAllocations?: any[];
  electiveGroups?: any[];
  usage?: {
    subjectAllocations?: any[];
    classes?: any[];
    electiveGroups?: any[];
    chaptersCount?: number;
    timetablePeriodsCount?: number;
    examSchedulesCount?: number;
    lessonPlansCount?: number;
    homeworkCount?: number;
    teacherMappingsCount?: number;
  };
}

interface SubjectUsageDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedSubject: ISubject | null;
  usageData?: SubjectUsageData | null;
  isLoading?: boolean;
  onArchive?: (subject: ISubject) => void;
  canArchive?: boolean;
}

// ----------------------------------------------------------------------

const getStatusLabel = (status?: string | number): 'Active' | 'Inactive' | 'Archived' => {
  if (status === 1 || status === '1' || status === 'Active') return 'Active';
  if (status === 2 || status === '2' || status === 'Inactive') return 'Inactive';
  if (status === 3 || status === '3' || status === 'Archived') return 'Archived';
  return 'Active';
};

const getStatusColor = (status: string): 'success' | 'default' | 'warning' | 'error' => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Archived':
      return 'warning';
    case 'Inactive':
      return 'default';
    default:
      return 'default';
  }
};

const normalizeItemName = (item: any): string => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    const std =
      item.standard ||
      item.className ||
      item.standardName ||
      item.class ||
      item.name ||
      item.groupName ||
      item.electiveGroupName ||
      item.title ||
      '';
    const code = item.code || item.subjectCode ? ` (${item.code || item.subjectCode})` : '';
    if (std && code) return `${std}${code}`;
    if (std) return std;
    if (code) return code.replace(/[()]/g, '').trim();
  }
  return String(item);
};

interface DependencyMetricItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  path?: string;
}

function DependencyItemRow({
  item,
  isEven,
  isLastRow,
}: {
  item: DependencyMetricItem;
  isEven: boolean;
  isLastRow: boolean;
}) {
  const isZero = item.value === 0;

  return (
    <Box
      sx={{
        py: 1.25,
        px: 1.75,
        display: 'flex',
        alignItems: 'center',
        minHeight: 44,
        borderBottom: {
          xs: isLastRow ? 'none' : '1px solid',
          sm: isLastRow ? 'none' : '1px solid',
        },
        borderRight: {
          xs: 'none',
          sm: isEven ? '1px solid' : 'none',
        },
        borderColor: (t) => alpha(t.palette.grey[500], 0.08),
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
        <Iconify
          icon={item.icon}
          width={19}
          height={19}
          sx={{
            color: isZero ? 'text.disabled' : item.color,
            flexShrink: 0,
          }}
        />

        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            fontSize: '14.5px',
            color: isZero ? 'text.disabled' : 'text.primary',
            minWidth: 20,
            lineHeight: 1,
          }}
        >
          {item.value}
        </Typography>

        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: isZero ? 400 : 500,
            fontSize: '12.5px',
            color: isZero ? 'text.secondary' : 'text.primary',
          }}
        >
          {item.label}
        </Typography>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function SubjectUsageDrawer({
  open,
  onClose,
  selectedSubject,
  usageData,
  isLoading = false,
  onArchive,
  canArchive = false,
}: SubjectUsageDrawerProps) {
  const theme = useTheme();
  const router = useRouter();

  const [showAllAllocations, setShowAllAllocations] = useState(false);
  const [showAllElectives, setShowAllElectives] = useState(false);

  const statusLabel = getStatusLabel(selectedSubject?.status);
  const subjectColor =
    selectedSubject?.color || (selectedSubject as any)?.subjectColor || theme.palette.primary.main;

  const rawAllocations =
    usageData?.usage?.subjectAllocations ||
    usageData?.subjectAllocations ||
    usageData?.usage?.classes ||
    [];

  const rawElectiveGroups = usageData?.usage?.electiveGroups || usageData?.electiveGroups || [];

  const chaptersCount = usageData?.usage?.chaptersCount ?? 0;
  const timetablePeriods = usageData?.usage?.timetablePeriodsCount ?? 0;
  const examSchedules = usageData?.usage?.examSchedulesCount ?? 0;
  const lessonPlans = usageData?.usage?.lessonPlansCount ?? 0;
  const homeworkCount = usageData?.usage?.homeworkCount ?? 0;
  const teacherMappings = usageData?.usage?.teacherMappingsCount ?? 0;

  // Normalized allocations labels
  const allocationLabels = useMemo(() => {
    return rawAllocations
      .map(normalizeItemName)
      .filter((label) => Boolean(label && label.trim().length > 0));
  }, [rawAllocations]);

  // Normalized elective group labels
  const electiveGroupLabels = useMemo(() => {
    return rawElectiveGroups
      .map(normalizeItemName)
      .filter((label) => Boolean(label && label.trim().length > 0));
  }, [rawElectiveGroups]);

  const displayedAllocations = showAllAllocations ? allocationLabels : allocationLabels.slice(0, 6);
  const hiddenAllocationsCount = allocationLabels.length - displayedAllocations.length;

  const displayedElectives = showAllElectives
    ? electiveGroupLabels
    : electiveGroupLabels.slice(0, 6);
  const hiddenElectivesCount = electiveGroupLabels.length - displayedElectives.length;

  // Dependent modules count
  const dependentModuleCount = useMemo(() => {
    let count = 0;
    if (allocationLabels.length > 0) count += 1;
    if (electiveGroupLabels.length > 0) count += 1;
    if (chaptersCount > 0) count += 1;
    if (timetablePeriods > 0) count += 1;
    if (examSchedules > 0) count += 1;
    if (lessonPlans > 0) count += 1;
    if (homeworkCount > 0) count += 1;
    if (teacherMappings > 0) count += 1;
    return count;
  }, [
    allocationLabels.length,
    electiveGroupLabels.length,
    chaptersCount,
    timetablePeriods,
    examSchedules,
    lessonPlans,
    homeworkCount,
    teacherMappings,
  ]);

  const isInUse = !usageData?.canDelete && dependentModuleCount > 0;

  const dependencyMetrics: DependencyMetricItem[] = useMemo(
    () => [
      {
        label: 'Class Allocations',
        value: allocationLabels.length,
        icon: 'solar:buildings-3-bold-duotone',
        color: theme.palette.primary.main,
      },
      {
        label: 'Elective Groups',
        value: electiveGroupLabels.length,
        icon: 'solar:layers-bold-duotone',
        color: theme.palette.info.main,
      },
      {
        label: 'Syllabus Chapters',
        value: chaptersCount,
        icon: 'solar:book-2-bold-duotone',
        color: theme.palette.primary.main,
      },
      {
        label: 'Timetable Periods',
        value: timetablePeriods,
        icon: 'solar:calendar-date-bold-duotone',
        color: theme.palette.warning.main,
      },
      {
        label: 'Examinations',
        value: examSchedules,
        icon: 'solar:diploma-verified-bold-duotone',
        color: theme.palette.error.main,
      },
      {
        label: 'Lesson Plans',
        value: lessonPlans,
        icon: 'solar:notebook-bookmark-bold-duotone',
        color: theme.palette.success.main,
      },
      {
        label: 'Homework Records',
        value: homeworkCount,
        icon: 'solar:clipboard-check-bold-duotone',
        color: theme.palette.secondary.main,
      },
      {
        label: 'Assigned Teachers',
        value: teacherMappings,
        icon: 'solar:user-id-bold-duotone',
        color: theme.palette.info.main,
      },
    ],
    [
      allocationLabels.length,
      electiveGroupLabels.length,
      chaptersCount,
      timetablePeriods,
      examSchedules,
      lessonPlans,
      homeworkCount,
      teacherMappings,
      theme.palette,
    ]
  );

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      hasForm={false}
      maxWidth="md"
      title={
        <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: alpha(subjectColor, 0.12),
              color: subjectColor,
              border: `1px solid ${alpha(subjectColor, 0.28)}`,
              fontWeight: 700,
            }}
          >
            {selectedSubject?.icon ? (
              <Iconify
                icon={getSubjectIcon(selectedSubject.icon)}
                width={22}
                height={22}
              />
            ) : selectedSubject?.name ? (
              selectedSubject.name.slice(0, 2).toUpperCase()
            ) : (
              <Iconify icon="lucide:book-open" width={22} height={22} />
            )}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
              >
                {selectedSubject?.name || 'Subject Usage & Details'}
              </Typography>
              <Label color={getStatusColor(statusLabel)} variant="soft" sx={{ height: 20 }}>
                {statusLabel}
              </Label>
              <CustomTooltip
                title="Subject Dependencies & System Usage Across Modules"
                placement="right"
                arrow
              >
                <Box
                  component="span"
                  sx={{ display: 'inline-flex', cursor: 'pointer', verticalAlign: 'middle' }}
                >
                  <Iconify icon={GlobalIcons.info} color="info.main" width={16} height={16} />
                </Box>
              </CustomTooltip>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.35, fontWeight: 500 }}
            >
              {selectedSubject?.category ? `${selectedSubject.category} · ` : ''}
              {dependentModuleCount > 0
                ? `Used across ${dependentModuleCount} module${dependentModuleCount > 1 ? 's' : ''}`
                : 'No active dependencies'}
            </Typography>
          </Box>
        </Stack>
      }
      paperProps={{
        sx: {
          maxWidth: 640,
          width: '100%',
          maxHeight: '90vh',
          borderRadius: 2,
        },
      }}
    >
      <DialogScrollContent
        sx={{
          bgcolor: 'background.neutral',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2.5,
        }}
      >
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={186} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 1.5 }} />
          </Stack>
        ) : (
          <>
            {/* 1. Dependencies & Usage (Unified 2-Column Summary List) */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Dependencies & Usage
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                  8 Tracked Metrics
                </Typography>
              </Stack>

              <Box
                sx={{
                  border: '1px solid',
                  borderColor: (t) => alpha(t.palette.grey[500], 0.08),
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                }}
              >
                {dependencyMetrics.map((metric, idx) => {
                  const isEven = idx % 2 === 0;
                  const isLastRow = idx >= dependencyMetrics.length - 2;
                  return (
                    <DependencyItemRow
                      key={metric.label}
                      item={metric}
                      isEven={isEven}
                      isLastRow={isLastRow}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* 2. Allocated Classes */}
            {allocationLabels.length > 0 && (
              <Card
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: (t) => alpha(t.palette.grey[500], 0.08),
                  bgcolor: 'background.paper',
                  boxShadow: 'none',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="solar:buildings-3-bold-duotone" width={16} height={16} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Allocated Classes ({allocationLabels.length})
                    </Typography>
                  </Stack>

                  {allocationLabels.length > 6 && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setShowAllAllocations(!showAllAllocations)}
                      sx={{ p: 0, minWidth: 0, fontSize: '11.5px', fontWeight: 600 }}
                    >
                      {showAllAllocations ? 'Show less' : `View all (${allocationLabels.length})`}
                    </Button>
                  )}
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {displayedAllocations.map((label, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      label={label}
                      variant="outlined"
                      sx={{
                        height: 28,
                        fontSize: '12px',
                        px: 0.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        borderColor: alpha(theme.palette.primary.main, 0.22),
                        color: 'text.primary',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                        },
                      }}
                    />
                  ))}
                  {!showAllAllocations && hiddenAllocationsCount > 0 && (
                    <Chip
                      size="small"
                      label={`+${hiddenAllocationsCount} more`}
                      clickable
                      onClick={() => setShowAllAllocations(true)}
                      sx={{
                        height: 28,
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.grey[500], 0.16),
                        },
                      }}
                    />
                  )}
                </Box>
              </Card>
            )}

            {/* 3. Mapped Elective Groups */}
            {electiveGroupLabels.length > 0 && (
              <Card
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: (t) => alpha(t.palette.grey[500], 0.08),
                  bgcolor: 'background.paper',
                  boxShadow: 'none',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: 'info.main',
                      }}
                    >
                      <Iconify icon="solar:layers-bold-duotone" width={16} height={16} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Mapped Elective Groups ({electiveGroupLabels.length})
                    </Typography>
                  </Stack>

                  {electiveGroupLabels.length > 6 && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setShowAllElectives(!showAllElectives)}
                      sx={{ p: 0, minWidth: 0, fontSize: '11.5px', fontWeight: 600 }}
                    >
                      {showAllElectives ? 'Show less' : `View all (${electiveGroupLabels.length})`}
                    </Button>
                  )}
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {displayedElectives.map((name, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      label={name}
                      variant="outlined"
                      sx={{
                        height: 28,
                        fontSize: '12px',
                        px: 0.5,
                        bgcolor: alpha(theme.palette.info.main, 0.06),
                        borderColor: alpha(theme.palette.info.main, 0.22),
                        color: 'text.primary',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.info.main, 0.12),
                        },
                      }}
                    />
                  ))}
                  {!showAllElectives && hiddenElectivesCount > 0 && (
                    <Chip
                      size="small"
                      label={`+${hiddenElectivesCount} more`}
                      clickable
                      onClick={() => setShowAllElectives(true)}
                      sx={{
                        height: 28,
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.grey[500], 0.16),
                        },
                      }}
                    />
                  )}
                </Box>
              </Card>
            )}

            {/* 4. Dependency / Impact & Restrictions Card */}
            <Card
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: isInUse
                  ? alpha(theme.palette.warning.main, 0.3)
                  : alpha(theme.palette.success.main, 0.3),
                bgcolor: isInUse
                  ? alpha(theme.palette.warning.main, 0.04)
                  : alpha(theme.palette.success.main, 0.04),
                boxShadow: 'none',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(
                        isInUse ? theme.palette.warning.main : theme.palette.success.main,
                        0.12
                      ),
                      color: isInUse ? 'warning.main' : 'success.main',
                    }}
                  >
                    <Iconify
                      icon={
                        isInUse
                          ? 'solar:shield-warning-bold-duotone'
                          : 'solar:shield-check-bold-duotone'
                      }
                      width={16}
                      height={16}
                    />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: isInUse ? 'warning.darker' : 'success.darker',
                    }}
                  >
                    {isInUse
                      ? 'Impact & System Restrictions'
                      : 'Safe to Modify or Delete'}
                  </Typography>
                </Stack>

                <Label
                  color={isInUse ? 'warning' : 'success'}
                  variant="soft"
                  sx={{ height: 20, fontSize: '11px' }}
                >
                  {isInUse ? 'Restricted Deletion' : 'Fully Modifiable'}
                </Label>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '12.5px', lineHeight: 1.5, mb: isInUse ? 1.5 : 0 }}
              >
                {isInUse ? (
                  <>
                    This subject is actively referenced across academic modules. Deletion is
                    restricted while active curriculum, timetable, examination, or other dependent
                    records exist.
                  </>
                ) : (
                  'This subject has no active class allocations or academic records. You can safely edit details or delete this subject.'
                )}
              </Typography>

              {isInUse && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Label color="warning" variant="filled" sx={{ height: 18, fontSize: '10px' }}>
                    Recommendation
                  </Label>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Archive instead of deletion when this subject is no longer actively taught.
                  </Typography>
                </Box>
              )}
            </Card>

            {/* 5. Quick Dependency Action Navigation */}
            {isInUse && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Quick Dependency Actions
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {allocationLabels.length > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        onClose();
                        router.push(academicPaths.curriculum.subjectsAssignment);
                      }}
                      startIcon={<Iconify icon="solar:buildings-3-bold" width={14} />}
                      sx={{
                        fontSize: '11.5px',
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'background.neutral' },
                      }}
                    >
                      Class Allocations ({allocationLabels.length})
                    </Button>
                  )}

                  {chaptersCount > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        onClose();
                        router.push(academicPaths.curriculum.chaptersManagement);
                      }}
                      startIcon={<Iconify icon="solar:book-2-bold" width={14} />}
                      sx={{
                        fontSize: '11.5px',
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'background.neutral' },
                      }}
                    >
                      Syllabus ({chaptersCount})
                    </Button>
                  )}

                  {timetablePeriods > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        onClose();
                        router.push(academicPaths.timetable.management);
                      }}
                      startIcon={<Iconify icon="solar:calendar-date-bold" width={14} />}
                      sx={{
                        fontSize: '11.5px',
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'background.neutral' },
                      }}
                    >
                      Timetable ({timetablePeriods})
                    </Button>
                  )}

                  {examSchedules > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        onClose();
                        router.push(academicPaths.examination.schedule);
                      }}
                      startIcon={<Iconify icon="solar:diploma-verified-bold" width={14} />}
                      sx={{
                        fontSize: '11.5px',
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'background.neutral' },
                      }}
                    >
                      Examinations ({examSchedules})
                    </Button>
                  )}

                  {lessonPlans > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        onClose();
                        router.push(academicPaths.curriculum.lessonPlan);
                      }}
                      startIcon={<Iconify icon="solar:notebook-bookmark-bold" width={14} />}
                      sx={{
                        fontSize: '11.5px',
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'background.neutral' },
                      }}
                    >
                      Lesson Plans ({lessonPlans})
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
          </>
        )}
      </DialogScrollContent>

      {/* Sticky Footer */}
      <DialogActions
        sx={{
          p: 2,
          px: 2.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          {canArchive && onArchive && statusLabel !== 'Archived' && selectedSubject && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="solar:archive-bold" width={15} />}
              onClick={() => {
                onClose();
                onArchive(selectedSubject);
              }}
              sx={{ fontWeight: 600, fontSize: '12px' }}
            >
              Archive Subject
            </Button>
          )}
        </Box>

        <CancelButton buttonText="Close" onClick={onClose} />
      </DialogActions>
    </CustomDialog>
  );
}

