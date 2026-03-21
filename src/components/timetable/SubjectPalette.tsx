import React from 'react';
import { useDrag } from 'react-dnd';
import { Add } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/useBoolean';
import { Box, List, Card, Button, ListItem, Typography } from '@mui/material';
import CreateNoOfLecture from 'src/screens/academic/timetable-schedule-management/settings/components/weekly-lectures/createWeeklyLectures';

import { ItemTypes } from './types';
import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import CustomDialog from '../custom-dialog';
import CustomTooltip from '../custom-tooltip';

import type { Subject } from './types';

interface SubjectCardProps {
  subject: Subject;
  placedCount: number;
  totalSubjects: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, placedCount, totalSubjects }) => {
  const isFull = placedCount >= (subject.totalLectures || 0);
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
        {placedCount} / {subject.totalLectures}
      </Typography>
    </ListItem>
  );
};

interface PaletteProps {
  subjects: Subject[];
  placedCounts: Record<string, number>;
  selectedClass: string;
  selectedDivision: string;
}

const SubjectPalette: React.FC<PaletteProps> = ({
  subjects,
  placedCounts,
  selectedClass,
  selectedDivision,
}) => {
  const weeklyLecturesDialog = useBoolean();

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
      {subjects.length > 0 ? (
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
