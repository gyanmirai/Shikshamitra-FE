import type { RootState } from 'src/redux/store';

import { useDrag } from 'react-dnd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import { Add, Search, Clear } from '@mui/icons-material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import CreateNoOfLecture from 'src/screens/academic/timetable-schedule-management/settings/components/weeklyLectures/createWeeklyLectures';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  Tab,
  List,
  Card,
  Chip,
  Tabs,
  Stack,
  Button,
  Divider,
  Skeleton,
  ListItem,
  TextField,
  Typography,
  IconButton,
  LinearProgress,
  InputAdornment,
} from '@mui/material';

import { ItemTypes } from './types';
import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import CustomDialog from '../customDialog';
import CustomTooltip from '../custom-tooltip';

import type { Subject } from './types';

interface SubjectCardProps {
  subject: Subject;
  placedCount: number;
  totalSubjects: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, placedCount, totalSubjects }) => {
  const totalLectures = subject.totalLectures ?? 0;
  const isFull = totalLectures > 0 && placedCount >= totalLectures;
  const progressPct = totalLectures > 0 ? Math.min(100, (placedCount / totalLectures) * 100) : 0;
  const isElective = !!(subject as any).electiveGroupId;
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.SUBJECT,
      item: { id: subject.subjectId, type: ItemTypes.SUBJECT, subject },
      canDrag: !isFull,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [isFull, subject]
  );

  const cardAccentColor = isFull
    ? theme.palette.success.main
    : subject.color || theme.palette.primary.main;

  return (
    <ListItem
      ref={(node) => {
        if (node && !isFull) drag(node);
      }}
      disableGutters
      sx={{
        p: 0,
        mb: 1.25,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: isFull
          ? (t) => alpha(t.palette.success.main, 0.3)
          : (t) => alpha(cardAccentColor, 0.24),
        borderLeft: `4px solid ${cardAccentColor}`,
        bgcolor: 'transparent',
        cursor: isFull ? 'default' : 'grab',
        transition: 'all 0.18s ease-in-out',
        opacity: isDragging ? 0.45 : 1,
        overflow: 'hidden',
        boxShadow: (t) =>
          t.palette.mode === 'dark'
            ? '0 2px 6px rgba(0,0,0,0.3)'
            : '0 2px 6px rgba(145, 158, 171, 0.08)',
        '&:hover': {
          transform: isFull ? 'none' : 'translateY(-2px)',
          boxShadow: isFull ? 'none' : (t) => `0 4px 12px ${alpha(cardAccentColor, 0.2)}`,
          borderColor: cardAccentColor,
        },
      }}
    >
      {/* Card Header & Information */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 1.5, pt: 1.25, pb: 0.75 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            color="text.primary"
            sx={{
              fontSize: '0.85rem',
              lineHeight: 1.3,
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subject.name}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={isElective ? 'Elective' : 'Core'}
              size="small"
              variant="soft"
              color={isElective ? 'secondary' : 'primary'}
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />

            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: 'text.primary',
                fontWeight: 700,
              }}
            >
              {placedCount}/{totalLectures} slots
            </Typography>
          </Stack>
        </Box>

        {isFull ? (
          <CustomTooltip title="All weekly slots scheduled" placement="top">
            <Iconify
              icon="mdi:check-circle"
              sx={{ color: 'success.main', flexShrink: 0, width: 20, height: 20, ml: 1 }}
            />
          </CustomTooltip>
        ) : (
          <CustomTooltip title="Drag to schedule in timetable" placement="top">
            <Iconify
              icon="solar:drag-vertical-bold"
              sx={{ color: 'text.disabled', flexShrink: 0, width: 18, height: 18, ml: 1 }}
            />
          </CustomTooltip>
        )}
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progressPct}
        sx={{
          width: '100%',
          height: 3,
          bgcolor: (t) => alpha(cardAccentColor, 0.12),
          borderRadius: 0,
          '& .MuiLinearProgress-bar': {
            bgcolor: isFull ? 'success.main' : cardAccentColor,
            borderRadius: 0,
            transition: 'width 0.4s ease',
          },
        }}
      />
    </ListItem>
  );
};

interface PaletteProps {
  placedCounts: Record<string, number>;
  selectedClass: string;
  selectedDivision: string;
  subjects: Subject[];
  conflicts?: string[];
}

const SubjectPalette: React.FC<PaletteProps> = ({
  placedCounts,
  selectedClass,
  selectedDivision,
  subjects,
  conflicts = [],
}) => {
  const weeklyLecturesDialog = useBoolean();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const standardId = React.useMemo(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [];
    const matched = allClasses.find((c: any) => c.name === selectedClass || c.id === selectedClass);
    return matched?.id || '';
  }, [medium, selectedClass]);

  const {
    data: subjectTableData,
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      standardId,
      status: SubjectAssignmentStatus.Published,
    },
    options: {
      skip: !medium?.id || !standardId,
    },
  });

  return (
    <Card
      sx={{
        width: '290px',
        height: '100%',
        ml: 1,
        mt: 1,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        boxShadow: (t) =>
          t.palette.mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : 'var(--shadows-4)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
      }}
    >
      {isSubjectsLoading || isSubjectsFetching ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1, p: 2 }}>
          <Skeleton variant="text" width={100} height={32} />
          <Skeleton variant="text" width={140} height={20} />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 1.5 }} />
          ))}
        </Box>
      ) : subjects?.length > 0 ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Panel Header */}
          <Box sx={{ p: 2, pb: 1, flexShrink: 0 }}>
            <Tabs
              value={tabIndex}
              onChange={(e, val) => setTabIndex(val)}
              variant="fullWidth"
              sx={{
                mb: 1.5,
                minHeight: 36,
                height: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  height: 36,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                },
              }}
            >
              <Tab label="Subjects" />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={0.75}>
                    Issues
                    {conflicts.length > 0 && (
                      <Chip
                        label={conflicts.length}
                        size="small"
                        color="error"
                        sx={{
                          height: 18,
                          minWidth: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 0.5 },
                        }}
                      />
                    )}
                  </Box>
                }
              />
            </Tabs>

            {tabIndex === 0 && (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ letterSpacing: '-0.01em' }}
                  >
                    Subjects
                  </Typography>
                  <CustomTooltip
                    title="Drag subjects onto time slots in the grid to schedule them"
                    placement="left"
                    arrow
                  >
                    <Iconify
                      icon="lucide:info"
                      sx={{ cursor: 'pointer', color: 'primary.main', width: 16, height: 16 }}
                    />
                  </CustomTooltip>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1.25 }}
                >
                  Drag to schedule ·{' '}
                  {
                    subjects.filter(
                      (s) =>
                        (s.totalLectures ?? 0) === 0 ||
                        ((placedCounts[s.subjectId] ?? 0) >= (s.totalLectures ?? 0) &&
                          (s.totalLectures ?? 0) > 0)
                    ).length
                  }
                  /{subjects.length} complete
                </Typography>

                {/* Search Input */}
                <TextField
                  size="small"
                  placeholder="Search subject by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: 18, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <Clear sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{
                    mb: 1.25,
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.8125rem',
                      borderRadius: 1.5,
                    },
                  }}
                />

                {/* Overall Completion Progress */}
                {(() => {
                  const schedulableSubjects = subjects.filter((s) => (s.totalLectures ?? 0) > 0);
                  const totalPlaced = schedulableSubjects.reduce(
                    (sum, s) =>
                      sum + Math.min(placedCounts[s.subjectId] ?? 0, s.totalLectures ?? 0),
                    0
                  );
                  const totalRequired = schedulableSubjects.reduce(
                    (sum, s) => sum + (s.totalLectures ?? 0),
                    0
                  );
                  const pct =
                    totalRequired > 0 ? Math.round((totalPlaced / totalRequired) * 100) : 0;
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: pct === 100 ? 'success.main' : 'primary.main',
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color={pct === 100 ? 'success.main' : 'text.secondary'}
                        sx={{ whiteSpace: 'nowrap', minWidth: 36, fontSize: '0.75rem' }}
                      >
                        {pct}%
                      </Typography>
                    </Box>
                  );
                })()}
              </>
            )}
          </Box>

          <Divider sx={{ flexShrink: 0 }} />

          {/* Subject List Tab */}
          {tabIndex === 0 && (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
              <Scrollbar
                sx={{
                  height: '100%',
                  '& .simplebar-content-wrapper': { height: '100%' },
                  '& .simplebar-track': { zIndex: 1 },
                }}
              >
                <List sx={{ px: 1.5, py: 1 }}>
                  {subjects
                    .filter((s) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((sub) => (
                      <SubjectCard
                        key={sub.subjectId}
                        subject={sub}
                        placedCount={placedCounts[sub.subjectId] || 0}
                        totalSubjects={sub.totalSubjects || 0}
                      />
                    ))}
                  {subjects.filter((s) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.disabled">
                        No subjects match search
                      </Typography>
                    </Box>
                  )}
                </List>
              </Scrollbar>
            </Box>
          )}

          {/* Issues List Tab */}
          {tabIndex === 1 && (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
              <Scrollbar
                sx={{
                  height: '100%',
                  '& .simplebar-content-wrapper': { height: '100%' },
                  '& .simplebar-track': { zIndex: 1 },
                }}
              >
                <List sx={{ px: 1.5, py: 1 }}>
                  {conflicts.map((err, idx) => (
                    <ListItem
                      key={idx}
                      disableGutters
                      sx={{
                        p: 1.25,
                        mb: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: (t) => alpha(t.palette.error.main, 0.3),
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.04),
                      }}
                    >
                      <Box display="flex" gap={1} alignItems="flex-start" width="100%">
                        <Iconify
                          icon="mdi:alert-circle"
                          color="error.main"
                          sx={{ mt: 0.25, flexShrink: 0 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.primary"
                          fontWeight={600}
                          sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}
                        >
                          {err}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                  {conflicts.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                      <Iconify
                        icon="mdi:check-circle"
                        color="success.main"
                        width={36}
                        height={36}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        No Issues Found
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        All configured rules and mappings are valid.
                      </Typography>
                    </Box>
                  )}
                </List>
              </Scrollbar>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            p: 3,
            gap: 1.5,
          }}
        >
          <Iconify
            icon="mdi:book-open-blank-variant-outline"
            sx={{ width: 40, height: 40, color: 'text.disabled' }}
          />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No subjects assigned yet
          </Typography>
          <Button
            startIcon={<Add />}
            size="small"
            variant="contained"
            onClick={weeklyLecturesDialog.onTrue}
          >
            Weekly Lectures
          </Button>
        </Box>
      )}
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Weekly Lectures</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Configure the number of lectures per week for each subject"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={weeklyLecturesDialog.value}
        handleClose={weeklyLecturesDialog.onFalse}
        maxWidth="sm"
      >
        <CreateNoOfLecture
          isEdit={false}
          editData={null}
          onClose={weeklyLecturesDialog.onFalse}
          selectedClass={selectedClass}
          tableData={subjectTableData?.data?.items}
        />
      </CustomDialog>
    </Card>
  );
};

export default SubjectPalette;
