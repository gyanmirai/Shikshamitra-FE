import type {
  SeatingSubjectDto,
  SeatingPlanGroupDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { formatSession } from '../workflow-utils';

export function SubjectOption({
  subject,
  owner,
  checked,
  onToggle,
}: {
  subject: SeatingSubjectDto;
  owner?: SeatingPlanGroupDto;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <FormControlLabel
      disabled={Boolean(owner)}
      control={<Checkbox checked={checked} onChange={onToggle} />}
      label={
        <Stack spacing={0.2}>
          <Typography variant="subtitle2">{subject.subjectName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {formatSession(subject)}
            {owner ? ` · Already in “${owner.name}”` : ''}
          </Typography>
        </Stack>
      }
      sx={{
        m: 0,
        px: 1.5,
        py: 0.75,
        minHeight: 60,
        border: '1px solid',
        borderColor: checked ? 'primary.main' : 'divider',
        borderRadius: 1.5,
        bgcolor: checked ? 'action.selected' : 'background.paper',
      }}
    />
  );
}
