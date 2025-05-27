import type { FormikProps } from 'formik';

import { useState } from 'react';

import { Box, Grid } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import UploadDocument from 'src/components/upload-document/uploadDocument';

import RubricCreationForm from '../../settings/rubricManagement/rubricCreationForm';

import type { IExamFormValues } from '../type';

const EvaluationCriteria = (props: FormikProps<IExamFormValues>) => {
  /** State to control the visibility of rubric creation dialog */
  const rubricCreationDialog = useBoolean();

  /** Formik instance for form handling */
  const formik = props;

  /**
   * State to manage rubric selection type
   * @type {'predefined' | 'custom'} - 'predefined' for existing rubrics, 'custom' for new rubric creation
   */
  const [rubricType, setRubricType] = useState<'predefined' | 'custom'>('predefined');

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {/* Document upload component for rubric files */}
          <UploadDocument
            formik={formik}
            name="rubric"
            title="Upload Rubric"
            accept={{ 'application/pdf': [] }}
          />
        </Grid>
        {/* Commented out rubric selection UI */}
        {/* <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Rubric Selection
          </Typography>
          {/* Radio group for selecting rubric type */}
        {/* <RadioGroup
            row
            value={rubricType}
            onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
          >
            <FormControlLabel value="predefined" control={<Radio />} label="Predefined Rubric" />
            <FormControlLabel value="custom" control={<Radio />} label="Custom Rubric" />
          </RadioGroup>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Conditional rendering based on rubric type */}
        {/* {rubricType === 'predefined' ? (
            <CustomSelect
              options={[]}
              label="Predefined Rubrics"
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
            />
          ) : (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                rubricCreationDialog.onTrue();
              }}
              size="small"
            >
              Create New Rubric
            </Button>
          )}
        </Grid> */}
      </Grid>
      {/* Dialog for creating new rubric */}
      <CustomDialog
        maxWidth="sm"
        open={rubricCreationDialog.value}
        handleClose={rubricCreationDialog.onFalse}
        title="New Rubric"
      >
        <RubricCreationForm onClose={rubricCreationDialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};
export default EvaluationCriteria;
