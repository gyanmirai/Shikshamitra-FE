import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { DisciplineActionFormProps } from './type';

const DisciplineActionForm: React.FC<DisciplineActionFormProps> = ({
  dialog,
  onClose,
  editData,
}) => {
  const formik = useFormik({
    initialValues: {
      disciplineActionName: editData?.disciplineActionName || '',
      description: editData?.description || '',
    },
    validationSchema: Yup.object().shape({
      disciplineActionName: Yup.string().required('Discipline Action Name is required'),
      description: Yup.string().required('Description is required'),
    }),
    onSubmit: (values) => {
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={
                    !!(formik.touched.disciplineActionName && formik.errors.disciplineActionName)
                  }
                >
                  <TextField
                    size="small"
                    label="Discipline Action Name"
                    name="disciplineActionName"
                    fullWidth
                    value={formik.values.disciplineActionName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.disciplineActionName &&
                      Boolean(formik.errors.disciplineActionName)
                    }
                    helperText={
                      formik.touched.disciplineActionName && formik.errors.disciplineActionName
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description)}
                >
                  <TextField
                    size="small"
                    label="Description"
                    name="description"
                    fullWidth
                    multiline
                    minRows={2}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default DisciplineActionForm;
