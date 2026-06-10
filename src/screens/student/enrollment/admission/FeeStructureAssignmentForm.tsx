'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import { useGetStandardFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';
import {
  useAssignFeeStructureMutation,
  useGetStudentFeeStructureQuery,
} from 'src/redux/student/admission/admission-api';
import {
  Box,
  Grid,
  Card,
  Table,
  Paper,
  Stack,
  TableRow,
  Checkbox,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardContent,
  DialogActions,
  TableContainer,
} from '@mui/material';

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
  const [feeHeads, setFeeHeads] = useState([]);
  // Get student's assigned structure
  const {
    data: assignedStructureData,
    isFetching: assignedFetching,
    isLoading: assignedLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeStructureQuery,
    params: { studentId: student?.studentId },
    options: { skip: !student?.studentId || !student?.isFeeStructureAssigned },
  });
  // Get available fee structures for the standard
  const {
    data: financeFeeStructures,
    isFetching: financeFetching,
    isLoading: financeLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStandardFeeStructureQuery,
    params: { standardId: student?.standardId },
    options: { skip: !student?.standardId },
  });

  const [assignFeeStructure, { isLoading: isSubmitting }] = useQueryAndMutation({
    type: 'mutation',
    params: { studentId: student?.studentId },
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
          studentId: student?.studentId,
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

  const handleToggleFeeHead = (feeHeadId: string) => {
    const currentSelected = formik.values.selectedFeeHeads;
    const updated = currentSelected.includes(feeHeadId)
      ? currentSelected.filter((id) => id !== feeHeadId)
      : [...currentSelected, feeHeadId];
    formik.setFieldValue('selectedFeeHeads', updated);
  };
  const feeStructureOptions = useMemo(
    () =>
      (financeFeeStructures?.standardFeeStructures ?? [])
        .map((fs: any) => ({
          ...fs,
          name: `${fs.name}`,
        }))
        .filter((fs: any) => fs.status === FeeStructureLockStatusType.Locked),
    [financeFeeStructures]
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              fullWidth
              label="Select Fee Structure *"
              options={feeStructureOptions}
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
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">Fee Heads</Typography>
                    <Box textAlign="right">
                      <Typography variant="caption" color="text.secondary" display="block">
                        Selected Fee Heads:{' '}
                        {
                          feeHeads.filter((item: FeeHeadItem) =>
                            item.isOptional
                              ? formik.values.selectedFeeHeads.includes(item.feeHeadId)
                              : true
                          ).length
                        }{' '}
                        of {feeHeads.length}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">Total Amount: ₹</Typography>
                        <Typography variant="subtitle2" color="primary.main">
                          {formatNumber(
                            feeHeads.reduce((acc: number, item: FeeHeadItem) => {
                              const isSelected = item.isOptional
                                ? formik.values.selectedFeeHeads.includes(item.feeHeadId)
                                : true;
                              return acc + (isSelected ? item.amount : 0);
                            }, 0)
                          )}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox" />
                          <TableCell>Fee Head</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feeHeads?.map((item: FeeHeadItem) => {
                          const isSelected = item.isOptional
                            ? formik.values.selectedFeeHeads.includes(item.feeHeadId)
                            : true;

                          return (
                            <TableRow
                              key={item.feeHeadId}
                              hover
                              onClick={() => {
                                if (item.isOptional) {
                                  handleToggleFeeHead(item.feeHeadId);
                                }
                              }}
                              selected={isSelected}
                              sx={{
                                cursor: item.isOptional ? 'pointer' : 'default',
                                bgcolor: isSelected
                                  ? (theme) => varAlpha(theme.palette.success.mainChannel, 0.08)
                                  : 'inherit',
                              }}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  color="success"
                                  checked={isSelected}
                                  disabled={!item.isOptional}
                                  onChange={() => {
                                    if (item.isOptional) {
                                      handleToggleFeeHead(item.feeHeadId);
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="subtitle2">{item.feeHeadName}</Typography>
                              </TableCell>
                              <TableCell>
                                {item.isOneTime ? (
                                  <Label color="info">One-Time</Label>
                                ) : (
                                  <Label color="default">Recurring</Label>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2">
                                  ₹ {formatNumber(item.amount)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
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
