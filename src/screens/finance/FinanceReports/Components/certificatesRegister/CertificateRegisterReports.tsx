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
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import { CertificateRegisterReportTitle } from 'src/enums/certificate-register-reports';

import { getCertificateRegisterValidationSchema } from './certificateRegisterValidation';

// -------------------------------------------------------------
// FIELD MAPPING
// -------------------------------------------------------------
export const CertificateRegisterReportsFieldsMap: Record<string, string[]> = {
  [CertificateRegisterReportTitle.FeeCertificateBasedOnReceipt]: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
  [CertificateRegisterReportTitle.FeeCertificateBasedOnReceiptWithDetail]: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
  [CertificateRegisterReportTitle.FeeCertificateBasedOnStudentFee]: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
  ],
  [CertificateRegisterReportTitle.FeeCertificateBasedOnTotalFee]: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
  ],
  [CertificateRegisterReportTitle.FeeCertificateWithAllFeeDetails]: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
    'students',
  ],
  [CertificateRegisterReportTitle.FeeRegisterAllStudent]: [
    'board',
    'medium',
    'organizations',
    'standards',
    'divisions',
  ],
};

// -------------------------------------------------------------
// INITIAL VALUES
// -------------------------------------------------------------
const initialValues = {
  report: '' as unknown as CertificateRegisterReportTitle,
  board: '',
  medium: '',
  organizations: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
  students: [] as string[],
  fromDate: null,
  toDate: null,
};

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------
const CertificateRegisterReports = () => {
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
    getCertificateRegisterValidationSchema([], currentYear)
  );

  const formik = useFormik({
    initialValues,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      console.log('Generating Report:', values);
      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  // -------------------------------------------------------------
  // DETERMINE SELECTED FIELDS
  // -------------------------------------------------------------
  const currentFields = useMemo(() => {
    if ((formik.values.report as unknown) === '' || formik.values.report === null) return [];
    return CertificateRegisterReportsFieldsMap[formik.values.report] || [];
  }, [formik.values.report]);

  // Update schema dynamically
  useEffect(() => {
    setDynamicSchema(getCertificateRegisterValidationSchema(currentFields, currentYear));
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
      return;
    }

    const mediumObj = allMediums.find((m) => m.id === formik.values.medium);
    const orgs = mediumObj?.educationMediumStages || [];
    setAllOrganizations(orgs);

    // Auto-select ALL organizations if multi-select is active
    if (currentFields.includes('organizations')) {
      const allOrgIds = orgs.map((o) => o.id);
      formik.setFieldValue('organizations', ['all', ...allOrgIds]);
    } else {
      formik.setFieldValue('organizations', []);
    }

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

    if (!currentFields.includes('standards')) {
      formik.setFieldValue('standards', []);
      return;
    }

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
  // STANDARD → DIVISIONS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!formik.values.medium) return;
    if (!currentFields.includes('standards')) return;

    const selectedStdIds = formik.values.standards.filter((id) => id !== 'all');

    if (!selectedStdIds || selectedStdIds.length === 0) {
      setAllDivisions([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    // 1️⃣ Single Standard → show actual divisions
    if (selectedStdIds.length === 1) {
      const stdObj = allStandards.find((s) => s.id === selectedStdIds[0]);
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
    if (!currentFields.includes('students')) return;
    if (!formik.values.standards.length || !formik.values.divisions.length) return;

    const payload = {
      classIds: formik.values.standards.filter((x) => x !== 'all'),
      divisionIds: formik.values.divisions.filter((x) => x !== 'all'),
    };

    getStudents(payload);
  }, [formik.values.standards, formik.values.divisions, getStudents, currentFields]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  // -------------------------------------------------------------
  // AUTO-SELECT STUDENTS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentFields.includes('students')) return;

    if (tableData.length > 0) {
      const allIds = tableData.map((s: any) => s.id);
      formik.setFieldValue('students', ['all', ...allIds]);
    } else {
      formik.setFieldValue('students', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, currentFields]);

  const showField = (field: string) => currentFields.includes(field);

  const getDateLabel = (type: 'from' | 'to') => {
    if (formik.values.report === CertificateRegisterReportTitle.FeeCertificateBasedOnReceipt) {
      return type === 'from' ? 'From Receipt Date *' : 'To Receipt Date *';
    }
    return type === 'from' ? 'From Date *' : 'To Date *';
  };

  return (
    <Box>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box p={2}>
            <Grid container spacing={3}>
              {/* REPORT DROPDOWN */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ShakingTextField
                  error={(formik.values.report as unknown) === '' && !!formik.touched.report}
                >
                  <CustomTooltip placement="top" title={formik.values.report}>
                    <Autocomplete
                      options={Object.values(CertificateRegisterReportTitle)}
                      getOptionLabel={(opt) => opt}
                      value={formik.values.report || null}
                      onChange={(e, val) => {
                        formik.setFieldValue('report', val || '');
                        // reset all other fields
                        formik.setFieldValue('board', '');
                        formik.setFieldValue('medium', '');
                        formik.setFieldValue('organizations', []);
                        formik.setFieldValue('standards', []);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('students', []);
                        formik.setFieldValue('fromDate', null);
                        formik.setFieldValue('toDate', null);
                      }}
                      renderInput={(p) => (
                        <TextField
                          {...p}
                          size="small"
                          fullWidth
                          label="Report *"
                          error={formik.touched.report && Boolean(formik.errors.report)}
                          helperText={formik.touched.report && formik.errors.report}
                        />
                      )}
                    />
                  </CustomTooltip>
                </ShakingTextField>
              </Grid>

              {/* BOARD */}
              {showField('board') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

              {/* ORGANIZATIONS (Multi) */}
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                      }}
                      error={formik.touched.organizations && Boolean(formik.errors.organizations)}
                      helperText={
                        (formik.touched.organizations && formik.errors.organizations) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* CLASS (Standards) */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

              {/* DIVISIONS */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                  >
                    <ResponsiveMultiSelect
                      label="Divisions *"
                      options={[{ id: 'all', name: 'All' }, ...allDivisions]}
                      getOptionLabel={(o) => o.name}
                      getOptionValue={(o) => o.id}
                      disabled={formik.values.standards.length === 0}
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
                        formik.setFieldTouched('divisions', false);
                      }}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* STUDENTS */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={formik.touched.students && Boolean(formik.errors.students)}
                  >
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
                    error={formik.touched.fromDate && Boolean(formik.errors.fromDate)}
                  >
                    <DatePicker
                      label={getDateLabel('from')}
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

              {/* TO DATE */}
              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={formik.touched.toDate && Boolean(formik.errors.toDate)}>
                    <DatePicker
                      label={getDateLabel('to')}
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

              {/* SUBMIT */}
              <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  disabled={
                    formik.values.report === ('' as unknown as CertificateRegisterReportTitle) ||
                    formik.values.report === null ||
                    formik.values.report === undefined
                  }
                  size="small"
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

export default CertificateRegisterReports;
