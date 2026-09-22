import type { AdmissionEligibilityCriterion } from 'src/redux/student/admissions/admission-eligibility-policy';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Grid, Stack, Button, TextField, Typography } from '@mui/material';

import { ADMISSION_DATE_FORMAT } from '../../admission-date-formats';

type Props = {
  value: AdmissionEligibilityCriterion;
  readOnly: boolean;
  onChange: (value: AdmissionEligibilityCriterion) => void;
};

function AgeBound({
  label,
  months,
  readOnly,
  onChange,
}: {
  label: string;
  months?: number | null;
  readOnly: boolean;
  onChange: (value: number | null) => void;
}) {
  const change = (text: string, part: 'years' | 'months') => {
    if (text === '') {
      onChange(
        part === 'years' ? (months ?? 0) % 12 || null : Math.floor((months ?? 0) / 12) * 12 || null
      );
      return;
    }
    const entered = Number(text);
    if (!Number.isInteger(entered) || entered < 0 || entered > (part === 'years' ? 100 : 11))
      return;
    const current = months ?? 0;
    onChange(
      part === 'years' ? entered * 12 + (current % 12) : Math.floor(current / 12) * 12 + entered
    );
  };
  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2">{label} (optional)</Typography>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={`${label} years`}
            disabled={readOnly}
            value={months == null ? '' : Math.floor(months / 12)}
            onChange={(event) => change(event.target.value, 'years')}
            slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={`${label} months`}
            disabled={readOnly}
            value={months == null ? '' : months % 12}
            onChange={(event) => change(event.target.value, 'months')}
            slotProps={{ htmlInput: { min: 0, max: 11, step: 1 } }}
          />
        </Grid>
      </Grid>
      {!readOnly && months != null && (
        <Button size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => onChange(null)}>
          Clear {label.toLowerCase()}
        </Button>
      )}
    </Stack>
  );
}

export function EligibilityAgeFields({ value, onChange, readOnly }: Props) {
  return (
    <Stack spacing={1.5}>
      <AgeBound
        label="Minimum age"
        months={value.minAgeMonths}
        readOnly={readOnly}
        onChange={(minAgeMonths) => onChange({ ...value, minAgeMonths })}
      />
      <AgeBound
        label="Maximum age"
        months={value.maxAgeMonths}
        readOnly={readOnly}
        onChange={(maxAgeMonths) => onChange({ ...value, maxAgeMonths })}
      />
      <DatePicker
        label="Age cutoff date *"
        format={ADMISSION_DATE_FORMAT}
        enableAccessibleFieldDOMStructure={false}
        value={value.cutoffDate ? dayjs(value.cutoffDate) : null}
        disabled={readOnly}
        onChange={(date) =>
          onChange({
            ...value,
            cutoffDate: date?.isValid() ? date.format('YYYY-MM-DD') : null,
          })
        }
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            required: true,
            helperText:
              'Age is checked on this fixed date, using the applicant or linked student date of birth.',
          },
        }}
      />
      <Typography variant="caption" color="text.secondary">
        Set at least one limit. Age uses completed calendar months; the maximum includes the
        selected month. Leap-day birthdays use 28 February in non-leap years.
      </Typography>
    </Stack>
  );
}
