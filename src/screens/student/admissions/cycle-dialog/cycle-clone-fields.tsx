import type { AcademicYear } from 'src/types/school';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';

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
          <StudentFeedback
            notificationKey="STU-0041"
            presentation="inline"
            severity="info"
            onClose={() => setDismissedNotice('clone')}
            closeText="Dismiss copy information"
          >
            The copy is created as a draft. Offerings and applications are not copied.
          </StudentFeedback>
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={!name.trim()}>
          <TextField
            fullWidth
            required
            size="small"
            label="Cycle name"
            value={name}
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
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value.slice(0, 1000))}
        />
      </Grid>
    </>
  );
}
