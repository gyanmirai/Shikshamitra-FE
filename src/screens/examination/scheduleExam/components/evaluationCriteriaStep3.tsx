import type { FormikProps } from 'formik';

import { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Grid, Radio, Button, RadioGroup, Typography, FormControlLabel } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import type { IExamFormValues } from '../type';

const EvaluationCriteria = (props: FormikProps<IExamFormValues>) => {
  const formik = props;
  // State to track whether to use predefined or custom rubric
  const [rubricType, setRubricType] = useState<'predefined' | 'custom'>('predefined');
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Rubric Selection
          </Typography>
          <RadioGroup
            row
            value={rubricType}
            onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
          >
            <FormControlLabel value="predefined" control={<Radio />} label="Predefined Rubric" />
            <FormControlLabel value="custom" control={<Radio />} label="Custom Rubric" />
          </RadioGroup>
        </Grid>
        <Grid item xs={12} md={6}>
          {rubricType === 'predefined' ? (
            <CustomSelect
              options={[]}
              label="Predefined Rubrics"
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
            />
          ) : (
            <Button variant="contained" startIcon={<Add />}>
              Create New Rubric
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
export default EvaluationCriteria;
