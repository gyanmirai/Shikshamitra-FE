'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { Division, Standards, Organization } from 'src/types/school';

import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { useReactToPrint } from 'react-to-print';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { AcademicInsights } from 'src/screens/academic/components/academic-insights';
import { useGetTenantByIdQuery } from 'src/redux/tenant/tenantApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { ExamReportTitle, ExamReportApiTypeMap } from 'src/enums/examination-reports';
import { usePreviewAcademicReportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import {
  ITimetableSummaryCard,
  TimetableSettingsSummaryCards,
} from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  Tooltip,
  TextField,
  Accordion,
  IconButton,
  Typography,
  Autocomplete,
  DialogActions,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  useGetResultHeaderQuery,
  useFreezeResultMutation,
  usePublishResultMutation,
  useGenerateResultMutation,
  useGetResultReadinessQuery,
  useGetStudentResultDetailsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ResultApi/resultApi';

import { buildStudentResultDocumentTitle } from './resultPrintUtils';
import {
  getExamMonthRange,
  getDefaultExamMonth,
} from '../exam-month-filter';
import { buildResultExamQuery, buildResultExamMonthOptions } from './result-exam-filter';
import StudentResultPrintReport, {
  STUDENT_RESULT_PRINT_PAGE_STYLE,
} from './StudentResultPrintReport';

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

const getWorkflowCopy = (resultHeaderData: any) => {
  if (!resultHeaderData) {
    return {
      label: 'Not Generated',
      helper: 'Generate a preview after all required checks pass.',
      icon: 'mdi:file-search-outline',
      color: 'default' as const,
    };
  }

  if (resultHeaderData.statusCode === 0) {
    return {
      label: 'Draft Generated',
      helper: 'Review the preview and publish when it is correct.',
      icon: 'mdi:file-document-edit-outline',
      color: 'warning' as const,
    };
  }

  if (resultHeaderData.statusCode === 1) {
    return {
      label: 'Published',
      helper: 'Results are visible in downstream academic/report flows.',
      icon: 'mdi:publish',
      color: 'success' as const,
    };
  }

  return {
    label: 'Locked',
    helper: 'Published results are frozen for audit-safe reporting.',
    icon: 'mdi:lock-outline',
    color: 'error' as const,
  };
};

const getResultReadinessSummary = (readinessData: any) => {
  const checks = readinessData?.checks ?? [];
  const passedCount = checks.filter((check: any) => check.passed).length;
  const pendingSubjects: string[] = readinessData?.pendingSubjects ?? [];

  return {
    checks,
    passedCount,
    readinessPercentage:
      typeof readinessData?.percentage === 'number'
        ? readinessData.percentage
        : checks.length
          ? Math.round((passedCount / checks.length) * 100)
          : 0,
    blockerCount:
      readinessData?.blockerCount ??
      checks.filter((check: any) => !check.passed && check.severity !== 'warning').length,
    warningCount:
      readinessData?.warningCount ??
      checks.filter((check: any) => !check.passed && check.severity === 'warning').length,
    pendingSubjects,
  };
};

function ResultWorkflowPanel({
  readinessData,
  resultHeaderData,
  selectedExamName,
  selectedClassName,
  selectedDivisionName,
}: {
  readinessData: any;
  resultHeaderData: any;
  selectedExamName: string;
  selectedClassName: string;
  selectedDivisionName: string;
}) {
  const workflow = getWorkflowCopy(resultHeaderData);
  const {
    checks,
    readinessPercentage,
    blockerCount,
    warningCount,
    pendingSubjects,
  } = getResultReadinessSummary(readinessData);

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700}>
              Result readiness
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedExamName || 'Selected exam'} · {selectedClassName || 'Class'} /{' '}
              {selectedDivisionName || 'Division'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Label variant="soft" color={workflow.color}>
              {workflow.label}
            </Label>
            <Label variant="soft" color={blockerCount ? 'error' : 'success'}>
              {blockerCount} Blockers
            </Label>
            <Label variant="soft" color={warningCount ? 'warning' : 'success'}>
              {warningCount} Warnings
            </Label>
          </Stack>
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              {readinessData?.isReady ? 'Required checks are complete.' : workflow.helper}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {readinessPercentage}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, readinessPercentage))}
            sx={{ height: 8, borderRadius: 999 }}
            color={readinessData?.isReady ? 'success' : 'warning'}
          />
        </Box>

        <Stack divider={<Divider flexItem />}>
          {checks.map((check: any) => {
            const checkColor = check.passed
              ? 'success'
              : check.severity === 'warning'
                ? 'warning'
                : 'error';

            return (
              <Stack
                key={check.label}
                direction="row"
                alignItems="flex-start"
                spacing={1}
                sx={{ py: 1.25 }}
              >
                <Iconify
                  icon={check.passed ? 'mdi:check-circle' : 'mdi:alert-circle-outline'}
                  width={18}
                  sx={{ mt: 0.15, color: `${checkColor}.main`, flexShrink: 0 }}
                />
                <Box minWidth={0} flex={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {check.label}
                  </Typography>
                  {check.hint && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {check.hint}
                    </Typography>
                  )}
                </Box>
                <Label variant="soft" color={checkColor}>
                  {check.passed ? 'Complete' : check.severity === 'warning' ? 'Warning' : 'Blocker'}
                </Label>
              </Stack>
            );
          })}
        </Stack>

        {pendingSubjects.length > 0 && (
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Subjects needing attention
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {pendingSubjects.slice(0, 5).map((subject) => (
                <Label key={subject} variant="soft" color="warning">
                  {subject}
                </Label>
              ))}
              {pendingSubjects.length > 5 && (
                <Label variant="soft" color="warning">
                  +{pendingSubjects.length - 5} more
                </Label>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

export interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  row: PreviewRow | any | null;
  examId: string;
  examName?: string;
  schoolName?: string;
}

const getSubjectTheme = (subjectName: string) => {
  const name = subjectName.toLowerCase().trim();
  if (name.includes('math')) {
    return { color: '#00897b', icon: 'mdi:function', bg: 'rgba(0, 137, 123, 0.1)' };
  }
  if (name.includes('sci')) {
    return { color: '#3f51b5', icon: 'mdi:flask-outline', bg: 'rgba(63, 81, 181, 0.1)' };
  }
  if (name.includes('eng')) {
    return {
      color: '#8e24aa',
      icon: 'mdi:book-open-variant-outline',
      bg: 'rgba(142, 36, 170, 0.1)',
    };
  }
  if (name.includes('soc') || name.includes('hist') || name.includes('geo')) {
    return { color: '#fb8c00', icon: 'mdi:earth', bg: 'rgba(251, 140, 0, 0.1)' };
  }
  if (name.includes('comp') || name.includes('ict') || name.includes('info')) {
    return { color: '#03a9f4', icon: 'mdi:monitor', bg: 'rgba(3, 169, 244, 0.1)' };
  }
  if (name.includes('hin')) {
    return { color: '#e91e63', icon: 'mdi:alphabet-latin', bg: 'rgba(233, 30, 99, 0.1)' };
  }
  if (name.includes('sans')) {
    return { color: '#9c27b0', icon: 'mdi:script-text-outline', bg: 'rgba(156, 39, 176, 0.1)' };
  }
  if (name.includes('phy') || name.includes('pe') || name.includes('sport')) {
    return { color: '#4caf50', icon: 'mdi:run', bg: 'rgba(76, 175, 80, 0.1)' };
  }
  return { color: '#607d8b', icon: 'mdi:book-outline', bg: 'rgba(96, 125, 139, 0.1)' };
};

export function StudentDetailsDialog({
  open,
  onClose,
  row,
  examId,
  examName: propExamName,
  schoolName = '',
}: StudentDialogProps) {
  const studentId = row?.StudentId || row?.studentId || '';
  const printRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentResultDetailsQuery,
    params: { examId, studentId },
    options: { skip: !open || !examId || !studentId },
  });
  const printDocumentTitle = buildStudentResultDocumentTitle(
    data?.studentName,
    data?.examName || propExamName
  );
  const handlePrintResult = useReactToPrint({
    contentRef: printRef,
    documentTitle: printDocumentTitle,
    pageStyle: STUDENT_RESULT_PRINT_PAGE_STYLE,
  });

  const subjectColumns = useMemo(
    () => [
      {
        id: 'subjectName',
        label: 'Subject',
        minWidth: 150,
        sticky: true,
        stickyPosition: 'left' as const,
        render: (value: any, item: any) => {
          const themeInfo = getSubjectTheme(item.subjectName ?? '');
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: themeInfo.bg,
                  color: themeInfo.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon={themeInfo.icon} width={16} />
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {item.subjectName}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'maxMarks',
        label: 'Max Marks',
        align: 'center' as const,
        minWidth: 100,
        filterType: 'number' as const,
        render: (value: any) => <Typography variant="body2">{value ?? '100'}</Typography>,
      },
      {
        id: 'marksObtained',
        label: 'Score & Progress',
        minWidth: 200,
        render: (value: any, item: any) => {
          const marksObtainedStr = item.marksObtained ?? '—';
          const isSubjectAbsent =
            marksObtainedStr === 'Ab' || marksObtainedStr.toLowerCase() === 'absent';
          const marksObtained = isSubjectAbsent ? 0 : parseFloat(marksObtainedStr) || 0;
          const maxMarks = parseFloat(item.maxMarks ?? '100') || 100;
          const progressPct = maxMarks > 0 ? Math.min((marksObtained / maxMarks) * 100, 100) : 0;
          const isSubjectPassed =
            item.isPassed !== undefined
              ? item.isPassed
              : (item.grade ?? '—') !== 'F' && !isSubjectAbsent;

          if (isSubjectAbsent) {
            return (
              <Typography variant="body2" color="error.main" fontWeight="bold">
                ABSENT
              </Typography>
            );
          }

          return (
            <Box display="flex" alignItems="center" gap={1}>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                aria-label={`${item.subjectName ?? 'Subject'} score progress`}
                sx={{
                  flex: 1,
                  height: 6,
                  bgcolor: 'divider',
                  borderRadius: 999,
                  overflow: 'hidden',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    bgcolor: isSubjectPassed ? 'success.main' : 'error.main',
                  },
                }}
              />
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{
                  minWidth: 40,
                  textAlign: 'right',
                  color: isSubjectPassed ? 'text.primary' : 'error.main',
                }}
              >
                {marksObtainedStr}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'grade',
        label: 'Grade',
        align: 'center' as const,
        minWidth: 90,
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'A+', value: 'A+' },
          { label: 'A', value: 'A' },
          { label: 'B+', value: 'B+' },
          { label: 'B', value: 'B' },
          { label: 'C+', value: 'C+' },
          { label: 'C', value: 'C' },
          { label: 'D', value: 'D' },
          { label: 'E', value: 'E' },
          { label: 'F', value: 'F' },
        ],
        render: (value: any, item: any) => {
          const subjectGrade = value ?? '—';
          const isSubjectAbsent =
            item.marksObtained === 'Ab' || String(item.marksObtained).toLowerCase() === 'absent';
          const isSubjectPassed =
            item.isPassed !== undefined ? item.isPassed : subjectGrade !== 'F' && !isSubjectAbsent;

          return (
            <Label
              variant="soft"
              color={
                !isSubjectPassed
                  ? 'error'
                  : ['A+', 'A', 'A1', 'A2'].includes(subjectGrade)
                    ? 'success'
                    : ['B+', 'B', 'B1', 'B2'].includes(subjectGrade)
                      ? 'info'
                      : 'warning'
              }
              sx={{ fontWeight: 'bold' }}
            >
              {subjectGrade}
            </Label>
          );
        },
      },

      {
        id: 'remarks',
        label: 'Remarks',
        minWidth: 150,
        render: (value: any, item: any) => {
          const marksObtainedStr = item.marksObtained ?? '—';
          const isSubjectAbsent =
            marksObtainedStr === 'Ab' || marksObtainedStr.toLowerCase() === 'absent';
          const subjectRemarks = value ?? (isSubjectAbsent ? 'Absent' : '—');
          return (
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {subjectRemarks}
            </Typography>
          );
        },
      },
      {
        id: 'isPassed',
        label: 'Pass/Fail',
        align: 'center' as const,
        minWidth: 100,
        sticky: true,
        stickyPosition: 'right' as const,
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'PASS', value: 'true' },
          { label: 'FAIL', value: 'false' },
          { label: 'ABSENT', value: 'absent' },
        ],
        render: (value: any, item: any) => {
          const marksObtainedStr = item.marksObtained ?? '—';
          const isSubjectAbsent =
            marksObtainedStr === 'Ab' || marksObtainedStr.toLowerCase() === 'absent';
          const subjectGrade = item.grade ?? '—';
          const isSubjectPassed =
            value !== undefined ? value : subjectGrade !== 'F' && !isSubjectAbsent;

          if (isSubjectAbsent) {
            return (
              <Label
                variant="soft"
                color="default"
                startIcon={<Iconify icon="mdi:account-off-outline" />}
              >
                ABSENT
              </Label>
            );
          }

          return (
            <Label
              variant="soft"
              color={isSubjectPassed ? 'success' : 'error'}
              startIcon={
                <Iconify
                  icon={isSubjectPassed ? 'mdi:check-circle-outline' : 'mdi:close-circle-outline'}
                />
              }
            >
              {isSubjectPassed ? 'PASS' : 'FAIL'}
            </Label>
          );
        },
      },
    ],
    []
  );

  if (!row) return null;

  if (isLoading || !data) {
    return (
      <CustomDialog
        open={open}
        handleClose={onClose}
        title={
          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            alignItems="center"
            component="span"
            sx={{ fontWeight: 'normal' }}
          >
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Loading Result Details
            </Box>
            <CustomTooltip
              arrow
              placement="right"
              title="Fetching detailed student result card and marks performance breakdown."
            >
              <Iconify
                icon={GlobalIcons.info}
                sx={{ cursor: 'pointer' }}
                color="info.main"
                width={16}
                height={16}
              />
            </CustomTooltip>
          </Box>
        }
        maxWidth="xs"
        hasForm={false}
      >
        <DialogScrollContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Loading student result details...
          </Typography>
          <LinearProgress />
        </DialogScrollContent>
      </CustomDialog>
    );
  }

  const {
    studentName,
    grNo,
    rollNo,
    dateOfBirth: dob,
    className,
    divisionName,
    examName: apiExamName,
    grade: gradeValue,
    rank,
    totalStudentsInClass,
    totalMarks: totalMaxMarksStr,
    obtainedMarks: totalValueStr,
    attendancePercentage,
    status,
    subjects = [],
  } = data;

  const examName = apiExamName || propExamName;
  const cleanSchoolName = schoolName === 'DDVS' ? '' : schoolName;

  const totalMaxMarks = parseFloat(totalMaxMarksStr) || 0;
  const totalValue = parseFloat(totalValueStr) || 0;
  const backendPct = parseFloat(String((data as any)?.percentage || '').replace('%', ''));

  const pctNum =
    !Number.isNaN(backendPct) && backendPct >= 0
      ? Math.round(backendPct)
      : totalMaxMarks > 0
        ? Math.round((totalValue / totalMaxMarks) * 100)
        : 0;
  const pctRaw = (data as any)?.percentage || `${pctNum}%`;
  const isPassing = status?.toUpperCase() === 'PASS';
  // Radial progress calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pctNum / 100) * circumference;

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={
        <Box
          display="flex"
          flexDirection="row"
          gap={1}
          alignItems="center"
          component="span"
          sx={{ fontWeight: 'normal' }}
        >
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
            {examName || 'Result Details'}
          </Box>
          <CustomTooltip
            arrow
            placement="right"
            title="View comprehensive details of student academic report cards, marks obtained, percentage, and overall status."
          >
            <Iconify
              icon={GlobalIcons.info}
              sx={{ cursor: 'pointer' }}
              color="info.main"
              width={16}
              height={16}
            />
          </CustomTooltip>
        </Box>
      }
      maxWidth="md"
      hasForm={false}
      paperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Content Body */}
      <DialogScrollContent
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Box
          sx={{
            bgcolor: '#D3FCD2',
            color: '#173B2D',
            px: { xs: 2, sm: 3 },
            py: 2.25,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ color: '#276749', letterSpacing: 1.2, lineHeight: 1.2 }}
            >
              Learner Passport · {examName || 'Result'}
            </Typography>
            <Typography variant="h4" fontWeight={700} noWrap sx={{ color: '#111827' }}>
              {studentName || 'Student'}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 1,
              }}
            >
              {[
                {
                  label: 'Class',
                  value: [className, divisionName].filter(Boolean).join(' – ') || '—',
                },
                { label: 'Gr. No.', value: grNo || '—' },
                { label: 'Roll No.', value: rollNo || '—' },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    minWidth: 88,
                    pr: 1.5,
                    mr: 0.5,
                    borderRight: '1px solid rgba(23, 59, 45, 0.22)',
                    '&:last-child': { borderRight: 'none' },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: '#276749',
                      fontSize: 9,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ color: '#173B2D', lineHeight: 1.3 }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              width: 66,
              height: 66,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: isPassing ? 'success.main' : 'error.main',
              color: isPassing ? 'success.main' : 'error.main',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography variant="h6" fontWeight={800} lineHeight={1}>
              {pctNum}%
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 9, letterSpacing: 0.5 }}>
              {isPassing ? 'PASSED' : 'RESULT'}
            </Typography>
          </Box>
        </Box>

        <Card
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            bgcolor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: 'none',
          }}
        >
          {[
            ['MARKS', `${totalValueStr} / ${totalMaxMarksStr}`],
            ['GRADE', gradeValue || '—'],
            ['CLASS RANK', rank ? `${rank} of ${totalStudentsInClass}` : '—'],
            ['ATTENDANCE', attendancePercentage || '—'],
          ].map(([label, value], index) => (
            <Box
              key={label}
              sx={{
                px: 2,
                py: 1.75,
                minHeight: 90,
                borderRight: {
                  xs: index % 2 === 0 ? '1px solid' : 'none',
                  sm: index < 3 ? '1px solid' : 'none',
                },
                borderBottom: { xs: index < 2 ? '1px solid' : 'none', sm: 'none' },
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" letterSpacing={0.6}>
                {label}
              </Typography>
              <Typography
                variant="body1"
                fontWeight={700}
                color={label === 'GRADE' ? 'success.main' : 'text.primary'}
                mt={1.25}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Card>

        {/* Top Grid: Student Info, Result Summary */}
        <Box display="none" gridTemplateColumns={{ xs: '1fr', md: '1.2fr 1.4fr' }} gap={1.5}>
          {/* Student Info Card */}
          <Card
            sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              boxShadow: 'none',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Iconify icon="mdi:account-outline" width={20} sx={{ color: 'primary.main' }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
              >
                Student Information
              </Typography>
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
              <Box
                sx={{
                  gridColumn: 'span 2',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                  p: 0.75,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.05)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Student Name
                </Typography>
                <Typography variant="body1" fontWeight="700" color="primary.main">
                  {studentName}
                </Typography>
              </Box>

              <Box sx={{ p: 0.25 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Gr. No.
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {grNo}
                </Typography>
              </Box>

              <Box sx={{ p: 0.25 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Roll No.
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {rollNo}
                </Typography>
              </Box>

              <Box sx={{ p: 0.25 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Class & Division
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {className} - {divisionName}
                </Typography>
              </Box>

              <Box sx={{ p: 0.25 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Date of Birth
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {dob}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Result Summary Card */}
          <Card
            sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1.5} width="100%">
              <Iconify icon="mdi:chart-arc" width={20} sx={{ color: 'primary.main' }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
              >
                Result Summary
              </Typography>
              <Label
                variant="soft"
                color={isPassing ? 'success' : 'error'}
                startIcon={<Iconify icon={isPassing ? 'mdi:check-decagram' : 'mdi:alert-circle'} />}
              >
                {status || '—'}
              </Label>
            </Box>

            {/* Sub-stats grid */}
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={0.75} width="100%" mb={2}>
              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 0.75,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ fontWeight: 600 }}
                >
                  Obtained
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="800"
                  sx={{ color: 'primary.main', mt: 0.25 }}
                >
                  {totalValueStr}
                </Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 0.75,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ fontWeight: 600 }}
                >
                  Max Marks
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="800"
                  sx={{ color: 'text.primary', mt: 0.25 }}
                >
                  {totalMaxMarksStr}
                </Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 0.75,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ fontWeight: 600 }}
                >
                  Attendance
                </Typography>
                <Typography variant="body2" fontWeight="800" sx={{ color: 'info.main', mt: 0.25 }}>
                  {attendancePercentage}
                </Typography>
              </Box>
            </Box>

            {/* Visual Indicators: Radial Chart & Grade/Rank Cards */}
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              mb={1.5}
              width="100%"
              justifyContent="center"
            >
              {/* Radial circle chart */}
              <Box
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(0,0,0,0.04)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={isPassing ? '#10b981' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{
                      filter: `drop-shadow(0px 2px 4px ${isPassing ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'})`,
                    }}
                  />
                </svg>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="800">
                    {pctRaw}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 8, fontWeight: 600 }}
                  >
                    PERCENT
                  </Typography>
                </Box>
              </Box>

              {/* Grade & Rank Badges Stacked */}
              <Stack spacing={0.75} sx={{ minWidth: 130 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                    border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: 1,
                  }}
                >
                  <Iconify icon="mdi:medal-outline" width={16} sx={{ color: 'success.main' }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: 8, fontWeight: 600 }}
                    >
                      GRADE
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="success.main"
                      sx={{ lineHeight: 1.1 }}
                    >
                      {gradeValue || '—'}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
                    border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: 1,
                  }}
                >
                  <Iconify icon="mdi:trophy-outline" width={16} sx={{ color: 'warning.main' }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: 8, fontWeight: 600 }}
                    >
                      CLASS RANK
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="warning.main"
                      sx={{ lineHeight: 1.1 }}
                    >
                      #{rank} of {totalStudentsInClass}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Box>

        {/* Marks Obtained Card */}
        {subjects.length > 0 && (
          <Card
            sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              boxShadow: 'none',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Iconify icon="mdi:format-list-bulleted" width={20} sx={{ color: 'primary.main' }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
              >
                Marks Obtained (Scholastic Areas)
              </Typography>
            </Box>
            <CustomizableTable
              tableId="student-subject-results-table"
              isLoading={isLoading}
              noDataText="No subject marks details available."
              columns={subjectColumns}
              data={subjects}
            />
          </Card>
        )}

      </DialogScrollContent>
      {/* </Box> */}

      {/* Action Buttons */}
      <DialogActions>
        <CancelButton buttonText="Close" onClick={onClose} />
        <Button
          onClick={() => handlePrintResult()}
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon="mdi:printer" />}
          sx={{ borderRadius: '8px', border: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          Print Result
        </Button>
        <Button
          onClick={() => handlePrintResult()}
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Iconify icon="mdi:file-pdf-box" />}
          sx={{ borderRadius: '8px' }}
        >
          Save PDF
        </Button>
      </DialogActions>

      <Box
        aria-hidden="true"
        sx={{ position: 'fixed', left: '-10000px', top: 0, width: '210mm', pointerEvents: 'none' }}
      >
        <StudentResultPrintReport
          ref={printRef}
          schoolName={cleanSchoolName}
          examName={examName}
          studentName={studentName}
          grNo={grNo}
          rollNo={rollNo}
          className={className}
          divisionName={divisionName}
          dateOfBirth={dob}
          obtainedMarks={totalValueStr}
          totalMarks={totalMaxMarksStr}
          percentage={pctRaw}
          attendancePercentage={attendancePercentage}
          grade={gradeValue}
          status={status}
          rank={rank}
          totalStudentsInClass={totalStudentsInClass}
          subjects={subjects}
        />
      </Box>
    </CustomDialog>
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
  const cards: ITimetableSummaryCard[] = [
    { label: 'Appeared', value: appeared, icon: 'mdi:account-group', color: 'info' },
    { label: 'Passed', value: passed, icon: 'mdi:check-decagram', color: 'success' },
    { label: 'Failed', value: failed, icon: 'mdi:close-circle', color: 'error' },
    { label: 'Pass %', value: `${passPercentage}%`, icon: 'mdi:chart-donut', color: 'primary' },
    { label: 'Highest %', value: `${highestPercentage}%`, icon: 'mdi:trophy', color: 'warning' },
    { label: 'Average %', value: `${averagePercentage}%`, icon: 'mdi:trending-up', color: 'info' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Accordion
        defaultExpanded={false}
        disableGutters
        elevation={0}
        sx={{
          mb: 1,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<Iconify icon="eva:chevron-down-fill" width={18} />}
          sx={{
            px: 2,
            minHeight: 44,
            bgcolor: 'background.neutral',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&.Mui-expanded': { minHeight: 44 },
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              my: 0.75,
              '&.Mui-expanded': { my: 0.75 },
            },
          }}
        >
          <Typography variant="subtitle2">Result Analytics Overview</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1, pb: 0.5 }}>
          <TimetableSettingsSummaryCards cards={cards} />
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

const ResultCreation = (_props: TabComponentType) => {
  const insightsDrawer = useBoolean();
  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );

  const session: any = useSession();
  const { data: user } = session;
  const { data: tenantData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTenantByIdQuery,
    params: user?.profile?.tenantid,
    options: {
      skip: !user?.profile?.tenantid,
    },
  });
  const schoolName = tenantData?.extraProperties?.InstituteName || 'Shiksha Mitra Public School';

  // ─── Filter states ─────────────────────────────────────────────────────
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [classes, setClass] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [examId, setExamId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const monthOptions = useMemo(() => buildResultExamMonthOptions(currentYear), [currentYear]);
  const selectedMonthRange = useMemo(
    () => getExamMonthRange(monthOptions, selectedMonth),
    [monthOptions, selectedMonth]
  );

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

  useEffect(() => {
    setSelectedMonth(getDefaultExamMonth(monthOptions));
    setExamId('');
    setPreviewResult(null);
  }, [monthOptions]);

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
    params: buildResultExamQuery(medium?.id, classes, division, selectedMonthRange),
    options: { skip: !(medium?.id && classes && division && selectedMonthRange) },
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
  const { data: rawResultHeaderData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetResultHeaderQuery,
    params: { examId, divisionId: division },
    options: { skip: !allFiltersSet },
    popupConfig: { error: false },
  });

  const { data: rawReadinessData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetResultReadinessQuery,
    params: { examId, divisionId: division },
    options: { skip: !allFiltersSet },
    popupConfig: { error: false },
  });

  const resultHeaderData = allFiltersSet ? rawResultHeaderData : null;
  const readinessData = allFiltersSet ? rawReadinessData : null;
  const readinessSummary = getResultReadinessSummary(readinessData);

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
        forceRegenerate: true,
      }).unwrap();
      shikshaMitraToast.success({
        message: `Result preview generated. ${result?.passed ?? 0} passed out of ${result?.totalStudents ?? 0} students.`,
      });
      await handleLoadResults();
    } catch {
      // error handled by useQueryAndMutation popupConfig
    }
  }, [allFiltersSet, generateResult, examId, division, handleLoadResults]);

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

    // First map all the columns from API
    const mappedCols = previewResult.columns
      .filter((col) => col.id && col.label && !col.id.startsWith('subj_'))
      .map((col) => {
        const colId = col.id as string;
        let label = col.label as string;

        // Rename "Total" to "Marks"
        if (colId === 'Total' || colId === 'total') {
          label = 'Marks';
        }

        return {
          id: colId,
          label,
          minWidth: colId === 'RollNo' || colId === 'rollNo' ? 90 : 130,
          align: 'left' as const,
          sticky: colId === 'RollNo' || colId === 'StudentName',
          stickyPosition:
            colId === 'RollNo' || colId === 'StudentName' ? ('left' as const) : undefined,
          filterType:
            colId === 'Total' || colId === 'total' || colId === 'RollNo' || colId === 'rollNo'
              ? ('number' as const)
              : undefined,
          render: (value: any, row: any) => {
            if (value == null || value === '') {
              return (
                <Typography variant="body2" color="text.disabled">
                  —
                </Typography>
              );
            }
            if (colId === 'Total' || colId === 'total') {
              const maxMarks = row.TotalMaxMarks || row.totalMaxMarks || '—';
              return (
                <Typography variant="body2" fontWeight={700}>
                  {value} / {maxMarks}
                </Typography>
              );
            }
            if (isStatusColumn(colId)) {
              return (
                <Label
                  variant="soft"
                  color={getStatusColor(String(value))}
                  sx={{ fontWeight: 700 }}
                >
                  {value}
                </Label>
              );
            }
            if (isPercentageColumn(colId)) {
              return (
                <Label
                  variant="soft"
                  color={getPercentageColor(String(value))}
                  sx={{ fontWeight: 700 }}
                >
                  {value}
                </Label>
              );
            }
            if (colId === 'Grade' || colId === 'grade') {
              return (
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={String(value) === 'F' ? 'error.main' : 'text.primary'}
                >
                  {value}
                </Typography>
              );
            }
            return <Typography variant="body2">{value}</Typography>;
          },
        };
      });

    // Create the final ordered list of columns
    const finalCols: any[] = [];

    // 1. Roll No and Student Name first
    const rollNoCol = mappedCols.find((c) => c.id === 'RollNo' || c.id === 'rollNo');
    const nameCol = mappedCols.find((c) => c.id === 'StudentName' || c.id === 'studentName');
    if (rollNoCol) finalCols.push(rollNoCol);
    if (nameCol) finalCols.push(nameCol);

    // 2. Marks (Total) column
    const marksCol = mappedCols.find((c) => c.id === 'Total' || c.id === 'total');
    if (marksCol) finalCols.push(marksCol);

    // 3. Grade column
    const gradeCol = mappedCols.find((c) => c.id === 'Grade' || c.id === 'grade');
    if (gradeCol) finalCols.push(gradeCol);

    // 4. Percentage column
    const pctCol = mappedCols.find((c) => c.id === 'Percentage' || c.id === 'percentage');
    if (pctCol) finalCols.push(pctCol);

    // 5. Status column
    finalCols.push({
      id: 'status',
      label: 'Status',
      minWidth: 120,
      align: 'left' as const,
      sticky: true,
      stickyPosition: 'right' as const,
      filterType: 'enum' as const,
      enumOptions: [
        { label: 'Passed', value: 'Passed' },
        { label: 'Failed', value: 'Failed' },
      ],
      render: (_value: any, row: any) => {
        const apiStatus = row.Status || row.status;
        if (apiStatus) {
          return (
            <Label
              variant="soft"
              color={getStatusColor(String(apiStatus))}
              sx={{ fontWeight: 700 }}
            >
              {apiStatus}
            </Label>
          );
        }
        const grade = row.Grade || row.grade;
        if (!grade || grade === '—') {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          );
        }
        const isPass = grade !== 'F';
        return (
          <Label variant="soft" color={isPass ? 'success' : 'error'} sx={{ fontWeight: 700 }}>
            {isPass ? 'Passed' : 'Failed'}
          </Label>
        );
      },
    });

    // Add any other columns that we didn't explicitly place (in case there are any)
    mappedCols.forEach((col) => {
      if (col.id === 'Status' || col.id === 'status') {
        return;
      }
      if (!finalCols.some((fc) => fc.id === col.id)) {
        finalCols.push(col);
      }
    });

    // 7. Action column — view student details
    finalCols.push({
      id: '_action',
      label: 'Details',
      minWidth: '80px',
      sticky: true,
      stickyPosition: 'right' as const,
      isFilter: false,
      isSort: false,
      render: (_: any, row: any) => (
        <Tooltip title="View full result">
          <IconButton
            size="small"
            onClick={() => handleViewStudent(row)}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.action.selected, 0.08),
              '&:hover': { bgcolor: (theme) => alpha(theme.palette.action.selected, 0.18) },
            }}
          >
            <Iconify icon="carbon:view-filled" width={17} sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Tooltip>
      ),
    });

    return finalCols;
  }, [previewResult?.columns, handleViewStudent]);

  const placeholderColumns = useMemo(
    () => [
      { id: 'rollNo', label: 'Roll No.', minWidth: 90, align: 'left' as const, sticky: true },
      {
        id: 'studentName',
        label: 'Student Name',
        minWidth: 180,
        align: 'left' as const,
        sticky: true,
      },
      { id: 'total', label: 'Marks', minWidth: 110, align: 'left' as const },
      { id: 'grade', label: 'Grade', minWidth: 80, align: 'left' as const },
      {
        id: 'percentage',
        label: 'Percentage',
        minWidth: 120,
        align: 'left' as const,
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        sticky: true,
        align: 'left' as const,
      },
      {
        id: '_action',
        label: 'Details',
        minWidth: 80,
        align: 'center' as const,
        sticky: true,
      },
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
        sx={{ mb: 1 }}
        heading="Result Creation"
        description={
          <Box sx={{ p: 1.5, maxWidth: 350 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Result Creation Workflow
            </Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5 } }}>
              <Typography component="li" variant="caption" color="text.secondary">
                <strong>Context Selection</strong> — Select Class, Division, and Exam to begin.
              </Typography>
              <Typography component="li" variant="caption" color="text.secondary">
                <strong>Readiness Check</strong> — Ensure all subject marks are entered and there
                are no blockers.
              </Typography>
              <Typography component="li" variant="caption" color="text.secondary">
                <strong>Draft Generation</strong> — Click &quot;Generate Result&quot; to compute
                totals, percentages, and ranks.
              </Typography>
              <Typography component="li" variant="caption" color="text.secondary">
                <strong>Publish</strong> — Review the draft. Click &quot;Publish&quot; to finalize,
                lock, and make results available for reporting.
              </Typography>
            </Box>
          </Box>
        }
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

            {allFiltersSet && !resultHeaderData && (
              <LoadingButton
                variant="contained"
                size="small"
                loading={isGenerating}
                disabled={!readinessData?.isReady}
                startIcon={<Iconify icon="mdi:calculator-variant-outline" />}
                onClick={handleGenerate}
                sx={{ minWidth: 145 }}
              >
                Generate Preview
              </LoadingButton>
            )}

            {(!allFiltersSet || !resultHeaderData || resultHeaderData?.statusCode === 0) && (
              <Tooltip
                title={
                  !allFiltersSet
                    ? 'Select class, division, and exam to publish results'
                    : !resultHeaderData
                      ? 'Generate result preview first'
                      : ''
                }
              >
                <span>
                  <LoadingButton
                    variant="contained"
                    size="small"
                    loading={isPublishing}
                    disabled={!allFiltersSet || !resultHeaderData}
                    startIcon={<Iconify icon="mdi:publish" />}
                    onClick={handlePublish}
                    sx={{ minWidth: 110 }}
                  >
                    Publish
                  </LoadingButton>
                </span>
              </Tooltip>
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
            gap: 1,
            mb: 1,
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
          <CustomSelect
            options={monthOptions}
            label="Month"
            value={selectedMonth}
            onChange={(val) => {
              setSelectedMonth(val as string);
              setExamId('');
              setPreviewResult(null);
            }}
            labelKey="label"
            valueKey="value"
            formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
            disabled={!division || monthOptions.length === 0}
          />
          <Autocomplete
            disabled={!division || !selectedMonth}
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
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:chart-2-outline" width={18} />}
            onClick={insightsDrawer.onTrue}
            disabled={!allFiltersSet || !readinessData?.checks?.length}
            sx={{ ml: 'auto', alignSelf: 'center', whiteSpace: 'nowrap' }}
          >
            View all insights
          </Button>
        </Box>
      </motion.div>

      <AcademicInsights
        title="Result creation insights"
        description="Result readiness and validation checks for the selected exam, class and division."
        metrics={[]}
        chart={{
          title: 'Readiness check overview',
          description: 'Passed, blocked, and warning checks for result generation.',
          categories: ['Passed', 'Blockers', 'Warnings'],
          values: [
            readinessSummary.passedCount,
            readinessSummary.blockerCount,
            readinessSummary.warningCount,
          ],
          seriesName: 'Checks',
          monochrome: true,
          summary: [
            { label: 'Passed', value: readinessSummary.passedCount },
            { label: 'Blockers', value: readinessSummary.blockerCount },
            { label: 'Warnings', value: readinessSummary.warningCount },
          ],
          emptyMessage: 'No result readiness checks are available.',
        }}
        afterChart={
          allFiltersSet && readinessData?.checks?.length > 0 ? (
            <ResultWorkflowPanel
              readinessData={readinessData}
              resultHeaderData={resultHeaderData}
              selectedExamName={selectedExamName}
              selectedClassName={selectedClassName}
              selectedDivisionName={selectedDivisionName}
            />
          ) : null
        }
        open={insightsDrawer.value}
        onClose={insightsDrawer.onFalse}
        hideTrigger
      />

      {/* Readiness Panel */}
      {false &&
        allFiltersSet &&
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
              <Stack spacing={1}>
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
              <Typography variant="body2" color="text.disabled">
                Select class, division and exam to view results
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={4}>
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
        examId={examId}
        examName={examOptions.find((opt) => opt.examId === examId)?.examName || ''}
        schoolName={schoolName}
      />
    </Box>
  );
};

export default ResultCreation;
