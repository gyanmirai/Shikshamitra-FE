'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import CancelButton from 'src/components/cancel-button';
import CustomSelect from 'src/components/custom-select';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import {
  useGetAcademicYearMonthsQuery,
  useGetStandardFeeStructureQuery,
} from 'src/redux/finance/financeFeeStructure';
import {
  useAssignFeeStructureMutation,
  useGetStudentFeeStructureQuery,
} from 'src/redux/student/admission/admission-api';
import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardContent,
  DialogActions,
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

interface FeeHeadAssignment extends FeeHeadItem {
  selectedAmount?: number;
  payableMonth?: string;
  payableYear?: number;
  startPayableMonth?: string;
  startPayableYear?: number;
  endPayableMonth?: string;
  endPayableYear?: number;
}

interface Props {
  student: IInquiryData | null;
  handleClose: (e: any, isSubmit: boolean) => void;
}

const FeeStructureAssignmentForm = ({ student, handleClose }: Props) => {
  const [feeHeads, setFeeHeads] = useState<FeeHeadAssignment[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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

  const { data: academicYearMonthsData, isLoading: isMonthsLoading } =
    useGetAcademicYearMonthsQuery({ academicYearId: currentYear?.id }, { skip: !currentYear?.id });

  const monthOptions = useMemo(
    () =>
      academicYearMonthsData?.map((item: { month: number; year: number }) => ({
        label: `${FeeMonth[item.month]}-${item.year}`,
        value: `${item.month}-${item.year}`,
      })) || [],
    [academicYearMonthsData]
  );

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

        const heads: FeeHeadAssignment[] = (assignedStructureData?.feeHeads || []).map(
          (fh: any) => {
            const mapped: FeeHeadAssignment = {
              ...fh,
              selectedAmount: fh.selectedAmount ?? fh.amount,
            };

            if (fh.isOptional) {
              if (fh.isOneTime && fh.payableMonth !== null && fh.payableMonth !== undefined) {
                mapped.payableMonth = `${fh.payableMonth}-${fh.payableYear}`;
              } else if (
                !fh.isOneTime &&
                fh.startPayableMonth !== null &&
                fh.startPayableMonth !== undefined
              ) {
                mapped.startPayableMonth = `${fh.startPayableMonth}-${fh.startPayableYear}`;
                mapped.endPayableMonth = `${fh.endPayableMonth}-${fh.endPayableYear}`;
              }
            }

            return mapped;
          }
        );
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
        // Validate optional fee heads have amounts and proper month selections
        const invalidFeeHeads = feeHeads.filter((fh) => {
          const isSelectedOptional =
            fh.isOptional && formik.values.selectedFeeHeads.includes(fh.feeHeadId);

          if (isSelectedOptional) {
            // Amount validation for optional fees
            if (!fh.selectedAmount || fh.selectedAmount <= 0) {
              return true;
            }

            // Month validation based on one-time or recurring
            if (fh.isOneTime) {
              return !fh.payableMonth;
            }
            return !fh.startPayableMonth || !fh.endPayableMonth;
          }

          return false;
        });

        if (invalidFeeHeads.length > 0) {
          shikshaMitraToast.error({
            message:
              'Please provide all required payable month/year information for selected fee heads',
          });
          return;
        }

        const selectedFeeHeadsPayload = feeHeads
          .filter((fh) => formik.values.selectedFeeHeads.includes(fh.feeHeadId))
          .map((fh) => {
            const basePayload: any = { feeHeadId: fh.feeHeadId };

            if (fh.isOptional) {
              // Add custom amount for optional fees
              if (fh.selectedAmount && fh.selectedAmount > 0) {
                basePayload.amount = fh.selectedAmount;
              }

              // Add month(s) for optional fees
              if (fh.isOneTime && fh.payableMonth) {
                const [month, year] = fh.payableMonth.split('-');
                basePayload.payableMonth = Number(month);
                basePayload.payableYear = Number(year);
              } else if (!fh.isOneTime && fh.startPayableMonth && fh.endPayableMonth) {
                const [startMonth, startYear] = fh.startPayableMonth.split('-');
                const [endMonth, endYear] = fh.endPayableMonth.split('-');
                basePayload.startPayableMonth = Number(startMonth);
                basePayload.startPayableYear = Number(startYear);
                basePayload.endPayableMonth = Number(endMonth);
                basePayload.endPayableYear = Number(endYear);
              }
            } else {
              // Non-optional fees use amounts and months from fee structure (API)
              basePayload.amount = fh.amount;

              if (fh.isOneTime && fh.payableMonth !== null && fh.payableMonth !== undefined) {
                basePayload.payableMonth = fh.payableMonth;
                basePayload.payableYear = fh.payableYear;
              } else if (!fh.isOneTime) {
                // Recurring non-optional fees don't have specific months
              }
            }

            return basePayload;
          });

        const body = {
          studentId: student?.studentId,
          standardFeeStructureId: values.feeStructureId,
          selectedOptionalFeeHeadIds: values.selectedFeeHeads,
          feeHeadDetails: selectedFeeHeadsPayload,
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

  const updateFeeHeadDetail = (feeHeadId: string, field: keyof FeeHeadAssignment, value: any) => {
    const updated = feeHeads.map((fh) =>
      fh.feeHeadId === feeHeadId ? { ...fh, [field]: value } : fh
    );
    setFeeHeads(updated);
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
                const heads: FeeHeadAssignment[] = (selectedStructure?.feeHeads || []).map(
                  (fh: any) => {
                    const initialized: FeeHeadAssignment = {
                      ...fh,
                    };

                    // Initialize payableMonth as string format from API response
                    if (fh.isOneTime && fh.payableMonth !== null && fh.payableMonth !== undefined) {
                      initialized.payableMonth = `${fh.payableMonth}-${fh.payableYear}`;
                      initialized.payableYear = fh.payableYear;
                    }

                    return initialized;
                  }
                );
                setFeeHeads(heads);
              }}
              labelKey="name"
              valueKey="id"
              isLoading={
                financeLoading ||
                financeFetching ||
                assignedFetching ||
                assignedLoading ||
                isMonthsLoading
              }
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
                        Selected Fee Heads: {formik.values.selectedFeeHeads.length} of{' '}
                        {feeHeads.length}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox" />
                          <TableCell>Fee Head</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Monthly Amount</TableCell>
                          <TableCell>Payable Month-Year</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feeHeads?.map((item: FeeHeadAssignment) => {
                          const isSelected = item.isOptional
                            ? formik.values.selectedFeeHeads.includes(item.feeHeadId)
                            : true;

                          const getAmountError = () => {
                            if (!isSelected) return '';
                            if (!item.selectedAmount || item.selectedAmount <= 0) {
                              return 'Amount is required';
                            }
                            return '';
                          };

                          const getMonthError = () => {
                            if (!isSelected) return '';
                            if (item.isOptional && item.isOneTime && !item.payableMonth) {
                              return 'Month is required';
                            }
                            if (item.isOptional && !item.isOneTime) {
                              if (!item.startPayableMonth) return 'Start month is required';
                              if (!item.endPayableMonth) return 'End month is required';
                            }
                            return '';
                          };

                          return (
                            <TableRow
                              key={item.feeHeadId}
                              hover
                              selected={isSelected}
                              sx={{
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
                                {item.isOptional ? (
                                  <NumericFormatCustom
                                    size="small"
                                    fullWidth
                                    label="Monthly Amount"
                                    placeholder="0.00"
                                    value={item.selectedAmount || ''}
                                    disabled={!isSelected}
                                    onValueChange={(values) => {
                                      updateFeeHeadDetail(
                                        item.feeHeadId,
                                        'selectedAmount',
                                        values.floatValue ?? undefined
                                      );
                                    }}
                                    error={Boolean(getAmountError())}
                                    helperText={getAmountError()}
                                    sx={{
                                      '& .MuiInputBase-root': { height: 36 },
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'transparent',
                                      },
                                      width: 120,
                                    }}
                                  />
                                ) : (
                                  <Typography variant="subtitle2">
                                    {formatNumber(item.amount)}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {isSelected ? (
                                  <Stack spacing={0.5}>
                                    {item.isOptional && item.isOneTime ? (
                                      <CustomSelect
                                        label="Month *"
                                        options={monthOptions}
                                        value={item.payableMonth || ''}
                                        onChange={(value) =>
                                          updateFeeHeadDetail(item.feeHeadId, 'payableMonth', value)
                                        }
                                        labelKey="label"
                                        valueKey="value"
                                        size="small"
                                        error={Boolean(!item.payableMonth && isSelected)}
                                        helperText={
                                          !item.payableMonth && isSelected
                                            ? 'Month is required'
                                            : ''
                                        }
                                        formControlProps={{
                                          sx: { width: '100%', minWidth: 140 },
                                        }}
                                      />
                                    ) : item.isOptional && !item.isOneTime ? (
                                      <>
                                        <CustomSelect
                                          label="Start Month *"
                                          options={monthOptions}
                                          value={item.startPayableMonth || ''}
                                          onChange={(value) =>
                                            updateFeeHeadDetail(
                                              item.feeHeadId,
                                              'startPayableMonth',
                                              value
                                            )
                                          }
                                          labelKey="label"
                                          valueKey="value"
                                          size="small"
                                          error={Boolean(!item.startPayableMonth && isSelected)}
                                          helperText={
                                            !item.startPayableMonth && isSelected
                                              ? 'Start month is required'
                                              : ''
                                          }
                                          formControlProps={{
                                            sx: { width: '100%', minWidth: 140 },
                                          }}
                                        />
                                        <CustomSelect
                                          label="End Month *"
                                          options={monthOptions}
                                          value={item.endPayableMonth || ''}
                                          onChange={(value) =>
                                            updateFeeHeadDetail(
                                              item.feeHeadId,
                                              'endPayableMonth',
                                              value
                                            )
                                          }
                                          labelKey="label"
                                          valueKey="value"
                                          size="small"
                                          error={Boolean(!item.endPayableMonth && isSelected)}
                                          helperText={
                                            !item.endPayableMonth && isSelected
                                              ? 'End month is required'
                                              : ''
                                          }
                                          formControlProps={{
                                            sx: { width: '100%', minWidth: 140 },
                                          }}
                                        />
                                      </>
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        Fixed by Structure
                                      </Typography>
                                    )}
                                  </Stack>
                                ) : item.isOptional ? (
                                  <Typography variant="caption" color="text.secondary">
                                    -
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    Fixed by Structure
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
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
