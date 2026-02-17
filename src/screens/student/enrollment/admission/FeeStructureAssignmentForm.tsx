'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetStandardFeeStructureQuery as useGetFinanceFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';
import {
  Grid,
  Card,
  Stack,
  Checkbox,
  Typography,
  CardContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  useAssignFeeStructureMutation,
  useGetStandardFeeStructureQuery as useGetAssignedFeeStructureQuery,
} from 'src/redux/student/admission/admission-api';

import type { IInquiryData } from '../Inquiry/type';

interface FeeHeadItem {
  feeHeadId: string;
  feeHeadName: string;
  amount: number;
  isOneTime: boolean;
  isOptional: boolean;
  categoryName: string;
}

interface Props {
  student: IInquiryData | null;
  handleClose: (e: any, isSubmit: boolean) => void;
}

const FeeStructureAssignmentForm = ({ student, handleClose }: Props) => {
  const theme = useTheme();
  console.log('student0000', student?.standardId);
  const [feeHeads, setFeeHeads] = useState([]);
  // Get student's assigned structure
  const {
    data: assignedStructureData,
    isFetching: assignedFetching,
    isLoading: assignedLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignedFeeStructureQuery,
    params: student?.id,
    options: { skip: !student?.id },
  });
  // Get available fee structures for the standard
  const {
    data: financeFeeStructures,
    isFetching: financeFetching,
    isLoading: financeLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinanceFeeStructureQuery,
    params: { standardId: student?.standardId },
    options: { skip: !student?.standardId },
  });

  const [assignFeeStructure, { isLoading: isSubmitting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignFeeStructureMutation,
  });

  // Pre-populate if structure is already assigned
  useEffect(() => {
    if (assignedStructureData) {
      const assignedId = assignedStructureData?.standardFeeStructureId;
      if (assignedId) {
        formik.setFieldValue('feeStructureId', assignedId);

        const heads = assignedStructureData?.feeHeads || [];
        setFeeHeads(heads);

        // Filter only optional heads that are selected
        const selectedOptionalHeads = heads
          .filter((item: any) => item.isOptional && item.isSelected)
          .map((item: any) => item.feeHeadId);

        formik.setFieldValue('selectedFeeHeads', selectedOptionalHeads);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedStructureData]);

  const formik = useFormik({
    initialValues: {
      feeStructureId: '',
      selectedFeeHeads: [] as string[],
    },
    validationSchema: Yup.object({
      feeStructureId: Yup.string().required('Fee Structure is required'),
    }),
    onSubmit: async (values) => {
      try {
        const body = {
          studentId: student?.id,
          standardFeeStructureId: values.feeStructureId,
          selectedOptionalFeeHeadIds: values.selectedFeeHeads,
        };

        await assignFeeStructure({ body }).unwrap();
        shikshaMitraToast.success({ message: 'Fee structure assigned successfully' });
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  console.log('formik----values----', formik.values);

  const handleToggleFeeHead = (feeHeadId: string) => {
    const currentSelected = formik.values.selectedFeeHeads;
    const updated = currentSelected.includes(feeHeadId)
      ? currentSelected.filter((id) => id !== feeHeadId)
      : [...currentSelected, feeHeadId];
    formik.setFieldValue('selectedFeeHeads', updated);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              fullWidth
              label="Select Fee Structure *"
              options={
                financeFeeStructures?.standardFeeStructures?.map((fs: any) => ({
                  ...fs,
                  name: `${fs.name}`,
                })) || []
              }
              disabled={!!assignedStructureData?.standardFeeStructureId}
              value={formik.values.feeStructureId}
              onChange={(value) => {
                formik.setFieldValue('feeStructureId', value);
                const selectedStructure = financeFeeStructures?.standardFeeStructures?.find(
                  (fs: any) => fs.id === value
                );
                const heads = selectedStructure?.feeHeads || [];
                setFeeHeads(heads);
              }}
              labelKey="name"
              valueKey="id"
              isLoading={financeLoading || financeFetching || assignedFetching || assignedLoading}
              error={formik.touched.feeStructureId && Boolean(formik.errors.feeStructureId)}
              helperText={
                (formik.touched.feeStructureId && (formik.errors.feeStructureId as string)) || ''
              }
            />
          </Grid>

          {formik.values.feeStructureId && feeHeads?.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Fee Heads
              </Typography>
              <Grid container spacing={2}>
                {feeHeads?.map((item: FeeHeadItem) => {
                  const isSelected = item.isOptional
                    ? formik.values.selectedFeeHeads.includes(item.feeHeadId)
                    : true;

                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={item.feeHeadId}>
                      <Card
                        variant="outlined"
                        sx={{
                          position: 'relative',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'grey.100' : 'background.paper',
                          transition: 'all 0.3s',
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">{item.feeHeadName}</Typography>
                              <Typography variant="h6">₹ {formatNumber(item.amount)}</Typography>
                              <Stack direction="row" spacing={1}>
                                {item.isOneTime && <Label color="info">One-Time</Label>}
                              </Stack>
                            </Stack>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={!!isSelected}
                                  disabled={!item.isOptional}
                                  onChange={() => handleToggleFeeHead(item.feeHeadId)}
                                />
                              }
                              label=""
                              sx={{ mr: 0 }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          )}
        </Grid>
      </DialogScrollContent>

      <DialogActions>
        <CancelButton onClick={() => handleClose(null, false)} />
        <LoadingButton
          loading={isSubmitting}
          onClick={(e: any) => formik.handleSubmit(e)}
          disabled={!formik.values.feeStructureId}
          variant="contained"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Assign Structure
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FeeStructureAssignmentForm;
