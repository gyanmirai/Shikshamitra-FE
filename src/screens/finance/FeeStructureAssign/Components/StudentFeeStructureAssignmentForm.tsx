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
  calculateTotalFees,
  parseMonthYearValue,
  getDefaultMonthlyAmount,
  hasInvalidRecurringRange,
} from 'src/utils/fee-structure-assignment-calculations';
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

interface FeeHeadItem {
  feeHeadId: string;
  feeHeadName: string;
  amount: number;
  isOneTime: boolean;
  isOptional: boolean;
  isRefundable?: boolean;
  categoryName: string;
  payableMonth?: number | string | null;
  payableYear?: number | null;
}

interface FeeHeadAssignment extends FeeHeadItem {
  isSelected?: boolean;
  selectedAmount?: number;
  startPayableMonth?: number | string;
  startPayableYear?: number;
  endPayableMonth?: number | string;
  endPayableYear?: number;
}

interface MonthOption {
  label: string;
  value: string;
}

type SelectValue = string | number | string[] | number[];

interface Props {
  student: {
    studentId?: string;
    standardId?: string;
    isFeeStructureAssigned?: boolean;
  } | null;
  handleClose: (e: any, isSubmit: boolean) => void;
}

const FeeStructureAssignmentForm = ({ student, handleClose }: Props) => {
  const [feeHeads, setFeeHeads] = useState<FeeHeadAssignment[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const feeMonthLookup = FeeMonth as unknown as Record<number, string>;
  const feeStructureSettingsPath = '/finance/settings/create-fee-structure';

  // Get student's assigned structure
  const {
    data: assignedStructureData,
    isFetching: assignedFetching,
    isLoading: assignedLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeStructureQuery,
		params: { studentId: student?.studentId, academicYearId: currentYear?.id },
		options: { skip: !student?.studentId || !student?.isFeeStructureAssigned || !currentYear?.id },
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

  const monthOptions = useMemo<MonthOption[]>(
    () =>
      academicYearMonthsData?.map((item: { month: number; year: number }) => ({
        label: `${FeeMonth[item.month]}-${item.year}`,
        value: `${item.month}-${item.year}`,
      })) || [],
    [academicYearMonthsData]
  );

  const defaultRecurringStartMonthYear = monthOptions[0]?.value;
  const defaultRecurringEndMonthYear = monthOptions[monthOptions.length - 1]?.value;

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
            const selectedAmountFromApi =
              fh.selectedAmount === null || fh.selectedAmount === undefined
                ? undefined
                : Number(fh.selectedAmount);

            const mapped = {
              feeHeadId: fh.feeHeadId,
              feeHeadName: fh.feeHeadName,
              amount: Number(fh.amount ?? 0),
              isOneTime: Boolean(fh.isOneTime),
              isOptional: Boolean(fh.isOptional),
              isSelected: Boolean(fh.isSelected),
              isRefundable: fh.isRefundable,
              categoryName: fh.categoryName,
              payableMonth: fh.payableMonth,
              payableYear:
                fh.payableYear === null || fh.payableYear === undefined
                  ? null
                  : Number(fh.payableYear),
              selectedAmount:
                selectedAmountFromApi !== undefined && Number.isFinite(selectedAmountFromApi)
                  ? selectedAmountFromApi
                  : getDefaultMonthlyAmount(Number(fh.amount ?? 0), Boolean(fh.isOneTime)),
            } as FeeHeadAssignment;

            if (fh.isOptional) {
              if (fh.isOneTime && fh.payableMonth !== null && fh.payableMonth !== undefined) {
                mapped.payableMonth = `${fh.payableMonth}-${fh.payableYear}`;
              }
            }

            if (!fh.isOneTime) {
              if (fh.startPayableMonth !== null && fh.startPayableMonth !== undefined) {
                mapped.startPayableMonth = `${fh.startPayableMonth}-${fh.startPayableYear}`;
                mapped.endPayableMonth = `${fh.endPayableMonth}-${fh.endPayableYear}`;
              } else {
                mapped.startPayableMonth = defaultRecurringStartMonthYear;
                mapped.endPayableMonth = defaultRecurringEndMonthYear;
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
  }, [assignedStructureData, defaultRecurringStartMonthYear, defaultRecurringEndMonthYear]);

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
            return (
              !fh.startPayableMonth ||
              !fh.endPayableMonth ||
              hasInvalidRecurringRange(
                fh.startPayableMonth,
                fh.endPayableMonth,
                fh.startPayableYear,
                fh.endPayableYear
              )
            );
          }

          return false;
        });

        if (invalidFeeHeads.length > 0) {
          shikshaMitraToast.error({
            message:
              'Please provide valid amount and payable month/year information for selected fee heads',
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
                const payableMonthYear = parseMonthYearValue(fh.payableMonth, fh.payableYear);
                if (payableMonthYear) {
                  basePayload.payableMonth = payableMonthYear.month;
                  basePayload.payableYear = payableMonthYear.year;
                }
              } else if (!fh.isOneTime && fh.startPayableMonth && fh.endPayableMonth) {
                const startMonthYear = parseMonthYearValue(
                  fh.startPayableMonth,
                  fh.startPayableYear
                );
                const endMonthYear = parseMonthYearValue(fh.endPayableMonth, fh.endPayableYear);
                if (startMonthYear && endMonthYear) {
                  basePayload.startPayableMonth = startMonthYear.month;
                  basePayload.startPayableYear = startMonthYear.year;
                  basePayload.endPayableMonth = endMonthYear.month;
                  basePayload.endPayableYear = endMonthYear.year;
                }
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

  const handleOpenFeeStructureSettings = () => {
    handleClose(null, false);
    window.location.assign(feeStructureSettingsPath);
  };

  const feeStructureEmptyState = (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: (theme) => `1px solid ${varAlpha(theme.palette.warning.mainChannel, 0.24)}`,
        bgcolor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.06),
      }}
    >
      <Typography variant="body2" fontWeight={600} color="text.primary">
        No locked fee structure is available for this class.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Create a fee structure or lock an existing one in Fee Structure settings to assign it.
      </Typography>
      <Typography
        component="button"
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleOpenFeeStructureSettings();
        }}
        sx={{
          mt: 1,
          p: 0,
          border: 'none',
          background: 'transparent',
          color: 'primary.main',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        Go to Fee Structure Settings
      </Typography>
    </Box>
  );

  const formatMonthYearDisplay = (value?: number | string | null, year?: number | null) => {
    const parsed = parseMonthYearValue(value, year);
    if (!parsed) {
      return 'Fixed by Structure';
    }

    return `${feeMonthLookup[parsed.month]}-${parsed.year}`;
  };

  const getMonthOptionIndex = (value?: number | string | null, year?: number | null) => {
    const parsed = parseMonthYearValue(value, year);
    if (!parsed) {
      return null;
    }

    return parsed.year * 12 + parsed.month;
  };

  const normalizeSelectValue = (value: SelectValue): string | number =>
    Array.isArray(value) ? (value[0] ?? '') : value;

  const isFeeStructureOptionsLoading =
    financeLoading || financeFetching || assignedFetching || assignedLoading || isMonthsLoading;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            {isFeeStructureOptionsLoading ? (
              <CustomSelect
                fullWidth
                label="Select Fee Structure *"
                options={[]}
                value=""
                onChange={() => {}}
                isLoading
              />
            ) : feeStructureOptions.length > 0 ? (
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
                      const mapped: FeeHeadAssignment = {
                        feeHeadId: fh.feeHeadId,
                        feeHeadName: fh.feeHeadName,
                        amount: fh.amount,
                        isOneTime: fh.isOneTime,
                        isOptional: fh.isOptional,
                        isRefundable: fh.isRefundable,
                        categoryName: fh.categoryName,
                        payableMonth: fh.payableMonth,
                        payableYear: fh.payableYear,
                        selectedAmount: getDefaultMonthlyAmount(
                          fh.amount ?? 0,
                          Boolean(fh.isOneTime)
                        ),
                      };

                      if (fh.isOptional && fh.isOneTime) {
                        mapped.payableMonth =
                          fh.payableMonth !== null && fh.payableMonth !== undefined
                            ? `${fh.payableMonth}-${fh.payableYear}`
                            : '';
                      }

                      if (!fh.isOneTime) {
                        mapped.startPayableMonth =
                          fh.startPayableMonth !== null && fh.startPayableMonth !== undefined
                            ? `${fh.startPayableMonth}-${fh.startPayableYear}`
                            : defaultRecurringStartMonthYear;
                        mapped.endPayableMonth =
                          fh.endPayableMonth !== null && fh.endPayableMonth !== undefined
                            ? `${fh.endPayableMonth}-${fh.endPayableYear}`
                            : defaultRecurringEndMonthYear;
                      }

                      return mapped;
                    }
                  );
                  setFeeHeads(heads);
                }}
                labelKey="name"
                valueKey="id"
                isLoading={isFeeStructureOptionsLoading}
                error={formik.touched.feeStructureId && Boolean(formik.errors.feeStructureId)}
                helperText={
                  (formik.touched.feeStructureId && (formik.errors.feeStructureId as string)) || ''
                }
              />
            ) : (
              feeStructureEmptyState
            )}
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
                          <TableCell align="right">Total Fees</TableCell>
                          <TableCell>Payable Month-Year</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feeHeads?.map((item: FeeHeadAssignment) => {
                          const isSelected = item.isOptional
                            ? formik.values.selectedFeeHeads.includes(item.feeHeadId)
                            : true;

                          const monthlyAmount =
                            item.selectedAmount ??
                            getDefaultMonthlyAmount(item.amount ?? 0, Boolean(item.isOneTime));

                          const isInvalidRecurringDateRange =
                            item.isOptional &&
                            !item.isOneTime &&
                            hasInvalidRecurringRange(
                              item.startPayableMonth,
                              item.endPayableMonth,
                              item.startPayableYear,
                              item.endPayableYear
                            );

                          const totalFees = calculateTotalFees({
                            isOneTime: item.isOneTime,
                            monthlyAmount,
                            startPayableMonth: item.startPayableMonth,
                            endPayableMonth: item.endPayableMonth,
                            startPayableYear: item.startPayableYear,
                            endPayableYear: item.endPayableYear,
                            fallbackTotal: item.isOptional ? undefined : item.amount,
                          });

                          const payableMonthNumber =
                            typeof item.payableMonth === 'number' ? item.payableMonth : null;

                          const oneTimeMonthValue =
                            typeof item.payableMonth === 'string'
                              ? item.payableMonth
                              : payableMonthNumber !== null && item.payableYear !== null
                                ? `${payableMonthNumber}-${item.payableYear}`
                                : '';

                          const isOptionalInputEditable = item.isOptional ? isSelected : false;

                          const startMonthIndex = getMonthOptionIndex(
                            item.startPayableMonth,
                            item.startPayableYear
                          );
                          const endMonthIndex = getMonthOptionIndex(
                            item.endPayableMonth,
                            item.endPayableYear
                          );

                          const startMonthOptions =
                            endMonthIndex === null
                              ? monthOptions
                              : monthOptions.filter(
                                  (option: MonthOption) =>
                                    (getMonthOptionIndex(option.value as string) ?? -Infinity) <=
                                    endMonthIndex
                                );

                          const endMonthOptions =
                            startMonthIndex === null
                              ? monthOptions
                              : monthOptions.filter(
                                  (option: MonthOption) =>
                                    (getMonthOptionIndex(option.value as string) ?? Infinity) >=
                                    startMonthIndex
                                );

                          const fixedPayableMonthLabel = formatMonthYearDisplay(
                            item.payableMonth,
                            item.payableYear
                          );

                          const startMonthLabel =
                            typeof item.startPayableMonth === 'string'
                              ? formatMonthYearDisplay(item.startPayableMonth)
                              : 'Fixed by Structure';
                          const endMonthLabel =
                            typeof item.endPayableMonth === 'string'
                              ? formatMonthYearDisplay(item.endPayableMonth)
                              : 'Fixed by Structure';
                          const oneTimeMonthLabel = oneTimeMonthValue
                            ? formatMonthYearDisplay(oneTimeMonthValue)
                            : fixedPayableMonthLabel;

                          const getAmountError = () => {
                            if (!isSelected) return '';
                            if (!item.selectedAmount || item.selectedAmount <= 0) {
                              return 'Amount is required';
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
                                {item.isOptional && isSelected ? (
                                  <NumericFormatCustom
                                    size="small"
                                    fullWidth
                                    label="Monthly Amount"
                                    placeholder="0.00"
                                    value={item.selectedAmount ?? ''}
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
                                    decimalScale={2}
                                    fixedDecimalScale={false}
                                    sx={{
                                      '& .MuiInputBase-root': { height: 36 },
                                      width: 120,
                                    }}
                                  />
                                ) : (
                                  <Typography variant="subtitle2">
                                    {formatNumber(monthlyAmount, 'INR')}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                {totalFees !== null ? (
                                  <Typography variant="subtitle2">
                                    {formatNumber(totalFees, 'INR')}
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ minWidth: 180 }}>
                                <Stack spacing={2.5} sx={{ width: '100%' }}>
                                  {item.isOneTime ? (
                                    item.isOptional && isOptionalInputEditable ? (
                                      <CustomSelect
                                        label="Month *"
                                        options={monthOptions}
                                        value={oneTimeMonthValue}
                                        onChange={(value) =>
                                          updateFeeHeadDetail(item.feeHeadId, 'payableMonth', value)
                                        }
                                        labelKey="label"
                                        valueKey="value"
                                        size="small"
                                        disabled={!isOptionalInputEditable}
                                        error={Boolean(
                                          !item.payableMonth && isOptionalInputEditable
                                        )}
                                        helperText={
                                          !item.payableMonth && isOptionalInputEditable
                                            ? 'Month is required'
                                            : ''
                                        }
                                        formControlProps={{
                                          sx: { width: '100%', minWidth: 160 },
                                        }}
                                      />
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        {oneTimeMonthLabel}
                                      </Typography>
                                    )
                                  ) : item.isOptional && isOptionalInputEditable ? (
                                    <>
                                      <CustomSelect
                                        label="Start Month *"
                                        options={startMonthOptions}
                                        value={item.startPayableMonth || ''}
                                        onChange={(value) => {
                                          const normalizedValue = normalizeSelectValue(value);
                                          updateFeeHeadDetail(
                                            item.feeHeadId,
                                            'startPayableMonth',
                                            normalizedValue
                                          );

                                          if (
                                            item.endPayableMonth &&
                                            hasInvalidRecurringRange(
                                              normalizedValue,
                                              item.endPayableMonth,
                                              item.startPayableYear,
                                              item.endPayableYear
                                            )
                                          ) {
                                            updateFeeHeadDetail(
                                              item.feeHeadId,
                                              'endPayableMonth',
                                              ''
                                            );
                                          }
                                        }}
                                        labelKey="label"
                                        valueKey="value"
                                        size="small"
                                        error={Boolean(!item.startPayableMonth)}
                                        helperText={
                                          !item.startPayableMonth ? 'Start month is required' : ''
                                        }
                                        formControlProps={{
                                          sx: { width: '100%', minWidth: 160 },
                                        }}
                                      />
                                      <CustomSelect
                                        label="End Month *"
                                        options={endMonthOptions}
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
                                        error={Boolean(
                                          !item.endPayableMonth || isInvalidRecurringDateRange
                                        )}
                                        helperText={
                                          !item.endPayableMonth
                                            ? 'End month is required'
                                            : isInvalidRecurringDateRange
                                              ? 'End month must be same or after start month'
                                              : ''
                                        }
                                        formControlProps={{
                                          sx: { width: '100%', minWidth: 160 },
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <Stack spacing={0.5}>
                                      <Typography variant="caption" color="text.secondary">
                                        Start: {startMonthLabel}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        End: {endMonthLabel}
                                      </Typography>
                                    </Stack>
                                  )}
                                </Stack>
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
