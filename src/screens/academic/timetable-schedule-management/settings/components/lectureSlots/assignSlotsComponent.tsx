'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Stack, Button, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAssignLectureSlotToClassesMutation } from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

interface AssignSlotsProps {
  onClose: (e: any, isSubmit: boolean) => void;
  lectureSlotId?: string;
}

const AssignSlots = ({ onClose, lectureSlotId }: AssignSlotsProps) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [assignLectureSlot, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignLectureSlotToClassesMutation,
  });

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
    onSubmit: async (values) => {
      const res = await assignLectureSlot({
        lectureSlotId,
        body: { standardIds: values.classNames },
      });
      if (res.data) {
        shikshaMitraToast.success({
          message: 'Slots assigned successfully.',
        });
        onClose?.(null, true);
      }
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
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          size="small"
          variant="contained"
          loading={isLoading}
          onClick={() => formik.handleSubmit()}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

export default AssignSlots;
