import type { TransferSection } from 'src/redux/library/campus-transfer-api';

import { GlobalIcons } from 'src/utils/icons';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { CirculationDateField } from '../circulation/CirculationDateField';

export type DispatchFields = {
  sourceSectionId: string;
  destinationSectionId: string;
  destinationShelfId: string;
  dispatchedOn: string;
  reason: string;
};
export const initialDispatch: DispatchFields = {
  sourceSectionId: '',
  destinationSectionId: '',
  destinationShelfId: '',
  dispatchedOn: '',
  reason: '',
};
const label = (row: TransferSection) => ({
  id: row.location.sectionId,
  name: `${row.location.campus} / ${row.location.section}`,
});

export default function CampusDispatchFields({
  value,
  sections,
  disabled,
  change,
  error,
  blur,
}: {
  value: DispatchFields;
  sections: TransferSection[];
  disabled: boolean;
  change: (value: DispatchFields) => void;
  error: (field: keyof DispatchFields) => string | undefined;
  blur: (field: keyof DispatchFields) => void;
}) {
  const feedback = (field: keyof DispatchFields) => ({
    error: Boolean(error(field)),
    helperText: error(field),
    onBlur: () => blur(field),
  });
  const source = sections.find((row) => row.location.sectionId === value.sourceSectionId);
  const destinations = sections.filter(
    (row) => row.location.campusId !== source?.location.campusId
  );
  const shelves =
    destinations.find((row) => row.location.sectionId === value.destinationSectionId)?.shelves ??
    [];
  return (
    <FormSectionCard title="Transfer route" icon={GlobalIcons.documentIcon}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Source section"
            name="sourceSectionId"
            {...feedback('sourceSectionId')}
            value={value.sourceSectionId}
            options={sections.map(label)}
            size="small"
            required
            disabled={disabled}
            onChange={(event) =>
              change({
                ...value,
                sourceSectionId: String(event),
                destinationSectionId: '',
                destinationShelfId: '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Destination section"
            name="destinationSectionId"
            {...feedback('destinationSectionId')}
            value={value.destinationSectionId}
            options={destinations.map(label)}
            size="small"
            required
            disabled={disabled || !source}
            onChange={(event) =>
              change({
                ...value,
                destinationSectionId: String(event),
                destinationShelfId: '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Destination shelf"
            name="destinationShelfId"
            {...feedback('destinationShelfId')}
            value={value.destinationShelfId}
            options={shelves}
            size="small"
            required
            disabled={disabled || !shelves.length}
            onChange={(event) => change({ ...value, destinationShelfId: String(event) })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CirculationDateField
            name="dispatchedOn"
            label="Dispatch date"
            value={parseDateOnly(value.dispatchedOn)}
            disabled={disabled}
            onBlur={() => blur('dispatchedOn')}
            error={error('dispatchedOn')}
            onChange={(date) => change({ ...value, dispatchedOn: toDateOnly(date) || '' })}
          />
        </Grid>
        <Grid size={12}>
          <ShakingTextField error={Boolean(error('reason'))}>
            <TextField
              value={value.reason}
              name="reason"
              label="Transfer reason"
              {...feedback('reason')}
              multiline
              minRows={2}
              required
              fullWidth
              size="small"
              disabled={disabled}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              onChange={(event) => change({ ...value, reason: event.target.value })}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
