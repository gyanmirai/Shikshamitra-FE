'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import {
  ReceiptListAdvanceReportsTitle,
  ReceiptListAdvanceReportsTitleOptions,
} from 'src/enums/receipt-list-advance-reports';

import { getReceiptListAdvanceReportsValidationSchema } from './ReceiptListAdvanceSchema';

export const ReceiptListAdvanceFieldsMap: Record<string, string[]> = {
  [ReceiptListAdvanceReportsTitle.RECEIPT_BOOK_WISE_DAILY_COLLECTION]: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'feeHeads',
    'payTypes',
    'classes',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
  [ReceiptListAdvanceReportsTitle.RECEIPT_BOOK_WISE_COLLECTION]: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'feeHeads',
    'payTypes',
    'classes',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
  [ReceiptListAdvanceReportsTitle.RECEIPT_BOOK_WISE_HEAD_WISE_COLLECTION]: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'feeHeads',
    'payTypes',
    'classes',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
  [ReceiptListAdvanceReportsTitle.RECEIPT_BOOK_WISE_FEE_TYPE_COLLECTION]: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'feeHeads',
    'payTypes',
    'classes',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
  [ReceiptListAdvanceReportsTitle.USER_WISE_COLLECTION]: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'feeHeads',
    'payTypes',
    'classes',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
  [ReceiptListAdvanceReportsTitle.CANCEL_RECEIPT_REPORT]: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'feeHeads',
    'payTypes',
    'classes',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
  [ReceiptListAdvanceReportsTitle.BANK_DEPOSIT_REPORT]: [
    'board',
    'medium',
    'organizationSingle',
    'receiptBookSingle',
    'feeHeads',
    'payTypes',
    'classes',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
};

const initialValues = {
  report: '' as unknown as ReceiptListAdvanceReportsTitle,
  board: '',
  medium: '',
  organizations: [] as string[],
  organizationSingle: '',
  receiptBooks: [] as string[],
  receiptBookSingle: '',
  feeHeads: [] as string[],
  payTypes: [] as string[],
  classes: [] as string[],
  divisions: [] as string[],
  students: [] as string[],
  fromDate: null,
  toDate: null,
};

const ReceiptListAdvance = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState || state.common); // Fallback if globalState not present
  const { allBoards: reduxBoards } = useSelector((state: RootState) => state.common);

  // Cascading Data
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allStandards, setAllStandards] = useState<Standards[]>([]);
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // API Calls
  // const { data: feeHeadsData } = useGetFeeHeadsQuery(null);
  const feeHeadsData = '';
  const [getFilterStudents] = useLazyGetFilterStudentsQuery();

  const allFeeHeads = feeHeadsData || [];

  // Mock Data
  const allReceiptBooks = [
    { id: 'rb1', name: 'English Medium Receipt Book' },
    { id: 'rb2', name: 'Gujarati Medium Receipt Book' },
    { id: 'rb3', name: 'Hindi Medium Receipt Book' },
  ];

  const allPayTypes = [
    { id: 'Cash', name: 'Cash' },
    { id: 'Cheque', name: 'Cheque' },
    { id: 'Online', name: 'Online' },
  ];

  const [dynamicSchema, setDynamicSchema] = useState(
    getReceiptListAdvanceReportsValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      // Handle report generation here
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    return ReceiptListAdvanceFieldsMap[formik.values.report] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(getReceiptListAdvanceReportsValidationSchema(currentFields, currentYear));
  }, [currentFields, currentYear]);

  // -------------------------------------------------------------
  // LOAD BOARDS
  // -------------------------------------------------------------
  useEffect(() => {
    if (currentYear?.boards) {
      setAllBoards(currentYear.boards);
    } else if (reduxBoards) {
      setAllBoards(reduxBoards);
    }
  }, [currentYear, reduxBoards]);

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
      formik.setFieldValue('classes', []);
      formik.setFieldValue('divisions', []);
      return;
    }

    // 1. Get organizations under this medium
    const mediumObj = allMediums.find((m) => m.id === formik.values.medium);
    const orgs = mediumObj?.educationMediumStages || [];

    // 2. Set organizations
    setAllOrganizations(orgs);

    // 3. Auto-select ALL organizations (if multi-select is visible)
    if (currentFields.includes('organizations')) {
      const allOrgIds = orgs.map((o) => o.id);
      formik.setFieldValue('organizations', ['all', ...allOrgIds]);
    }

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
  }, [formik.values.medium, allMediums, currentFields]);

  // -------------------------------------------------------------
  // ORGANIZATION (Multi) → STANDARDS
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
      formik.setFieldValue('classes', ['all', ...newStdIds]);
    } else {
      formik.setFieldValue('classes', []);
    }

    // Reset divisions
    formik.setFieldValue('divisions', []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations, allOrganizations, currentFields]);

  // -------------------------------------------------------------
  // ORGANIZATION (Single) → STANDARDS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.medium) return;
    if (!currentFields.includes('organizationSingle')) return;

    const selectedOrgId = formik.values.organizationSingle;
    if (!selectedOrgId) {
      setAllStandards([]);
      formik.setFieldValue('classes', []);
      return;
    }

    const org = allOrganizations.find((o) => o.id === selectedOrgId);
    const newStdList = org?.standards || [];
    setAllStandards(newStdList);

    // Handle "Select All" logic for standards
    const newStdIds = newStdList.map((s) => s.id);
    if (newStdIds.length > 0) {
      formik.setFieldValue('classes', ['all', ...newStdIds]);
    } else {
      formik.setFieldValue('classes', []);
    }

    // Reset divisions
    formik.setFieldValue('divisions', []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizationSingle, allOrganizations, currentFields]);

  // -------------------------------------------------------------
  // STANDARDS (Multi) → DIVISIONS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentFields.includes('classes')) return;

    const selectedStds = formik.values.classes.filter((id) => id !== 'all');
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
    // Multiple Standards → ONLY "All" allowed
    else {
      setAllDivisions([]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.classes, allStandards, currentFields]);

  // -------------------------------------------------------------
  // FETCH STUDENTS
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchStudents = async () => {
      if (
        formik.values.board &&
        formik.values.medium &&
        (formik.values.classes.length > 0 || formik.values.divisions.length > 0)
      ) {
        try {
          const payload = {
            boardId: formik.values.board,
            mediumId: formik.values.medium,
            classIds: formik.values.classes.filter((id) => id !== 'all'),
            divisionIds: formik.values.divisions.filter((id) => id !== 'all'),
          };
          const response = await getFilterStudents(payload).unwrap();
          setStudents(response?.data || []);
        } catch (error) {
          console.error('Failed to fetch students', error);
        }
      } else {
        setStudents([]);
      }
    };

    if (currentFields.includes('students')) {
      fetchStudents();
    }
  }, [
    formik.values.board,
    formik.values.medium,
    formik.values.classes,
    formik.values.divisions,
    getFilterStudents,
    currentFields,
  ]);

  const studentList = useMemo(
    () => [
      { id: 'all', name: 'All' },
      ...(students || []).map((s: any) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
      })),
    ],
    [students]
  );

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
                      options={ReceiptListAdvanceReportsTitleOptions}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(o, v) => o.name === v.name}
                      value={
                        ReceiptListAdvanceReportsTitleOptions.find(
                          (opt) => opt.name === formik.values.report
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        formik.setFieldValue('report', newValue ? newValue.name : '');
                        // Reset fields on report change
                        formik.setFieldValue('board', '');
                        formik.setFieldValue('medium', '');
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('organizationSingle', '');
                        formik.setFieldValue('receiptBooks', []);
                        formik.setFieldValue('receiptBookSingle', '');
                        formik.setFieldValue('feeHeads', []);
                        formik.setFieldValue('payTypes', []);
                        formik.setFieldValue('classes', []);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('students', []);
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
                      disabled={!formik.values.medium}
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

              {/* PAY TYPES (Multi) */}
              {showField('payTypes') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.payTypes && formik.errors.payTypes)}
                  >
                    <ResponsiveMultiSelect
                      label="Pay Type *"
                      options={[{ id: 'all', name: 'All' }, ...allPayTypes]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.payTypes}
                      disabled={!formik.values.medium}
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

              {/* CLASSES (Multi) */}
              {showField('classes') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.classes && formik.errors.classes)}
                  >
                    <ResponsiveMultiSelect
                      label="Class *"
                      options={[{ id: 'all', name: 'All' }, ...allStandards]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.classes}
                      disabled={
                        formik.values.organizations.length === 0 &&
                        !formik.values.organizationSingle
                      }
                      onChange={(selectedValues) => {
                        const allRealIds = allStandards.map((o) => o.id);
                        const hasAll = selectedValues.includes('all');
                        const wasAll = formik.values.classes.includes('all');

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
                        formik.setFieldValue('classes', final);
                      }}
                      error={Boolean(formik.touched.classes && formik.errors.classes)}
                      helperText={
                        (formik.touched.classes && (formik.errors.classes as string)) as string
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
                      disabled={formik.values.classes.length === 0}
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

              {/* STUDENTS (Multi) */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.students && formik.errors.students)}
                  >
                    <ResponsiveMultiSelect
                      label="Students *"
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
                        } else if (selectedValues.length === allRealIds.length) {
                          finalValues = ['all', ...allRealIds];
                        } else {
                          finalValues = selectedValues;
                        }
                        formik.setFieldValue('students', finalValues);
                      }}
                      error={formik.touched.students && Boolean(formik.errors.students)}
                      helperText={(formik.touched.students && formik.errors.students) as string}
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
                      minDate={currentYear ? dayjs(currentYear.startDate) : undefined}
                      maxDate={currentYear ? dayjs(currentYear.endDate) : undefined}
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
                      minDate={currentYear ? dayjs(currentYear.startDate) : undefined}
                      maxDate={currentYear ? dayjs(currentYear.endDate) : undefined}
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
                    formik.values.report === ('' as unknown as ReceiptListAdvanceReportsTitle) ||
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

export default ReceiptListAdvance;
