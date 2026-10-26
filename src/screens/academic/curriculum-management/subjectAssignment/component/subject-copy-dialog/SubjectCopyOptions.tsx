import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Grid, Stack, Switch, Divider, Typography } from '@mui/material';

import { SubjectCopyChoiceCard } from './SubjectCopyChoiceCard';

import type { SubjectCopyFormState } from './types';

type Props = { form: SubjectCopyFormState };

type ToggleRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      sx={{ py: 1 }}
    >
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Switch
        size="small"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        slotProps={{ input: { 'aria-label': label } }}
      />
    </Stack>
  );
}

export function SubjectCopyOptions({ form }: Props) {
  return (
    <FormSectionCard
      icon={GlobalIcons.stationaryIcon}
      title="Copy Settings"
      descriptionTooltip="Supporting data is optional. Existing destination settings stay protected by default."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <Typography variant="subtitle2">Include supporting data</Typography>
            <ToggleRow
              label="Documents and links"
              description="Reference files and learning resources"
              checked={form.includeDocuments}
              onChange={form.setIncludeDocuments}
            />
            <Divider />
            <ToggleRow
              label="Teacher assignments"
              description="Primary and secondary teachers"
              checked={form.includeTeachers}
              onChange={form.setIncludeTeachers}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              If a subject already exists
            </Typography>
            <Stack spacing={2} role="radiogroup" aria-label="Existing subject behavior">
              <SubjectCopyChoiceCard
                selected={form.conflictStrategy === 'SKIP'}
                label="Keep destination settings"
                description="Only add subjects that are missing."
                badge="Recommended"
                onSelect={() => form.setConflictStrategy('SKIP')}
              />
              <SubjectCopyChoiceCard
                selected={form.conflictStrategy === 'OVERWRITE'}
                label="Replace destination settings"
                description="Overwrite matching subject allocations."
                onSelect={() => form.setConflictStrategy('OVERWRITE')}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
