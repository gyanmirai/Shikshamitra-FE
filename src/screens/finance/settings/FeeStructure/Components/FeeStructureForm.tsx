import type { Board, Standards, AcademicYear } from 'src/types/school';

import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Box,
  Chip,
  Card,
  Grid,
  Paper,
  Button,
  useTheme,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  FeeStructureClassStatusType,
  FeeStructureClassStatusTypeColors,
} from 'src/enums/fee-structure-statusType';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import FeeStructureCard from './FeeStructureCard';
import { getInitialFeeStructureData } from './FeeStructureInitialValues';
import { getFeeStructureValidationSchema } from './financeValidationSchema';

import type { IFeeStructureFormProps } from '../type';

const FeeStructureForm: React.FC<IFeeStructureFormProps> = ({ open, onClose, editData }) => {
  // Get MUI theme instance
  const theme = useTheme();

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
    initialValues: getInitialFeeStructureData(editData),
    validationSchema: getFeeStructureValidationSchema(),
    // Handle form submission
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Subject ${values.feeStructureName} updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Subject ${values.feeStructureName} added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  const [selectedAcademicYear, setSelectedAcademicYear] = useState();

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

  useEffect(() => {
    if (classes?.length > 0 && !editData) {
      const updatedClassWiseFees: Record<
        string,
        Array<{
          feeCategory: string;
          feeHead: string;
          amount: number;
          required: boolean;
        }>
      > = {};

      classes.forEach((classItem: Standards) => {
        const className = classItem.name; // adjust key based on your API

        updatedClassWiseFees[className] = [
          {
            feeCategory: 'Tuition Fee',
            feeHead: 'Monthly Fee',
            amount: 1000,
            required: true,
          },
        ];
      });
      formik.setFieldValue('feeStructureClasses', updatedClassWiseFees);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, editData, formik.values.medium]);

  return (
    <Card sx={{ height: '100%', boxShadow: 'none', background: 'transparent', mt: 1 }}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box
          component="form"
          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          onSubmit={formik.handleSubmit}
        >
          <Scrollbar
            sx={{
              px: 1,
              height: '100%',
            }}
          >
            <SectionCard title="General Information">
              <Grid item xs={4}>
                <ShakingTextField
                  error={
                    !!(formik.touched.feeStructureName && formik.errors.feeStructureName) || false
                  }
                >
                  <TextField
                    fullWidth
                    size="small"
                    name="feeStructureName"
                    label="Fee Structure Name *"
                    error={
                      formik.touched.feeStructureName && Boolean(formik.errors.feeStructureName)
                    }
                    helperText={
                      (formik.touched.feeStructureName && formik.errors.feeStructureName) as string
                    }
                    value={formik.values.feeStructureName}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      const capitalized = capitalize(onlyLetters);
                      formik.setFieldValue('feeStructureName', capitalized);
                    }}
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
                      formik.setFieldValue('feeStructureClasses', {});
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
                      formik.setFieldValue('class', '');
                      formik.setFieldValue('board', value);
                      formik.setFieldValue('feeStructureClasses', {});
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
              <Grid item xs={12} md={4}>
                <ShakingTextField
                  error={!!(formik.touched.receiptBook && formik.errors.receiptBook) || false}
                >
                  <CustomSelect
                    name="receiptBook"
                    label="Receipt Book *"
                    options={[
                      { id: 'book1', name: 'Receipt Book 1' },
                      { id: 'book2', name: 'Receipt Book 2' },
                      { id: 'book3', name: 'Receipt Book 3' },
                    ]}
                    value={formik.values.receiptBook}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value) => {
                      formik.setFieldValue('receiptBook', value);
                    }}
                    error={!!(formik.touched.receiptBook && formik.errors.receiptBook) || false}
                    helperText={(formik.touched.receiptBook && formik.errors.receiptBook) || ''}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <ShakingTextField
                  error={!!(formik.touched.paymentTerm && formik.errors.paymentTerm) || false}
                >
                  <CustomSelect
                    name="paymentTerm"
                    label="Payment Term *"
                    options={[
                      { id: 'monthly', name: 'Monthly' },
                      { id: 'quarterly', name: 'Quarterly' },
                      { id: 'halfYearly', name: 'Half Yearly' },
                      { id: 'yearly', name: 'Yearly' },
                    ]}
                    value={formik.values.paymentTerm}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value) => {
                      formik.setFieldValue('paymentTerm', value);
                    }}
                    error={!!(formik.touched.paymentTerm && formik.errors.paymentTerm) || false}
                    helperText={(formik.touched.paymentTerm && formik.errors.paymentTerm) || ''}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <ShakingTextField
                  error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod) || false}
                >
                  <CustomSelect
                    name="paymentMethod"
                    label="Payment Method *"
                    options={[
                      { id: 'cash', name: 'Cash' },
                      { id: 'cheque', name: 'Cheque' },
                      { id: 'upi', name: 'UPI' },
                      { id: 'netBanking', name: 'Net Banking' },
                      { id: 'debitCard', name: 'Debit Card' },
                      { id: 'creditCard', name: 'Credit Card' },
                    ]}
                    multiple
                    value={formik.values.paymentMethod}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value) => {
                      formik.setFieldValue('paymentMethod', value);
                    }}
                    error={!!(formik.touched.paymentMethod && formik.errors.paymentMethod) || false}
                    helperText={
                      (formik.touched.paymentMethod && formik.errors.paymentMethod) as string
                    }
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </ShakingTextField>
              </Grid>
            </SectionCard>
            {Object.keys(formik.values.feeStructureClasses).length > 0 && (
              <SectionCard title="Select Classes">
                <Grid item xs={12}>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {Object.keys(formik.values.feeStructureClasses).map((className) => {
                      const { status } = formik.values.feeStructureClasses[className];

                      return (
                        <Box key={className} textAlign="center">
                          <Button
                            variant={
                              status === FeeStructureClassStatusType.Current
                                ? 'contained'
                                : 'outlined'
                            }
                            color={
                              FeeStructureClassStatusTypeColors[
                                status as FeeStructureClassStatusType
                              ]
                            }
                            onClick={() => {
                              const updatedStatus = { ...formik.values.feeStructureClasses };

                              Object.keys(updatedStatus).forEach((cls) => {
                                if (cls === className) {
                                  updatedStatus[cls].status = FeeStructureClassStatusType.Current;
                                } else if (
                                  updatedStatus[cls].status ===
                                    FeeStructureClassStatusType.Current ||
                                  updatedStatus[cls].status ===
                                    FeeStructureClassStatusType.Completed
                                ) {
                                  updatedStatus[cls].status = FeeStructureClassStatusType.Completed;
                                } else {
                                  updatedStatus[cls].status = FeeStructureClassStatusType.Remaining;
                                }
                              });

                              formik.setFieldValue('feeStructureClasses', updatedStatus);
                            }}
                            sx={{
                              minWidth: 80,
                              textTransform: 'none',
                              fontWeight: 500,
                            }}
                          >
                            {className.replace('Class ', '')}
                          </Button>
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={3} mb={2}>
                    {[
                      FeeStructureClassStatusType.Current,
                      FeeStructureClassStatusType.Completed,
                      FeeStructureClassStatusType.Remaining,
                    ].map((statusKey) => {
                      const count = Object.values(formik.values.feeStructureClasses).filter(
                        (cls) => cls.status === statusKey
                      ).length;

                      const dotColor =
                        statusKey === FeeStructureClassStatusType.Current
                          ? theme.palette.success.main
                          : statusKey === FeeStructureClassStatusType.Completed
                            ? theme.palette.success.light
                            : theme.palette.grey[400];

                      return (
                        <Box key={statusKey} display="flex" alignItems="center" gap={1}>
                          <FiberManualRecordIcon sx={{ fontSize: 12, color: dotColor }} />
                          <Typography variant="body2" color="text.primary">
                            {FeeStructureClassStatusType[statusKey]} (
                            {String(count).padStart(2, '0')})
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>
              </SectionCard>
            )}
            {Object.entries(formik.values.feeStructureClasses)
              .filter(([_, data]) => data.status === FeeStructureClassStatusType.Current)
              .map(([className, data]) => {
                const totalFeeAmount =
                  data.feeItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
                return (
                  <Paper sx={{ p: 2, mb: 3, position: 'relative' }} elevation={6} key={className}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" pb={2}>
                      <Typography variant="h6" color="primary.main">
                        {`Fee Structure - Class ${className}`}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <CustomSelect
                          name="class"
                          label="Copy Fee Structure From"
                          disabled={!formik.values.medium}
                          options={classes || []}
                          value=""
                          labelKey="name"
                          valueKey="id"
                          onChange={(value) => {
                            // formik.setFieldValue('class', value);
                          }}
                          formControlProps={{ fullWidth: true, sx: { minWidth: '250px' } }}
                        />

                        <Chip
                          label={`Total Fee Amount : ₹${totalFeeAmount}`}
                          color="default"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Grid container spacing={3} sx={{ display: 'flex', alignItems: 'center' }}>
                      <FeeStructureCard
                        className={className}
                        feeItems={data.feeItems || []}
                        formik={formik}
                      />
                    </Grid>
                  </Paper>
                );
              })}
          </Scrollbar>
          <DialogActions sx={{ flexShrink: 0, p: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              size="small"
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              size="small"
            >
              Submit
            </LoadingButton>
          </DialogActions>
        </Box>
      </BackPopUpChecked>
    </Card>
  );
};

export default FeeStructureForm;
