'use client';

import type { AcademicYear } from 'src/types/school';
import type {
  AdmissionCycle,
  CloneAdmissionCycle,
  ScheduleAdmissionCycle,
  UpdateAdmissionCycleWindow,
} from 'src/redux/student/admissions/admission-cycles-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { Grid, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { CycleCloneFields } from './cycle-dialog/cycle-clone-fields';
import { CycleWindowFields } from './cycle-dialog/cycle-window-fields';
import { CycleScheduleFields } from './cycle-dialog/cycle-schedule-fields';
import { useCycleConfiguration } from './cycle-dialog/use-cycle-configuration';

export type CycleConfigurationMode = 'clone' | 'window' | 'schedule';

type Payload = CloneAdmissionCycle | UpdateAdmissionCycleWindow | ScheduleAdmissionCycle;
export type AdmissionCycleConfigurationProps = {
  mode: CycleConfigurationMode | null;
  cycle: AdmissionCycle | null;
  academicYears: AcademicYear[];
  busy: boolean;
  onClose: () => void;
  onConfirm: (payload: Payload) => Promise<void>;
};

const titles: Record<CycleConfigurationMode, string> = {
  clone: 'Clone Admission Cycle',
  window: 'Revise Application Window',
  schedule: 'Schedule Admission Cycle',
};

const descriptions: Record<CycleConfigurationMode, string> = {
  clone:
    'Create a new draft cycle from this configuration without copying offerings or applications.',
  window: 'Change the application window while keeping linked offering dates within the cycle.',
  schedule: 'Choose future publish and close times using the institution timezone.',
};

export function AdmissionCycleConfigurationDialog({
  mode,
  cycle,
  academicYears,
  busy,
  onClose,
  onConfirm,
}: AdmissionCycleConfigurationProps) {
  const state = useCycleConfiguration({ mode, cycle, busy, onClose, onConfirm });
  const { guard, requestClose, disabled, submit, reason, setReason } = state;
  if (!mode || !cycle) return null;
  return (
    <CustomDialog
      open
      handleClose={requestClose}
      guardUnsavedChanges={false}
      disableClose={busy}
      formProps={{
        onSubmit: (event) => {
          event.preventDefault();
          if (!disabled) submit();
        },
      }}
      title={
        <AdmissionDialogTitle
          title={titles[mode]}
          helpText={descriptions[mode]}
          helpLabel="Cycle configuration information"
        />
      }
      maxWidth="sm"
    >
      <DialogScrollContent>
        <FormSectionCard
          title="Cycle Configuration"
          icon={GlobalIcons.admissionDetails}
          descriptionTooltip={descriptions[mode]}
        >
          <Grid container spacing={1.5}>
            {mode === 'clone' && <CycleCloneFields academicYears={academicYears} state={state} />}
            {(mode === 'clone' || mode === 'window') && <CycleWindowFields state={state} />}
            {mode === 'window' && (
              <Grid size={{ xs: 12 }}>
                <ShakingTextField error={!reason.trim()}>
                  <TextField
                    sx={{ mt: 1.5 }}
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    size="small"
                    label="Reason for revising the window"
                    value={reason}
                    onChange={(event) => setReason(event.target.value.slice(0, 500))}
                    helperText={`${reason.length}/500 characters`}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {mode === 'schedule' && <CycleScheduleFields status={cycle.status} state={state} />}
          </Grid>
        </FormSectionCard>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <LoadingButton
          size="small"
          variant="outlined"
          onClick={requestClose}
          disabled={busy}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          size="small"
          variant="contained"
          type="submit"
          loading={busy}
          disabled={disabled}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
      {guard.confirmation}
    </CustomDialog>
  );
}
