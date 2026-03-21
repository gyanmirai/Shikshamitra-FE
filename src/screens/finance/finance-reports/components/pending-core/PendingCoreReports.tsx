'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

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
import { PendingCoreReportsTitle } from 'src/enums/pending-core-reports';
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';

import { getPendingCoreReportsValidationSchema } from './PendingCoreReportsSchema';

export const PendingCoreReportsFieldsMap: Record<string, string[]> = {
  // 1. Pending Fee 100 Percent
  PendingFee100Percent: ['board', 'medium', 'organizations', 'standards', 'divisions'],

  // 2. Pending Fee All Batch
  PendingFeeAllBatch: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'fromDate', // Optional
    'students',
  ],

  // 3. Pending Fee As On Date
  PendingFeeAsOnDate: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'toDate',
    'toDateRequired', // Required
    'students',
  ],

  // 4. Pending Fee Divisionwise As On Date
  PendingFeeDivisionwiseAsOnDate: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'toDate',
    'toDateRequired', // Required
    'students',
  ],

  // 5. Pending Fee
  PendingFee: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'standards',
    'divisions',
    'toDate',
    'toDateRequired', // Required
    'students',
  ],

  // 6. Pending Fee Slip
  PendingFeeSlip: ['board', 'medium', 'organizations', 'standards', 'divisions', 'students'],

  // 7. Pending Fee Slip With Details
  PendingFeeSlipWithDetails: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'fromDate',
    'fromDateRequired', // Required
    'toDate',
    'toDateRequired', // Required
    'students',
  ],
};

// -------------------------------------------------------------
// INITIAL VALUES
// -------------------------------------------------------------
const initialValues = {
  report: '' as unknown as PendingCoreReportsTitle,
  board: '',
  medium: '',
  standard_single: '',
  organizations: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
  fromDate: null,
  toDate: null,
  receiptBooks: [] as string[],
  students: [] as string[],
};

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------
const PendingCoreReports = ({ report }: { report: any }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Cascading Data
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allStandards, setAllStandards] = useState<Standards[]>([]);

  const [allDivisions, setAllDivisions] = useState<Division[]>([]);

  const allReceiptBooks = [
    { id: 'rb1', name: 'English Medium Receipt Book' },
    { id: 'rb2', name: 'Gujarati Medium Receipt Book' },
    { id: 'rb3', name: 'Hindi Medium Receipt Book' },
  ];

  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const [dynamicSchema, setDynamicSchema] = useState(
    getPendingCoreReportsValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Pending Core Report Generated!');
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    // Convert enum number → enum string key
    const enumKey = PendingCoreReportsTitle[formik.values.report];
    return PendingCoreReportsFieldsMap[enumKey] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(getPendingCoreReportsValidationSchema(currentFields, currentYear));
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
  // MEDIUM → ORGANIZATIONS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.medium) {
      setAllOrganizations([]);
      setAllStandards([]);
      formik.setFieldValue('organizations', []);
      formik.setFieldValue('standards', []);
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('students', []);
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

    // Only auto-select standards if the field should be shown
    if (currentFields.includes('standards')) {
      // 7. Auto-select ALL standards
      const allStdIds = uniqueStandards.map((s) => s.id);
      formik.setFieldValue('standards', ['all', ...allStdIds]);
    } else {
      // Clear standards if not needed
      formik.setFieldValue('standards', []);
    }

    // 8. Reset divisions (will be set in standard → division effect)
    formik.setFieldValue('divisions', []);
    formik.setFieldValue('students', []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.medium, allMediums]);

  // -------------------------------------------------------------
  // ORGANIZATION → STANDARDS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.medium) return;

    // Only run if report wants standards
    if (!currentFields.includes('standards')) {
      formik.setFieldValue('standards', []);
      return;
    }

    const selected = formik.values.organizations;
    const list = allOrganizations.map((o) => o.id);

    // Filter selected organizations (handle 'all')
    const useOrgs = selected.includes('all') ? list : selected;

    const collected: Standards[] = [];
    allOrganizations
      .filter((org) => useOrgs.includes(org.id))
      .forEach((org) => org.standards && collected.push(...org.standards));

    const unique = Array.from(new Map(collected.map((s) => [s.id, s])).values());
    setAllStandards(unique);

    const newStdIds = unique.map((s) => s.id);

    if (newStdIds.length > 0) {
      formik.setFieldValue('standards', ['all', ...newStdIds]);
    } else {
      formik.setFieldValue('standards', []);
    }

    // Reset divisions and students
    formik.setFieldValue('divisions', []);
    formik.setFieldValue('students', []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations, allOrganizations, currentFields]);

  // -------------------------------------------------------------
  // STANDARD → DIVISIONS
  // -------------------------------------------------------------
  useEffect(() => {
    // Guard: Don't run if medium is not selected
    if (!formik.values.medium) {
      return;
    }

    // Guard: Only run this effect if report uses 'standards' field (not 'standard_single')
    if (!currentFields.includes('standards')) {
      return;
    }

    const selectedStdIds = formik.values.standards.filter((id) => id !== 'all');

    // No standards selected
    if (!selectedStdIds || selectedStdIds.length === 0) {
      setAllDivisions([]);
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('students', []);
      return;
    }

    // 1. Single Standard → show actual divisions
    if (selectedStdIds.length === 1) {
      const stdObj = allStandards.find((s) => s.id === selectedStdIds[0]);
      const divisions = stdObj?.divisions || [];
      setAllDivisions(divisions);

      // Auto-select all divisions
      const divIds = divisions.map((d) => d.id);
      formik.setFieldValue('divisions', divIds.length ? ['all', ...divIds] : []);
    }
    // 2. Multiple Standards → ONLY "All" allowed
    else {
      setAllDivisions([
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          strength: 0,
          standardId: '',
        },
      ]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.standards, allStandards, currentFields]);

  const handleSingleStandardSelection = (value: string) => {
    formik.setFieldValue('standard_single', value);

    const cls = allStandards.find((c) => c.id === value);
    const divs = cls?.divisions || [];

    setAllDivisions(divs);
    formik.setFieldValue('divisions', ['all', ...divs.map((d) => d.id)]);
  };

  // -------------------------------------------------------------
  // FETCH STUDENTS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.standards.length || !formik.values.divisions.length) return;

    const payload = {
      classIds: formik.values.standards.filter((id) => id !== 'all'),
      divisionIds: formik.values.divisions.filter((x) => x !== 'all'),
    };

    getStudents(payload);
  }, [formik.values.standards, formik.values.divisions, getStudents]);

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

  const showField = (field: string) => currentFields.includes(field);

  // -------------------------------------------------------------
  // UI START
  // -------------------------------------------------------------
  return (
    <Box>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box p={2}>
            <Grid container spacing={3}>
              {/* BOARD */}
              {showField('board') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={formik.touched.board && Boolean(formik.errors.board)}>
                    <CustomSelect
                      label="Board *"
                      options={allBoards}
                      valueKey="id"
                      labelKey="name"
                      value={formik.values.board}
                      onChange={(val) => {
                        formik.setFieldValue('board', val);
                        formik.setFieldValue('medium', '');
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('divisions', []);
                      }}
                      error={formik.touched.board && Boolean(formik.errors.board)}
                      helperText={(formik.touched.board && formik.errors.board) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* MEDIUM */}
              {showField('medium') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={formik.touched.medium && Boolean(formik.errors.medium)}>
                    <CustomSelect
                      label="Medium *"
                      options={allMediums}
                      valueKey="id"
                      labelKey="name"
                      disabled={!formik.values.board}
                      value={formik.values.medium}
                      onChange={(val) => {
                        formik.setFieldValue('medium', val);
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('divisions', []);
                      }}
                      error={formik.touched.medium && Boolean(formik.errors.medium)}
                      helperText={(formik.touched.medium && formik.errors.medium) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* ORGANIZATIONS */}
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={formik.touched.organizations && Boolean(formik.errors.organizations)}
                  >
                    <ResponsiveMultiSelect
                      label="Organizations *"
                      options={[{ id: 'all', name: 'All' }, ...allOrganizations]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      disabled={!formik.values.medium}
                      value={formik.values.organizations}
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
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('divisions', []);
                      }}
                      error={formik.touched.organizations && Boolean(formik.errors.organizations)}
                      helperText={
                        (formik.touched.organizations && formik.errors.organizations) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* CLASS */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={formik.touched.standards && Boolean(formik.errors.standards)}
                  >
                    <ResponsiveMultiSelect
                      label="Class *"
                      options={[{ id: 'all', name: 'All' }, ...allStandards]}
                      value={formik.values.standards}
                      disabled={formik.values.organizations.length === 0}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = allStandards
                          .filter((o) => o.id !== 'all')
                          .map((o) => o.id);
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
                        formik.setFieldValue('divisions', []);
                        formik.setFieldTouched('standards', false);
                      }}
                      error={formik.touched.standards && Boolean(formik.errors.standards)}
                      helperText={(formik.touched.standards && formik.errors.standards) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('standard_single') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={formik.touched.standard_single && Boolean(formik.errors.standard_single)}
                  >
                    <CustomSelect
                      label="Class *"
                      options={allStandards}
                      disabled={!formik.values.medium}
                      valueKey="id"
                      labelKey="name"
                      value={formik.values.standard_single}
                      onChange={(val) => handleSingleStandardSelection(val as string)}
                      error={
                        formik.touched.standard_single && Boolean(formik.errors.standard_single)
                      }
                      helperText={
                        (formik.touched.standard_single && formik.errors.standard_single) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* DIVISIONS */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                  >
                    <ResponsiveMultiSelect
                      label="Divisions *"
                      options={allDivisions}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      disabled={
                        formik.values.standards.length === 0 || !!formik.values.standard_single
                      }
                      value={formik.values.divisions}
                      onChange={(val) => formik.setFieldValue('divisions', val)}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* RECEIPT BOOKS */}
              {showField('receiptBooks') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={formik.touched.receiptBooks && Boolean(formik.errors.receiptBooks)}
                  >
                    <ResponsiveMultiSelect
                      label="Receipt Book *"
                      options={allReceiptBooks}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      disabled={!formik.values.medium}
                      value={formik.values.receiptBooks}
                      onChange={(val) => formik.setFieldValue('receiptBooks', val)}
                      error={formik.touched.receiptBooks && Boolean(formik.errors.receiptBooks)}
                      helperText={
                        (formik.touched.receiptBooks && formik.errors.receiptBooks) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* DATES */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={formik.touched.fromDate && Boolean(formik.errors.fromDate)}
                  >
                    <DatePicker
                      label="From Date"
                      format="DD/MM/YYYY"
                      disableFuture
                      minDate={dayjs(currentYear.startDate)}
                      maxDate={dayjs(currentYear.endDate)}
                      value={formik.values.fromDate}
                      onChange={(d) => formik.setFieldValue('fromDate', d)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.fromDate && Boolean(formik.errors.fromDate),
                          helperText: formik.touched.fromDate && formik.errors.fromDate,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={formik.touched.toDate && Boolean(formik.errors.toDate)}>
                    <DatePicker
                      label="To Date"
                      format="DD/MM/YYYY"
                      disableFuture
                      minDate={dayjs(currentYear.startDate)}
                      maxDate={dayjs(currentYear.endDate)}
                      value={formik.values.toDate}
                      onChange={(d) => formik.setFieldValue('toDate', d)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.toDate && Boolean(formik.errors.toDate),
                          helperText: formik.touched.toDate && formik.errors.toDate,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* STUDENTS */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={formik.touched.students && Boolean(formik.errors.students)}
                  >
                    <ResponsiveMultiSelect
                      label="Students"
                      options={studentList}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      disabled={!formik.values.divisions.length}
                      value={formik.values.students}
                      onChange={(selectedValues) => {
                        const allActualStudents = studentList || [];
                        const allRealIds = allActualStudents.map((s: any) => s.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.students as string[]
                        ).includes('all');
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
                            allRealIds.every((id: any) => selectedRealIds.includes(id))
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
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  disabled={
                    formik.values.report === ('' as unknown as PendingCoreReportsTitle) ||
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

export default PendingCoreReports;
