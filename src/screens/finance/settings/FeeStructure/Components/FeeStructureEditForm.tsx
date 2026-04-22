import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Button, DialogActions } from '@mui/material';
import React, { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useSaveStandardFeeStructuresMutation } from 'src/redux/finance/financeFeeStructure';

import FeeStructureStep from './FeeStructureStep2';
import { getInitialFeeStructureData } from './FeeStructureInitialValues';

import type { IFeeStructureEditFormProps } from '../type';

const FeeStructureEditForm: React.FC<IFeeStructureEditFormProps> = ({ editData, onClose }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [classList, setClassList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch class list by medium
  const [getClassByMedium, { data: classes }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  // Save mutation
  const [saveStandardFeeStructures] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveStandardFeeStructuresMutation,
  });

  // Initial values from editData
  const initialValues = useMemo(
    () => getInitialFeeStructureData(currentYear, editData),
    [currentYear, editData]
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Transform form data to update payload — API expects one object per class
        const classEntries = Object.entries(
          values.feeStructureClasses as Record<string, any[]>
        ).filter(([_, structures]) => structures.length > 0);

        await Promise.all(
          classEntries.map(([classId, structures]) =>
            saveStandardFeeStructures({
              feeStructureId: values.id,
              body: {
                standardId: classId,
                standardFeeStructures: structures.map((s) => ({
                  name: s.name,
                  feeHeads: s.feeHeads.map((fh: any) => ({
                    feeHeadId: fh.feeHeadId,
                    amount: fh.amount,
                    isOneTime: fh.isOneTime,
                    isOptional: fh.isOptional,
                  })),
                })),
              },
            }).unwrap()
          )
        );

        shikshaMitraToast.success({
          message: `Standard fee structures saved successfully`,
        });
        onClose(null, true);
      } catch (error) {
        console.error('Failed to save fee structure:', error);
        shikshaMitraToast.error({
          message: `Failed to save fee structure`,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch classes when medium is available from editData
  useEffect(() => {
    if (editData?.mediumId) {
      getClassByMedium(editData.mediumId);
    }
  }, [editData?.mediumId, getClassByMedium]);

  // Store class list for FeeStructureStep2
  useEffect(() => {
    if (classes?.length > 0) {
      setClassList(classes);
    }
  }, [classes]);

  return (
    <motion.div
      key="edit-form"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
          <Box display="flex" flexDirection="column" height="100%">
            <Scrollbar sx={{ p: 2, height: '100%' }}>
              <FeeStructureStep formik={formik as any} classList={classList} />
            </Scrollbar>

            <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
              <Button
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                onClick={() => onClose(null, false)}
                variant="outlined"
                size="small"
              >
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                size="small"
                disabled={isSubmitting}
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                loading={isSubmitting}
              >
                Submit
              </LoadingButton>
            </DialogActions>
          </Box>
        </form>
      </BackPopUpChecked>
    </motion.div>
  );
};

export default FeeStructureEditForm;
