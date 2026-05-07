import type { RootState } from 'src/redux/store';

import { useDrag } from 'react-dnd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Add, Search } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CreateNoOfLecture from 'src/screens/academic/timetable-schedule-management/settings/components/weeklyLectures/createWeeklyLectures';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  List,
  Card,
  Chip,
  Button,
  Divider,
  Skeleton,
  ListItem,
  TextField,
  Typography,
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
  const isFull = placedCount >= totalLectures && totalLectures > 0;
  const progressPct = totalLectures > 0 ? (placedCount / totalLectures) * 100 : 0;
  const isElective = !!(subject as any).electiveGroupId;
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.SUBJECT,
      item: { id: subject.id, type: ItemTypes.SUBJECT, subject },
      canDrag: !isFull,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [isFull, subject]
  );

  const subjectColor = isFull ? '#9e9e9e' : subject.color;

  return (
    <ListItem
      ref={(node) => {
        if (node && !isFull) drag(node);
      }}
      disableGutters
      sx={{
        p: 0,
        mb: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: isFull ? 'action.disabled' : 'divider',
        borderLeft: `4px solid ${subjectColor}`,
        bgcolor: 'background.paper',
        cursor: isFull ? 'not-allowed' : 'grab',
        transition: 'all 0.18s ease',
        opacity: isDragging ? 0.45 : isFull ? 0.55 : 1,
        filter: isFull ? 'grayscale(60%)' : 'none',
        pointerEvents: isFull ? 'none' : 'auto',
        overflow: 'hidden',
        boxShadow: isFull ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: isFull ? 'none' : 'translateY(-2px)',
          boxShadow: isFull ? 'none' : `0 4px 12px ${alpha(subjectColor, 0.25)}`,
          borderColor: isFull ? 'action.disabled' : subjectColor,
          bgcolor: isFull ? 'background.paper' : alpha(subjectColor, 0.04),
        },
      }}
    >
      {/* Card content row */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 1.5, pt: 1, pb: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            color={isFull ? 'text.disabled' : 'text.primary'}
            sx={{
              lineHeight: 1.3,
              mb: 0.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subject.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              label={isElective ? 'Elective' : 'Core'}
              size="small"
              variant="outlined"
              sx={{
                height: 16,
                fontSize: '0.6rem',
                fontWeight: 700,
                backgroundColor: isElective
                  ? alpha(theme.palette.secondary.main, 0.16)
                  : alpha(theme.palette.primary.main, 0.14),
                color: isElective
                  ? theme.vars.palette.text.secondary
                  : theme.vars.palette.primary.dark,
                border: '1px solid',
                borderColor: isElective
                  ? alpha(theme.palette.secondary.main, 0.35)
                  : alpha(theme.palette.primary.main, 0.3),
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                color: isFull ? 'error.main' : placedCount > 0 ? 'success.main' : 'text.secondary',
                fontWeight: 600,
              }}
            >
              {placedCount}/{totalLectures} slots
            </Typography>
          </Box>
        </Box>
        {isFull && (
          <Iconify
            icon="mdi:check-circle"
            sx={{ color: 'success.main', flexShrink: 0, width: 18, height: 18 }}
          />
        )}
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progressPct}
        sx={{
          width: '100%',
          height: 3,
          bgcolor: alpha(subjectColor, 0.15),
          borderRadius: 0,
          '& .MuiLinearProgress-bar': {
            bgcolor: isFull ? 'success.main' : subjectColor,
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
}

const SubjectPalette: React.FC<PaletteProps> = ({
  placedCounts,
  selectedClass,
  selectedDivision,
  subjects,
}) => {
  const weeklyLecturesDialog = useBoolean();
  const [searchQuery, setSearchQuery] = useState('');
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
    },
    options: {
      skip: !medium?.id || !standardId,
    },
  });

  // const subjects: Subject[] = React.useMemo(() => {
  //   if (!subjectTableData?.data?.items) return [];
  //   return subjectTableData.data.items.flatMap((item: any) => {
  //     const totalLectures = item.totalLectures ?? 0;
  //     if (item.subjectType === 1) {
  //       return item.subjects.map((sub: any) => ({
  //         id: sub.assignedId || sub.subjectId,
  //         name: sub.subject?.name || sub.subjectName,
  //         color: sub.subject?.color || sub.color || '#90caf9',
  //         totalLectures,
  //       }));
  //     }
  //     return [
  //       {
  //         id: item.subjects[0]?.assignedId || item.subjects[0]?.subjectId,
  //         name: item.subjects[0]?.subject?.name || item.subjects[0]?.subjectName,
  //         color: item.subjects[0]?.subject?.color || item.subjects[0]?.color || '#90caf9',
  //         totalLectures,
  //       },
  //     ];
  //   });
  // }, [subjectTableData]);

  return (
    <Card
      sx={{
        width: '280px',
        height: '100%',
        ml: 1,
        mt: 1,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        boxShadow: 'var(--shadows-4)',
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
        <>
          {/* Panel Header */}
          <Box sx={{ p: 2, pb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                Subjects
              </Typography>
              <CustomTooltip
                title="Drag subjects onto time slots to schedule them"
                placement="left"
                arrow
              >
                <Iconify
                  icon="lucide:info"
                  sx={{ cursor: 'pointer', color: 'text.disabled', width: 16, height: 16 }}
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
                    (placedCounts[s.id] ?? 0) >= (s.totalLectures ?? 0) &&
                    (s.totalLectures ?? 0) > 0
                ).length
              }
              /{subjects.length} complete
            </Typography>

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.8rem',
                  borderRadius: 1.5,
                },
              }}
            />

            {/* Stats Row */}
            {(() => {
              const totalPlaced = subjects.reduce((sum, s) => sum + (placedCounts[s.id] ?? 0), 0);
              const totalRequired = subjects.reduce((sum, s) => sum + (s.totalLectures ?? 0), 0);
              const pct = totalRequired > 0 ? Math.round((totalPlaced / totalRequired) * 100) : 0;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'action.hover',
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
                    sx={{ whiteSpace: 'nowrap', minWidth: 36 }}
                  >
                    {pct}%
                  </Typography>
                </Box>
              );
            })()}
          </Box>

          <Divider />

          {/* Subject List */}
          <Scrollbar sx={{ flex: 1 }}>
            <List sx={{ px: 1.5, py: 1 }}>
              {subjects
                .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((sub) => (
                  <SubjectCard
                    key={sub.id}
                    subject={sub}
                    placedCount={placedCounts[sub.id] || 0}
                    totalSubjects={sub.totalSubjects || 0}
                  />
                ))}
              {subjects.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .length === 0 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.disabled">
                    No subjects match
                  </Typography>
                </Box>
              )}
            </List>
          </Scrollbar>
        </>
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
