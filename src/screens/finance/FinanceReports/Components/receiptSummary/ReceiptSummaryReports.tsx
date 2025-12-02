'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import { Box, Card, Grid, Button, TextField, Autocomplete } from '@mui/material';
import {
  ReceiptSummaryReportsTitle,
  ReceiptSummaryReportsTitleOptions,
} from 'src/enums/receipt-summary-reports';

import { getReceiptSummaryReportsValidationSchema } from './ReceiptSummaryReportsSchema';

// -------------------------------------------------------------
// FIELDS MAP
// -------------------------------------------------------------
export const ReceiptSummaryReportsFieldsMap: Record<string, string[]> = {
  // 1. Receipt Summary Date Wise
  ReceiptSummaryDateWise: ['board', 'medium', 'organizations', 'fromDate', 'toDate'],

  // 2. Receipt Summary Date And Pay Type Wise
  ReceiptSummaryDateAndPayTypeWise: [
    'board',
    'medium',
    'organizations',
    'fromDate',
    'toDate',
    'payTypes', // Default All
  ],

  // 3. Receipt Summary Date And Receipt Book Wise
  ReceiptSummaryDateAndReceiptBookWise: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'fromDate',
    'toDate',
  ],

  // 4. Receipt Summary Date And Receipt Book With Paytype
  ReceiptSummaryDateAndReceiptBookWithPayType: [
    'board',
    'medium',
    'organizations',
    'receiptBooks', // Default All
    'payTypes', // Default All
    'fromDate',
    'toDate',
  ],

  // 5. Receipt Summary FeeHeadwise
  ReceiptSummaryFeeHeadWise: [
    'board',
    'medium',
    'organizations',
    'feeHeads',
    'standards',
    'fromDate',
    'toDate',
  ],

  // 6. Receipt Summary Feewise
  ReceiptSummaryFeeWise: [
    'board',
    'medium',
    'organizations',
    'feeHeads',
    'standards',
    'fromDate',
    'toDate',
  ],

  // 7. Receipt Summary Organization Fee Head And Pay Type Wise
  ReceiptSummaryOrganizationFeeHeadAndPayTypeWise: [
    'board',
    'medium',
    'organizations',
    'fromDate',
    'toDate',
  ],
};

// -------------------------------------------------------------
// INITIAL VALUES
// -------------------------------------------------------------
const initialValues = {
  report: '' as unknown as ReceiptSummaryReportsTitle,
  board: '',
  medium: '',
  organizations: [] as string[],
  receiptBooks: [] as string[],
  payTypes: [] as string[],
  feeHeads: [] as string[],
  standards: [] as string[],
  fromDate: null,
  toDate: null,
};

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------
const ReceiptSummaryReports = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Cascading Data
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allStandards, setAllStandards] = useState<Standards[]>([]);

  // API Data
  const { data: feeHeadsData } = useGetFeeHeadsQuery(null);
  const allFeeHeads = useMemo(() => feeHeadsData || [], [feeHeadsData]);

  // Mock Data
  const allReceiptBooks = [
    { id: 'rb1', name: 'English Medium Receipt Book' },
    { id: 'rb2', name: 'Gujarati Medium Receipt Book' },
    { id: 'rb3', name: 'Hindi Medium Receipt Book' },
  ];

  const payTypeOptions = [
    { id: 'cash', name: 'Cash' },
    { id: 'cheque', name: 'Cheque' },
    { id: 'online', name: 'Online' },
    { id: 'dd', name: 'DD' },
  ];

  const [dynamicSchema, setDynamicSchema] = useState(
    getReceiptSummaryReportsValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Receipt Summary Report Generated!');
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    const enumKey = ReceiptSummaryReportsTitle[formik.values.report];
    return ReceiptSummaryReportsFieldsMap[enumKey] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(getReceiptSummaryReportsValidationSchema(currentFields, currentYear));
  }, [currentFields, currentYear]);

  // -------------------------------------------------------------
  // LOAD BOARDS
  // -------------------------------------------------------------
  useEffect(() => {
    if (currentYear?.boards) {
      setAllBoards(currentYear.boards);
    }
  }, [currentYear]);

  // -------------------------------------------------------------
  // BOARD → MEDIUMS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.board) {
      setAllMediums([]);
      return;
    }
    const board = allBoards.find((x) => x.id === formik.values.board);
    setAllMediums(board?.educationMediums || []);
  }, [formik.values.board, allBoards]);

  // -------------------------------------------------------------
  // MEDIUM → ORGANIZATIONS → STANDARDS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.medium) {
      setAllOrganizations([]);
      setAllStandards([]);
      formik.setFieldValue('organizations', []);
      formik.setFieldValue('standards', []);
      return;
    }

    // 1. Get organizations under this medium
    const mediumObj = allMediums.find((m) => m.id === formik.values.medium);
    const orgs = mediumObj?.educationMediumStages || [];

    // 2. Set organizations
    setAllOrganizations(orgs);

    // 3. Auto-select ALL organizations
    const allOrgIds = orgs.map((o) => o.id);
    formik.setFieldValue('organizations', ['all', ...allOrgIds]);

    // 4. Collect standards from ALL organizations
    const allStdList: Standards[] = [];
    orgs.forEach((org) => {
      if (org.standards) {
        allStdList.push(...org.standards);
      }
    });

    // 5. Make unique standards
    const uniqueStandards = Array.from(new Map(allStdList.map((s) => [s.id, s])).values());

    // 6. Set all standards
    setAllStandards(uniqueStandards);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.medium, allMediums]);

  // -------------------------------------------------------------
  // ORGANIZATION → STANDARDS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.medium) return;
    if (!currentFields.includes('organizations')) return;

    const selected = formik.values.organizations;

    // --- UPDATE STANDARDS LIST BASED ON SELECTED ORGS ---
    const selectedOrgIds = selected.filter((id) => id !== 'all');
    const relevantOrgs = allOrganizations.filter((o) => selectedOrgIds.includes(o.id));

    const newStdList: Standards[] = [];
    relevantOrgs.forEach((org) => {
      if (org.standards) {
        newStdList.push(...org.standards);
      }
    });
    const uniqueNewStandards = Array.from(new Map(newStdList.map((s) => [s.id, s])).values());
    setAllStandards(uniqueNewStandards);

    // Handle "Select All" logic for standards
    const newStdIds = uniqueNewStandards.map((s) => s.id);
    if (newStdIds.length > 0) {
      formik.setFieldValue('standards', ['all', ...newStdIds]);
    } else {
      formik.setFieldValue('standards', []);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations, allOrganizations, currentFields]);

  // -------------------------------------------------------------
  // DEFAULT VALUES LOGIC
  // -------------------------------------------------------------
  // useEffect(() => {
  //   // Pay Types Default All
  //   if (currentFields.includes('payTypes') && formik.values.payTypes.length === 0) {
  //     const allIds = payTypeOptions.map((p) => p.id);
  //     formik.setFieldValue('payTypes', ['all', ...allIds]);
  //   }
  //   // Receipt Books Default All (only for specific report)
  //   if (
  //     formik.values.report ===
  //       ReceiptSummaryReportsTitle.ReceiptSummaryDateAndReceiptBookWithPayType &&
  //     formik.values.receiptBooks.length === 0
  //   ) {
  //     const allIds = allReceiptBooks.map((r) => r.id);
  //     formik.setFieldValue('receiptBooks', ['all', ...allIds]);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentFields, formik.values.report]);

  const showField = (field: string) => currentFields.includes(field);

  return (
    <Box>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box p={2}>
            <Grid container spacing={3}>
              {/* REPORT TITLE */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ShakingTextField
                  error={(formik.values.report as unknown) === '' && !!formik.touched.report}
                >
                  <CustomTooltip
                    placement="top"
                    title={ReceiptSummaryReportsTitle[formik.values.report] || ''}
                  >
                    <Autocomplete
                      fullWidth
                      options={ReceiptSummaryReportsTitleOptions}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(o, v) => o.name === v.name}
                      value={
                        ReceiptSummaryReportsTitleOptions.find(
                          (opt) => opt.name === formik.values.report
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        formik.setFieldValue('report', newValue ? newValue.name : '');
                        // Reset fields on report change
                        formik.setFieldValue('board', '');
                        formik.setFieldValue('medium', '');
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('receiptBooks', []);
                        formik.setFieldValue('payTypes', []);
                        formik.setFieldValue('feeHeads', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Report *"
                          error={Boolean(formik.touched.report && formik.errors.report)}
                          helperText={formik.touched.report && (formik.errors.report as string)}
                        />
                      )}
                    />
                  </CustomTooltip>
                </ShakingTextField>
              </Grid>

              {/* BOARD */}
              {showField('board') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(formik.touched.board && formik.errors.board)}>
                    <CustomSelect
                      label="Board *"
                      name="board"
                      value={formik.values.board}
                      onChange={(val) => formik.setFieldValue('board', val)}
                      options={allBoards}
                      valueKey="id"
                      labelKey="name"
                      error={Boolean(formik.touched.board && formik.errors.board)}
                      helperText={
                        (formik.touched.board && (formik.errors.board as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* MEDIUM */}
              {showField('medium') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(formik.touched.medium && formik.errors.medium)}>
                    <CustomSelect
                      label="Medium *"
                      name="medium"
                      value={formik.values.medium}
                      onChange={(val) => formik.setFieldValue('medium', val)}
                      options={allMediums}
                      valueKey="id"
                      labelKey="name"
                      disabled={!formik.values.board}
                      error={Boolean(formik.touched.medium && formik.errors.medium)}
                      helperText={
                        (formik.touched.medium && (formik.errors.medium as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* ORGANIZATIONS (Multi) */}
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.organizations && formik.errors.organizations)}
                  >
                    <ResponsiveMultiSelect
                      label="Organization *"
                      options={[{ id: 'all', name: 'All' }, ...allOrganizations]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.organizations}
                      disabled={!formik.values.medium}
                      onChange={(selectedValues) => {
                        const allRealIds = allOrganizations.map((o) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.organizations.includes('all');

                        let final: string[] = [];
                        if (hasAll && !wasAll) {
                          final = ['all', ...allRealIds];
                        } else if (!hasAll && wasAll) {
                          final = [];
                        } else if (hasAll && wasAll) {
                          final = selectedValues.filter((id) => id !== 'all');
                        } else if (selectedValues.length === allRealIds.length) {
                          final = ['all', ...allRealIds];
                        } else {
                          final = selectedValues;
                        }
                        formik.setFieldValue('organizations', final);
                      }}
                      error={Boolean(formik.touched.organizations && formik.errors.organizations)}
                      helperText={
                        (formik.touched.organizations &&
                          (formik.errors.organizations as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* RECEIPT BOOKS (Multi) */}
              {showField('receiptBooks') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.receiptBooks && formik.errors.receiptBooks)}
                  >
                    <ResponsiveMultiSelect
                      label="Receipt Book *"
                      options={[{ id: 'all', name: 'All' }, ...allReceiptBooks]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.receiptBooks}
                      disabled={!formik.values.medium}
                      onChange={(selectedValues) => {
                        const allRealIds = allReceiptBooks.map((o) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.receiptBooks.includes('all');

                        let final: string[] = [];
                        if (hasAll && !wasAll) {
                          final = ['all', ...allRealIds];
                        } else if (!hasAll && wasAll) {
                          final = [];
                        } else if (hasAll && wasAll) {
                          final = selectedValues.filter((id) => id !== 'all');
                        } else if (selectedValues.length === allRealIds.length) {
                          final = ['all', ...allRealIds];
                        } else {
                          final = selectedValues;
                        }
                        formik.setFieldValue('receiptBooks', final);
                      }}
                      error={Boolean(formik.touched.receiptBooks && formik.errors.receiptBooks)}
                      helperText={
                        (formik.touched.receiptBooks &&
                          (formik.errors.receiptBooks as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* PAY TYPES (Multi) */}
              {showField('payTypes') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.payTypes && formik.errors.payTypes)}
                  >
                    <ResponsiveMultiSelect
                      label="Pay Type *"
                      options={[{ id: 'all', name: 'All' }, ...payTypeOptions]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.payTypes}
                      onChange={(selectedValues) => {
                        const allRealIds = payTypeOptions.map((o) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.payTypes.includes('all');

                        let final: string[] = [];
                        if (hasAll && !wasAll) {
                          final = ['all', ...allRealIds];
                        } else if (!hasAll && wasAll) {
                          final = [];
                        } else if (hasAll && wasAll) {
                          final = selectedValues.filter((id) => id !== 'all');
                        } else if (selectedValues.length === allRealIds.length) {
                          final = ['all', ...allRealIds];
                        } else {
                          final = selectedValues;
                        }
                        formik.setFieldValue('payTypes', final);
                      }}
                      error={Boolean(formik.touched.payTypes && formik.errors.payTypes)}
                      helperText={
                        (formik.touched.payTypes && (formik.errors.payTypes as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* FEE HEADS (Multi) */}
              {showField('feeHeads') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.feeHeads && formik.errors.feeHeads)}
                  >
                    <ResponsiveMultiSelect
                      label="Fee Head *"
                      options={[{ id: 'all', name: 'All' }, ...allFeeHeads]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.feeHeads}
                      onChange={(selectedValues) => {
                        const allRealIds = allFeeHeads.map((o: any) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.feeHeads.includes('all');

                        let final: string[] = [];
                        if (hasAll && !wasAll) {
                          final = ['all', ...allRealIds];
                        } else if (!hasAll && wasAll) {
                          final = [];
                        } else if (hasAll && wasAll) {
                          final = selectedValues.filter((id) => id !== 'all');
                        } else if (selectedValues.length === allRealIds.length) {
                          final = ['all', ...allRealIds];
                        } else {
                          final = selectedValues;
                        }
                        formik.setFieldValue('feeHeads', final);
                      }}
                      error={Boolean(formik.touched.feeHeads && formik.errors.feeHeads)}
                      helperText={
                        (formik.touched.feeHeads && (formik.errors.feeHeads as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* STANDARDS (Multi) */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.standards && formik.errors.standards)}
                  >
                    <ResponsiveMultiSelect
                      label="Class *"
                      options={[{ id: 'all', name: 'All' }, ...allStandards]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.standards}
                      disabled={formik.values.organizations.length === 0}
                      onChange={(selectedValues) => {
                        const allRealIds = allStandards.map((o) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.standards.includes('all');

                        let final: string[] = [];
                        if (hasAll && !wasAll) {
                          final = ['all', ...allRealIds];
                        } else if (!hasAll && wasAll) {
                          final = [];
                        } else if (hasAll && wasAll) {
                          final = selectedValues.filter((id) => id !== 'all');
                        } else if (selectedValues.length === allRealIds.length) {
                          final = ['all', ...allRealIds];
                        } else {
                          final = selectedValues;
                        }
                        formik.setFieldValue('standards', final);
                      }}
                      error={Boolean(formik.touched.standards && formik.errors.standards)}
                      helperText={
                        (formik.touched.standards && (formik.errors.standards as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* FROM DATE */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.fromDate && formik.errors.fromDate)}
                  >
                    <DatePicker
                      label="From Date *"
                      value={formik.values.fromDate}
                      format="DD/MM/YYYY"
                      onChange={(newValue) => formik.setFieldValue('fromDate', newValue)}
                      minDate={dayjs(currentYear.startDate)}
                      maxDate={dayjs(currentYear.endDate)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: Boolean(formik.touched.fromDate && formik.errors.fromDate),
                          helperText: formik.touched.fromDate && (formik.errors.fromDate as string),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* TO DATE */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(formik.touched.toDate && formik.errors.toDate)}>
                    <DatePicker
                      label="To Date *"
                      value={formik.values.toDate}
                      format="DD/MM/YYYY"
                      onChange={(newValue) => formik.setFieldValue('toDate', newValue)}
                      minDate={dayjs(currentYear.startDate)}
                      maxDate={dayjs(currentYear.endDate)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: Boolean(formik.touched.toDate && formik.errors.toDate),
                          helperText: formik.touched.toDate && (formik.errors.toDate as string),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* SUBMIT */}
              <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  disabled={
                    formik.values.report === ('' as unknown as ReceiptSummaryReportsTitle) ||
                    formik.values.report === null ||
                    formik.values.report === undefined
                  }
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default ReceiptSummaryReports;
