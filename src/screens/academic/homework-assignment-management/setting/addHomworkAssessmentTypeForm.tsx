import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IAddCategoryProps } from './type';

export const AddCategory: React.FC<IAddCategoryProps> = ({
  open,
  onClose,
  onSubmit,
  data,
  isEdit,
}: IAddCategoryProps) => {
  const formik = useFormik({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      name: isEdit && data ? data?.name : '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
    }),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={1}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
            <Grid container spacing={1}>
              <Grid size={12}>
                <ShakingTextField error={formik.touched.name && Boolean(formik.errors.name)}>
                  <TextField
                    fullWidth
                    label="Type"
                    name="name"
                    size="small"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </ShakingTextField>
              </Grid>{' '}
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              type="submit"
              variant="contained"
              onClick={() => {
                onClose(null, false);
              }}
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </BackPopUpChecked>
  );
};
