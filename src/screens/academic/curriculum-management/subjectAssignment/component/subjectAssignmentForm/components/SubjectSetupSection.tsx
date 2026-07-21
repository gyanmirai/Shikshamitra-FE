import React from 'react';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import TeacherSelectionFields from '../TeacherSelectionFields';

interface SubjectSetupSectionProps {
  index: number;
  subjectCode: string;
  primaryTeacherId: string;
  secondaryTeacherIds: string[];
  primaryTeacherObj: any;
  secondaryTeacherObjs: any[];
  fetchPrimaryTeacherOptions: any;
  fetchSecondaryTeacherOptions: any;
  onPrimaryChange: (newValue: any) => void;
  onSecondaryChange: (newValues: any[]) => void;
  getError: (field: string) => any;
  onChange: (field: string, value: unknown) => void;
  formik: any;
}

export const SubjectSetupSection: React.FC<SubjectSetupSectionProps> = ({
  index,
  subjectCode,
  primaryTeacherId,
  secondaryTeacherIds,
  primaryTeacherObj,
  secondaryTeacherObjs,
  fetchPrimaryTeacherOptions,
  fetchSecondaryTeacherOptions,
  onPrimaryChange,
  onSecondaryChange,
  getError,
  onChange,
  formik,
}) => (
  <Grid container spacing={1}>
    <Grid size={{ xs: 12, md: 4 }}>
      <ShakingTextField error={!!getError('subjectCode')}>
        <TextField
          fullWidth
          label="Subject Code *"
          placeholder="e.g. MATH-101"
          size="small"
          value={subjectCode || ''}
          onChange={(e) => {
            const uppercaseValue = e.target.value.toUpperCase().replace(/[^A-Z0-9\-_]/g, '');
            onChange('subjectCode', uppercaseValue);
          }}
          error={!!getError('subjectCode')}
          helperText={getError('subjectCode') || 'Auto-formatted to uppercase (e.g. MATH-101)'}
        />
      </ShakingTextField>
    </Grid>

    <TeacherSelectionFields
      index={index}
      primaryTeacherObj={primaryTeacherObj}
      secondaryTeacherObjs={secondaryTeacherObjs}
      secondaryTeacherIds={secondaryTeacherIds}
      primaryTeacherId={primaryTeacherId}
      fetchPrimaryTeacherOptions={fetchPrimaryTeacherOptions}
      fetchSecondaryTeacherOptions={fetchSecondaryTeacherOptions}
      onPrimaryChange={onPrimaryChange}
      onSecondaryChange={onSecondaryChange}
      getError={getError}
    />
  </Grid>
);
