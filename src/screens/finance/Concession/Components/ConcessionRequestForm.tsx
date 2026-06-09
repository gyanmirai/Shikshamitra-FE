'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetStudentsByDivisionQuery } from 'src/redux/student';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetConcessionTypesQuery } from 'src/redux/finance/concessionType';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetStudentFeeStructureQuery } from 'src/redux/student/admission/admission-api';
import {
  Box,
  Grid,
  Card,
  Paper,
  Stack,
  Alert,
  Button,
  Divider,
  Checkbox,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
} from '@mui/material';
import {
  useUploadDocumentsMutation,
  useGetConcessionRequestByIdQuery,
  useCreateConcessionRequestMutation,
  useUpdateConcessionRequestMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

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

const paperSx = {
  p: 1.5,
  mb: 1.5,
  borderRadius: 2,
  transition: 'box-shadow 0.2s ease',
  '&:hover': { boxShadow: 4 },
} as const;

function buildInitialValues(detailData?: any): FormValues {
  if (detailData) {
    const typeId = detailData.concessionTypeId;
    const selectedFeeHeads: Record<string, string[]> = {};
    const valueEntries: Record<string, Record<string, ValueEntry>> = {};

    selectedFeeHeads[typeId] = [];
    valueEntries[typeId] = {};

    (detailData.feeHeadConcessions || []).forEach((fh: any) => {
      selectedFeeHeads[typeId].push(fh.feeHeadId);
      valueEntries[typeId][fh.feeHeadId] = {
        basedOn: fh.basedOn,
        amount: fh.amount,
        netAmount: fh.netAmount,
      };
    });

    const docs =
      detailData.submittedDocuments?.map((d: any) => ({
        documentId: d.documentId,
        url: d.url,
        status: d.status,
      })) || [];

    return {
      boardId: detailData.boardId || '',
      boardName: detailData.boardName || '',
      mediumId: detailData.educationMediumId || '',
      mediumName: detailData.educationMediumName || '',
      standardId: detailData.standardId || '',
      standardName: detailData.standardName || '',
      divisionId: detailData.divisionId || '',
      divisionName: detailData.divisionName || '',
      studentId: detailData.studentId || '',
      studentName: detailData.studentName || '',
      selectedStudent: null,
      concessionTypeId: typeId || '',
      concessionTypeDocuments: [{ concessionTypeId: typeId, documents: docs }],
      selectedFeeHeads,
      valueEntries,
      concessionRequestId: detailData.concessionRequestId || detailData.id || '',
      remarks: detailData.remarks || '',
    };
  }

  return {
    boardId: '',
    boardName: '',
    mediumId: '',
    mediumName: '',
    standardId: '',
    standardName: '',
    divisionId: '',
    divisionName: '',
    studentId: '',
    studentName: '',
    selectedStudent: null,
    concessionTypeId: '',
    concessionTypeDocuments: [],
    selectedFeeHeads: {},
    valueEntries: {},
    concessionRequestId: '',
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
  const isEditMode = !!editData?.id;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const theme = useTheme();

  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivisions, setAllDivisions] = useState<any[]>([]);

  // -- API queries / mutations -----------------------------------------------

  const {
    data: concessionData,
    isLoading: isLoadingConcession,
    isFetching: isFetchingConcession,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestByIdQuery,
    params: {
      concessionRequestId: editData?.id,
    },
    options: { skip: !editData?.id },
  });

  const [updateConcessionRequest, { isLoading: updateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateConcessionRequestMutation,
  });

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

  const initialValues = useMemo(() => buildInitialValues(concessionData?.data), [concessionData]);

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

        const typeId = values.concessionTypeId;
        const selectedFeeHeadIds = values.selectedFeeHeads[typeId] || [];
        const feeHeadConcessions = selectedFeeHeadIds.map((fhId: string) => {
          const entry = values.valueEntries[typeId]?.[fhId] || {
            basedOn: 0,
            amount: 0,
            netAmount: 0,
          };
          return {
            feeHeadId: fhId,
            basedOn: entry.basedOn,
            amount: entry.amount,
            netAmount: entry.netAmount,
          };
        });

        const isEditing = !!(editData?.id && values.concessionRequestId);
        let res: any;

        if (isEditing) {
          res = await updateConcessionRequest({
            concessionRequestId: values.concessionRequestId,
            academicYearId: currentYear?.id,
            studentId: values.studentId,
            concessionTypeId: typeId,
            remarks: values.remarks,
            feeHeadConcessions,
          }).unwrap();
        } else {
          res = await createConcessionRequest({
            academicYearId: currentYear?.id,
            studentId: values.studentId,
            concessionTypeId: typeId,
            remarks: values.remarks,
            feeHeadConcessions,
          }).unwrap();
        }

        const reqId =
          res?.data?.concessionRequestId ||
          res?.concessionRequestId ||
          res?.data?.id ||
          res?.id ||
          values.concessionRequestId;

        if (!reqId) throw new Error('Failed to get concession request ID from response');

        const docBlock = values.concessionTypeDocuments?.find(
          (d: any) => d.concessionTypeId === typeId
        );
        const flatDocs =
          docBlock?.documents?.map((d: any) => ({
            documentId: d.documentId,
            url: d.url,
            status: d.status ?? 1,
          })) || [];

        if (flatDocs.length > 0) {
          await uploadDocuments({ concessionRequestId: reqId, documents: flatDocs }).unwrap();
        }

        shikshaMitraToast.success({
          message: `Concession request ${isEditing ? 'updated' : 'created'} successfully`,
        });
        onClose(null, true);
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.message || err?.message || 'Something went wrong',
        });
      }
    },
  });
  useEffect(() => {
    formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear?.id]); // Log formik values on every change for debugging

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;

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
    formik.validateForm().then(() => {
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
  console.log('formik initial values---', formik.initialValues);
  console.log('formik values-------------', formik.values);
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

  // Reset fee head selections when concession type changes (skip in edit mode to preserve loaded data)
  const prevConcessionTypeIdRef = useRef<string>('');
  useEffect(() => {
    // In edit mode, the first time concessionTypeId is set from API data, don't clear
    if (isEditMode && prevConcessionTypeIdRef.current === '') {
      prevConcessionTypeIdRef.current = values.concessionTypeId;
      return;
    }
    if (prevConcessionTypeIdRef.current !== values.concessionTypeId) {
      prevConcessionTypeIdRef.current = values.concessionTypeId;
      if (!isEditMode) {
        setFieldValue('selectedFeeHeads', {});
        setFieldValue('valueEntries', {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.concessionTypeId]);

  // -- Render ----------------------------------------------------------------

  if (isLoadingConcession || isFetchingConcession) {
    return (
      <Box sx={{ p: 1, height: '100%', overflow: 'auto' }}>
        {/* Student Information skeleton */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
            <Skeleton variant="circular" width={18} height={18} />
            <Box>
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="text" width={220} height={16} />
            </Box>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
            <Grid size={{ xs: 12 }}>
              <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Paper>

        {/* Concession Details skeleton */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
            <Skeleton variant="circular" width={18} height={18} />
            <Box>
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="text" width={200} height={16} />
            </Box>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Skeleton variant="rounded" height={60} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Paper>

        {/* Fee Head Mapping skeleton */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
            <Skeleton variant="circular" width={18} height={18} />
            <Box>
              <Skeleton variant="text" width={130} height={20} />
              <Skeleton variant="text" width={210} height={16} />
            </Box>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            {[...Array(8)].map((_, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                <Skeleton variant="rounded" height={52} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  }

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ p: 1 }}>
              <Grid container spacing={0}>
                {/* 1. Student Information */}
                <Grid size={{ xs: 12 }}>
                  <Paper variant="outlined" sx={paperSx}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                      <Iconify
                        icon="solar:users-group-rounded-bold-duotone"
                        width={18}
                        sx={{ color: 'primary.main' }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Student Information
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Select board, class, and student to proceed
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
                          <CustomSelect
                            label="Board *"
                            options={boards}
                            labelKey="name"
                            valueKey="id"
                            value={values.boardId}
                            disabled={isEditMode}
                            onChange={(val) => {
                              const board = boards.find((b) => b.id === val);
                              setFieldValue('boardId', val);
                              setFieldTouched('boardId', false);
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
                            disabled={isEditMode || !values.boardId}
                            options={mediums}
                            labelKey="name"
                            valueKey="id"
                            value={values.mediumId}
                            onChange={(val) => {
                              const medium = mediums.find((m) => m.id === val);
                              setFieldValue('mediumId', val);
                              setFieldTouched('mediumId', false);
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
                            disabled={isEditMode || !values.mediumId}
                            options={classes || []}
                            isLoading={classLoading}
                            labelKey="name"
                            valueKey="id"
                            value={values.standardId}
                            onChange={(val) => {
                              const standard = classes?.find((c: any) => c.id === val);
                              setFieldValue('standardId', val);
                              setFieldTouched('standardId', false);
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
                            disabled={isEditMode || !values.standardId}
                            options={allDivisions}
                            labelKey="name"
                            valueKey="id"
                            value={values.divisionId}
                            onChange={(val) => {
                              const division = allDivisions.find((d) => d.id === val);
                              setFieldValue('divisionId', val);
                              setFieldTouched('divisionId', false);
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
                            disabled={isEditMode || !values.divisionId}
                            options={studentOptions}
                            value={
                              studentOptions.find((s: any) => s.studentId === values.studentId) ||
                              null
                            }
                            onChange={(_e, value: any) => {
                              setFieldValue('studentId', value?.studentId || '');
                              setFieldTouched('studentId', false);
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
                  </Paper>
                </Grid>
                {/* 3. Fee Summary */}
                {values.studentId && totalFees > 0 && (
                  <Grid size={{ xs: 12 }} pb={1}>
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
                    <Paper variant="outlined" sx={paperSx}>
                      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <Iconify
                          icon="solar:tag-price-bold-duotone"
                          width={18}
                          sx={{ color: 'primary.main' }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Concession Details
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Choose concession type and add remarks
                          </Typography>
                        </Box>
                      </Stack>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <ShakingTextField
                            error={!!(touched.concessionTypeId && errors.concessionTypeId)}
                          >
                            <Autocomplete
                              options={concessionTypesList}
                              value={
                                concessionTypesList.find(
                                  (ct: any) => ct.id === values.concessionTypeId
                                ) ||
                                (isEditMode
                                  ? {
                                      id: values.concessionTypeId,
                                      name: concessionData?.data?.concessionTypeName || '',
                                    }
                                  : null)
                              }
                              onChange={(_, newValue: any) => {
                                setFieldValue('concessionTypeId', newValue?.id || '');
                                setFieldValue('concessionTypeDocuments', []);
                              }}
                              disabled={isEditMode}
                              size="small"
                              disableClearable
                              getOptionLabel={(option: any) => option.name || ''}
                              renderOption={(props, option: any) => (
                                <Box
                                  component="li"
                                  {...props}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    width: '100%',
                                  }}
                                >
                                  {option.name}
                                  <Box sx={{ marginLeft: 'auto' }}>
                                    <CustomTooltip
                                      title={option.description || 'No description available'}
                                      placement="right"
                                    >
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: theme.vars.palette.info.main,
                                        }}
                                      >
                                        <Iconify icon="mdi:information" width={20} />
                                      </IconButton>
                                    </CustomTooltip>
                                  </Box>
                                </Box>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Concession Type *"
                                  fullWidth
                                  error={!!errors.concessionTypeId && touched.concessionTypeId}
                                  helperText={
                                    (touched.concessionTypeId && errors.concessionTypeId) as string
                                  }
                                />
                              )}
                            />
                          </ShakingTextField>
                        </Grid>
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
                    </Paper>
                  </Grid>
                )}

                {/* 4. Fee Head Mapping */}
                {values.studentId && (
                  <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={paperSx}>
                      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <Iconify
                          icon="solar:bill-list-bold-duotone"
                          width={18}
                          sx={{ color: 'primary.main' }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Fee Head Mapping
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Select fee heads to apply concession
                          </Typography>
                        </Box>
                      </Stack>
                      <Divider sx={{ mb: 2 }} />
                      {!values.concessionTypeId ? (
                        <Typography color="text.secondary" textAlign="center" py={2}>
                          Please select a concession type above to map fee heads.
                        </Typography>
                      ) : feeStructureLoading ? (
                        <Typography color="text.secondary" textAlign="center" py={2}>
                          Loading fee structure...
                        </Typography>
                      ) : (
                        (() => {
                          // In edit mode, fall back to feeHeadConcessions from API if feeStructureData hasn't loaded yet
                          const displayFeeHeads =
                            feeHeads.length > 0
                              ? feeHeads
                              : isEditMode
                                ? (concessionData?.data?.feeHeadConcessions || []).map(
                                    (fhc: any) => ({
                                      feeHeadId: fhc.feeHeadId,
                                      feeHeadName: fhc.feeHeadName,
                                      amount: fhc.annualBaseAmount ?? fhc.amount ?? 0,
                                      categoryName: '',
                                    })
                                  )
                                : [];

                          if (displayFeeHeads.length === 0) {
                            return (
                              <Typography color="text.secondary" textAlign="center" py={2}>
                                No fee heads available for this student.
                              </Typography>
                            );
                          }

                          return (
                            <Grid container spacing={1}>
                              {displayFeeHeads.map((fh: any) => {
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
                                            handleFeeHeadToggle(
                                              values.concessionTypeId,
                                              fh.feeHeadId
                                            )
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
                          );
                        })()
                      )}
                    </Paper>
                  </Grid>
                )}

                {/* 5. Concession Values */}
                {values.studentId && values.concessionTypeId && hasSelectedFeeHeads && (
                  <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={paperSx}>
                      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <Iconify
                          icon="solar:calculator-bold-duotone"
                          width={18}
                          sx={{ color: 'primary.main' }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Concession Values
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Enter concession amounts per fee head
                          </Typography>
                        </Box>
                      </Stack>
                      <Divider sx={{ mb: 2 }} />
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
                    </Paper>
                  </Grid>
                )}

                {/* 6. Concession Preview */}
                {previewData && (
                  <Grid size={{ xs: 12 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 2,
                        border: '1.5px solid',
                        borderColor: 'primary.main',
                        transition: 'box-shadow 0.2s ease',
                        '&:hover': { boxShadow: 4 },
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <Iconify icon="mdi:eye-outline" width={18} sx={{ color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Concession Preview
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Summary of concession impact on fees
                          </Typography>
                        </Box>
                      </Stack>
                      <Divider sx={{ mb: 2 }} />
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ px: 2.5, py: 1.5 }}>
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
                    </Paper>
                  </Grid>
                )}

                {/* 7. Documents */}
                {values.concessionTypeId && (
                  <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={paperSx}>
                      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                        <Iconify
                          icon="solar:document-bold-duotone"
                          width={18}
                          sx={{ color: 'primary.main' }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Documents
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Upload required supporting documents
                          </Typography>
                        </Box>
                      </Stack>
                      <Divider sx={{ mb: 2 }} />
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
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Scrollbar>

          {/* ── Sticky Action Bar ── */}
          <Box
            sx={{
              flexShrink: 0,
              borderTop: `1px solid`,
              borderColor: 'divider',
              backdropFilter: 'blur(12px)',
              px: { xs: 2, md: 3 },
              py: 1.5,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              gap={1.5}
            >
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
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
                  disabled={
                    createLoading || updateLoading || uploadLoading || isAmountExceedingFees
                  }
                  startIcon={<Iconify icon={GlobalIcons.submit} />}
                  loading={createLoading || updateLoading || uploadLoading}
                  onClick={handleSubmit}
                >
                  {editData?.id ? 'Update' : 'Submit'}
                </LoadingButton>
              </Stack>
            </Box>
          </Box>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ConcessionRequestForm;
