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

import type { ISubject } from './type';

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

export default function SubjectUsageDrawer({
  open,
  onClose,
  selectedSubject,
  usageData,
  isLoading = false,
}: SubjectUsageDrawerProps) {
  const theme = useTheme();
  const router = useRouter();

  const [showAllAllocations, setShowAllAllocations] = useState(false);
  const [showAllElectives, setShowAllElectives] = useState(false);

  const statusLabel = getStatusLabel(selectedSubject?.status);
  const subjectColor = selectedSubject?.color || theme.palette.primary.main;

  const rawAllocations =
    usageData?.usage?.subjectAllocations ||
    usageData?.subjectAllocations ||
    usageData?.usage?.classes ||
    [];

  const rawElectiveGroups =
    usageData?.usage?.electiveGroups ||
    usageData?.electiveGroups ||
    [];

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

  const displayedAllocations = showAllAllocations
    ? allocationLabels
    : allocationLabels.slice(0, 6);
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

  const statCards: StatCardItem[] = useMemo(
    () => [
      {
        label: 'Class Allocations',
        value: allocationLabels.length,
        icon: 'solar:buildings-3-bold-duotone',
        color: 'primary',
      },
      {
        label: 'Elective Groups',
        value: electiveGroupLabels.length,
        icon: 'solar:layers-bold-duotone',
        color: 'info',
      },
      {
        label: 'Syllabus (Chapters)',
        value: chaptersCount,
        icon: 'solar:book-2-bold-duotone',
        color: 'info',
      },
      {
        label: 'Timetable (Periods)',
        value: timetablePeriods,
        icon: 'solar:calendar-date-bold-duotone',
        color: 'warning',
      },
      {
        label: 'Examinations',
        value: examSchedules,
        icon: 'solar:diploma-verified-bold-duotone',
        color: 'error',
      },
      {
        label: 'Lesson Plans',
        value: lessonPlans,
        icon: 'solar:notebook-bookmark-bold-duotone',
        color: 'success',
      },
      {
        label: 'Homework Records',
        value: homeworkCount,
        icon: 'solar:clipboard-check-bold-duotone',
        color: 'primary',
      },
      {
        label: 'Assigned Teachers',
        value: teacherMappings,
        icon: 'solar:user-id-bold-duotone',
        color: 'info',
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
              bgcolor: alpha(subjectColor, 0.14),
              color: subjectColor,
              border: `1px solid ${alpha(subjectColor, 0.28)}`,
              fontWeight: 700,
            }}
          >
            <Iconify
              icon={selectedSubject?.icon || 'solar:book-bookmark-bold'}
              width={22}
              height={22}
            />
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
                {selectedSubject?.name || 'Subject Usage'}
              </Typography>
              <Label color={getStatusColor(statusLabel)} variant="soft" sx={{ height: 20 }}>
                {statusLabel}
              </Label>
              <CustomTooltip
                title="Subject Dependencies & Usage Across Modules"
                placement="right"
                arrow
              >
                <Box component="span" sx={{ display: 'inline-flex', cursor: 'pointer' }}>
                  <Iconify icon={GlobalIcons.info} color="info.main" width={16} height={16} />
                </Box>
              </CustomTooltip>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {selectedSubject?.category ? `${selectedSubject.category} · ` : ''}
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
          p: 2
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} variant="rounded" height={74} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
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

            {/* Mapped Classes Breakdown */}
            {allocationLabels.length > 0 && (
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
                    Allocated Classes ({allocationLabels.length})
                  </Typography>
                  {allocationLabels.length > 6 && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setShowAllAllocations(!showAllAllocations)}
                      sx={{ p: 0, minWidth: 0, fontSize: '11.5px' }}
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
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                        borderColor: (t) => alpha(t.palette.primary.main, 0.24),
                        color: 'text.primary',
                        fontWeight: 600,
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
                      }}
                    />
                  )}
                </Box>
              </Card>
            )}

            {/* Mapped Elective Groups Breakdown */}
            {electiveGroupLabels.length > 0 && (
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
                    Mapped Elective Groups ({electiveGroupLabels.length})
                  </Typography>
                  {electiveGroupLabels.length > 6 && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setShowAllElectives(!showAllElectives)}
                      sx={{ p: 0, minWidth: 0, fontSize: '11.5px' }}
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
                        bgcolor: (t) => alpha(t.palette.info.main, 0.08),
                        borderColor: (t) => alpha(t.palette.info.main, 0.24),
                        color: 'text.primary',
                        fontWeight: 600,
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
                      }}
                    />
                  )}
                </Box>
              </Card>
            )}

            {/* 3. Edit Safety Contextual Alert */}
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
                  ? 'This subject is currently in use across modules'
                  : 'Safe to modify or delete'}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                {isInUse ? (
                  <>
                    You can safely edit display attributes (<strong>Display Name</strong>,{' '}
                    <strong>Color</strong>, <strong>Icon</strong>). Deletion is restricted due to
                    active curriculum, timetable, or examination records.
                  </>
                ) : (
                  'This subject has no active class allocations or academic records. You can safely edit details or delete this subject.'
                )}
              </Typography>

              {isInUse && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Label color="warning" variant="filled" sx={{ height: 18, fontSize: '10px' }}>
                    Notice
                  </Label>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Archive is recommended when no longer in active use.
                  </Typography>
                </Box>
              )}
            </Alert>

            {/* 4. Dependency Navigation Links */}
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
                      sx={{ fontSize: '11.5px', bgcolor: 'background.paper' }}
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
                      sx={{ fontSize: '11.5px', bgcolor: 'background.paper' }}
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
                      sx={{ fontSize: '11.5px', bgcolor: 'background.paper' }}
                    >
                      Lesson Plans ({lessonPlans})
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
