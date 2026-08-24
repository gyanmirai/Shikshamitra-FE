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

import type { IElectiveSubject } from '../type';

// ----------------------------------------------------------------------

interface ElectiveGroupUsageData {
  canDelete?: boolean;
  subjects?: Array<string | { id?: string; name: string; color?: string; subjectColor?: string }>;
  usage?: {
    classAllocationsCount?: number;
    studentSelectionsCount?: number;
    timetablePeriodsCount?: number;
    examSchedulesCount?: number;
    subjectWiseStudentCount?: Array<{ subject: string; count: number }>;
  };
}

interface ElectiveGroupUsageDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedGroup: IElectiveSubject | null;
  usageData?: ElectiveGroupUsageData | null;
  isLoading?: boolean;
  onArchive?: (group: IElectiveSubject) => void;
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

export default function ElectiveGroupUsageDrawer({
  open,
  onClose,
  selectedGroup,
  usageData,
  isLoading = false,
  onArchive,
  canArchive = false,
}: ElectiveGroupUsageDrawerProps) {
  const theme = useTheme();
  const router = useRouter();
  const [showAllDistribution, setShowAllDistribution] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  const statusLabel = getStatusLabel(selectedGroup?.status);
  const groupColor = selectedGroup?.color || theme.palette.primary.main;

  // Normalized subjects list
  const normalizedSubjects = useMemo(() => {
    if (selectedGroup?.subjects && selectedGroup.subjects.length > 0) {
      return selectedGroup.subjects.map((s) => ({
        name: typeof s === 'string' ? s : s.name,
        color: typeof s === 'object' ? s.color || s.subjectColor || groupColor : groupColor,
      }));
    }
    if (usageData?.subjects && usageData.subjects.length > 0) {
      return usageData.subjects.map((s) => ({
        name: typeof s === 'string' ? s : s.name,
        color: typeof s === 'object' ? s.color || s.subjectColor || groupColor : groupColor,
      }));
    }
    return [];
  }, [selectedGroup, usageData, groupColor]);

  // Counts & calculations
  const classAllocations = usageData?.usage?.classAllocationsCount ?? 0;
  const studentSelections = usageData?.usage?.studentSelectionsCount ?? 0;
  const timetablePeriods = usageData?.usage?.timetablePeriodsCount ?? 0;
  const examSchedules = usageData?.usage?.examSchedulesCount ?? 0;
  const subjectDistribution = usageData?.usage?.subjectWiseStudentCount ?? [];

  const totalStudents = useMemo(() => {
    if (subjectDistribution.length > 0) {
      return subjectDistribution.reduce((acc, curr) => acc + (curr.count || 0), 0);
    }
    return studentSelections;
  }, [subjectDistribution, studentSelections]);

  const maxStudentCount = useMemo(() => {
    if (subjectDistribution.length === 0) return 1;
    const max = Math.max(...subjectDistribution.map((s) => s.count || 0));
    return max > 0 ? max : 1;
  }, [subjectDistribution]);

  // Dependent modules count
  const dependentModuleCount = useMemo(() => {
    let count = 0;
    if (classAllocations > 0) count += 1;
    if (timetablePeriods > 0) count += 1;
    if (examSchedules > 0) count += 1;
    if (studentSelections > 0) count += 1;
    return count;
  }, [classAllocations, timetablePeriods, examSchedules, studentSelections]);

  const isInUse = !usageData?.canDelete && (dependentModuleCount > 0 || classAllocations > 0);

  const displayedDistribution = showAllDistribution
    ? subjectDistribution
    : subjectDistribution.slice(0, 5);

  const displayedSubjects = showAllSubjects ? normalizedSubjects : normalizedSubjects.slice(0, 6);

  const hiddenSubjectsCount = normalizedSubjects.length - displayedSubjects.length;

  const dependencyMetrics: DependencyMetricItem[] = useMemo(
    () => [
      {
        label: 'Subjects Mapped',
        value: normalizedSubjects.length,
        icon: 'solar:book-bookmark-bold-duotone',
        color: theme.palette.primary.main,
      },
      {
        label: 'Class Allocations',
        value: classAllocations,
        icon: 'solar:buildings-3-bold-duotone',
        color: theme.palette.info.main,
      },
      {
        label: 'Student Selections',
        value: studentSelections,
        icon: 'solar:users-group-two-rounded-bold-duotone',
        color: theme.palette.success.main,
      },
      {
        label: 'Timetable Periods',
        value: timetablePeriods,
        icon: 'solar:calendar-date-bold-duotone',
        color: theme.palette.warning.main,
      },
      {
        label: 'Exam Schedules',
        value: examSchedules,
        icon: 'solar:diploma-verified-bold-duotone',
        color: theme.palette.error.main,
      },
      {
        label: 'Total Students',
        value: totalStudents,
        icon: 'solar:user-bold-duotone',
        color: theme.palette.primary.main,
      },
    ],
    [
      normalizedSubjects.length,
      classAllocations,
      studentSelections,
      timetablePeriods,
      examSchedules,
      totalStudents,
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
              bgcolor: alpha(groupColor, 0.12),
              color: groupColor,
              border: `1px solid ${alpha(groupColor, 0.28)}`,
              fontWeight: 700,
            }}
          >
            <Iconify icon="solar:layers-bold" width={22} height={22} />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
              >
                {selectedGroup?.name || 'Elective Group Details'}
              </Typography>
              <Label color={getStatusColor(statusLabel)} variant="soft" sx={{ height: 20 }}>
                {statusLabel}
              </Label>
              <CustomTooltip
                title="Elective Group Dependencies & System Usage Across Modules"
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
              {normalizedSubjects.length} {normalizedSubjects.length === 1 ? 'Subject' : 'Subjects'}{' '}
              ·{' '}
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
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 1.5 }} />
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
                  6 Tracked Metrics
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

            {/* 2. Mapped Subjects Chip List */}
            {normalizedSubjects.length > 0 && (
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
                      <Iconify icon="solar:book-bookmark-bold-duotone" width={16} height={16} />
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
                      Mapped Subjects ({normalizedSubjects.length})
                    </Typography>
                  </Stack>

                  {normalizedSubjects.length > 6 && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setShowAllSubjects(!showAllSubjects)}
                      sx={{ p: 0, minWidth: 0, fontSize: '11.5px', fontWeight: 600 }}
                    >
                      {showAllSubjects ? 'Show less' : `View all (${normalizedSubjects.length})`}
                    </Button>
                  )}
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {displayedSubjects.map((subject, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      label={subject.name}
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
                  {!showAllSubjects && hiddenSubjectsCount > 0 && (
                    <Chip
                      size="small"
                      label={`+${hiddenSubjectsCount} more`}
                      clickable
                      onClick={() => setShowAllSubjects(true)}
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

            {/* 3. Student Distribution */}
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
                    <Iconify icon="solar:chart-2-bold-duotone" width={16} height={16} />
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
                    Student Distribution
                  </Typography>
                </Stack>

                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {totalStudents} total {totalStudents === 1 ? 'student' : 'students'}
                </Typography>
              </Stack>

              {subjectDistribution.length > 0 ? (
                <Stack spacing={1.75}>
                  {displayedDistribution.map((item, idx) => {
                    const percent = Math.round(((item.count || 0) / maxStudentCount) * 100);
                    return (
                      <Box key={idx}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 0.75 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 240,
                            }}
                          >
                            {item.subject}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: item.count > 0 ? 'text.primary' : 'text.disabled',
                            }}
                          >
                            {item.count} {item.count === 1 ? 'student' : 'students'}
                          </Typography>
                        </Stack>

                        <Box
                          sx={{
                            width: '100%',
                            height: 7,
                            borderRadius: 3.5,
                            bgcolor: alpha(theme.palette.grey[500], 0.12),
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percent}%`,
                              height: '100%',
                              borderRadius: 3.5,
                              bgcolor:
                                idx % 3 === 0
                                  ? theme.palette.primary.main
                                  : idx % 3 === 1
                                    ? theme.palette.info.main
                                    : theme.palette.success.main,
                              transition: 'width 0.4s ease-in-out',
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}

                  {subjectDistribution.length > 5 && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setShowAllDistribution(!showAllDistribution)}
                      sx={{ alignSelf: 'flex-start', p: 0, minWidth: 0, fontSize: '11.5px', fontWeight: 600 }}
                    >
                      {showAllDistribution
                        ? 'Show less'
                        : `View all (${subjectDistribution.length} subjects)`}
                    </Button>
                  )}
                </Stack>
              ) : (
                <Box
                  sx={{
                    py: 2,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    No student enrollment distribution recorded yet for this group.
                  </Typography>
                </Box>
              )}
            </Card>

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
                sx={{ display: 'block', fontSize: '12.5px', lineHeight: 1.5, mb: isInUse ? 1.5 : 0 }}
              >
                {isInUse ? (
                  <>
                    This elective group is actively referenced by student choices or timetable allocations. Modifying subjects or deletion is restricted while active dependencies exist.
                  </>
                ) : (
                  'This elective group has no active student or timetable dependencies. You can safely edit structure or delete this group.'
                )}
              </Typography>

              {isInUse && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Label color="warning" variant="filled" sx={{ height: 18, fontSize: '10px' }}>
                    Recommendation
                  </Label>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Archive when this elective group is no longer offered in current academic terms.
                  </Typography>
                </Box>
              )}
            </Card>

            {/* 5. Quick Dependency Action Navigation Links */}
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
                  {classAllocations > 0 && (
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
                      Class Allocations ({classAllocations})
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
          {canArchive && onArchive && statusLabel !== 'Archived' && selectedGroup && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="solar:archive-bold" width={15} />}
              onClick={() => {
                onClose();
                onArchive(selectedGroup);
              }}
              sx={{ fontWeight: 600, fontSize: '12px' }}
            >
              Archive Group
            </Button>
          )}
        </Box>

        <CancelButton buttonText="Close" onClick={onClose} />
      </DialogActions>
    </CustomDialog>
  );
}

