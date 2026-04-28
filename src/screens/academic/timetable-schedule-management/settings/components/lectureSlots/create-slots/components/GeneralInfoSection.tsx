import type { Standards } from 'src/types/school';

import React from 'react';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

interface IGeneralInfoSectionProps {
  classes: Standards[];
  className: string;
  schoolHours: string;
  previousClassSlots: string;
  classNameError?: string;
  schoolHoursError?: string;
  previousClassError?: string;
  disabled?: boolean;
  isEdit?: boolean;
  hasData?: boolean;
  onChangeClassName: (val: string) => void;
  onChangePreviousClassSlots: (val: string) => void;
  onChangeSchoolHours: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GeneralInfoSection: React.FC<IGeneralInfoSectionProps> = ({
  classes,
  className,
  schoolHours,
  previousClassSlots,
  classNameError,
  schoolHoursError,
  previousClassError,
  disabled,
  isEdit,
  hasData,
  onChangeClassName,
  onChangePreviousClassSlots,
  onChangeSchoolHours,
}) => {
  const lockedByEdit = disabled || (isEdit && !!hasData);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField error={Boolean(classNameError)}>
          <CustomSelect
            options={classes}
            value={className}
            onChange={(val) => onChangeClassName(val as string)}
            label="Class *"
            labelKey="name"
            valueKey="id"
            formControlProps={{ fullWidth: true }}
            error={Boolean(classNameError)}
            helperText={classNameError}
            disabled={lockedByEdit}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField error={Boolean(schoolHoursError)}>
          <TextField
            fullWidth
            label="School Hours *"
            name="schoolHours"
            value={schoolHours || '07:00 AM - 12:30 PM'}
            onChange={onChangeSchoolHours}
            size="small"
            disabled
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField error={Boolean(previousClassError)}>
          <CustomSelect
            options={classes}
            value={previousClassSlots}
            onChange={(val) => onChangePreviousClassSlots(val as string)}
            label="Slots From Other Class"
            labelKey="name"
            valueKey="id"
            formControlProps={{ fullWidth: true }}
            error={Boolean(previousClassError)}
            helperText={previousClassError}
            disabled={lockedByEdit}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
};

export default GeneralInfoSection;
