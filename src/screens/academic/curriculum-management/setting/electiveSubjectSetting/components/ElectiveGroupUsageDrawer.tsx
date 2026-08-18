'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { academicPaths } from 'src/constants/academic-menu';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Drawer,
  Button,
  Avatar,
  Skeleton,
  Typography,
  IconButton,
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

interface StatCardItem {
  label: string;
  value: number | string;
  icon: string;
  color: 'primary' | 'info' | 'success' | 'warning' | 'error' | 'secondary';
}

function StatCard({ item }: { item: StatCardItem }) {
  const theme = useTheme();
  const paletteColor = (theme.palette as any)[item.color] || theme.palette.primary;

  return (
    <Card
      sx={{
        p: 1.75,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        boxShadow: 'var(--shadows-3)',
        borderRadius: 2,
        bgcolor: 'background.paper',
        minHeight: 74,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: alpha(paletteColor.main, 0.14),
          color: paletteColor.main,
        }}
      >
        <Iconify icon={item.icon} width={22} height={22} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ lineHeight: 1.15, fontSize: '1.2rem' }}
          noWrap
        >
          {item.value}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            fontWeight: 500,
            fontSize: '11.5px',
            mt: 0.25,
            lineHeight: 1.2,
          }}
          noWrap
        >
          {item.label}
        </Typography>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

export default function ElectiveGroupUsageDrawer({
  open,
  onClose,
  selectedGroup,
  usageData,
  isLoading = false,
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

  const displayedSubjects = showAllSubjects
    ? normalizedSubjects
    : normalizedSubjects.slice(0, 6);

  const hiddenSubjectsCount = normalizedSubjects.length - displayedSubjects.length;

  const statCards: StatCardItem[] = useMemo(
    () => [
      {
        label: 'Subjects',
        value: normalizedSubjects.length,
        icon: 'solar:book-bookmark-bold-duotone',
        color: 'primary',
      },
      {
        label: 'Class Allocations',
        value: classAllocations,
        icon: 'solar:buildings-3-bold-duotone',
        color: 'info',
      },
      {
        label: 'Student Selections',
        value: studentSelections,
        icon: 'solar:users-group-two-rounded-bold-duotone',
        color: 'success',
      },
      {
        label: 'Timetable Periods',
        value: timetablePeriods,
        icon: 'solar:calendar-date-bold-duotone',
        color: 'warning',
      },
      {
        label: 'Exam Schedules',
        value: examSchedules,
        icon: 'solar:diploma-verified-bold-duotone',
        color: 'error',
      },
      {
        label: 'Total Students',
        value: totalStudents,
        icon: 'solar:user-bold-duotone',
        color: 'primary',
      },
    ],
    [
      normalizedSubjects.length,
      classAllocations,
      studentSelections,
      timetablePeriods,
      examSchedules,
      totalStudents,
    ]
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
          width: { xs: '100%', sm: 480, md: 520 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 28px -4px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {/* 1. Header (Skill Pattern: Title + CustomTooltip info icon + Status Label + Close) */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.5,
              bgcolor: alpha(groupColor, 0.14),
              color: groupColor,
              border: `1px solid ${alpha(groupColor, 0.28)}`,
              fontWeight: 700,
            }}
          >
            <Iconify icon="solar:layers-bold" width={22} height={22} />
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: 200, sm: 240 },
                }}
              >
                {selectedGroup?.name || 'Elective Group'}
              </Typography>
              <Label color={getStatusColor(statusLabel)} variant="soft" sx={{ height: 20 }}>
                {statusLabel}
              </Label>
              <CustomTooltip
                title="Elective Group Dependencies & Usage Across Modules"
                placement="right"
                arrow
              >
                <Box component="span" sx={{ display: 'inline-flex', cursor: 'pointer' }}>
                  <Iconify icon={GlobalIcons.info} color="info.main" width={16} height={16} />
                </Box>
              </CustomTooltip>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {normalizedSubjects.length} {normalizedSubjects.length === 1 ? 'Subject' : 'Subjects'} ·{' '}
              {dependentModuleCount > 0
                ? `Used across ${dependentModuleCount} module${dependentModuleCount > 1 ? 's' : ''}`
                : 'No active dependencies'}
            </Typography>
          </Box>
        </Stack>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            p: 0.5,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="mdi:close" width={20} height={20} />
        </IconButton>
      </Box>

      {/* 2. Scrollable Body with Standard Scrollbar */}
      <Scrollbar
        sx={{
          flex: 1,
          minHeight: 0,
          bgcolor: 'background.neutral',
          '& .simplebar-content': {
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          },
          p : 2
        }}
      >
        {isLoading ? (
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.25,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="rounded" height={74} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
            <Skeleton variant="rounded" height={130} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : (
          <>
            {/* Usage & Dependencies 2-Column Grid */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Usage & Dependencies
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Live Snapshot
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1.25,
                }}
              >
                {statCards.map((card) => (
                  <StatCard key={card.label} item={card} />
                ))}
              </Box>
            </Box>

            {/* Mapped Subjects Chip List */}
            {normalizedSubjects.length > 0 && (
              <Card
                sx={{
                  p: 2,
                  boxShadow: 'var(--shadows-3)',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
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
                  {normalizedSubjects.length > 6 && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setShowAllSubjects(!showAllSubjects)}
                      sx={{ p: 0, minWidth: 0, fontSize: '11.5px' }}
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
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                        borderColor: (t) => alpha(t.palette.primary.main, 0.24),
                        color: 'text.primary',
                        fontWeight: 600,
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
                        bgcolor: (t) => alpha(t.palette.grey[500], 0.12),
                        fontWeight: 600,
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
                boxShadow: 'var(--shadows-3)',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
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
                      sx={{ alignSelf: 'flex-start', p: 0, minWidth: 0, fontSize: '12px' }}
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

            {/* 4. Edit Safety Contextual Alert */}
            <Alert
              severity={isInUse ? 'warning' : 'success'}
              icon={
                <Iconify
                  icon={isInUse ? 'solar:shield-warning-bold-duotone' : 'solar:shield-check-bold-duotone'}
                  width={22}
                  height={22}
                />
              }
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: (t) =>
                  alpha(isInUse ? t.palette.warning.main : t.palette.success.main, 0.35),
                bgcolor: (t) =>
                  alpha(isInUse ? t.palette.warning.main : t.palette.success.main, 0.08),
                '& .MuiAlert-icon': {
                  color: isInUse ? 'warning.main' : 'success.main',
                  mr: 1.25,
                  mt: 0.25,
                },
                '& .MuiAlert-message': {
                  width: '100%',
                  p: 0,
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  color: isInUse ? 'warning.darker' : 'success.darker',
                }}
              >
                {isInUse
                  ? 'This elective group is currently in use'
                  : 'Safe to modify or delete'}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                {isInUse ? (
                  <>
                    You can safely edit basic attributes (<strong>Name</strong>,{' '}
                    <strong>Color</strong>, <strong>Description</strong>). Modifying subjects or
                    deleting is restricted due to active dependencies.
                  </>
                ) : (
                  'This elective group has no active student or timetable dependencies. You can safely edit structure or delete this group.'
                )}
              </Typography>

              {isInUse && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Label color="warning" variant="filled" sx={{ height: 18, fontSize: '10px' }}>
                    Notice
                  </Label>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Archive is recommended when no longer required.
                  </Typography>
                </Box>
              )}
            </Alert>

            {/* 5. Dependency Navigation Links */}
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
                      sx={{ fontSize: '11.5px', bgcolor: 'background.paper' }}
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
                      sx={{ fontSize: '11.5px', bgcolor: 'background.paper' }}
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
                      sx={{ fontSize: '11.5px', bgcolor: 'background.paper' }}
                    >
                      Examinations ({examSchedules})
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Scrollbar>

      {/* 3. Sticky Footer (Skill Pattern: size="small" button, startIcon cancel/close icon, right-aligned) */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
          sx={{ px: 2 }}
        >
          Close
        </Button>
      </Box>
    </Drawer>
  );
}
