import { Label } from 'src/components/label';
import { Box, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

interface SubjectImpactStatusCardProps {
  isInUse: boolean;
}

export function SubjectImpactStatusCard({ isInUse }: SubjectImpactStatusCardProps) {
  return (
    <FormSectionCard
      icon={isInUse ? 'solar:shield-warning-linear' : 'solar:shield-check-linear'}
      title={isInUse ? 'Impact & System Restrictions' : 'Safe to Modify or Delete'}
      description={
        isInUse
          ? 'Review the current restrictions before changing or removing this subject.'
          : 'This subject has no active academic dependencies.'
      }
    >
      <Stack spacing={1.25}>
        <Box>
          <Label color="default" variant="soft">
            {isInUse ? 'Restricted Deletion' : 'Fully Modifiable'}
          </Label>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {isInUse
            ? 'Deletion is restricted while curriculum, timetable, examination, or other dependent records reference this subject.'
            : 'You can safely edit or delete this subject because it is not referenced by active records.'}
        </Typography>

        {isInUse && (
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Recommendation:{' '}
            </Box>
            Archive instead of deletion when this subject is no longer actively taught.
          </Typography>
        )}
      </Stack>
    </FormSectionCard>
  );
}
