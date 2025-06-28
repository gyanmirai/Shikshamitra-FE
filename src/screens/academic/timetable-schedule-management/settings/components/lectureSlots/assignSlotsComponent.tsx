'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

const AssignSlots = ({ onClose }: { onClose: (e: any, isSubmit: boolean) => void }) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
  }, [medium]);

  const formik = useFormik({
    initialValues: {
      classNames: [] as string[],
    },
    onSubmit: (values) => {
      console.log('Selected classes:', values.classNames);
      onClose?.(null, true);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '120px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                options={allClass}
                value={formik.values.classNames}
                onChange={(val) => formik.setFieldValue('classNames', val)}
                label="Class"
                multiple
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
            </Grid>
          </Grid>
        </Scrollbar>

        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            size="small"
            onClick={() => onClose?.(null, false)}
          >
            Cancel
          </Button>
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            size="small"
            type="submit"
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default AssignSlots;
