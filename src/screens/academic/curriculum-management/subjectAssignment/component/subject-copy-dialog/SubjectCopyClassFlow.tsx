import type { Standards } from 'src/types/school';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
  Grid,
  Alert,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

type Props = {
  sourceClass: Standards | null;
  targetClassName?: string;
  eligibleClasses: Standards[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onChange: (value: Standards | null) => void;
};

export function SubjectCopyClassFlow(props: Props) {
  const { sourceClass, targetClassName, eligibleClasses, isLoading, hasError, onRetry, onChange } =
    props;
  const [sourceTouched, setSourceTouched] = useState(false);
  const sourceError = sourceTouched && !sourceClass && eligibleClasses.length > 0;

  return (
    <FormSectionCard
      icon={GlobalIcons.transfer}
      title="Source and Destination"
      descriptionTooltip="Choose the source class. The current class is already selected as the destination."
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 5.5 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={64} />
          ) : hasError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={onRetry}>
                  Retry
                </Button>
              }
            >
              Classes could not be loaded.
            </Alert>
          ) : (
            <ShakingTextField error={sourceError}>
              <Autocomplete
                size="small"
                options={eligibleClasses}
                getOptionLabel={(option) => option.name}
                value={sourceClass}
                onChange={(_, value) => onChange(value)}
                onBlur={() => setSourceTouched(true)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Source class"
                    placeholder="Select a class"
                    error={sourceError}
                    helperText={
                      eligibleClasses.length === 0
                        ? 'No other classes contain subjects.'
                        : sourceError
                          ? 'Select a source class.'
                          : undefined
                    }
                  />
                )}
                noOptionsText="No classes with subjects"
              />
            </ShakingTextField>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'grid', placeItems: 'center' }}>
          <Iconify
            icon="solar:arrow-right-outline"
            width={22}
            sx={{ color: 'text.disabled', transform: { xs: 'rotate(90deg)', sm: 'none' } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 5.5 }}>
          <Box>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Destination class
              </Typography>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {targetClassName || 'Current class'}
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
