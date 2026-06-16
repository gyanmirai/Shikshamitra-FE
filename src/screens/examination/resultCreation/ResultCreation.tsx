'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { Division, Standards, Organization } from 'src/types/school';

import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ExamReportTitle, ExamReportApiTypeMap } from 'src/enums/examination-reports';
import { usePreviewAcademicReportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import {
  useGetResultHeaderQuery,
  useFreezeResultMutation,
  usePublishResultMutation,
  useGenerateResultMutation,
  useGetResultReadinessQuery,
} from 'src/redux/academicAPI/ExaminationApi/ResultApi/resultApi';
import {
  Box,
  Card,
  Stack,
  Table,
  Button,
  Dialog,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  DialogActions,
  DialogContent,
  LinearProgress,
} from '@mui/material';

// ─── Types ─────────────────────────────────────────────────────────────────

interface PreviewColumn {
  id: string | null;
  label: string | null;
}

interface PreviewRow {
  [key: string]: string | null;
}

interface PreviewData {
  reportType: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
  columns: PreviewColumn[] | null;
  rows: PreviewRow[] | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const isStatusColumn = (colId: string | null): boolean => {
  if (!colId) return false;
  const lower = colId.toLowerCase();
  return lower.includes('status') || lower === 'pass_fail';
};

const isPercentageColumn = (colId: string | null): boolean => {
  if (!colId) return false;
  const lower = colId.toLowerCase();
  return lower.includes('percent') || lower.includes('%');
};

const getStatusColor = (
  value: string | null | undefined
): 'success' | 'error' | 'warning' | 'default' => {
  if (!value) return 'default';
  const lower = value.toLowerCase().trim();
  if (['pass', 'passed', 'p'].includes(lower)) return 'success';
  if (['fail', 'failed', 'f'].includes(lower)) return 'error';
  if (lower === 'compartment') return 'warning';
  return 'default';
};

const getPercentageColor = (
  value: string | null | undefined
): 'success' | 'warning' | 'error' | 'default' => {
  if (!value) return 'default';
  const num = parseFloat(value.replace('%', ''));
  if (Number.isNaN(num)) return 'default';
  if (num >= 75) return 'success';
  if (num >= 50) return 'warning';
  return 'error';
};

// ─── Student Details Dialog ─────────────────────────────────────────────────

interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  row: PreviewRow | null;
  columns: PreviewColumn[];
  examName: string;
  className: string;
  divisionName: string;
}

function StudentDetailsDialog({
  open,
  onClose,
  row,
  columns,
  examName,
  className,
  divisionName,
}: StudentDialogProps) {
  if (!row) return null;

  const subjectCols = columns.filter((c) => c.id?.startsWith('subj_'));
  const pctRaw = row.Percentage ?? '—';
  const gradeValue = row.Grade ?? '—';
  const totalValue = row.Total ?? '—';
  const rollNo = row.RollNo ?? '—';
  const studentName = row.StudentName ?? '—';
  const pctNum = parseFloat(pctRaw.replace('%', '')) || 0;
  const isPassing = pctNum >= 33 && gradeValue !== 'F';

  const gradeColorMap: Record<string, string> = {
    'A+': '#00897b',
    A: '#26a69a',
    'B+': '#42a5f5',
    B: '#64b5f6',
    'C+': '#ffa726',
    C: '#ffb74d',
    D: '#ef5350',
    F: '#b71c1c',
    '—': '#9e9e9e',
  };
  const gradeColor = gradeColorMap[gradeValue] ?? '#9e9e9e';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          px: 2.5,
          pt: 2.5,
          pb: 2,
          color: 'white',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              {studentName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Roll No: {rollNo}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white', mt: -0.5, mr: -1 }}>
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Box>
        <Box display="flex" gap={0.75} mt={1.25} flexWrap="wrap">
          {examName && (
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.3,
                bgcolor: 'rgba(255,255,255,0.18)',
                borderRadius: 1,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {examName}
            </Box>
          )}
          {className && (
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.3,
                bgcolor: 'rgba(255,255,255,0.12)',
                borderRadius: 1,
                fontSize: 11,
              }}
            >
              {className}
            </Box>
          )}
          {divisionName && (
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.3,
                bgcolor: 'rgba(255,255,255,0.12)',
                borderRadius: 1,
                fontSize: 11,
              }}
            >
              Div: {divisionName}
            </Box>
          )}
        </Box>
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={Math.min(pctNum, 100)}
        color={isPassing ? 'success' : 'error'}
        sx={{ height: 5 }}
      />

      <DialogContent sx={{ p: 0 }}>
        {/* Summary row */}
        <Box
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {[
            { label: 'Total Marks', value: totalValue, color: undefined as string | undefined },
            {
              label: 'Percentage',
              value: pctRaw,
              color: pctNum >= 75 ? '#11998e' : pctNum >= 33 ? '#f7971e' : '#f5576c',
            },
            { label: 'Grade', value: gradeValue, color: gradeColor },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRight: 1,
                borderColor: 'divider',
                '&:last-child': { borderRight: 0 },
              }}
            >
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ color: item.color || 'text.primary' }}
                lineHeight={1}
              >
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Pass / Fail banner */}
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: isPassing
              ? (theme) => alpha(theme.palette.success.main, 0.1)
              : (theme) => alpha(theme.palette.error.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Iconify
            icon={isPassing ? 'mdi:check-circle' : 'mdi:close-circle'}
            width={18}
            sx={{ color: isPassing ? 'success.main' : 'error.main' }}
          />
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ color: isPassing ? 'success.dark' : 'error.dark' }}
          >
            {isPassing ? 'RESULT: PASS' : 'RESULT: FAIL'}
          </Typography>
        </Box>

        {/* Subject marks table */}
        {subjectCols.length > 0 && (
          <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1, fontSize: 10 }}
            >
              Subject-wise Marks
            </Typography>
            <Table size="small" sx={{ mt: 0.75 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 12 }}>Subject</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, py: 0.75, fontSize: 12 }}>
                    Obtained
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, py: 0.75, fontSize: 12 }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjectCols.map((col) => {
                  const val = row[col.id!] ?? '—';
                  const isAbsent = val === 'Ab' || val.toLowerCase() === 'absent';
                  const marksNum = isAbsent ? null : parseFloat(val);
                  return (
                    <TableRow key={col.id} hover>
                      <TableCell sx={{ py: 0.75 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {col.label}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.75 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {isAbsent ? '—' : val}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.75 }}>
                        {isAbsent ? (
                          <Label variant="soft" color="default">
                            Absent
                          </Label>
                        ) : (
                          <Label
                            variant="soft"
                            color={marksNum !== null && marksNum > 0 ? 'info' : 'default'}
                          >
                            {marksNum !== null && marksNum > 0 ? 'Appeared' : '—'}
                          </Label>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Analytics Cards ────────────────────────────────────────────────────────

interface AnalyticsCardsProps {
  appeared: number;
  passed: number;
  failed: number;
  passPercentage: number;
  highestPercentage: number;
  averagePercentage: number;
}

function AnalyticsCards({
  appeared,
  passed,
  failed,
  passPercentage,
  highestPercentage,
  averagePercentage,
}: AnalyticsCardsProps) {
  const cards = [
    { label: 'Appeared', value: appeared, icon: 'mdi:account-group', g: ['#667eea', '#764ba2'] },
    {
      label: 'Passed',
      value: passed,
      icon: 'mdi:check-decagram',
      g: ['#11998e', '#38ef7d'],
    },
    {
      label: 'Failed',
      value: failed,
      icon: 'mdi:close-circle',
      g: ['#f5576c', '#f093fb'],
    },
    {
      label: 'Pass %',
      value: `${passPercentage}%`,
      icon: 'mdi:chart-donut',
      g: ['#4facfe', '#00f2fe'],
    },
    {
      label: 'Highest %',
      value: `${highestPercentage}%`,
      icon: 'mdi:trophy',
      g: ['#f7971e', '#ffd200'],
    },
    {
      label: 'Average %',
      value: `${averagePercentage}%`,
      icon: 'mdi:trending-up',
      g: ['#a18cd1', '#fbc2eb'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(145px, 1fr))"
        gap={1.5}
        mb={2}
      >
        {cards.map((card) => (
          <Box
            key={card.label}
            sx={{
              background: `linear-gradient(135deg, ${card.g[0]} 0%, ${card.g[1]} 100%)`,
              borderRadius: 2,
              p: 2,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 4px 18px ${card.g[0]}50`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: `0 8px 28px ${card.g[0]}70`,
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                right: -10,
                bottom: -10,
                opacity: 0.18,
                pointerEvents: 'none',
              }}
            >
              <Iconify icon={card.icon} width={64} />
            </Box>
            <Iconify icon={card.icon} width={22} sx={{ mb: 1, opacity: 0.92 }} />
            <Typography variant="h4" fontWeight={800} lineHeight={1} mb={0.5}>
              {card.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.88, fontWeight: 600, letterSpacing: 0.3 }}
            >
              {card.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

const ResultCreation = (_props: TabComponentType) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // ─── Filter states ─────────────────────────────────────────────────────
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [classes, setClass] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [examId, setExamId] = useState<string>('');

  useEffect(() => {
    const allClasses: Standards[] =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    if (allClasses.length > 0) setClass(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const divs: Division[] = allClass.find((c: any) => c?.id === classes)?.divisions || [];
    setAllDivision(divs);
    setDivision(divs[0]?.id || '');
    setExamId('');
  }, [allClass, classes]);

  useEffect(() => {
    setExamId('');
    setPreviewResult(null);
  }, [division]);

  // Auto-load results when all filters are selected
  useEffect(() => {
    if (classes && division && examId) {
      handleLoadResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // ─── Exams dropdown ────────────────────────────────────────────────────
  const {
    data: examData,
    isLoading: isExamLoading,
    isFetching: isExamFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params: {
      AcademicMediumId: medium?.id,
      StandardId: classes,
      DivisionId: division,
      Status: examScheduledStatus.Completed,
    },
    options: { skip: !(medium?.id && classes && division) },
  });

  const examOptions = useMemo<{ examId: string; examName: string }[]>(() => {
    const raw: any[] = examData?.data?.items ?? examData?.items ?? [];
    return raw.map((e: any) => ({
      examId: e.examId ?? e.id ?? '',
      examName: e.examName ?? e.name ?? '',
    }));
  }, [examData]);

  // ─── Preview API ───────────────────────────────────────────────────────
  const [previewResult, setPreviewResult] = useState<PreviewData | null>(null);

  const [previewReport, { isLoading: isPreviewLoading }] = useQueryAndMutation<
    typeof usePreviewAcademicReportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: usePreviewAcademicReportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to load results. Please try again.' },
  });

  const allFiltersSet = !!(classes && division && examId);

  // ─── Result header & analytics ─────────────────────────────────────────
  const { data: resultHeaderData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetResultHeaderQuery,
    params: { examId, divisionId: division },
    options: { skip: !allFiltersSet },
    popupConfig: { error: false },
  });

  const { data: readinessData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetResultReadinessQuery,
    params: { examId, divisionId: division },
    options: { skip: !allFiltersSet },
    popupConfig: { error: false },
  });

  const [generateResult, { isLoading: isGenerating }] = useQueryAndMutation<
    typeof useGenerateResultMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useGenerateResultMutation,
    popupConfig: { error: true, errorMessage: 'Failed to generate result.' },
  });

  const [publishResult, { isLoading: isPublishing }] = useQueryAndMutation<
    typeof usePublishResultMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: usePublishResultMutation,
    popupConfig: { error: true, errorMessage: 'Failed to publish result.' },
  });

  const [freezeResult, { isLoading: isFreezing }] = useQueryAndMutation<
    typeof useFreezeResultMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useFreezeResultMutation,
    popupConfig: { error: true, errorMessage: 'Failed to freeze result.' },
  });

  const handleLoadResults = useCallback(async () => {
    if (!allFiltersSet) return;
    try {
      const result = await (previewReport as any)({
        reportType: ExamReportApiTypeMap[ExamReportTitle.ResultWithAllSubjectList],
        page: 1,
        pageSize: 500,
        filters: { classIds: [classes], divisionIds: [division], examId },
      });
      if (result?.data) setPreviewResult(result.data as PreviewData);
    } catch {
      // handled by popupConfig
    }
  }, [allFiltersSet, previewReport, classes, division, examId]);

  const handleGenerate = useCallback(async () => {
    if (!allFiltersSet) return;
    try {
      const result: any = await generateResult({
        examId,
        divisionId: division,
        forceRegenerate: resultHeaderData?.statusCode === 2,
      }).unwrap();
      shikshaMitraToast.success({
        message: `Result generated! ${result?.passed ?? 0} passed out of ${result?.totalStudents ?? 0} students.`,
      });
      await handleLoadResults();
    } catch {
      // error handled by useQueryAndMutation popupConfig
    }
  }, [allFiltersSet, generateResult, examId, division, resultHeaderData, handleLoadResults]);

  const handlePublish = useCallback(async () => {
    if (!resultHeaderData?.id) return;
    try {
      await publishResult({ resultHeaderId: resultHeaderData.id }).unwrap();
      shikshaMitraToast.success({ message: 'Result published successfully!' });
    } catch {
      // error handled by useQueryAndMutation popupConfig
    }
  }, [resultHeaderData, publishResult]);

  const handleFreeze = useCallback(async () => {
    if (!resultHeaderData?.id) return;
    try {
      await freezeResult({ resultHeaderId: resultHeaderData.id }).unwrap();
      shikshaMitraToast.success({ message: 'Result frozen successfully.' });
    } catch {
      // error handled by useQueryAndMutation popupConfig
    }
  }, [resultHeaderData, freezeResult]);

  // ─── Student dialog ────────────────────────────────────────────────────
  const [dialogStudent, setDialogStudent] = useState<PreviewRow | null>(null);
  const handleViewStudent = useCallback((row: PreviewRow) => setDialogStudent(row), []);

  // ─── Table columns ─────────────────────────────────────────────────────
  const tableColumns = useMemo(() => {
    if (!previewResult?.columns?.length) return [];

    const dataCols: any[] = previewResult.columns
      .filter((col) => col.id && col.label)
      .map((col) => ({
        id: col.id as string,
        label: col.label as string,
        minWidth: col.id?.startsWith('subj_') ? 110 : 130,
        align: 'left' as const,
        render: (value: any) => {
          if (value == null || value === '') {
            return (
              <Typography variant="caption" color="text.disabled">
                —
              </Typography>
            );
          }
          if (isStatusColumn(col.id)) {
            return (
              <Label variant="soft" color={getStatusColor(String(value))}>
                {value}
              </Label>
            );
          }
          if (isPercentageColumn(col.id)) {
            return (
              <Label variant="soft" color={getPercentageColor(String(value))}>
                {value}
              </Label>
            );
          }
          if (col.id === 'Grade') {
            return (
              <Typography
                variant="caption"
                fontWeight={700}
                color={String(value) === 'F' ? 'error.main' : 'text.primary'}
              >
                {value}
              </Typography>
            );
          }
          return <Typography variant="caption">{value}</Typography>;
        },
      }));

    // Action column — view student details
    dataCols.push({
      id: '_action',
      label: 'Details',
      minWidth: 72,
      align: 'center' as const,
      render: (_: any, row: any) => (
        <Tooltip title="View full result">
          <IconButton
            size="small"
            onClick={() => handleViewStudent(row)}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18) },
            }}
          >
            <Iconify icon="mdi:eye-outline" width={17} sx={{ color: 'primary.main' }} />
          </IconButton>
        </Tooltip>
      ),
    });

    return dataCols;
  }, [previewResult?.columns, handleViewStudent]);

  const placeholderColumns = useMemo(
    () => [
      { id: 'studentName', label: 'Student Name', minWidth: 180, align: 'left' as const },
      { id: 'rollNo', label: 'Roll No.', minWidth: 90, align: 'left' as const },
      { id: 'total', label: 'Total', minWidth: 110, align: 'left' as const },
      { id: 'percentage', label: 'Percentage', minWidth: 120, align: 'left' as const },
      { id: 'grade', label: 'Grade', minWidth: 80, align: 'left' as const },
    ],
    []
  );

  const selectedExamName = examOptions.find((o) => o.examId === examId)?.examName || '';
  const selectedClassName = allClass.find((c: any) => c?.id === classes)?.name || '';
  const selectedDivisionName = allDivision.find((d: any) => d?.id === division)?.name || '';
  const tableData = useMemo(() => previewResult?.rows ?? [], [previewResult]);

  const statusChipColor = (
    code: number | undefined
  ): 'default' | 'warning' | 'success' | 'error' => {
    if (code === 0) return 'warning';
    if (code === 1) return 'success';
    if (code === 2) return 'error';
    return 'default';
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Breadcrumbs */}
      <CustomBreadcrumbs
        heading="Result Creation"
        description="Generate and review student-wise exam results with all subject marks"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination' },
          { name: 'Result Creation' },
        ]}
        action={
          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            {resultHeaderData && (
              <Label variant="soft" color={statusChipColor(resultHeaderData.statusCode)}>
                <Iconify
                  icon={
                    resultHeaderData.statusCode === 2
                      ? 'mdi:lock-outline'
                      : resultHeaderData.statusCode === 1
                        ? 'mdi:check-circle-outline'
                        : 'mdi:clock-outline'
                  }
                  width={14}
                  sx={{ mr: 0.5 }}
                />
                {resultHeaderData.status}
              </Label>
            )}

            {allFiltersSet && (
              <LoadingButton
                variant="contained"
                size="small"
                loading={isGenerating}
                startIcon={
                  <Iconify
                    icon={resultHeaderData ? 'mdi:refresh' : 'mdi:calculator-variant-outline'}
                  />
                }
                onClick={handleGenerate}
                sx={{ minWidth: 145 }}
              >
                {resultHeaderData ? 'Regenerate' : 'Generate Result'}
              </LoadingButton>
            )}

            {resultHeaderData?.statusCode === 0 && (
              <LoadingButton
                variant="contained"
                color="success"
                size="small"
                loading={isPublishing}
                startIcon={<Iconify icon="mdi:publish" />}
                onClick={handlePublish}
                sx={{ minWidth: 110 }}
              >
                Publish
              </LoadingButton>
            )}

            {resultHeaderData?.statusCode === 1 && (
              <LoadingButton
                variant="contained"
                color="error"
                size="small"
                loading={isFreezing}
                startIcon={<Iconify icon="mdi:lock-outline" />}
                onClick={handleFreeze}
                sx={{ minWidth: 110 }}
              >
                Freeze
              </LoadingButton>
            )}
          </Box>
        }
      />

      {/* Filter Box */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Box
          display="flex"
          flexWrap="wrap"
          sx={{
            borderRadius: '8px',
            bgcolor: 'background.paper',
            boxShadow: 'var(--shadows-3)',
            p: 1,
            gap: 2,
            mb: 2,
          }}
        >
          <CustomSelect
            options={allClass}
            label="Class"
            value={classes}
            onChange={(val) => setClass(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          />
          <CustomSelect
            options={allDivision}
            label="Division"
            value={division}
            onChange={(val) => setDivision(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
            disabled={!classes}
          />
          <Autocomplete
            disabled={!division}
            loading={isExamLoading || isExamFetching}
            options={examOptions}
            getOptionLabel={(option: any) => option.examName || ''}
            isOptionEqualToValue={(option: any, value: any) => option.examId === value.examId}
            value={examOptions.find((opt) => opt.examId === examId) || null}
            onChange={(_event, newValue: any) => {
              setExamId(newValue?.examId || '');
              setPreviewResult(null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Exam"
                size="small"
                fullWidth
                sx={{ minWidth: '248px', width: '100%' }}
              />
            )}
          />
        </Box>
      </motion.div>

      {/* Readiness Panel */}
      {allFiltersSet &&
        !previewResult &&
        !isPreviewLoading &&
        readinessData?.checks?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{ p: 2, mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Iconify
                  icon={
                    readinessData.isReady ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'
                  }
                  width={20}
                  sx={{ color: readinessData.isReady ? 'success.main' : 'warning.main' }}
                />
                <Typography variant="subtitle2">
                  {readinessData.isReady
                    ? 'Ready to generate result'
                    : 'Prerequisites for result generation'}
                </Typography>
              </Box>
              <Stack spacing={0.75}>
                {readinessData.checks.map((check: any) => (
                  <Box key={check.label} display="flex" alignItems="flex-start" gap={1}>
                    <Iconify
                      icon={check.passed ? 'mdi:check-circle' : 'mdi:close-circle'}
                      width={16}
                      sx={{
                        mt: 0.25,
                        flexShrink: 0,
                        color: check.passed ? 'success.main' : 'error.main',
                      }}
                    />
                    <Box>
                      <Typography variant="caption" fontWeight={500}>
                        {check.label}
                      </Typography>
                      {check.hint && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {check.hint}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Card>
          </motion.div>
        )}

      {/* Analytics Cards — sourced directly from ResultHeaderDto (includes all counts) */}
      {resultHeaderData && (
        <AnalyticsCards
          appeared={resultHeaderData.appeared}
          passed={resultHeaderData.passed}
          failed={resultHeaderData.failed}
          passPercentage={resultHeaderData.passPercentage}
          highestPercentage={resultHeaderData.highestPercentage}
          averagePercentage={resultHeaderData.averagePercentage}
        />
      )}

      {/* Result Table */}
      {/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{ flex: 1 }}
      > */}
      <CustomizableTable
        tableId="result-creation-table"
        noDataText={
          !allFiltersSet ? (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={4}>
              <Iconify icon="mdi:filter-outline" width={40} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.disabled">
                Select class, division and exam to view results
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={4}>
              <Iconify
                icon="mdi:database-search-outline"
                width={40}
                sx={{ color: 'text.disabled' }}
              />
              <Typography variant="body2" color="text.disabled">
                No results found for the selected filters.
              </Typography>
            </Box>
          )
        }
        totalCount={previewResult?.totalCount}
        isLoading={isPreviewLoading}
        columns={tableColumns.length > 0 ? tableColumns : placeholderColumns}
        data={tableData as any[]}
      />
      {/* </motion.div> */}

      {/* Student Details Dialog */}
      <StudentDetailsDialog
        open={dialogStudent !== null}
        onClose={() => setDialogStudent(null)}
        row={dialogStudent}
        columns={previewResult?.columns ?? []}
        examName={selectedExamName}
        className={selectedClassName}
        divisionName={selectedDivisionName}
      />
    </Box>
  );
};

export default ResultCreation;
