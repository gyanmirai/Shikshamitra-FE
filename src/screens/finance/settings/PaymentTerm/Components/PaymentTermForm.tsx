import type { FormikErrors } from 'formik';
import type { Board, AcademicYear } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialPaymentTermData } from './PaymentTermInitialValues';
import { paymentTermValidationSchema } from './PayementTermValidationSchema';

import type { IInstallment, IFeeStructureFormProps } from '../type';

const PaymentTermForm: React.FC<IFeeStructureFormProps> = ({ open, onClose, editData }) => {
  // Fetch academic year data using custom query hook
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });

  // Lazy query hook to fetch classes by medium
  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  // Fetch board data using custom query hook
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  // Local state to store filtered boards based on academic year
  const [boards, setBoards] = useState([]);

  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values, populated from editData if available
    initialValues: getInitialPaymentTermData(editData),
    validationSchema: paymentTermValidationSchema,
    validateOnChange: true,
    // Handle form submission
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Payment Term ${values.paymentTermName} updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Payment Term ${values.paymentTermName} added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  const [selectedAcademicYear, setSelectedAcademicYear] = useState();

  const [installments, setInstallments] = useState(formik.values.installments || []);

  // Update installments when number changes
  useEffect(() => {
    const count = Number(formik.values.totalInstallments || 0);

    if (count > 0) {
      // Calculate default percentage per installment
      // Calculate equal percentage for all installments
      const equalPercentage = Math.round(100 / count);
      const updated = Array.from({ length: count }, (_, i) => ({
        index: i,
        id: i + 1,
        installmentName: formik.values.installments?.[i]?.installmentName || '',
        percentage: equalPercentage,
        dueDate: formik.values.installments?.[i]?.dueDate || null,
      }));

      setInstallments(updated);
      formik.setFieldValue('installments', updated);
    } else {
      setInstallments([]);
      formik.setFieldValue('installments', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.totalInstallments]);

  console.log('formik values----', formik.values);

  useEffect(() => {
    if (editData) {
      // Filter boards based on academic year ID from edit data
      const findBoards = board?.items.filter(
        (item: Board) => item.academicYearId === editData.academicYear
      );
      setBoards(findBoards);
      const year = academicYear?.items?.find(
        (item: AcademicYear) => item.id === formik.values.academicYear
      );
      setSelectedAcademicYear(year?.name || '');

      // Fetch classes if education medium ID exists in edit data
      if (editData.medium) {
        getClassByMedium(editData.medium);
      }
    }
  }, [academicYear?.items, board?.items, editData, formik.values.academicYear, getClassByMedium]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ShakingTextField
                  error={!!(formik.touched.paymentTermName && formik.errors.paymentTermName)}
                >
                  <TextField
                    fullWidth
                    name="paymentTermName"
                    label="Payment Term Name *"
                    value={formik.values.paymentTermName || ''}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.paymentTermName && formik.errors.paymentTermName)}
                    helperText={formik.touched.paymentTermName && formik.errors.paymentTermName}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <ShakingTextField
                  error={!!(formik.touched.totalInstallments && formik.errors.totalInstallments)}
                >
                  <TextField
                    fullWidth
                    name="totalInstallments"
                    label="Total Installments *"
                    type="number"
                    inputProps={{ min: 1, max: 20 }}
                    value={formik.values.totalInstallments || ''}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.totalInstallments && formik.errors.totalInstallments)}
                    helperText={formik.touched.totalInstallments && formik.errors.totalInstallments}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <ShakingTextField
                  error={!!(formik.touched.academicYear && formik.errors.academicYear) || false}
                >
                  <CustomSelect
                    name="academicYear"
                    label="Academic Year *"
                    isLoading={yearLoading}
                    options={academicYear?.items || []}
                    value={formik.values.academicYear || ''}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value) => {
                      const findBoards = board?.items.filter(
                        (item: Board) => item.academicYearId === value
                      );
                      setBoards(findBoards);
                      formik.setFieldValue('board', '');
                      formik.setFieldValue('medium', '');
                      formik.setFieldValue('academicYear', value);
                    }}
                    error={!!(formik.touched.academicYear && formik.errors.academicYear) || false}
                    helperText={(formik.touched.academicYear && formik.errors.academicYear) || ''}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <ShakingTextField error={!!(formik.touched.board && formik.errors.board) || false}>
                  <CustomSelect
                    name="board"
                    label="Board *"
                    isLoading={boardLoading}
                    options={boards || []}
                    labelKey="name"
                    valueKey="id"
                    value={formik.values.board || ''}
                    onChange={(value) => {
                      formik.setFieldValue('medium', '');
                      formik.setFieldValue('board', value);
                    }}
                    error={!!(formik.touched.board && formik.errors.board) || false}
                    helperText={(formik.touched.board && formik.errors.board) || ''}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    disabled={!formik.values.academicYear}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <ShakingTextField
                  error={!!(formik.touched.medium && formik.errors.medium) || false}
                >
                  <CustomSelect
                    name="medium"
                    label="Medium *"
                    disabled={!formik.values.board}
                    options={
                      board?.items?.find((item: Board) => item.id === formik.values.board)
                        ?.educationMediums || []
                    }
                    value={formik.values.medium || ''}
                    labelKey="name"
                    valueKey="id"
                    onChange={async (value) => {
                      formik.setFieldValue('medium', value);
                      formik.setFieldValue('feeStructureClasses', {});
                      await getClassByMedium(value);
                    }}
                    error={!!(formik.touched.medium && formik.errors.medium) || false}
                    helperText={(formik.touched.medium && formik.errors.medium) || ''}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>

            {/* Installments Table with CustomizableTable */}
            {installments.length > 0 && (
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <strong>Installments</strong>
                  </Grid>
                  <Grid item xs={12}>
                    <CustomizableTable
                      tableContainerProps={{ sx: { maxHeight: '300px' } }}
                      tableId="installments-table"
                      isSearch={false}
                      isFilter={false}
                      isPagination={false}
                      columns={[
                        {
                          id: 'id',
                          label: 'Sr No.',
                          render(value, row) {
                            return <span>{row.id}</span>;
                          },
                        },
                        {
                          id: 'installmentName',
                          label: 'Installment Name *',
                          render(value, row) {
                            return (
                              <TextField
                                fullWidth
                                size="small"
                                label="Installment Name *"
                                name={`installments.${row.index}.installmentName`}
                                value={formik.values.installments[row.index]?.installmentName || ''}
                                onChange={(e) => {
                                  const updated = [...installments];
                                  updated[row.index].installmentName = e.target.value;
                                  setInstallments(updated);
                                }}
                                variant="outlined"
                                sx={{
                                  mb: 1.5,
                                  width: '100%',
                                  padding: '0',
                                  borderRadius: 1,
                                }}
                                error={
                                  !!(
                                    formik?.touched?.installments?.[row.index]?.installmentName &&
                                    Array.isArray(formik?.errors?.installments) &&
                                    typeof formik?.errors?.installments?.[row.index] === 'object' &&
                                    (
                                      formik.errors.installments[
                                        row.index
                                      ] as FormikErrors<IInstallment>
                                    )?.installmentName
                                  )
                                }
                                helperText={
                                  formik?.touched?.installments?.[row.index]?.installmentName &&
                                  Array.isArray(formik?.errors?.installments) &&
                                  typeof formik?.errors?.installments?.[row.index] === 'object' &&
                                  (
                                    formik.errors.installments[
                                      row.index
                                    ] as FormikErrors<IInstallment>
                                  )?.installmentName
                                    ? (
                                        formik.errors.installments[
                                          row.index
                                        ] as FormikErrors<IInstallment>
                                      )?.installmentName
                                    : ''
                                }
                              />
                            );
                          },
                        },
                        {
                          id: 'percentage',
                          label: 'Percentage *',
                          render(value, row) {
                            return (
                              <TextField
                                fullWidth
                                size="small"
                                disabled
                                type="number"
                                label="Percentage *"
                                name={`installments.${row.index}.percentage`}
                                inputProps={{ min: 0, max: 100 }}
                                value={formik.values.installments[row.index]?.percentage || ''}
                                onChange={(e) => {
                                  const updated = [...installments];
                                  updated[row.index].percentage = Number(e.target.value);
                                  setInstallments(updated);
                                }}
                                variant="outlined"
                                sx={{
                                  mb: 1.5,
                                  width: '100%',
                                  padding: '0',
                                  borderRadius: 1,
                                }}
                                error={
                                  !!(
                                    formik?.touched?.installments?.[row.index]?.percentage &&
                                    Array.isArray(formik?.errors?.installments) &&
                                    typeof formik?.errors?.installments?.[row.index] === 'object' &&
                                    (
                                      formik.errors.installments[
                                        row.index
                                      ] as FormikErrors<IInstallment>
                                    )?.percentage
                                  )
                                }
                                helperText={
                                  formik?.touched?.installments?.[row.index]?.percentage &&
                                  Array.isArray(formik?.errors?.installments) &&
                                  typeof formik?.errors?.installments?.[row.index] === 'object' &&
                                  (
                                    formik.errors.installments[
                                      row.index
                                    ] as FormikErrors<IInstallment>
                                  )?.percentage
                                    ? (
                                        formik.errors.installments[
                                          row.index
                                        ] as FormikErrors<IInstallment>
                                      )?.percentage
                                    : ''
                                }
                              />
                            );
                          },
                        },
                        {
                          id: 'dueDate',
                          label: 'Due Date *',
                          render(value, row) {
                            return (
                              <DatePicker
                                name={`installments.${row.index}.dueDate`}
                                label="Due Date *"
                                value={
                                  formik.values.installments[row.index]?.dueDate
                                    ? dayjs(formik.values.installments[row.index]?.dueDate)
                                    : null
                                }
                                onChange={(newValue) => {
                                  const updated = [...installments];
                                  updated[row.index].dueDate = newValue;
                                  setInstallments(updated);
                                }}
                                format="DD-MM-YYYY"
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: 'small',
                                    variant: 'outlined',
                                    sx: {
                                      mb: 1.5,
                                      width: '100%',
                                      padding: '0',
                                      borderRadius: 1,
                                    },
                                    error: !!(
                                      formik?.touched?.installments?.[row.index]?.dueDate &&
                                      Array.isArray(formik?.errors?.installments) &&
                                      typeof formik?.errors?.installments?.[row.index] ===
                                        'object' &&
                                      (
                                        formik.errors.installments[
                                          row.index
                                        ] as FormikErrors<IInstallment>
                                      )?.dueDate
                                    ),
                                    helperText:
                                      formik?.touched?.installments?.[row.index]?.dueDate &&
                                      Array.isArray(formik?.errors?.installments) &&
                                      typeof formik?.errors?.installments?.[row.index] ===
                                        'object' &&
                                      (
                                        formik.errors.installments[
                                          row.index
                                        ] as FormikErrors<IInstallment>
                                      )?.dueDate
                                        ? (
                                            formik.errors.installments[
                                              row.index
                                            ] as FormikErrors<IInstallment>
                                          )?.dueDate
                                        : '',
                                  },
                                }}
                              />
                            );
                          },
                        },
                      ]}
                      data={installments} // Changed from formik.values.installments to installments
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Academic Year, Board, Medium Selects */}
          </Scrollbar>
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                onClose(null, false);
              }}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={editData ? 16 : 20}
                  height={editData ? 16 : 20}
                />
              }
              type="submit"
              size="small"
              variant="contained"
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default PaymentTermForm;
