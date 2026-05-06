'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetStudentsByDivisionQuery } from 'src/redux/student';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetConcessionTypesQuery } from 'src/redux/finance/concessionType';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetStudentFeeStructureQuery } from 'src/redux/student/admission/admission-api';
import {
  useUploadDocumentsMutation,
  useCreateConcessionRequestMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';
import {
  Box,
  Grid,
  Card,
  Stack,
  Alert,
  Button,
  Divider,
  Checkbox,
  Accordion,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import ConcessionDocumentList from './ConcessionDocumentList';
import ValueEntryStep from './ConcessionSteps/ValueEntryStep';

import type { IConcessionFormProps } from '../type';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ValueEntry = { basedOn: 0 | 1; amount: number; netAmount: number };

type FormValues = {
  boardId: string;
  boardName: string;
  mediumId: string;
  mediumName: string;
  standardId: string;
  standardName: string;
  divisionId: string;
  divisionName: string;
  studentId: string;
  studentName: string;
  selectedStudent: any;
  concessionTypeId: string;
  concessionTypeDocuments: any[];
  selectedFeeHeads: Record<string, string[]>;
  valueEntries: Record<string, Record<string, ValueEntry>>;
  concessionRequestId: string;
  remarks: string;
};

// ---------------------------------------------------------------------------
// Module-level helpers (no React deps)
// ---------------------------------------------------------------------------

/**
 * UI-ONLY: Base accordion style — soft card appearance with subtle border,
 * rounded corners, and smooth box-shadow transition for a premium ERP feel.
 */
const accordionSx = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '12px !important',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
  transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
  '&:before': { display: 'none' },
} as const;

function buildInitialValues(editData: any): FormValues {
  return {
    boardId: editData?.board || '',
    boardName: editData?.boardName || '',
    mediumId: editData?.medium || '',
    mediumName: editData?.mediumName || '',
    standardId: editData?.className || '',
    standardName: editData?.standardName || '',
    divisionId: editData?.division || '',
    divisionName: editData?.divisionName || '',
    studentId: editData?.studentId || '',
    studentName: editData?.studentName || '',
    selectedStudent: null,
    concessionTypeId: editData?.concessionTypeIds?.[0] || '',
    concessionTypeDocuments: [],
    selectedFeeHeads: {},
    valueEntries: {},
    concessionRequestId: editData?.id || '',
    remarks: '',
  };
}

const validationSchema = Yup.object({
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  standardId: Yup.string().required('Class is required'),
  divisionId: Yup.string().required('Division is required'),
  studentId: Yup.string().required('Student is required'),
  concessionTypeId: Yup.string().required('Concession type is required'),
});

function computeDiscount(
  selectedFeeHeadIds: string[],
  typeEntries: Record<string, ValueEntry>,
  feeHeads: any[]
): number {
  let total = 0;
  selectedFeeHeadIds.forEach((fhId) => {
    const entry = typeEntries[fhId];
    const fh = feeHeads.find((f: any) => f.feeHeadId === fhId);
    if (entry && fh) {
      const base: number = fh.amount || 0;
      total += base - (entry.netAmount ?? base);
    }
  });
  return Number(total.toFixed(2));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ConcessionRequestForm: React.FC<IConcessionFormProps> = ({ onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivisions, setAllDivisions] = useState<any[]>([]);

  const [expandedPanels, setExpandedPanels] = useState({
    studentInfo: true,
    concessionType: true,
    feeHeads: true,
    valueEntry: true,
    preview: true,
    documents: true,
  });

  const handleAccordionToggle = useCallback(
    (panel: keyof typeof expandedPanels) =>
      setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] })),
    []
  );

  // -- API queries / mutations -----------------------------------------------

  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const [
    getStudents,
    { data: StudentsData, isLoading: studentLoading, isFetching: studentFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetStudentsByDivisionQuery,
  });

  const { data: concessionTypes = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
    params: { academicYearId: currentYear?.id },
    options: { skip: !currentYear?.id },
  });

  const [createConcessionRequest, { isLoading: createLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateConcessionRequestMutation,
  });

  const [uploadDocuments, { isLoading: uploadLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  // -- Derived lists ---------------------------------------------------------

  const concessionTypesList = useMemo(() => concessionTypes?.data?.items || [], [concessionTypes]);

  const studentOptions = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName}${item.middleName ? ` ${item.middleName}` : ''} ${item.lastName}`,
      })) || [],
    [StudentsData?.items]
  );

  // -- Formik ----------------------------------------------------------------

  /**
   * Ref so the formik onSubmit closure always reads the latest fee heads
   * without needing them declared before the formik instance.
   */
  const feeHeadsRef = useRef<any[]>([]);

  const initialValues = useMemo(() => buildInitialValues(editData), [editData]);

  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        const feeHeads = feeHeadsRef.current;
        const totalFees = feeHeads.reduce((s: number, fh: any) => s + (fh.amount || 0), 0);
        const concessionAmount = computeDiscount(
          values.selectedFeeHeads[values.concessionTypeId] || [],
          values.valueEntries[values.concessionTypeId] || {},
          feeHeads
        );

        if (totalFees > 0 && concessionAmount > totalFees) {
          shikshaMitraToast.error({ message: 'Concession amount cannot exceed total fees' });
          return;
        }

        const res: any = await createConcessionRequest({
          boardId: values.boardId,
          educationMediumId: values.mediumId,
          standardId: values.standardId,
          divisionId: values.divisionId,
          studentId: values.studentId,
          concessionTypeIds: [values.concessionTypeId],
          concessionAmount,
          selectedFeeHeads: values.selectedFeeHeads,
          valueEntries: values.valueEntries,
          remarks: values.remarks,
        }).unwrap();

        const reqId =
          res?.data?.concessionRequestId || res?.concessionRequestId || res?.data?.id || res?.id;

        if (!reqId) throw new Error('Failed to get concession request ID from response');

        if (values.concessionTypeDocuments?.length > 0) {
          const selectedConcessionTypes =
            res?.data?.selectedConcessionTypes || res?.selectedConcessionTypes || [];
          const concessionTypeIdMap: Record<string, string> = {};
          selectedConcessionTypes.forEach((ct: any) => {
            concessionTypeIdMap[ct.concessionTypeId] = ct.concessionRequestConcessionTypeId;
          });
          const concessionTypeDocuments = values.concessionTypeDocuments.map((docGroup: any) => ({
            ...docGroup,
            concessionRequestConcessionTypeId:
              concessionTypeIdMap[docGroup.concessionTypeId] ||
              docGroup.concessionRequestConcessionTypeId ||
              '',
          }));
          await uploadDocuments({ concessionRequestId: reqId, concessionTypeDocuments }).unwrap();
        }

        shikshaMitraToast.success({ message: 'Concession request created successfully' });
        onClose(null, true);
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.message || err?.message || 'Something went wrong',
        });
      }
    },
  });

  const { values, touched, errors, setFieldValue } = formik;

  // -- Fee structure ---------------------------------------------------------

  const { data: feeStructureData, isLoading: feeStructureLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeStructureQuery,
    params: { studentId: values.studentId },
    options: { skip: !values.studentId },
  }) as { data: any; isLoading: boolean };

  const feeHeads: any[] = useMemo(() => feeStructureData?.feeHeads || [], [feeStructureData]);

  const totalFees = useMemo(
    () => feeHeads.reduce((sum: number, fh: any) => sum + (fh.amount || 0), 0),
    [feeHeads]
  );

  // Keep ref in sync so onSubmit closure always reads fresh fee heads
  feeHeadsRef.current = feeHeads;

  // -- Computed concession amount (auto-derived, never user-typed) -----------

  const computedConcessionAmount = useMemo(
    () =>
      computeDiscount(
        values.selectedFeeHeads[values.concessionTypeId] || [],
        values.valueEntries[values.concessionTypeId] || {},
        feeHeads
      ),
    [values.selectedFeeHeads, values.concessionTypeId, values.valueEntries, feeHeads]
  );

  const isAmountExceedingFees = totalFees > 0 && computedConcessionAmount > totalFees;

  // -- Derived state for selected type / preview ----------------------------

  const selectedConcessionType = useMemo(
    () => concessionTypesList.find((ct: any) => ct.id === values.concessionTypeId),
    [concessionTypesList, values.concessionTypeId]
  );

  const previewData = useMemo(() => {
    if (!values.studentId || !values.concessionTypeId || computedConcessionAmount <= 0) return null;
    return {
      totalFees,
      concessionAmount: computedConcessionAmount,
      netPayable: Math.max(totalFees - computedConcessionAmount, 0),
      savingsPercent:
        totalFees > 0 ? ((computedConcessionAmount / totalFees) * 100).toFixed(1) : '0',
    };
  }, [totalFees, computedConcessionAmount, values.studentId, values.concessionTypeId]);

  const selectedFeeHeadCount = (values.selectedFeeHeads[values.concessionTypeId] || []).length;
  const hasSelectedFeeHeads = selectedFeeHeadCount > 0;

  // -- Handlers --------------------------------------------------------------

  const handleSubmit = useCallback(() => {
    const fieldToPanelMap: Record<string, keyof typeof expandedPanels> = {
      boardId: 'studentInfo',
      mediumId: 'studentInfo',
      standardId: 'studentInfo',
      divisionId: 'studentInfo',
      studentId: 'studentInfo',
      concessionTypeId: 'concessionType',
    };
    formik.validateForm().then((errs) => {
      const errorKeys = Object.keys(errs);
      if (errorKeys.length > 0) {
        const panelsToOpen = errorKeys.reduce<Partial<typeof expandedPanels>>((acc, key) => {
          const panel = fieldToPanelMap[key];
          if (panel) acc[panel] = true;
          return acc;
        }, {});
        setExpandedPanels((prev) => ({ ...prev, ...panelsToOpen }));
      }
      formik.handleSubmit();
    });
  }, [formik]);

  const handleFeeHeadToggle = useCallback(
    (concessionTypeId: string, feeHeadId: string) => {
      const current = values.selectedFeeHeads[concessionTypeId] || [];
      const updated = current.includes(feeHeadId)
        ? current.filter((id) => id !== feeHeadId)
        : [...current, feeHeadId];
      setFieldValue('selectedFeeHeads', {
        ...values.selectedFeeHeads,
        [concessionTypeId]: updated,
      });
    },
    [values.selectedFeeHeads, setFieldValue]
  );

  const handleSaveDocs = useCallback(
    (concessionId: string, newDocs: any[]) => {
      const payload = [...(values.concessionTypeDocuments || [])];
      const idx = payload.findIndex((d: any) => d.concessionTypeId === concessionId);
      const docs = newDocs.map((d) => ({ documentId: d.documentId, url: d.url, status: d.status }));
      if (idx === -1) payload.push({ concessionTypeId: concessionId, documents: docs });
      else payload[idx] = { ...payload[idx], documents: docs };
      setFieldValue('concessionTypeDocuments', payload);
    },
    [values.concessionTypeDocuments, setFieldValue]
  );

  const getSubmittedDocs = useCallback(
    (concessionId: string) => {
      const block = values.concessionTypeDocuments?.find(
        (d: any) => d.concessionTypeId === concessionId
      );
      return (block?.documents || []).map((d: any) => ({
        documentId: d.documentId,
        url: d.url,
        status: d.status,
      }));
    },
    [values.concessionTypeDocuments]
  );

  // -- Side effects ----------------------------------------------------------

  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear]);

  useEffect(() => {
    const board = boards.find((b: any) => b.id === values.boardId);
    setMediums(board?.educationMediums || []);
  }, [values.boardId, boards]);

  useEffect(() => {
    if (values.mediumId) getClassByMedium(values.mediumId);
  }, [values.mediumId, getClassByMedium]);

  useEffect(() => {
    setAllDivisions(classes?.find((cls: any) => cls.id === values.standardId)?.divisions || []);
  }, [values.standardId, classes]);

  useEffect(() => {
    if (values.divisionId) {
      getStudents(values.divisionId);
    }
  }, [getStudents, values.divisionId]);

  // Reset fee head selections when concession type changes
  useEffect(() => {
    setFieldValue('selectedFeeHeads', {});
    setFieldValue('valueEntries', {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.concessionTypeId]);

  // -- Render ----------------------------------------------------------------

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={2}>
              {/* 1. Student Information */}
              <Grid size={{ xs: 12 }}>
                <Accordion
                  expanded={expandedPanels.studentInfo}
                  onChange={() => handleAccordionToggle('studentInfo')}
                  disableGutters
                  elevation={0}
                  sx={accordionSx}
                >
                  <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                    <Typography variant="h6" fontWeight={600}>
                      Student Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
                          <CustomSelect
                            label="Board *"
                            options={boards}
                            labelKey="name"
                            valueKey="id"
                            value={values.boardId}
                            onChange={(val) => {
                              const board = boards.find((b) => b.id === val);
                              setFieldValue('boardId', val);
                              setFieldValue('boardName', board?.name || '');
                              setFieldValue('mediumId', '');
                              setFieldValue('mediumName', '');
                              setFieldValue('standardId', '');
                              setFieldValue('standardName', '');
                              setFieldValue('divisionId', '');
                              setFieldValue('divisionName', '');
                              setFieldValue('studentId', '');
                              setFieldValue('studentName', '');
                              setFieldValue('selectedStudent', null);
                            }}
                            error={!!errors.boardId && touched.boardId}
                            helperText={(touched.boardId && errors.boardId) as string}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField error={!!(touched.mediumId && errors.mediumId)}>
                          <CustomSelect
                            label="Medium *"
                            disabled={!values.boardId}
                            options={mediums}
                            labelKey="name"
                            valueKey="id"
                            value={values.mediumId}
                            onChange={(val) => {
                              const medium = mediums.find((m) => m.id === val);
                              setFieldValue('mediumId', val);
                              setFieldValue('mediumName', medium?.name || '');
                              setFieldValue('standardId', '');
                              setFieldValue('standardName', '');
                              setFieldValue('divisionId', '');
                              setFieldValue('divisionName', '');
                              setFieldValue('studentId', '');
                              setFieldValue('studentName', '');
                              setFieldValue('selectedStudent', null);
                            }}
                            error={!!errors.mediumId && touched.mediumId}
                            helperText={(touched.mediumId && errors.mediumId) as string}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField error={!!(touched.standardId && errors.standardId)}>
                          <CustomSelect
                            label="Class *"
                            disabled={!values.mediumId}
                            options={classes || []}
                            isLoading={classLoading}
                            labelKey="name"
                            valueKey="id"
                            value={values.standardId}
                            onChange={(val) => {
                              const standard = classes?.find((c: any) => c.id === val);
                              setFieldValue('standardId', val);
                              setFieldValue('standardName', standard?.name || '');
                              setFieldValue('divisionId', '');
                              setFieldValue('divisionName', '');
                              setFieldValue('studentId', '');
                              setFieldValue('studentName', '');
                              setFieldValue('selectedStudent', null);
                            }}
                            error={!!errors.standardId && touched.standardId}
                            helperText={(touched.standardId && errors.standardId) as string}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField error={!!(touched.divisionId && errors.divisionId)}>
                          <CustomSelect
                            label="Division *"
                            disabled={!values.standardId}
                            options={allDivisions}
                            labelKey="name"
                            valueKey="id"
                            value={values.divisionId}
                            onChange={(val) => {
                              const division = allDivisions.find((d) => d.id === val);
                              setFieldValue('divisionId', val);
                              setFieldValue('divisionName', division?.name || '');
                              setFieldValue('studentId', '');
                              setFieldValue('studentName', '');
                              setFieldValue('selectedStudent', null);
                            }}
                            error={!!errors.divisionId && touched.divisionId}
                            helperText={(touched.divisionId && errors.divisionId) as string}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <ShakingTextField error={!!(touched.studentId && errors.studentId)}>
                          <Autocomplete
                            loading={studentLoading || studentFetching}
                            noOptionsText="No Student Found"
                            fullWidth
                            disabled={!values.divisionId}
                            options={studentOptions}
                            value={
                              studentOptions.find((s: any) => s.studentId === values.studentId) ||
                              null
                            }
                            onChange={(_e, value: any) => {
                              setFieldValue('studentId', value?.studentId || '');
                              setFieldValue('studentName', value?.name || '');
                              setFieldValue('selectedStudent', value || null);
                            }}
                            getOptionLabel={(option: any) => option.name || ''}
                            renderOption={(props, option: any) => (
                              <li {...props} key={option.studentId}>
                                {option.name}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                label="Student *"
                                fullWidth
                                error={!!errors.studentId && touched.studentId}
                                helperText={(touched.studentId && errors.studentId) as string}
                              />
                            )}
                          />
                        </ShakingTextField>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              {/* 3. Fee Summary — driven by real fee structure data */}
              {values.studentId && totalFees > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Grid container spacing={2}>
                    {[
                      {
                        icon: 'mdi:currency-inr',
                        title: 'Total Fees',
                        value: totalFees,
                        color: 'text.primary',
                        /* UI-ONLY: accent strip color token per card type */
                        accentColor: '#1976d2',
                        bgColor: 'rgba(25,118,210,0.06)',
                      },
                      {
                        icon: 'mdi:tag-minus-outline',
                        title: 'Concession Amount',
                        value: computedConcessionAmount,
                        color: computedConcessionAmount > 0 ? 'error.main' : 'text.disabled',
                        accentColor: '#d32f2f',
                        bgColor: 'rgba(211,47,47,0.06)',
                      },
                      {
                        icon: 'mdi:cash-check',
                        title: 'Net Payable',
                        value: Math.max(totalFees - computedConcessionAmount, 0),
                        color: 'success.main',
                        accentColor: '#2e7d32',
                        bgColor: 'rgba(46,125,50,0.06)',
                      },
                    ].map((item) => (
                      <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
                        <Card
                          sx={{
                            p: 1.5,
                            height: '100%',
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderLeft: `4px solid ${item.accentColor}`,
                            borderRadius: '10px',
                            boxShadow: 'none',
                            transition: 'box-shadow 0.25s ease, transform 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            textTransform="uppercase"
                            letterSpacing={0.8}
                            display="block"
                            mb={0.5}
                          >
                            {item.title}
                          </Typography>
                          <Typography variant="h6" color={item.color} fontWeight={800}>
                            {formatNumber(item.value, 'INR')}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {isAmountExceedingFees && (
                    <Alert severity="error" sx={{ mt: 1, borderRadius: 1.5 }}>
                      Total concession ({formatNumber(computedConcessionAmount, 'INR')}) exceeds
                      total applicable fees ({formatNumber(totalFees, 'INR')}). Please reduce the
                      concession values.
                    </Alert>
                  )}
                </Grid>
              )}
              {/* 2. Concession Details */}
              {values.studentId && (
                <Grid size={{ xs: 12 }}>
                  <Accordion
                    expanded={expandedPanels.concessionType}
                    onChange={() => handleAccordionToggle('concessionType')}
                    disableGutters
                    elevation={0}
                    sx={accordionSx}
                  >
                    <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                      <Typography variant="h6" fontWeight={600}>
                        Concession Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <ShakingTextField
                            error={!!(touched.concessionTypeId && errors.concessionTypeId)}
                          >
                            <CustomSelect
                              label="Concession Type *"
                              options={concessionTypesList}
                              labelKey="name"
                              valueKey="id"
                              value={values.concessionTypeId}
                              onChange={(val) => {
                                setFieldValue('concessionTypeId', val);
                                setFieldValue('concessionTypeDocuments', []);
                              }}
                              error={!!errors.concessionTypeId && touched.concessionTypeId}
                              helperText={
                                (touched.concessionTypeId && errors.concessionTypeId) as string
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                        {selectedConcessionType?.description && (
                          <Grid size={{ xs: 12 }}>
                            <Alert severity="info" variant="outlined" sx={{ borderRadius: 1.5 }}>
                              <Typography variant="body2">
                                {selectedConcessionType.description}
                              </Typography>
                            </Alert>
                          </Grid>
                        )}
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            label="Remarks (optional)"
                            value={values.remarks}
                            onChange={(e) => setFieldValue('remarks', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}

              {/* 4. Fee Head Mapping */}
              {values.studentId && (
                <Grid size={{ xs: 12 }}>
                  <Accordion
                    expanded={expandedPanels.feeHeads}
                    onChange={() => handleAccordionToggle('feeHeads')}
                    disableGutters
                    elevation={0}
                    sx={accordionSx}
                  >
                    <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="h6" fontWeight={600}>
                          Fee Head Mapping
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      {!values.concessionTypeId ? (
                        <Typography color="text.secondary" textAlign="center" py={2}>
                          Please select a concession type above to map fee heads.
                        </Typography>
                      ) : feeStructureLoading ? (
                        <Typography color="text.secondary" textAlign="center" py={2}>
                          Loading fee structure...
                        </Typography>
                      ) : feeHeads.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" py={2}>
                          No fee heads available for this student.
                        </Typography>
                      ) : (
                        <Grid container spacing={1}>
                          {feeHeads.map((fh: any) => {
                            const isChecked = (
                              values.selectedFeeHeads[values.concessionTypeId] || []
                            ).includes(fh.feeHeadId);
                            return (
                              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={fh.feeHeadId}>
                                <Box
                                  onClick={() =>
                                    handleFeeHeadToggle(values.concessionTypeId, fh.feeHeadId)
                                  }
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '1.5px solid',
                                    borderColor: isChecked ? 'primary.main' : 'divider',
                                    borderRadius: '8px',
                                    p: '6px 10px',
                                    cursor: 'pointer',
                                    bgcolor: isChecked
                                      ? 'rgba(25,118,210,0.08)'
                                      : 'background.paper',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isChecked
                                      ? '0 1px 6px rgba(25,118,210,0.14)'
                                      : 'none',
                                    '&:hover': {
                                      borderColor: 'primary.light',
                                      bgcolor: 'action.hover',
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      minWidth: 0,
                                      gap: 1,
                                    }}
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={isChecked}
                                      onChange={() =>
                                        handleFeeHeadToggle(values.concessionTypeId, fh.feeHeadId)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      sx={{ p: 0.25, flexShrink: 0 }}
                                    />
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography
                                        variant="subtitle2"
                                        color="text.primary"
                                        fontWeight={isChecked ? 600 : 400}
                                        noWrap
                                      >
                                        {fh.feeHeadName}
                                      </Typography>
                                      {fh.categoryName && (
                                        <Typography variant="caption" noWrap display="block">
                                          {fh.categoryName}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                  <Typography
                                    variant="subtitle2"
                                    color={isChecked ? 'primary.main' : 'text.secondary'}
                                    sx={{
                                      fontWeight: 700,
                                      whiteSpace: 'nowrap',
                                      ml: 0.5,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {new Intl.NumberFormat('en-IN', {
                                      style: 'currency',
                                      currency: 'INR',
                                      maximumFractionDigits: 0,
                                    }).format(fh.amount)}
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}

              {/* 5. Concession Values */}
              {values.studentId && values.concessionTypeId && hasSelectedFeeHeads && (
                <Grid size={{ xs: 12 }}>
                  <Accordion
                    expanded={expandedPanels.valueEntry}
                    onChange={() => handleAccordionToggle('valueEntry')}
                    elevation={0}
                    sx={accordionSx}
                  >
                    <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="h6" fontWeight={600}>
                          Concession Values
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ValueEntryStep
                        formik={{
                          ...formik,
                          values: {
                            ...formik.values,
                            concessionTypeIds: [formik.values.concessionTypeId],
                          },
                        }}
                        concessionTypes={concessionTypesList}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}

              {/* 6. Concession Preview */}
              {previewData && (
                <Grid size={{ xs: 12 }}>
                  <Accordion
                    expanded={expandedPanels.preview}
                    onChange={() => handleAccordionToggle('preview')}
                    elevation={0}
                    sx={{
                      border: '1.5px solid',
                      borderColor: 'primary.main',
                      borderRadius: '12px !important',
                      mb: 1.5,
                      boxShadow: '0 2px 12px rgba(25,118,210,0.12)',
                      transition: 'box-shadow 0.25s ease',
                      '&:before': { display: 'none' },
                      '&:hover': { boxShadow: '0 6px 24px rgba(25,118,210,0.20)' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<Iconify icon="mdi:chevron-down" />}
                      sx={{
                        borderRadius: '12px 12px 0 0',
                        bgcolor: (theme) =>
                          theme.palette.primary.lighter || 'rgba(25,118,210,0.08)',
                        borderBottom: '1px solid',
                        borderColor: 'primary.light',
                        minHeight: 52,
                        '&.Mui-expanded': { minHeight: 52 },
                        '& .MuiAccordionSummary-content': { my: '14px' },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Iconify icon="mdi:eye-outline" width={20} color="primary.main" />
                        <Typography variant="h6" fontWeight={600} letterSpacing={0.1}>
                          Concession Preview
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'grey.50' }}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            letterSpacing={0.1}
                            color="text.primary"
                          >
                            {selectedConcessionType?.concessionName ||
                              selectedConcessionType?.name ||
                              'Concession'}{' '}
                            — Impact Summary
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2.5 }}>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                Total Fees
                              </Typography>
                              <Typography variant="body2" fontWeight={700}>
                                {formatNumber(previewData.totalFees, 'INR')}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="error.main" fontWeight={600}>
                                (-) Concession Discount
                              </Typography>
                              <Typography variant="body2" fontWeight={700} color="error.main">
                                - {formatNumber(previewData.concessionAmount, 'INR')}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight={700}>
                                Net Payable
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={800} color="success.main">
                                {formatNumber(previewData.netPayable, 'INR')}
                              </Typography>
                            </Box>
                            <Alert
                              severity="success"
                              variant="outlined"
                              icon={<Iconify icon="mdi:tag-check-outline" width={20} />}
                              sx={{ borderRadius: '8px', mt: 0.5 }}
                            >
                              <Typography variant="body2">
                                Student saves{' '}
                                <strong>{formatNumber(previewData.concessionAmount, 'INR')}</strong>{' '}
                                ({previewData.savingsPercent}% of total fees)
                              </Typography>
                            </Alert>
                          </Stack>
                        </Box>
                      </Card>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}

              {/* 7. Documents */}
              {values.concessionTypeId && (
                <Grid size={{ xs: 12 }}>
                  <Accordion
                    expanded={expandedPanels.documents}
                    onChange={() => handleAccordionToggle('documents')}
                    disableGutters
                    elevation={0}
                    sx={accordionSx}
                  >
                    <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                      <Typography variant="h6" fontWeight={600}>
                        Documents
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ConcessionDocumentList
                        concessionId={values.concessionTypeId}
                        concessionName={
                          selectedConcessionType?.concessionName ||
                          selectedConcessionType?.name ||
                          ''
                        }
                        submittedDocuments={getSubmittedDocs(values.concessionTypeId)}
                        onSave={(newDocs) => handleSaveDocs(values.concessionTypeId, newDocs)}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </Grid>
          </Scrollbar>

          <DialogActions
            sx={{
              px: 2.5,
              py: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
              gap: 1,
            }}
          >
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
            <LoadingButton
              type="button"
              variant="contained"
              size="small"
              disabled={createLoading || uploadLoading || isAmountExceedingFees}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              loading={createLoading || uploadLoading}
              onClick={handleSubmit}
            >
              Submit
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ConcessionRequestForm;
