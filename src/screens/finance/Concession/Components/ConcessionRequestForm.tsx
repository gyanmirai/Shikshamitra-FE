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
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useGetConcessionTypesQuery } from 'src/redux/finance/concessionType';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
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
  Accordion,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import ConcessionDocumentList from './ConcessionDocumentList';

import type { IConcessionFormProps } from '../type';

const DUMMY_FEE_DATA = {
  totalFees: 45000,
  paidFees: 15000,
  pendingFees: 30000,
  feeHeads: [
    { name: 'Tuition Fee', amount: 25000, paid: 10000, pending: 15000 },
    { name: 'Library Fee', amount: 5000, paid: 2000, pending: 3000 },
    { name: 'Lab Fee', amount: 8000, paid: 3000, pending: 5000 },
    { name: 'Sports Fee', amount: 4000, paid: 0, pending: 4000 },
    { name: 'Exam Fee', amount: 3000, paid: 0, pending: 3000 },
  ],
};

const ConcessionRequestForm: React.FC<IConcessionFormProps> = ({
  onClose,
  open,
  student,
  editData,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivisions, setAllDivisions] = useState<any[]>([]);

  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const [
    getFilterStudents,
    { data: studentsData, isLoading: studentLoading, isFetching: studentFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
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

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    studentInfo: true,
    feeDetails: true,
    concessionType: true,
    preview: true,
    documents: true,
  });

  const handleAccordionToggle = useCallback((panel: string) => {
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  const concessionTypesList = useMemo(() => concessionTypes?.data?.items || [], [concessionTypes]);

  const initialValues = useMemo(
    () => ({
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
      selectedStudent: null as any,
      concessionTypeId: editData?.concessionTypeIds?.[0] || '',
      concessionAmount: editData?.concessions?.[0]?.amount || 0,
      concessionTypeDocuments: [] as any[],
      remarks: '',
    }),
    [editData]
  );

  const validationSchema = Yup.object({
    boardId: Yup.string().required('Board is required'),
    mediumId: Yup.string().required('Medium is required'),
    standardId: Yup.string().required('Class is required'),
    divisionId: Yup.string().required('Division is required'),
    studentId: Yup.string().required('Student is required'),
    concessionTypeId: Yup.string().required('Concession type is required'),
    concessionAmount: Yup.number()
      .required('Concession amount is required')
      .min(1, 'Amount must be greater than 0'),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        const res: any = await createConcessionRequest({
          boardId: values.boardId,
          educationMediumId: values.mediumId,
          standardId: values.standardId,
          divisionId: values.divisionId,
          studentId: values.studentId,
          concessionTypeIds: [values.concessionTypeId],
          concessionAmount: values.concessionAmount,
          remarks: values.remarks,
        }).unwrap();

        const reqId =
          res?.data?.concessionRequestId || res?.concessionRequestId || res?.data?.id || res?.id;

        if (!reqId) {
          throw new Error('Failed to get concession request ID from response');
        }

        if (values.concessionTypeDocuments?.length > 0) {
          const selectedConcessionTypes =
            res?.data?.selectedConcessionTypes || res?.selectedConcessionTypes || [];
          const concessionTypeIdMap: Record<string, string> = {};
          (selectedConcessionTypes || []).forEach((ct: any) => {
            concessionTypeIdMap[ct.concessionTypeId] = ct.concessionRequestConcessionTypeId;
          });
          const concessionTypeDocuments = (values.concessionTypeDocuments || []).map(
            (docGroup: any) => ({
              ...docGroup,
              concessionRequestConcessionTypeId:
                concessionTypeIdMap[docGroup.concessionTypeId] ||
                docGroup.concessionRequestConcessionTypeId ||
                '',
            })
          );
          await uploadDocuments({ concessionRequestId: reqId, concessionTypeDocuments }).unwrap();
        }

        shikshaMitraToast.success({ message: 'Concession request created successfully' });
        onClose(null, true);
      } catch (err: any) {
        console.error(err);
        shikshaMitraToast.error({
          message: err?.data?.message || err?.message || 'Something went wrong',
        });
      }
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;

  const handleSubmit = useCallback(() => {
    const fieldToPanelMap: Record<string, string> = {
      boardId: 'studentInfo',
      mediumId: 'studentInfo',
      standardId: 'studentInfo',
      divisionId: 'studentInfo',
      studentId: 'studentInfo',
      concessionTypeId: 'concessionType',
      concessionAmount: 'concessionType',
    };
    formik.validateForm().then((validationErrors) => {
      const errorKeys = Object.keys(validationErrors);
      if (errorKeys.length > 0) {
        const panelsToOpen: Record<string, boolean> = {};
        errorKeys.forEach((key) => {
          if (fieldToPanelMap[key]) panelsToOpen[fieldToPanelMap[key]] = true;
        });
        setExpandedPanels((prev) => ({ ...prev, ...panelsToOpen }));
      }
      formik.handleSubmit();
    });
  }, [formik]);

  const feeData = useMemo(() => {
    if (!values.studentId) return null;
    return DUMMY_FEE_DATA;
  }, [values.studentId]);

  const selectedConcessionType = useMemo(
    () => concessionTypesList.find((ct: any) => ct.id === values.concessionTypeId),
    [concessionTypesList, values.concessionTypeId]
  );

  const previewData = useMemo(() => {
    if (!feeData || !values.concessionAmount || values.concessionAmount <= 0) return null;
    const concessionAmt = Number(values.concessionAmount) || 0;
    return {
      totalFees: feeData.totalFees,
      paidFees: feeData.paidFees,
      pendingFees: feeData.pendingFees,
      concessionAmount: concessionAmt,
      netPayable: Math.max(feeData.pendingFees - concessionAmt, 0),
      savingsPercent: ((concessionAmt / feeData.pendingFees) * 100).toFixed(1),
    };
  }, [feeData, values.concessionAmount]);

  const handleSaveDocs = useCallback(
    (concessionId: string, newDocs: any[]) => {
      const currentPayload = [...(values.concessionTypeDocuments || [])];
      const typeIndex = currentPayload.findIndex((d: any) => d.concessionTypeId === concessionId);
      const formattedDocs = newDocs.map((d) => ({
        documentId: d.documentId,
        url: d.url,
        status: d.status,
      }));
      if (typeIndex === -1) {
        currentPayload.push({ concessionTypeId: concessionId, documents: formattedDocs });
      } else {
        currentPayload[typeIndex] = { ...currentPayload[typeIndex], documents: formattedDocs };
      }
      setFieldValue('concessionTypeDocuments', currentPayload);
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

  const studentOptions = useMemo(
    () =>
      studentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.middleName ? `${item.middleName} ` : ''}${item.lastName}`,
      })) || [],
    [studentsData?.items]
  );

  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear]);

  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === values.boardId);
    setMediums(selectedBoard?.educationMediums || []);
  }, [values.boardId, boards]);

  useEffect(() => {
    if (values.mediumId) getClassByMedium(values.mediumId);
  }, [values.mediumId, getClassByMedium]);

  useEffect(() => {
    setAllDivisions(classes?.find((cls: any) => cls.id === values.standardId)?.divisions || []);
  }, [values.standardId, classes]);

  useEffect(() => {
    if (values.standardId && values.divisionId) {
      getFilterStudents({ academicYearId: currentYear?.id, academicMediumId: values.mediumId });
    }
  }, [currentYear?.id, getFilterStudents, values.mediumId, values.standardId, values.divisionId]);

  const accordionSx = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '8px !important',
    mb: 1,
    '&:before': { display: 'none' },
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={2}>
              {/* Student Information */}
              <Grid size={{ xs: 12 }}>
                <Accordion
                  expanded={expandedPanels.studentInfo}
                  onChange={() => handleAccordionToggle('studentInfo')}
                  disableGutters
                  elevation={0}
                  sx={accordionSx}
                >
                  <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                    <Typography variant="h6">Student Information</Typography>
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
                              setFieldValue('boardId', val);
                              const board = boards.find((b) => b.id === val);
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
                              setFieldValue('mediumId', val);
                              const medium = mediums.find((m) => m.id === val);
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
                              setFieldValue('standardId', val);
                              const standard = classes?.find((c: any) => c.id === val);
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
                              setFieldValue('divisionId', val);
                              const division = allDivisions.find((d) => d.id === val);
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

              {/* Fee Details */}
              {values.studentId && feeData && (
                <Grid size={{ xs: 12 }}>
                  <Grid container spacing={2}>
                    {[
                      {
                        icon: 'mdi:currency-inr',
                        title: 'Total Fees',
                        value: feeData.totalFees,
                        color: 'text.primary',
                        bgColor: 'background.neutral',
                      },
                      {
                        icon: 'mdi:cash-check',
                        title: 'Paid Fees',
                        value: feeData.paidFees,
                        color: 'success.main',
                        bgColor: 'success.lighter',
                      },
                      {
                        icon: 'mdi:cash-clock',
                        title: 'Pending Fees',
                        value: feeData.pendingFees,
                        color: 'warning.main',
                        bgColor: 'warning.lighter',
                      },
                    ].map((item) => (
                      <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
                        <Card
                          sx={{
                            p: 1.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 3,
                            flexGrow: 1,
                            height: '100%',
                            width: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': { boxShadow: 'var(--shadows-8)', scale: 1.02 },
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1">{item.title}</Typography>
                            <Typography variant="h6">{formatNumber(item.value, 'INR')}</Typography>
                          </Box>
                          <Iconify
                            icon={item.icon}
                            sx={{ height: '40px', width: '40px', color: item.color }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {/* Concession Details */}
              <Grid size={{ xs: 12 }}>
                <Accordion
                  expanded={expandedPanels.concessionType}
                  onChange={() => handleAccordionToggle('concessionType')}
                  disableGutters
                  elevation={0}
                  sx={accordionSx}
                >
                  <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                    <Typography variant="h6">Concession Details</Typography>
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
                              setFieldValue('concessionAmount', 0);
                              setFieldValue('concessionTypeDocuments', []);
                            }}
                            error={!!errors.concessionTypeId && touched.concessionTypeId}
                            helperText={
                              (touched.concessionTypeId && errors.concessionTypeId) as string
                            }
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <ShakingTextField
                          error={!!(touched.concessionAmount && errors.concessionAmount)}
                        >
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Concession Amount *"
                            value={values.concessionAmount || ''}
                            onChange={(e) =>
                              setFieldValue('concessionAmount', Number(e.target.value))
                            }
                            onBlur={() => setFieldTouched('concessionAmount', true)}
                            error={!!errors.concessionAmount && touched.concessionAmount}
                            helperText={
                              (touched.concessionAmount && errors.concessionAmount) as string
                            }
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mr: 0.5 }}
                                  >
                                    &#8377;
                                  </Typography>
                                ),
                              },
                            }}
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

              {/* Concession Preview */}
              {previewData && values.concessionTypeId && (
                <Grid size={{ xs: 12 }}>
                  <Accordion
                    expanded={expandedPanels.preview}
                    onChange={() => handleAccordionToggle('preview')}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: '2px solid',
                      borderColor: 'primary.light',
                      borderRadius: '8px !important',
                      mb: 1,
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<Iconify icon="mdi:chevron-down" />}
                      sx={{
                        bgcolor: (theme) =>
                          theme.palette.primary.lighter || theme.palette.action.hover,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="mdi:eye-outline" width={20} color="primary.main" />
                        <Typography variant="subtitle2" color="primary.main">
                          Concession Preview
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {selectedConcessionType?.concessionName ||
                              selectedConcessionType?.name ||
                              'Concession'}{' '}
                            â€” Impact Summary
                          </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2 }}>
                          <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                Pending Fees
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {formatNumber(previewData.pendingFees, 'INR')}
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
                              <Typography variant="subtitle1" fontWeight={700}>
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
                              sx={{ borderRadius: 1.5, mt: 1 }}
                            >
                              <Typography variant="body2">
                                Student saves{' '}
                                <strong>{formatNumber(previewData.concessionAmount, 'INR')}</strong>{' '}
                                ({previewData.savingsPercent}% of pending fees)
                              </Typography>
                            </Alert>
                            {previewData.concessionAmount > previewData.pendingFees && (
                              <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                                <Typography variant="body2">
                                  Concession amount exceeds pending fees. Net payable will be 0.
                                </Typography>
                              </Alert>
                            )}
                          </Stack>
                        </Box>
                      </Card>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}

              {/* Documents */}
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
                      <Typography variant="h6">Documents</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
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
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </Grid>
          </Scrollbar>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
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
              disabled={createLoading || uploadLoading}
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
