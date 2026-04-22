import type { RootState } from 'src/redux/store';

import React from 'react';
import { useDrag } from 'react-dnd';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, List, Card, Button, Skeleton, ListItem, Typography } from '@mui/material';
import CreateNoOfLecture from 'src/screens/academic/timetable-schedule-management/settings/components/weeklyLectures/createWeeklyLectures';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

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
  ); // Add dependencies to ensure drag state updates

  return (
    <ListItem
      ref={(node) => {
        if (node && !isFull) drag(node);
      }}
      sx={{
        p: 1.5,

        mb: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: isFull ? 'action.disabled' : 'divider',
        borderRadius: 1,
        cursor: isFull ? 'not-allowed' : 'grab',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: isFull ? 0 : 1,
        fontWeight: 500,
        fontSize: '0.9rem',
        borderLeft: `4px solid ${isFull ? '#9e9e9e' : subject.color}`,
        opacity: isDragging ? 0.5 : isFull ? 0.6 : 1,
        filter: isFull ? 'grayscale(100%)' : 'none',
        pointerEvents: isFull ? 'none' : 'auto',
        '&:hover': {
          transform: isFull ? 'none' : 'translateY(-2px)',
          boxShadow: isFull ? 0 : 2,
          borderColor: isFull ? 'action.disabled' : 'primary.main',
        },
      }}
    >
      <Typography
        variant="body2"
        fontWeight="medium"
        color={isFull ? 'text.disabled' : 'text.primary'}
      >
        {subject.name}
      </Typography>
      <Typography
        variant="caption"
        color={isFull ? 'error.main' : placedCount > 0 ? 'primary.main' : 'text.secondary'}
        fontWeight={placedCount > 0 ? 'bold' : 'regular'}
      >
        {placedCount} / {subject.totalLectures ?? 0}
      </Typography>
    </ListItem>
  );
};

interface PaletteProps {
  placedCounts: Record<string, number>;
  selectedClass: string;
  selectedDivision: string;
}

const SubjectPalette: React.FC<PaletteProps> = ({
  placedCounts,
  selectedClass,
  selectedDivision,
}) => {
  const weeklyLecturesDialog = useBoolean();
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

  const subjects: Subject[] = React.useMemo(() => {
    if (!subjectTableData?.data?.items) return [];
    return subjectTableData.data.items.flatMap((item: any) => {
      const totalLectures = item.totalLectures ?? 0;
      if (item.subjectType === 1) {
        return item.subjects.map((sub: any) => ({
          id: sub.assignedId || sub.subjectId,
          name: sub.subject?.name || sub.subjectName,
          color: sub.subject?.color || sub.color || '#90caf9',
          totalLectures,
        }));
      }
      return [
        {
          id: item.subjects[0]?.assignedId || item.subjects[0]?.subjectId,
          name: item.subjects[0]?.subject?.name || item.subjects[0]?.subjectName,
          color: item.subjects[0]?.subject?.color || item.subjects[0]?.color || '#90caf9',
          totalLectures,
        },
      ];
    });
  }, [subjectTableData]);

  return (
    <Card
      // elevation={2}
      sx={{
        width: '280px',
        height: '100%',
        // border: 1,
        ml: 1,
        mt: 1,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        boxShadow: 'var(--shadows-4)',
      }}
    >
      {isSubjectsLoading || isSubjectsFetching ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          <Skeleton variant="text" width={100} height={32} />
          <Skeleton variant="text" width={140} height={20} />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      ) : subjects.length > 0 ? (
        <>
          <Box sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight="600">
              Subjects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag to schedule
            </Typography>
          </Box>
          <Scrollbar sx={{ height: '100%' }}>
            <List sx={{ maxHeight: 'unset', height: '100%' }}>
              {subjects.map((sub) => (
                <SubjectCard
                  key={sub.id}
                  subject={sub}
                  placedCount={placedCounts[sub.id] || 0}
                  totalSubjects={sub.totalSubjects || 0}
                />
              ))}
            </List>
          </Scrollbar>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            mt: 2,
            mb: 2,
          }}
        >
          <Button
            startIcon={<Add />}
            size="small"
            variant="contained"
            onClick={() => {
              weeklyLecturesDialog.onTrue();
            }}
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
        />
      </CustomDialog>
    </Card>
  );
};

export default SubjectPalette;
