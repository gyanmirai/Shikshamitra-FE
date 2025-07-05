'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { Stack, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';

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
    validationSchema: Yup.object({
      classNames: Yup.array().min(1, 'Please select at least one class'),
    }),
    onSubmit: (values) => {
      console.log('Selected classes:', values.classNames);
      shikshaMitraToast.success({ message: 'Slots assign successfully to class ' });
      onClose?.(null, true);
    },
  });

  return (
    <Stack component="form" onSubmit={formik.handleSubmit} spacing={0}>
      <Stack spacing={0} p={2}>
        <ShakingTextField error={formik.touched.classNames && Boolean(formik.errors.classNames)}>
          <CustomSelect
            options={allClass}
            value={formik.values.classNames}
            onChange={(val) => {
              formik.setFieldValue('classNames', val);
              formik.setFieldTouched('classNames', true, true);
            }}
            label="Class"
            multiple
            labelKey="name"
            valueKey="id"
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
    </Stack>
  );
};

export default AssignSlots;
