import React from 'react';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import TeacherSelectionFields from '../TeacherSelectionFields';

import type { TeacherOption } from '../teacherOptions';

interface SubjectSetupSectionProps {
  subjectCode: string;
  teacherObjs: TeacherOption[];
  fetchTeacherOptions: (
    query: string,
    page?: number
  ) => Promise<{ data: TeacherOption[]; hasMore: boolean }>;
  onTeachersChange: (newValues: TeacherOption[]) => void;
  getError: (field: string) => any;
  onChange: (field: string, value: unknown) => void;
}

export const SubjectSetupSection: React.FC<SubjectSetupSectionProps> = ({
  subjectCode,
  teacherObjs,
  fetchTeacherOptions,
  onTeachersChange,
  getError,
  onChange,
}) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 4 }}>
      <ShakingTextField error={!!getError('subjectCode')}>
        <TextField
          fullWidth
          label="Subject code"
          required
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
      teacherObjs={teacherObjs}
      fetchTeacherOptions={fetchTeacherOptions}
      onChange={onTeachersChange}
      getError={getError}
    />
  </Grid>
);
