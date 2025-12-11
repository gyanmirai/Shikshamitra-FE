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
import { PendingTotalReportsTitle } from 'src/enums/pending-total-reports';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { getPendingTotalReportsValidationSchema } from './PendingTotalReportsSchema';

export const PendingTotalReportsFieldsMap: Record<string, string[]> = {
  // 1. Total Pending Divisionwise Fee Headwise As On Date
  TotalPendingDivisionwiseFeeHeadwiseAsOnDate: [
    'board',
    'medium',
    'organizations',
    'standard_single',
    'divisions',
    'toDate',
    'students',
  ],

  // 2. Total Pending Fee As On Date
  TotalPendingFeeAsOnDate: [
    'board',
    'medium',
    'organizations',
    'standard_single',
    'divisions',
    'toDate',
    'students',
  ],

  // 3. Total Pending Fee Divisionwise As On Date
  TotalPendingFeeDivisionwiseAsOnDate: [
    'board',
    'medium',
    'organizations',
    'standard_single',
    'divisions',
    'toDate',
    'students',
  ],

  // 4. Pending Divisionwise Fee Headwise As On Date
  PendingDivisionwiseFeeHeadwiseAsOnDate: [
    'board',
    'medium',
    'organizations',
    'standard_single',
    'divisions',
    'toDate',
    'students',
  ],

  // 5. Pending Divisionwise Feewise As On Date
  PendingDivisionwiseFeewiseAsOnDate: [
    'board',
    'medium',
    'organizations',
    'standard_single',
    'divisions',
    'toDate',
    'students',
  ],
};

// -------------------------------------------------------------
// INITIAL VALUES
// -------------------------------------------------------------
const initialValues = {
  report: '' as unknown as PendingTotalReportsTitle,
  board: '',
  medium: '',
  standard_single: '',
  organizations: [] as string[],
  divisions: [] as string[],
  toDate: null,
  students: [] as string[],
};

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------
const PendingTotalReports = ({ report }: { report: any }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Cascading Data
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allStandards, setAllStandards] = useState<Standards[]>([]);
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);

  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const [dynamicSchema, setDynamicSchema] = useState(
    getPendingTotalReportsValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Pending Total Report Generated!');
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    // Convert enum number → enum string key
    const enumKey = PendingTotalReportsTitle[formik.values.report];
    return PendingTotalReportsFieldsMap[enumKey] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(getPendingTotalReportsValidationSchema(currentFields, currentYear));
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
      formik.setFieldValue('standard_single', '');
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

    // If using Single Standard, clear if not in list
    if (formik.values.standard_single) {
      const exists = uniqueStandards.find((s) => s.id === formik.values.standard_single);
      if (!exists) formik.setFieldValue('standard_single', '');
    }

    // Reset divisions
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

    // If using Single Standard, clear if not in list
    if (formik.values.standard_single) {
      const exists = uniqueNewStandards.find((s) => s.id === formik.values.standard_single);
      if (!exists) formik.setFieldValue('standard_single', '');
    }

    // Reset divisions
    formik.setFieldValue('divisions', []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations, allOrganizations, currentFields]);

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
  // STANDARD (Single) → DIVISIONS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.standard_single) {
      setAllDivisions([]);
      return;
    }
    const std = allStandards.find((s) => s.id === formik.values.standard_single);
    const divs = std?.divisions || [];
    setAllDivisions(divs);

    // Auto select all divisions
    const divIds = divs.map((d) => d.id);
    formik.setFieldValue('divisions', ['all', ...divIds]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.standard_single, allStandards, currentFields]);

  // -------------------------------------------------------------
  // FETCH STUDENTS
  // -------------------------------------------------------------
  useEffect(() => {
    if (
      formik.values.board &&
      formik.values.medium &&
      formik.values.organizations.length > 0 &&
      formik.values.standard_single &&
      formik.values.divisions.length > 0
    ) {
      const payload = {
        boardId: formik.values.board,
        mediumId: formik.values.medium,
        organizationIds: formik.values.organizations.filter((id) => id !== 'all'),
        standardIds: [formik.values.standard_single],
        divisionIds: formik.values.divisions.filter((id) => id !== 'all'),
        academicYearId: currentYear?.id,
      };
      getStudents(payload);
    }
  }, [
    formik.values.board,
    formik.values.medium,
    formik.values.organizations,
    formik.values.standard_single,
    formik.values.divisions,
    currentYear,
    getStudents,
  ]);

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleSingleStandardSelection = (value: string) => {
    formik.setFieldValue('standard_single', value);
  };

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

              {/* STANDARD (Single) */}
              {showField('standard_single') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.standard_single && formik.errors.standard_single)}
                  >
                    <CustomSelect
                      label="Class *"
                      name="standard_single"
                      value={formik.values.standard_single}
                      onChange={(val) => handleSingleStandardSelection(val as string)}
                      options={allStandards}
                      valueKey="id"
                      labelKey="name"
                      disabled={!formik.values.medium}
                      error={Boolean(
                        formik.touched.standard_single && formik.errors.standard_single
                      )}
                      helperText={
                        (formik.touched.standard_single &&
                          (formik.errors.standard_single as string)) as string
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
                      label="Division"
                      options={[{ id: 'all', name: 'All' }, ...allDivisions]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      value={formik.values.divisions}
                      disabled={!formik.values.standard_single}
                      onChange={(val) => formik.setFieldValue('divisions', val)}
                      error={Boolean(formik.touched.divisions && formik.errors.divisions)}
                      helperText={
                        (formik.touched.divisions && (formik.errors.divisions as string)) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* TO DATE */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={Boolean(formik.touched.toDate && formik.errors.toDate)}>
                    <DatePicker
                      label="To Date"
                      value={formik.values.toDate}
                      minDate={dayjs(currentYear.startDate)}
                      format="DD/MM/YYYY"
                      maxDate={dayjs(currentYear.endDate)}
                      onChange={(newValue) => formik.setFieldValue('toDate', newValue)}
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

              {/* STUDENTS (Multi) */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.students && formik.errors.students)}
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
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={
                    formik.values.report === ('' as unknown as PendingTotalReportsTitle) ||
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

export default PendingTotalReports;
