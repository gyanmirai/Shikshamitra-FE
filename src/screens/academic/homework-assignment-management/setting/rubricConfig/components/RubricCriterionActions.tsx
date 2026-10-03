import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import {
  Stack,
  Switch,
  Tooltip,
  IconButton,
  FormControlLabel,
} from '@mui/material';

type RubricCriterionActionsProps = {
  criterionNumber: number;
  isRequired: boolean;
  canDelete: boolean;
  onRequiredChange: (isRequired: boolean) => void;
  onDelete: () => void;
};

export function RubricCriterionActions({
  criterionNumber,
  isRequired,
  canDelete,
  onRequiredChange,
  onDelete,
}: RubricCriterionActionsProps) {
  const actionLabel = `Criterion ${criterionNumber} actions`;
  const deleteLabel = `Delete criterion ${criterionNumber}`;

  return (
    <Stack
      role="group"
      aria-label={actionLabel}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={1}
      sx={{ minHeight: 40 }}
    >
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={isRequired}
            onChange={(event) => onRequiredChange(event.target.checked)}
            slotProps={{ input: { 'aria-label': `Criterion ${criterionNumber} required` } }}
          />
        }
        label="Required"
        sx={{ m: 0 }}
      />
      <Tooltip
        title={canDelete ? deleteLabel : 'A rubric must contain at least one criterion'}
        arrow
      >
        <span>
          <IconButton
            size="small"
            color="error"
            aria-label={deleteLabel}
            disabled={!canDelete}
            onClick={onDelete}
            sx={{
              width: 40,
              height: 40,
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <Iconify icon={GlobalIcons.delete} width={18} />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
