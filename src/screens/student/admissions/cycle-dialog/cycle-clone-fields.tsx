import type { AcademicYear } from 'src/types/school';

import { Alert, Grid, IconButton, TextField } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { CycleConfigurationState } from './use-cycle-configuration';

export function CycleCloneFields({
  academicYears,
  state,
}: {
  academicYears: AcademicYear[];
  state: CycleConfigurationState;
}) {
  const {
    name,
    nameError,
    setName,
    description,
    setDescription,
    academicYearId,
    setAcademicYearId,
    dismissedNotice,
    setDismissedNotice,
  } = state;
  return (
    <>
      {dismissedNotice !== 'clone' && (
        <Grid size={{ xs: 12 }}>
          <Alert
            severity="info"
            variant="outlined"
            icon={<Iconify icon="mdi:information-outline" width={18} />}
            action={
              <IconButton
                aria-label="Dismiss copy information"
                size="small"
                onClick={() => setDismissedNotice('clone')}
              >
                <Iconify icon="mdi:close" width={18} />
              </IconButton>
            }
            sx={{
              width: '100%',
              alignItems: 'center',
              py: 0.5,
              px: 1.5,
              '& .MuiAlert-icon': { alignItems: 'center', py: 0, mr: 1 },
              '& .MuiAlert-message': { py: 0, minWidth: 0 },
              '& .MuiAlert-action': { alignItems: 'center', py: 0, pl: 1, mr: 0 },
            }}
          >
            The copy is created as a draft. Offerings and applications are not copied.
          </Alert>
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={Boolean(nameError)}>
          <TextField
            fullWidth
            required
            size="small"
            label="Cycle name"
            value={name}
            error={Boolean(nameError)}
            helperText={nameError}
            onChange={(event) => setName(event.target.value.slice(0, 128))}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={!academicYearId}>
          <CustomSelect
            label="Academic year"
            name="academicYearId"
            value={academicYearId}
            options={academicYears.map((year) => ({ value: year.id, label: year.name }))}
            onChange={(value) => setAcademicYearId(String(value))}
            formControlProps={{ required: true }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value.slice(0, 1000))}
        />
      </Grid>
    </>
  );
}
