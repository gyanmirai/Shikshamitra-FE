'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Button } from '@mui/material';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeStatusReportTitle } from 'src/enums/fee-status-general-reports';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { getFeeStatusValidationSchema } from './FeeStatusGeneralReportsInitialValues';

export const feeStatusReportInitialValues = {
  report: '' as unknown as FeeStatusReportTitle,
  board: '',
  medium: '',
  organizations: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
  fromDate: null,
  toDate: null,
  receiptBooks: [] as string[],
  students: [] as string[],
};

// ----------------------------------------------------------------------

const commonFields = [
  'board',
  'medium',
  'organizations',
  'standards',
  'divisions',
  'fromDate',
  'toDate',
];

export const FeeStatusReportFieldsMap: Record<string, string[]> = {
  // 1. Fee Status – Collection Group Wise With Detail
  [FeeStatusReportTitle.FeeStatusCollectionGroupWiseDetail]: [...commonFields],

  // 2. Fee Status – Collection Group Wise
  [FeeStatusReportTitle.FeeStatusCollectionGroupWise]: [...commonFields, 'receiptBooks'],

  // 3. Fee Status – Studentwise With Paid Date
  [FeeStatusReportTitle.FeeStatusStudentwiseWithPaidDate]: [...commonFields, 'students'],

  // 4. Fee Status Detail Division Wise
  [FeeStatusReportTitle.FeeStatusDetailDivisionWise]: [...commonFields, 'students'],

  // 5. Fee Status Head Wise
  [FeeStatusReportTitle.FeeStatusHeadWise]: [...commonFields, 'students'],

  // 6. Fee Status Head Wise Detail
  [FeeStatusReportTitle.FeeStatusHeadWiseDetail]: [...commonFields, 'students'],

  // 7. Fee Status Student Wise Details
  [FeeStatusReportTitle.FeeStatusStudentWiseDetails]: [...commonFields, 'students'],

  // 8. Fee Status Student Wise With Discount
  [FeeStatusReportTitle.FeeStatusStudentWiseWithDiscount]: [...commonFields, 'students'],
};

// ----------------------------------------------------------------------

const FeeStatusGeneralReports = ({ report }: { report: FeeStatusReportTitle }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Local state for cascading dropdowns
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allStandards, setAllStandards] = useState<Standards[]>([]);
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);

  // Mock Receipt Books (Replace with API if available)
  const allReceiptBooks = [
    { id: 'rb1', name: 'English Medium Receipt Book' },
    { id: 'rb2', name: 'Gujarati Medium Receipt Book' },
    { id: 'rb3', name: 'Hindi Medium Receipt Book' },
  ];

  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });
  const [dynamicSchema, setDynamicSchema] = useState(getFeeStatusValidationSchema([], currentYear));

  const formik = useFormik({
    initialValues: {
      ...feeStatusReportInitialValues,
      report: report as unknown as FeeStatusReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  // Determine current fields based on selected report
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '') return [];
    return FeeStatusReportFieldsMap[formik.values.report] || [];
  }, [formik.values.report]);

  // Update validation schema when fields change
  useEffect(() => {
    setDynamicSchema(getFeeStatusValidationSchema(currentFields, currentYear));
  }, [currentFields, currentYear]);

  // Filter Boards by Current Year
  useEffect(() => {
    if (currentYear?.boards) {
      setAllBoards(currentYear.boards);
    } else {
      setAllBoards([]);
    }
  }, [currentYear]);

  // Handle Board Change -> Set Mediums
  useEffect(() => {
    if (!formik.values.board) {
      setAllMediums([]);
      return;
    }
    const selectedBoard = allBoards.find((b) => b.id === formik.values.board);
    setAllMediums(selectedBoard?.educationMediums || []);
  }, [formik.values.board, allBoards]);

  // Handle Medium Change -> Set Organizations
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
    setAllOrganizations([{ id: 'all', name: 'All' } as Organization, ...orgs]);

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
    setAllStandards([{ id: 'all', name: 'All' } as Standards, ...uniqueStandards]);

    // 7. Reset divisions
    formik.setFieldValue('divisions', []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.medium, allMediums]);

  // Handle Organization Change -> Set Standards
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
    setAllStandards([{ id: 'all', name: 'All' } as Standards, ...uniqueNewStandards]);

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

  // Handle Standard Change -> Set Divisions
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

  // Fetch Students based on selection
  useEffect(() => {
    if (
      formik.values.board &&
      formik.values.medium &&
      formik.values.organizations.length > 0 &&
      formik.values.standards.length > 0 &&
      formik.values.divisions.length > 0
    ) {
      const payload = {
        boardId: formik.values.board,
        mediumId: formik.values.medium,
        organizationIds: formik.values.organizations.filter((id) => id !== 'all'),
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
    formik.values.standards,
    formik.values.divisions,
    currentYear,
    getStudents,
  ]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

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

  return (
    <Box>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* BOARD */}
              {showField('board') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.board && !!formik.touched.board}>
                    <CustomSelect
                      label="Board *"
                      options={allBoards}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.board}
                      onChange={(val) => {
                        formik.setFieldValue('board', val);
                        formik.setFieldTouched('board', false);
                        formik.setFieldValue('medium', '');
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                        formik.setFieldValue('students', []);
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
                  <ShakingTextField error={!!formik.errors.medium && !!formik.touched.medium}>
                    <CustomSelect
                      label="Medium *"
                      options={allMediums}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.medium}
                      disabled={!formik.values.board}
                      onChange={(val) => {
                        formik.setFieldValue('medium', val);
                        formik.setFieldTouched('medium', false);
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                        formik.setFieldValue('students', []);
                      }}
                      error={formik.touched.medium && Boolean(formik.errors.medium)}
                      helperText={(formik.touched.medium && formik.errors.medium) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* ORGANIZATION (Multi) */}
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!formik.errors.organizations && !!formik.touched.organizations}
                  >
                    <ResponsiveMultiSelect
                      label="Organization *"
                      options={allOrganizations}
                      value={formik.values.organizations}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={!formik.values.medium}
                      onChange={(selectedValues) => {
                        // Handle "All" selection logic
                        const allRealIds = allOrganizations
                          .filter((o) => o.id !== 'all')
                          .map((o) => o.id);
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
                        formik.setFieldTouched('organizations', false);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                        formik.setFieldValue('students', []);
                      }}
                      error={formik.touched.organizations && Boolean(formik.errors.organizations)}
                      helperText={
                        (formik.touched.organizations && formik.errors.organizations) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* STANDARD (Multi) */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standards && !!formik.touched.standards}>
                    <ResponsiveMultiSelect
                      label="Class *"
                      options={allStandards}
                      value={formik.values.standards}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.organizations.length === 0}
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
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                        formik.setFieldValue('students', []);
                      }}
                      error={formik.touched.standards && Boolean(formik.errors.standards)}
                      helperText={(formik.touched.standards && formik.errors.standards) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* DIVISION (Multi) */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.divisions && !!formik.touched.divisions}>
                    <ResponsiveMultiSelect
                      label="Division *"
                      options={allDivisions}
                      value={formik.values.divisions}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.standards.length === 0}
                      onChange={(selectedValues) => {
                        const allRealIds = allDivisions
                          .filter((o) => o.id !== 'all')
                          .map((o) => o.id);
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
                        formik.setFieldTouched('divisions', false);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                        formik.setFieldValue('students', []);
                      }}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* FROM DATE */}
              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.fromDate && !!formik.touched.fromDate}>
                    <DatePicker
                      label="From Date"
                      format="DD/MM/YYYY"
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.fromDate}
                      onChange={(date) => formik.setFieldValue('fromDate', date)}
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

              {/* TO DATE */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.toDate && !!formik.touched.toDate}>
                    <DatePicker
                      label="To Date"
                      format="DD/MM/YYYY"
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.toDate}
                      onChange={(date) => formik.setFieldValue('toDate', date)}
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

              {/* RECEIPT BOOK (Multi - Optional) */}
              {showField('receiptBooks') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!formik.errors.receiptBooks && !!formik.touched.receiptBooks}
                  >
                    <ResponsiveMultiSelect
                      label="Receipt Book"
                      disabled={!formik.values.medium}
                      options={allReceiptBooks}
                      value={formik.values.receiptBooks}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(val) => formik.setFieldValue('receiptBooks', val)}
                      error={formik.touched.receiptBooks && Boolean(formik.errors.receiptBooks)}
                      helperText={
                        (formik.touched.receiptBooks && formik.errors.receiptBooks) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* STUDENTS (Multi - Optional) */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.students && !!formik.touched.students}>
                    <ResponsiveMultiSelect
                      label="Students *"
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

              {/* SUBMIT BUTTON */}
              <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  disabled={
                    formik.values.report === ('' as unknown as FeeStatusReportTitle) ||
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

export default FeeStatusGeneralReports;
