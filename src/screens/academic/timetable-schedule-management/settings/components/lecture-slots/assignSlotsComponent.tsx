'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Stack, Button, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/custom-dialog';

const AssignSlots = ({ onClose }: { onClose: (e: any, isSubmit: boolean) => void }) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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
    validationSchema: Yup.object({
      classNames: Yup.array().min(1, 'Please select at least one class'),
    }),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Slots assign successfully to class ${values.classNames}`,
      });
      onClose?.(null, true);
    },
  });

  return (
    <Box>
      <DialogScrollContent>
        <Stack spacing={0}>
          <ShakingTextField error={formik.touched.classNames && Boolean(formik.errors.classNames)}>
            <CustomSelect
              options={allClass}
              value={formik.values.classNames}
              onChange={(val) => {
                formik.setFieldValue('classNames', val);
              }}
              label="Class"
              multiple
              labelKey="name"
              valueKey="name"
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={formik.touched.classNames && Boolean(formik.errors.classNames)}
              helperText={
                formik.touched.classNames && typeof formik.errors.classNames === 'string'
                  ? formik.errors.classNames
                  : undefined
              }
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>

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
          variant="contained"
          form="dialog-form"
          onClick={() => formik.handleSubmit()}
        >
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AssignSlots;
