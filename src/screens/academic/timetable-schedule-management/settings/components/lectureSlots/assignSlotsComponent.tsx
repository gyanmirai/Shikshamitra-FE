'use client';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

const AssignSlots = () => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                options={classData?.items || []}
                value={[]}
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Class"
                // isLoading={isLoading}
                multiple
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                  <FormHelperText error>{formik.errors.className}</FormHelperText>
                )} */}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            type="submit"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
export default AssignSlots;
