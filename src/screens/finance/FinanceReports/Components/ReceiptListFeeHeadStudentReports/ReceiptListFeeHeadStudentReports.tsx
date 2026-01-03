'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';
import type { ReceiptListFeeHeadStudentReportsTitle } from 'src/enums/receipt-list-fee-head-student-reports';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Button } from '@mui/material';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';

import { getReceiptListFeeHeadStudentReportsValidationSchema } from './ReceiptListFeeHeadStudentReportsSchema';

export const ReceiptListFeeHeadStudentReportsFieldsMap: Record<string, string[]> = {
  // 1. Receipt List Fee Head wise
  ReceiptListFeeHeadWise: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
    'feeHeads',
    'fromDate',
    'toDate',
  ],

  // 2. Receipt List Fee Head wise With Discount
  ReceiptListFeeHeadWiseWithDiscount: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
    'feeHeads',
    'fromDate',
    'toDate',
  ],

  // 3. Receipt List FeeHead Headwise
  ReceiptListFeeHeadHeadwise: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],

  // 4. Receipt List Monthly Datewise
  ReceiptListMonthlyDateWise: [
    'board',
    'medium',
    'organizations',
    'fromDate',
    'toDate',
    'feeHeads',
  ],

  // 5. Receipt List Monthly Datewise With PayType
  ReceiptListMonthlyDateWiseWithPayType: [
    'board',
    'medium',
    'organizations',
    'fromDate',
    'toDate',
    'feeHeads',
    'months',
  ],

  // 6. Receipt List Student Wise
  ReceiptListStudentWise: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'fromDate',
    'toDate',
  ],

  // 7. Custom Group Receipt List
  CustomGroupReceiptList: ['board', 'medium', 'organizationSingle', 'fromDate', 'toDate'],
};

// -------------------------------------------------------------
// INITIAL VALUES
// -------------------------------------------------------------
const initialValues = {
  report: '' as unknown as ReceiptListFeeHeadStudentReportsTitle,
  board: '',
  medium: '',
  organizations: [] as string[],
  organizationSingle: '',
  standards: [] as string[],
  divisions: [] as string[],
  students: [] as string[],
  feeHeads: [] as string[],
  months: [] as string[],
  fromDate: null,
  toDate: null,
};

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------
const ReceiptListFeeHeadStudentReports = ({ report }: { report: any }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Cascading Data
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allStandards, setAllStandards] = useState<Standards[]>([]);
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);

  // Fee Heads Data
  const { data: feeHeadsData } = useGetFeeHeadsQuery('');
  const allFeeHeads = useMemo(() => feeHeadsData?.items || [], [feeHeadsData]);

  // Months Data (Static for now)
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

  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const [dynamicSchema, setDynamicSchema] = useState(
    getReceiptListFeeHeadStudentReportsValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Report Generated!');
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    return ReceiptListFeeHeadStudentReportsFieldsMap[formik.values.report] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(
      getReceiptListFeeHeadStudentReportsValidationSchema(currentFields, currentYear)
    );
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

    // 3. Auto-select ALL organizations (for Multi Select)
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
    if (currentFields.includes('standards')) {
      const newStdIds = uniqueNewStandards.map((s) => s.id);
      if (newStdIds.length > 0) {
        formik.setFieldValue('standards', ['all', ...newStdIds]);
      } else {
        formik.setFieldValue('standards', []);
      }
    }

    // Reset divisions
    formik.setFieldValue('divisions', []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations, allOrganizations, currentFields]);

  // -------------------------------------------------------------
  // ORGANIZATION (Single) → STANDARDS (Not really used for standards here but good to have)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.medium) return;
    // eslint-disable-next-line no-useless-return
    if (!currentFields.includes('organizationSingle')) return;
    // Logic for single organization if needed for standards/divisions
  }, [formik.values.organizationSingle, currentFields, formik.values.medium]);

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
    // Multiple Standards → ONLY "All" allowed
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

  // -------------------------------------------------------------
  // DEFAULT SELECT ALL FOR FEE HEADS & MONTHS
  // -------------------------------------------------------------
  useEffect(() => {
    if (currentFields.includes('feeHeads') && allFeeHeads.length > 0) {
      const allIds = allFeeHeads.map((fh: any) => fh.id);
      formik.setFieldValue('feeHeads', ['all', ...allIds]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFields, allFeeHeads]);

  // Auto-select students when list loads
  useEffect(() => {
    // Only auto-select students when standards & divisions are selected
    if (!currentFields.includes('students')) return;
    if (!formik.values.standards.length || !formik.values.divisions.length) return;

    if (studentList.length > 0) {
      formik.setFieldValue('students', ['all', ...studentList.map((s) => s.id)]);
    } else {
      formik.setFieldValue('students', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentList, currentFields, formik.values.standards, formik.values.divisions]);

  useEffect(() => {
    if (currentFields.includes('months') && allMonths.length > 0) {
      const allIds = allMonths.map((m) => m.id);
      formik.setFieldValue('months', ['all', ...allIds]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFields]);

  const showField = (field: string) => currentFields.includes(field);

  return (
    <Box>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box p={2}>
            <Grid container spacing={3}>
              {/* BOARD */}
              {showField('board') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
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

              {/* STANDARDS (Multi) */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.standards && formik.errors.standards)}
                  >
                    <ResponsiveMultiSelect
                      label="Class *"
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
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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

              {/* STUDENTS (Multi) */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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

              {/* FEE HEADS (Multi) */}
              {showField('feeHeads') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.feeHeads && formik.errors.feeHeads)}
                  >
                    <ResponsiveMultiSelect
                      label="Fee Head *"
                      options={[{ id: 'all', feeHeadName: 'All' }, ...allFeeHeads]}
                      getOptionLabel={(o) => o.feeHeadName}
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

              {/* MONTHS (Multi) */}
              {showField('months') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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

              {/* FROM DATE */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
                    formik.values.report ===
                      ('' as unknown as ReceiptListFeeHeadStudentReportsTitle) ||
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

export default ReceiptListFeeHeadStudentReports;
