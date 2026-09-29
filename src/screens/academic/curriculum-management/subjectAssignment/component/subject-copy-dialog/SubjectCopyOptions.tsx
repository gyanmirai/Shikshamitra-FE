import { Box, Grid, Stack, Paper, Switch, Divider, Typography } from '@mui/material';

import { SubjectCopyChoiceCard } from './SubjectCopyChoiceCard';
import { SubjectCopySectionHeading } from './SubjectCopySectionHeading';

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
        inputProps={{ 'aria-label': label }}
      />
    </Stack>
  );
}

export function SubjectCopyOptions({ form }: Props) {
  return (
    <Box component="section" aria-labelledby="copy-options-heading">
      <SubjectCopySectionHeading
        step={3}
        title="Review copy settings"
        description="Supporting data is optional. Existing destination settings stay protected by default."
      />

      <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
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
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              If a subject already exists
            </Typography>
            <Stack spacing={1} role="radiogroup" aria-label="Existing subject behavior">
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
