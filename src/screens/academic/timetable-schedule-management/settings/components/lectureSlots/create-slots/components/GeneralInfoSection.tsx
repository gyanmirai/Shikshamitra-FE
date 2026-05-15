import type { Standards } from 'src/types/school';

import React from 'react';
import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

interface IGeneralInfoSectionProps {
  classes: Standards[];
  className: string;
  previousClassSlots: string;
  classNameError?: string;
  previousClassError?: string;
  disabled?: boolean;
  isEdit?: boolean;
  hasData?: boolean;
  onChangeClassName: (val: string) => void;
  onChangePreviousClassSlots: (val: string) => void;
}

const GeneralInfoSection: React.FC<IGeneralInfoSectionProps> = ({
  classes,
  className,
  previousClassSlots,
  classNameError,
  previousClassError,
  disabled,
  isEdit,
  hasData,
  onChangeClassName,
  onChangePreviousClassSlots,
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
    </Grid>
  );
};

export default GeneralInfoSection;
