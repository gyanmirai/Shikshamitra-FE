import { GlobalIcons } from 'src/utils/icons';
import { Switch, FormControlLabel } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function RoomAssignmentToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <FormSectionCard
      title="Room Assignment"
      icon={GlobalIcons.building}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      descriptionTooltip="Optionally allocate rooms for each division and scheduled subject. Leave this off when room assignment is not needed."
      action={
        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Switch
              checked={checked}
              onChange={(event) => onChange(event.target.checked)}
              slotProps={{ input: { 'aria-label': 'Assign rooms' } }}
            />
          }
          label={checked ? 'Enabled' : 'Disabled'}
        />
      }
    />
  );
}
