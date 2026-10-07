import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

type ScheduleExamPreviewActionsProps = {
  canEdit?: boolean;
  exam: any;
  onClose: () => void;
  onEdit?: (exam: any) => void;
  onPublish?: (exam: any) => void;
  onViewTimetable?: (exam: any) => void;
};

export function ScheduleExamPreviewActions({
  canEdit,
  exam,
  onClose,
  onEdit,
  onPublish,
  onViewTimetable,
}: ScheduleExamPreviewActionsProps) {
  const isPending = Number(exam?.status) === examScheduledStatus.Pending;

  return (
    <Box
      component="footer"
      sx={{
        px: { xs: 1, sm: 1.5 },
        py: 1,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'var(--shadows-8)',
      }}
    >
      <Button variant="outlined" color="inherit" onClick={onClose}>
        Close
      </Button>
      {onViewTimetable && (
        <Button
          variant={isPending && onPublish ? 'outlined' : 'contained'}
          startIcon={<Iconify icon={GlobalIcons.eye} />}
          onClick={() => onViewTimetable(exam)}
        >
          View timetable
        </Button>
      )}
      {canEdit && onEdit && isPending && (
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.edit} />}
          onClick={() => onEdit(exam)}
        >
          Edit
        </Button>
      )}
      {onPublish && isPending && (
        <Button
          color="inherit"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.publish} />}
          onClick={() => onPublish(exam)}
          sx={{
            bgcolor: 'text.primary',
            color: 'background.paper',
            '&:hover': { bgcolor: 'text.secondary' },
          }}
        >
          Publish exam
        </Button>
      )}
    </Box>
  );
}
