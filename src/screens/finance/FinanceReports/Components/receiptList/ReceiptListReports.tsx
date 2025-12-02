'use client';

import type { RootState } from 'src/redux/store';
import type { ReceiptListReportsTitle } from 'src/enums/receipt-list-reports';
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
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { ReceiptListReportsTitleOptions } from 'src/enums/receipt-list-reports';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';

import { getReceiptListReportsValidationSchema } from './ReceiptListReportsSchema';

export const ReceiptListReportsFieldsMap: Record<string, string[]> = {
  // 1. Receipt List Date wise
  ReceiptListDateWise: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'standards',
    'divisions',
    'students',
    'payTypes',
    'fromDate',
    'toDate',
  ],

  // 2. Receipt List Date wise With Remark
  ReceiptListDateWiseWithRemark: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'standards',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],

  // 3. Receipt List Date wise With Batch
  ReceiptListDateWiseWithBatch: [
    'board',
    'medium',
    'organizations',
    'fromDate',
    'toDate',
    'standards',
    'divisions',
    'students',
  ],

  // 4. Receipt List Date wise With Pay Type
  ReceiptListDateWiseWithPayType: ['board', 'medium', 'organizations', 'fromDate', 'toDate'],

  // 5. Receipt List Number wise
  ReceiptListNumberWise: [
    'board',
    'medium',
    'organizations',
    'fromDate',
    'toDate',
    'standards',
    'divisions',
    'students',
  ],

  // 6. Receipt List With Detail
  ReceiptListWithDetail: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],

  // 7. Organization Wise Fee Receipt List
  OrganizationWiseFeeReceiptList: ['board', 'medium', 'organizations', 'fromDate', 'toDate'],
};

// -------------------------------------------------------------
// INITIAL VALUES
// -------------------------------------------------------------
const initialValues = {
  report: '' as unknown as ReceiptListReportsTitle,
  board: '',
  medium: '',
  organizations: [] as string[],
  organizationSingle: '',
  standards: [] as string[],
  divisions: [] as string[],
  months: [] as string[],
  feeHeads: [] as string[],
  receiptBooks: [] as string[],
  receiptBookSingle: '',
  batch: '',
  payTypes: [] as string[],
  academicYear: [] as string[],
  students: [] as string[],
  fromDate: null,
  toDate: null,
  fromReceiptDate: null,
  toReceiptDate: null,
};

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------
const ReceiptListReports = () => {
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

  const allPayTypes = [
    { id: 'pt1', name: 'Cash' },
    { id: 'pt2', name: 'Cheque' },
    { id: 'pt3', name: 'Online' },
  ];

  const allBatches = currentYear ? [{ id: currentYear.id, name: currentYear.name }] : [];
  const allAcademicYears = currentYear ? [{ id: currentYear.id, name: currentYear.name }] : [];

  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const [dynamicSchema, setDynamicSchema] = useState(
    getReceiptListReportsValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Receipt List Report Generated!');
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    return ReceiptListReportsFieldsMap[formik.values.report] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(getReceiptListReportsValidationSchema(currentFields, currentYear));
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
      formik.setFieldValue('organizationSingle', '');
      formik.setFieldValue('standards', []);
      formik.setFieldValue('divisions', []);
      return;
    }

    // 1. Get organizations under this medium
    const mediumObj = allMediums.find((m) => m.id === formik.values.medium);
    const orgs = mediumObj?.educationMediumStages || [];

    // 2. Set organizations
    setAllOrganizations(orgs);

    // 3. Auto-select ALL organizations (for multi-select)
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

    // Handle both Multi and Single organization selection for standards filtering
    let selectedOrgIds: string[] = [];

    if (currentFields.includes('organizations')) {
      selectedOrgIds = formik.values.organizations.filter((id) => id !== 'all');
    } else if (currentFields.includes('organizationSingle') && formik.values.organizationSingle) {
      selectedOrgIds = [formik.values.organizationSingle];
    } else {
      return;
    }

    // --- UPDATE STANDARDS LIST BASED ON SELECTED ORGS ---
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
  }, [
    formik.values.organizations,
    formik.values.organizationSingle,
    allOrganizations,
    currentFields,
  ]);

  const studentList = useMemo(
    () => [
      { id: 'all', name: 'All' },
      ...(StudentsData?.items || []).map((s: any) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
      })),
    ],
    [StudentsData]
  );

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

  // -------------------------------------------------------------
  // FETCH STUDENTS
  // -------------------------------------------------------------
  useEffect(() => {
    if (
      formik.values.board &&
      formik.values.medium &&
      (formik.values.organizations.length > 0 || formik.values.organizationSingle) &&
      formik.values.standards.length > 0 &&
      formik.values.divisions.length > 0
    ) {
      const orgIds = currentFields.includes('organizationSingle')
        ? [formik.values.organizationSingle]
        : formik.values.organizations.filter((id) => id !== 'all');

      const payload = {
        boardId: formik.values.board,
        mediumId: formik.values.medium,
        organizationIds: orgIds,
        standardIds: formik.values.standards.filter((id) => id !== 'all'),
        divisionIds: formik.values.divisions.filter((id) => id !== 'all'),
        academicYearId: currentYear?.id,
      };
      getStudents(payload);
    }
  }, [
    formik.values.board,
    formik.values.medium,
    formik.values.organizations,
    formik.values.organizationSingle,
    formik.values.standards,
    formik.values.divisions,
    currentYear,
    getStudents,
    currentFields,
  ]);

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
                  <CustomTooltip placement="top" title={formik.values.report || ''}>
                    <Autocomplete
                      fullWidth
                      options={ReceiptListReportsTitleOptions}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(o, v) => o.name === v.name}
                      value={
                        ReceiptListReportsTitleOptions.find(
                          (opt) => opt.name === formik.values.report
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        formik.setFieldValue('report', newValue ? newValue.name : '');
                        // Reset fields
                        formik.setFieldValue('board', '');
                        formik.setFieldValue('medium', '');
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('organizationSingle', '');
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('months', []);
                        formik.setFieldValue('feeHeads', []);
                        formik.setFieldValue('receiptBooks', []);
                        formik.setFieldValue('receiptBookSingle', '');
                        formik.setFieldValue('batch', '');
                        formik.setFieldValue('payTypes', []);
                        formik.setFieldValue('academicYear', []);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                        formik.setFieldValue('fromReceiptDate', null);
                        formik.setFieldValue('toReceiptDate', null);
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

              {/* ACADEMIC YEAR (Multi) */}
              {showField('academicYear') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.academicYear && formik.errors.academicYear)}
                  >
                    <ResponsiveMultiSelect
                      label="Academic Year *"
                      options={[{ id: 'all', name: 'All' }, ...allAcademicYears]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.academicYear}
                      onChange={(selectedValues) => {
                        const allRealIds = allAcademicYears.map((o) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.academicYear.includes('all');

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
                        formik.setFieldValue('academicYear', final);
                      }}
                      error={Boolean(formik.touched.academicYear && formik.errors.academicYear)}
                      helperText={
                        (formik.touched.academicYear &&
                          (formik.errors.academicYear as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

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

              {/* ORGANIZATION (Single) */}
              {showField('organizationSingle') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(
                      formik.touched.organizationSingle && formik.errors.organizationSingle
                    )}
                  >
                    <CustomSelect
                      label="Organization *"
                      name="organizationSingle"
                      value={formik.values.organizationSingle}
                      onChange={(val) => formik.setFieldValue('organizationSingle', val)}
                      options={allOrganizations}
                      valueKey="id"
                      labelKey="name"
                      disabled={!formik.values.medium}
                      error={Boolean(
                        formik.touched.organizationSingle && formik.errors.organizationSingle
                      )}
                      helperText={
                        (formik.touched.organizationSingle &&
                          (formik.errors.organizationSingle as string)) as string
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
              {(showField('receiptBooks') || showField('receiptBooksOptional')) && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.receiptBooks && formik.errors.receiptBooks)}
                  >
                    <ResponsiveMultiSelect
                      label={showField('receiptBooks') ? 'Receipt Book *' : 'Receipt Book'}
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

              {/* RECEIPT BOOK (Single) */}
              {showField('receiptBookSingle') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(
                      formik.touched.receiptBookSingle && formik.errors.receiptBookSingle
                    )}
                  >
                    <CustomSelect
                      label="Receipt Book *"
                      name="receiptBookSingle"
                      value={formik.values.receiptBookSingle}
                      onChange={(val) => formik.setFieldValue('receiptBookSingle', val)}
                      options={allReceiptBooks}
                      valueKey="id"
                      labelKey="name"
                      disabled={!formik.values.medium}
                      error={Boolean(
                        formik.touched.receiptBookSingle && formik.errors.receiptBookSingle
                      )}
                      helperText={
                        (formik.touched.receiptBookSingle &&
                          (formik.errors.receiptBookSingle as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* STANDARDS (Multi) */}
              {(showField('standards') || showField('standardsOptional')) && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.standards && formik.errors.standards)}
                  >
                    <ResponsiveMultiSelect
                      label={showField('standards') ? 'Class *' : 'Class'}
                      options={[{ id: 'all', name: 'All' }, ...allStandards]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.standards}
                      disabled={
                        formik.values.organizations.length === 0 &&
                        !formik.values.organizationSingle
                      }
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
              {(showField('divisions') || showField('divisionsOptional')) && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.divisions && formik.errors.divisions)}
                  >
                    <ResponsiveMultiSelect
                      label={showField('divisions') ? 'Division *' : 'Division'}
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

              {/* PAY TYPES (Multi) */}
              {(showField('payTypes') || showField('payTypesOptional')) && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.payTypes && formik.errors.payTypes)}
                  >
                    <ResponsiveMultiSelect
                      label={showField('payTypes') ? 'Pay Types *' : 'Pay Types'}
                      options={[{ id: 'all', name: 'All' }, ...allPayTypes]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.payTypes}
                      onChange={(selectedValues) => {
                        const allRealIds = allPayTypes.map((o) => o.id);
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

              {/* FROM RECEIPT DATE */}
              {showField('fromReceiptDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.fromReceiptDate && formik.errors.fromReceiptDate)}
                  >
                    <DatePicker
                      label="From Receipt Date *"
                      value={formik.values.fromReceiptDate}
                      format="DD/MM/YYYY"
                      onChange={(newValue) => formik.setFieldValue('fromReceiptDate', newValue)}
                      minDate={dayjs(currentYear.startDate)}
                      maxDate={dayjs(currentYear.endDate)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: Boolean(
                            formik.touched.fromReceiptDate && formik.errors.fromReceiptDate
                          ),
                          helperText:
                            formik.touched.fromReceiptDate &&
                            (formik.errors.fromReceiptDate as string),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* TO RECEIPT DATE */}
              {showField('toReceiptDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.toReceiptDate && formik.errors.toReceiptDate)}
                  >
                    <DatePicker
                      label="To Receipt Date *"
                      value={formik.values.toReceiptDate}
                      format="DD/MM/YYYY"
                      onChange={(newValue) => formik.setFieldValue('toReceiptDate', newValue)}
                      minDate={dayjs(currentYear.startDate)}
                      maxDate={dayjs(currentYear.endDate)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: Boolean(
                            formik.touched.toReceiptDate && formik.errors.toReceiptDate
                          ),
                          helperText:
                            formik.touched.toReceiptDate && (formik.errors.toReceiptDate as string),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* STUDENTS (Multi) */}
              {(showField('students') || showField('studentsOptional')) && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.students && formik.errors.students)}
                  >
                    <ResponsiveMultiSelect
                      label={showField('students') ? 'Students *' : 'Students'}
                      options={studentList}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      disabled={!formik.values.divisions.length}
                      value={formik.values.students}
                      onChange={(selectedValues) => {
                        const allActualStudents = studentList.filter((s) => s.id !== 'all');
                        const allRealIds = allActualStudents.map((s) => s.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.students.includes('all');
                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }
                        formik.setFieldValue('students', finalValues);
                      }}
                      error={formik.touched.students && Boolean(formik.errors.students)}
                      helperText={(formik.touched.students && formik.errors.students) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* SUBMIT */}
              <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  size="small"
                  disabled={
                    formik.values.report === ('' as unknown as ReceiptListReportsTitle) ||
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

export default ReceiptListReports;
