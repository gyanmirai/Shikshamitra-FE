import type {
  AdmissionTrack,
  AdmissionEntryMode,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useId } from 'react';
import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { admissionTrackLabels } from './admission-offering-model';

type Feedback = { error?: boolean; helperText?: string };
type Routing = { track: AdmissionTrack; entryMode: AdmissionEntryMode };

export function AdmissionOfferingRoutingFields({
  values,
  onChange,
  onBlur,
  locked = false,
  feedback = {},
}: {
  values: Routing;
  onChange: (routing: Routing) => void;
  onBlur: (field: keyof Routing) => void;
  locked?: boolean;
  feedback?: Partial<Record<keyof Routing, Feedback>>;
}) {
  const typeLabelId = useId();
  const typeFeedback = {
    error: Boolean(feedback.track?.error || feedback.entryMode?.error),
    helperText: feedback.track?.helperText || feedback.entryMode?.helperText,
  };

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <ShakingTextField error={typeFeedback.error}>
          <CustomSelect
            label="Admission type"
            required
            name="track"
            labelId={typeLabelId}
            SelectDisplayProps={{ 'aria-labelledby': typeLabelId }}
            size="small"
            value={values.track}
            options={admissionTrackLabels.map((label, value) => ({ label, value }))}
            disabled={locked}
            onChange={(value) => {
              const track = Number(value) as AdmissionTrack;
              if (track === values.track) return;
              onChange({ track, entryMode: track === 0 ? 0 : 1 });
            }}
            onBlur={() => onBlur('track')}
            {...typeFeedback}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}
