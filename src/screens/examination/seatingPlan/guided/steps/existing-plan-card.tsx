import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

const STATUS_LABELS: Record<number, string> = {
  0: 'Not started',
  1: 'In progress',
  2: 'Ready',
  3: 'Needs attention',
  4: 'Completed',
  5: 'Published',
};

export function ExistingPlanCard({
  plan,
  selected,
  isExaminationPublished,
  canEdit,
  canDelete,
  onOpen,
  onEdit,
  onDelete,
}: {
  plan: SeatingPlanGroupDto;
  selected: boolean;
  isExaminationPublished: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const deleteDisabled = plan.allocatedStudents > 0;
  const statusLabel =
    isExaminationPublished || plan.status !== 5 ? STATUS_LABELS[plan.status] : 'Ready';

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: selected ? 'primary.main' : 'divider',
        borderWidth: selected ? 2 : 1,
        bgcolor: selected ? 'action.selected' : 'background.paper',
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1">{plan.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {plan.subjects.map((subject) => subject.subjectName).join(', ')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {plan.subjects.length === 1 ? 'Individual' : 'Shared'} · {plan.scheduleCount}{' '}
                schedule{plan.scheduleCount === 1 ? '' : 's'} · {plan.allocatedStudents} of{' '}
                {plan.totalStudents} seated
              </Typography>
            </Stack>
            <Chip size="small" variant="outlined" label={statusLabel ?? 'Draft'} />
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              disabled={!canEdit || isExaminationPublished}
              onClick={onOpen}
            >
              {plan.allocatedStudents > 0 ? 'Edit seating' : 'Configure seating'}
            </Button>
            {!isExaminationPublished && (
              <Button variant="text" disabled={!canEdit} onClick={onEdit}>
                Edit subjects
              </Button>
            )}
            {!isExaminationPublished && canDelete && (
              <Button color="error" variant="text" disabled={deleteDisabled} onClick={onDelete}>
                Delete empty plan
              </Button>
            )}
          </Stack>
          {deleteDisabled && !isExaminationPublished && canDelete && (
            <Typography variant="caption" color="text.secondary">
              Use “Reset all draft seating” to remove plans that already contain seat assignments.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
