'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import {
  FeeCollectionReportsTitle,
  FeeCollectionReportsTitleOptions,
} from 'src/enums/fee-collection-reports';

import { getFeeCollectionReportsValidationSchema } from './FeeCollectionReportsSchema';

export const FeeCollectionReportsFieldsMap: Record<string, string[]> = {
  // 1. Fee Collection Batch And Monthwise
  FeeCollectionBatchAndMonthwise: ['months'],

  // 2. Fee Collection Batchwise
  FeeCollectionBatchwise: [],

  // 3. Fee Collection Month And FeeHeadwise
  FeeCollectionMonthAndFeeHeadwise: ['months', 'feeHeads'],

  // 4. Fee Collection Student With Feewise
  FeeCollectionStudentWithFeewise: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'fromDate',
    'toDate',
  ],

  // 5. Fee Monthly Register
  FeeMonthlyRegister: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'standards',
    'divisions',
  ],

  // 6. Monthly Fee Collection Summary
  MonthlyFeeCollectionSummary: ['board', 'medium', 'organizations', 'fromDate', 'toDate'],

  // 7. Fee List Cheque Clear Date Wise
  FeeListChequeClearDateWise: [
    'board',
    'medium',
    'organizations',
    'standards',
    'fromDate',
    'toDate',
  ],
};

// -------------------------------------------------------------
// INITIAL VALUES
// -------------------------------------------------------------
const initialValues = {
  report: '' as unknown as FeeCollectionReportsTitle,
  board: '',
  medium: '',
  organizations: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
  months: [] as string[],
  feeHeads: [] as string[],
  receiptBooks: [] as string[],
  batch: '',
  fromDate: null,
  toDate: null,
};

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------
const FeeCollectionReports = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Cascading Data
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allStandards, setAllStandards] = useState<Standards[]>([]);
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);

  // Mock Data
  const allMonths = [
    { id: 'April', name: 'April' },
    { id: 'May', name: 'May' },
    { id: 'June', name: 'June' },
    { id: 'July', name: 'July' },
    { id: 'August', name: 'August' },
    { id: 'September', name: 'September' },
    { id: 'October', name: 'October' },
    { id: 'November', name: 'November' },
    { id: 'December', name: 'December' },
    { id: 'January', name: 'January' },
    { id: 'February', name: 'February' },
    { id: 'March', name: 'March' },
  ];

  const allFeeHeads = [
    { id: 'fh1', name: 'Tuition Fee' },
    { id: 'fh2', name: 'Term Fee' },
    { id: 'fh3', name: 'Admission Fee' },
  ];

  const allReceiptBooks = [
    { id: 'rb1', name: 'English Medium Receipt Book' },
    { id: 'rb2', name: 'Gujarati Medium Receipt Book' },
    { id: 'rb3', name: 'Hindi Medium Receipt Book' },
  ];

  const allBatches = currentYear ? [{ id: currentYear.id, name: currentYear.name }] : [];

  const [dynamicSchema, setDynamicSchema] = useState(
    getFeeCollectionReportsValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Fee Collection Report Generated!');
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    const enumKey = FeeCollectionReportsTitle[formik.values.report];
    return FeeCollectionReportsFieldsMap[enumKey] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(getFeeCollectionReportsValidationSchema(currentFields, currentYear));
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
      formik.setFieldValue('divisions', []);
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

    // 7. Reset divisions
    formik.setFieldValue('divisions', []);

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

    // Reset divisions
    formik.setFieldValue('divisions', []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations, allOrganizations, currentFields]);

  // -------------------------------------------------------------
  // STANDARDS (Multi) → DIVISIONS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentFields.includes('standards')) return;

    const selectedStds = formik.values.standards.filter((id) => id !== 'all');
    if (selectedStds.length === 0) {
      setAllDivisions([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    // 1️⃣ Single Standard → show actual divisions
    if (selectedStds.length === 1) {
      const stdObj = allStandards.find((s) => s.id === selectedStds[0]);
      const divisions = stdObj?.divisions || [];
      setAllDivisions(divisions);

      // Auto-select all divisions
      const divIds = divisions.map((d) => d.id);
      formik.setFieldValue('divisions', divIds.length ? ['all', ...divIds] : []);
    }
    // 2️⃣ Multiple Standards → ONLY "All" allowed
    else {
      setAllDivisions([]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.standards, allStandards, currentFields]);

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
                    title={FeeCollectionReportsTitle[formik.values.report] || ''}
                  >
                    <Autocomplete
                      fullWidth
                      options={FeeCollectionReportsTitleOptions}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(o, v) => o.name === v.name}
                      value={
                        FeeCollectionReportsTitleOptions.find(
                          (opt) => opt.name === formik.values.report
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        formik.setFieldValue('report', newValue ? newValue.name : '');
                        formik.setFieldTouched('report', false);

                        // Reset fields
                        formik.setFieldValue('board', '');
                        formik.setFieldValue('medium', '');
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('months', []);
                        formik.setFieldValue('feeHeads', []);
                        formik.setFieldValue('receiptBooks', []);
                        formik.setFieldValue('batch', '');
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

              {/* BATCH (Single) */}
              {showField('batch') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(formik.touched.batch && formik.errors.batch)}>
                    <CustomSelect
                      label="Batch *"
                      name="batch"
                      value={formik.values.batch}
                      onChange={(val) => formik.setFieldValue('batch', val)}
                      options={allBatches}
                      valueKey="id"
                      labelKey="name"
                      error={Boolean(formik.touched.batch && formik.errors.batch)}
                      helperText={
                        (formik.touched.batch && (formik.errors.batch as string)) as string
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

              {/* DIVISIONS (Multi) */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.divisions && formik.errors.divisions)}
                  >
                    <ResponsiveMultiSelect
                      label="Division *"
                      options={[{ id: 'all', name: 'All' }, ...allDivisions]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.divisions}
                      disabled={formik.values.standards.length === 0}
                      onChange={(selectedValues) => {
                        const allRealIds = allDivisions.map((o) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.divisions.includes('all');

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
                        formik.setFieldValue('divisions', final);
                      }}
                      error={Boolean(formik.touched.divisions && formik.errors.divisions)}
                      helperText={
                        (formik.touched.divisions && (formik.errors.divisions as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* MONTHS (Multi) */}
              {showField('months') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(formik.touched.months && formik.errors.months)}>
                    <ResponsiveMultiSelect
                      label="Months *"
                      options={[{ id: 'all', name: 'All' }, ...allMonths]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.months}
                      onChange={(selectedValues) => {
                        const allRealIds = allMonths.map((o) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.months.includes('all');

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
                        formik.setFieldValue('months', final);
                      }}
                      error={Boolean(formik.touched.months && formik.errors.months)}
                      helperText={
                        (formik.touched.months && (formik.errors.months as string)) as string
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
                      label="Fee Heads *"
                      options={[{ id: 'all', name: 'All' }, ...allFeeHeads]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.feeHeads}
                      onChange={(selectedValues) => {
                        const allRealIds = allFeeHeads.map((o) => o.id);
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
                    formik.values.report === ('' as unknown as FeeCollectionReportsTitle) ||
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

export default FeeCollectionReports;
