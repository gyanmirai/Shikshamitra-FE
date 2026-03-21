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
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';
import { FeeStatusClassDivReportsTitle } from 'src/enums/fee-status-divisionClass';

import { getFeeStatusClassDivValidationSchema } from './FeeStatusClassDivisionReportIntialValues';

export const FeeStatusClassDivReportFieldsMap: Record<string, string[]> = {
  //  Fee Status – Division Wise → Single class + Multi divisions
  FeeStatusDivisionWise: [
    'board',
    'medium',
    'organizations',
    'standard_single', // <-- SINGLE SELECT
    'divisions',
    'fromDate',
    'toDate',
    'students',
  ],

  //  Fee Status – Receipt Book Wise → MULTI class
  FeeStatusReceiptBookWise: [
    'board',
    'medium',
    'organizations',
    'receiptBooks',
    'standards', // <-- MULTI SELECT
    'divisions',
    'fromDate',
    'toDate',
    'students',
  ],

  // Fee Status – Student Wise As On Date → MULTI class
  FeeStatusStudentWiseAsOnDate: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'fromDate',
    'toDate',
    'students',
  ],

  //  Fee Status – Student Wise → MULTI class
  FeeStatusStudentWise: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'fromDate',
    'toDate',
    'students',
  ],

  // Fee Status – Classwise / Division Wise → SINGLE class
  FeeStatusClassDivisionWise: [
    'board',
    'medium',
    'organizations',
    'standard_single', // <-- SINGLE class like Exam reports
    'divisions',
    'fromDate',
    'toDate',
    'students',
  ],

  // Fee Status Headwise
  FeeStatusHeadwise: ['board', 'medium', 'organizations'],

  // Student Count Status → MULTI Class
  StudentCountStatus: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'fromDate',
    'toDate',
  ],
};

// -------------------------------------------------------------
// INITIAL VALUES
// -------------------------------------------------------------
const initialValues = {
  report: '' as unknown as FeeStatusClassDivReportsTitle,
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
const FeeStatusClassDivisionReports = ({ report }: { report: any }) => {
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
    getFeeStatusClassDivValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Class/Division Wise Fee Report Generated!');
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    // Convert enum number → enum string key
    const enumKey = FeeStatusClassDivReportsTitle[formik.values.report];
    return FeeStatusClassDivReportFieldsMap[enumKey] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(getFeeStatusClassDivValidationSchema(currentFields, currentYear));
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
  // -------------------------------------------------------------
  // MEDIUM → ORGANIZATIONS → STANDARDS
  // -------------------------------------------------------------
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

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );
  // -------------------------------------------------------------
  // STANDARD → DIVISIONS
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // STANDARD → DIVISIONS
  // -------------------------------------------------------------
  useEffect(() => {
    // GUARD: Don't run if medium is not selected
    if (!formik.values.medium) {
      return;
    }

    // NEW GUARD: Only run this effect if report uses 'standards' field (not 'standard_single')
    if (!currentFields.includes('standards')) {
      return;
    }

    const selectedStdIds = formik.values.standards.filter((id) => id !== 'all');

    // No standards selected
    if (!selectedStdIds || selectedStdIds.length === 0) {
      setAllDivisions([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    // 1 Single Standard → show actual divisions
    if (selectedStdIds.length === 1) {
      const stdObj = allStandards.find((s) => s.id === selectedStdIds[0]);
      const divisions = stdObj?.divisions || [];
      setAllDivisions(divisions);

      // Auto-select all divisions
      const divIds = divisions.map((d) => d.id);
      formik.setFieldValue('divisions', divIds.length ? ['all', ...divIds] : []);
    }
    // 2 Multiple Standards → ONLY "All" allowed
    else {
      setAllDivisions([]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.standards, allStandards, currentFields]);

  const handleSingleStandardSelection = (value: string) => {
    formik.setFieldValue('standard_single', value);
    formik.setFieldTouched('standard_single', false);
    const cls = allStandards.find((c) => c.id === value);
    const divs = cls?.divisions || [];

    setAllDivisions(divs);
    formik.setFieldValue('divisions', ['all', ...divs.map((d) => d.id)]);
  };

  // -------------------------------------------------------------
  // FETCH STUDENTS
  // -------------------------------------------------------------
  useEffect(() => {
    const hasStandards = formik.values.standards.length > 0;
    const hasSingleStandard = !!formik.values.standard_single;

    if ((!hasStandards && !hasSingleStandard) || !formik.values.divisions.length) return;

    let classIds: string[] = [];
    if (hasStandards) {
      classIds = formik.values.standards.filter((id) => id !== 'all');
    } else if (hasSingleStandard) {
      classIds = [formik.values.standard_single];
    }

    const payload = {
      classIds,
      divisionIds: formik.values.divisions.filter((x) => x !== 'all'),
    };

    getStudents(payload);
  }, [
    formik.values.standards,
    formik.values.standard_single,
    formik.values.divisions,
    getStudents,
  ]);

  // Auto-select students when list loads
  useEffect(() => {
    // Only auto-select students when standards & divisions are selected
    if (!currentFields.includes('students')) return;
    if (!formik.values.standards.length || !formik.values.divisions.length) return;

    if (tableData.length > 0) {
      formik.setFieldValue('students', ['all', ...tableData.map((s: any) => s.id)]);
    } else {
      formik.setFieldValue('students', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, currentFields, formik.values.standards, formik.values.divisions]);

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
                        formik.setFieldValue('students', []);
                      }} // simple
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
                        formik.setFieldValue('students', []);
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
                      options={[{ id: 'all', name: 'All' }, ...allDivisions]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.divisions}
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
                        formik.setFieldValue('students', []);
                      }}
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
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.fromDate}
                      onChange={(d) => formik.setFieldValue('fromDate', d)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.fromDate && Boolean(formik.errors.fromDate),
                          helperText: (formik.touched.fromDate && formik.errors.fromDate) as string,
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
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.toDate}
                      onChange={(d) => formik.setFieldValue('toDate', d)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.toDate && Boolean(formik.errors.toDate),
                          helperText: (formik.touched.toDate && formik.errors.toDate) as string,
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
                      options={[{ id: 'all', name: 'All' }, ...(tableData || [])]}
                      value={formik.values.students}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.divisions.length === 0}
                      onChange={(selectedValues) => {
                        const allActualStudents = tableData || [];
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
                      // onBlur={() => formik.setFieldTouched('students', true)}
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
                    formik.values.report === ('' as unknown as FeeStatusClassDivReportsTitle) ||
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

export default FeeStatusClassDivisionReports;
