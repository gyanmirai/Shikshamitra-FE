import type { Standards } from 'src/types/school';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Grid,
  Alert,
  Paper,
  Button,
  Skeleton,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import { SubjectCopySectionHeading } from './SubjectCopySectionHeading';

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

  return (
    <Box component="section" aria-labelledby="copy-source-heading">
      <SubjectCopySectionHeading
        step={1}
        title="Choose where to copy from"
        description="The current class is already selected as the destination."
      />

      <Grid container spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
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
            <Autocomplete
              size="small"
              options={eligibleClasses}
              getOptionLabel={(option) => option.name}
              value={sourceClass}
              onChange={(_, value) => onChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Source class"
                  placeholder="Select a class"
                  helperText={
                    eligibleClasses.length === 0 ? 'No other classes contain subjects.' : undefined
                  }
                />
              )}
              noOptionsText="No classes with subjects"
            />
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
          <Paper
            variant="outlined"
            sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.neutral', minHeight: 64 }}
          >
            <Typography variant="caption" color="text.secondary">
              Destination class
            </Typography>
            <Typography variant="subtitle2" noWrap>
              {targetClassName || 'Current class'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
