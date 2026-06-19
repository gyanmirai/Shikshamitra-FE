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
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import { useGetTenantByIdQuery } from 'src/redux/tenant/tenantApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ExamReportTitle, ExamReportApiTypeMap } from 'src/enums/examination-reports';
import { usePreviewAcademicReportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
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
  LinearProgress,
} from '@mui/material';
import {
  useGetResultHeaderQuery,
  useFreezeResultMutation,
  usePublishResultMutation,
  useGenerateResultMutation,
  useGetResultReadinessQuery,
  useGetStudentResultDetailsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ResultApi/resultApi';

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
  examId: string;
  examName?: string;
  schoolName: string;
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

function StudentDetailsDialog({
  open,
  onClose,
  row,
  examId,
  examName: propExamName,
  schoolName,
}: StudentDialogProps) {
  const studentId = row?.StudentId || row?.studentId || '';
  const { data, isLoading } = useGetStudentResultDetailsQuery(
    { examId, studentId },
    { skip: !open || !examId || !studentId }
  );

  if (!row) return null;

  if (isLoading || !data) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            p: 3,
            borderRadius: 2,
            textAlign: 'center',
          },
        }}
      >
        <Typography variant="body2" color="text.secondary" mb={2}>
          Loading student result details...
        </Typography>
        <LinearProgress />
      </Dialog>
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

  const pctNum = totalMaxMarks > 0 ? Math.round((totalValue / totalMaxMarks) * 100) : 0;
  const pctRaw = `${pctNum}%`;
  const isPassing = status?.toUpperCase() === 'PASS';

  // Radial progress calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pctNum / 100) * circumference;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default',
          position: 'relative',
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1100,
        }}
      >
        <Iconify icon="mdi:close" width={24} />
      </IconButton>

      {/* Content Body */}
      <DialogScrollContent
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          overflowY: 'auto',
          flexGrow: 1,
        }}
      >
        {/* Header Block containing Exam Name & School Name */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pb={2}
          sx={{ borderBottom: (theme) => `1px dashed ${theme.palette.divider}` }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
                {examName || 'Result Details'}
              </Typography>
              <Tooltip title="View exam and grade information details">
                <IconButton size="small" sx={{ p: 0.5 }}>
                  <Iconify
                    icon="mdi:information-outline"
                    width={20}
                    sx={{ color: 'primary.main' }}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 600 }}
            >
              Academic Report Card
            </Typography>
          </Box>
          {cleanSchoolName && (
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main', mr: 5 }}>
              {cleanSchoolName}
            </Typography>
          )}
        </Box>

        {/* Top Grid: Student Info, Result Summary */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1.2fr 1.4fr' }} gap={3}>
          {/* Student Info Card */}
          <Card
            sx={{
              p: 2.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              boxShadow: 'none',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Iconify icon="mdi:account-outline" width={20} sx={{ color: 'primary.main' }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
              >
                Student Information
              </Typography>
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
              <Box
                sx={{
                  gridColumn: 'span 2',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                  p: 1.25,
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

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Gr. No.
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {grNo}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Roll No.
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {rollNo}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Class & Division
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {className} - {divisionName}
                </Typography>
              </Box>

              <Box>
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
              p: 2.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2} width="100%">
              <Iconify icon="mdi:chart-arc" width={20} sx={{ color: 'primary.main' }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
              >
                Result Summary
              </Typography>
            </Box>

            {/* Overall Status Banner */}
            <Box
              sx={{
                width: '100%',
                py: 1.25,
                px: 2,
                borderRadius: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: isPassing ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${isPassing ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight="700" color="text.secondary">
                OVERALL RESULT
              </Typography>
              <Label
                variant="filled"
                color={isPassing ? 'success' : 'error'}
                sx={{ fontSize: '0.85rem', fontWeight: 800, px: 2 }}
                startIcon={<Iconify icon={isPassing ? 'mdi:check-decagram' : 'mdi:alert-circle'} />}
              >
                {status || '—'}
              </Label>
            </Box>

            {/* Visual Indicators: Radial Chart & Grade/Rank Cards */}
            <Box
              display="flex"
              alignItems="center"
              gap={3}
              mb={3}
              width="100%"
              justifyContent="center"
            >
              {/* Radial circle chart */}
              <Box
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="100" height="100" viewBox="0 0 100 100">
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
                  <Typography variant="h6" fontWeight="800">
                    {pctRaw}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 9, fontWeight: 600 }}
                  >
                    PERCENTAGE
                  </Typography>
                </Box>
              </Box>

              {/* Grade & Rank Badges Stacked */}
              <Stack spacing={1.5} sx={{ minWidth: 140 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                    border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: 1,
                  }}
                >
                  <Iconify icon="mdi:medal-outline" width={18} sx={{ color: 'success.main' }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: 9, fontWeight: 600 }}
                    >
                      GRADE
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                      {gradeValue || '—'}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
                    border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: 1,
                  }}
                >
                  <Iconify icon="mdi:trophy-outline" width={18} sx={{ color: 'warning.main' }} />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: 9, fontWeight: 600 }}
                    >
                      CLASS RANK
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="warning.main">
                      #{rank} of {totalStudentsInClass}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Sub-stats grid */}
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1.5} width="100%">
              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 1.25,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ fontWeight: 600 }}
                >
                  Obtained Marks
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="800"
                  sx={{ color: 'primary.main', mt: 0.5 }}
                >
                  {totalValueStr}
                </Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 1.25,
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
                  variant="body1"
                  fontWeight="800"
                  sx={{ color: 'text.primary', mt: 0.5 }}
                >
                  {totalMaxMarksStr}
                </Typography>
              </Box>

              <Box
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 1.25,
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
                <Typography variant="body1" fontWeight="800" sx={{ color: 'info.main', mt: 0.5 }}>
                  {attendancePercentage}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Marks Obtained Card */}
        {subjects.length > 0 && (
          <Card
            sx={{
              p: 2.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              boxShadow: 'none',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Iconify icon="mdi:format-list-bulleted" width={20} sx={{ color: 'primary.main' }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
              >
                Marks Obtained (Scholastic Areas)
              </Typography>
            </Box>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, py: 1.5 }}>Subject</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13, py: 1.5 }}>
                    Max Marks
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, py: 1.5, width: '35%' }}>
                    Score & Progress
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13, py: 1.5 }}>
                    Grade
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13, py: 1.5 }}>
                    Pass/Fail
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, py: 1.5 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((sub: any, idx: number) => {
                  const marksObtainedStr = sub.marksObtained ?? '—';
                  const isSubjectAbsent =
                    marksObtainedStr === 'Ab' || marksObtainedStr.toLowerCase() === 'absent';
                  const marksObtained = isSubjectAbsent ? 0 : parseFloat(marksObtainedStr) || 0;
                  const maxMarksStr = sub.maxMarks ?? '100';
                  const maxMarks = parseFloat(maxMarksStr) || 100;
                  const progressPct =
                    maxMarks > 0 ? Math.min((marksObtained / maxMarks) * 100, 100) : 0;
                  const subjectGrade = sub.grade ?? '—';
                  const subjectRemarks = sub.remarks ?? (isSubjectAbsent ? 'Absent' : '—');
                  const isSubjectPassed =
                    sub.isPassed !== undefined
                      ? sub.isPassed
                      : subjectGrade !== 'F' && !isSubjectAbsent;

                  const themeInfo = getSubjectTheme(sub.subjectName ?? '');

                  return (
                    <TableRow
                      key={idx}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1.25}>
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
                            {sub.subjectName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5, fontWeight: 500 }}>
                        {maxMarksStr}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {isSubjectAbsent ? (
                          <Typography variant="body2" color="error.main" fontWeight="bold">
                            ABSENT
                          </Typography>
                        ) : (
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Box
                              sx={{
                                flex: 1,
                                height: 6,
                                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${progressPct}%`,
                                  height: '100%',
                                  bgcolor: isSubjectPassed ? 'success.main' : 'error.main',
                                  borderRadius: 3,
                                }}
                              />
                            </Box>
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
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
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
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        {isSubjectAbsent ? (
                          <Label
                            variant="soft"
                            color="default"
                            startIcon={<Iconify icon="mdi:account-off-outline" />}
                          >
                            ABSENT
                          </Label>
                        ) : (
                          <Label
                            variant="soft"
                            color={isSubjectPassed ? 'success' : 'error'}
                            startIcon={
                              <Iconify
                                icon={
                                  isSubjectPassed
                                    ? 'mdi:check-circle-outline'
                                    : 'mdi:close-circle-outline'
                                }
                              />
                            }
                          >
                            {isSubjectPassed ? 'PASS' : 'FAIL'}
                          </Label>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: 'text.secondary', fontWeight: 500 }}>
                        {subjectRemarks}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </DialogScrollContent>
      {/* </Box> */}

      {/* Action Buttons */}
      <DialogActions
        className="no-print"
        sx={{
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          justifyContent: 'flex-end',
          gap: 1.5,
        }}
      >
        <Button onClick={onClose} variant="outlined" size="medium" sx={{ borderRadius: '8px' }}>
          Close
        </Button>
        {/* <Button
          onClick={() => window.print()}
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="mdi:printer" />}
          sx={{ borderRadius: '8px', border: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          Print Result
        </Button>
        <Button
          onClick={() => window.print()}
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mdi:arrow-top-right" />}
          sx={{ borderRadius: '8px' }}
        >
          Download PDF
        </Button> */}
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
    { label: 'Appeared', value: appeared, icon: 'mdi:account-group', color: '#6366f1' },
    { label: 'Passed', value: passed, icon: 'mdi:check-decagram', color: '#22c55e' },
    { label: 'Failed', value: failed, icon: 'mdi:close-circle', color: '#ef4444' },
    { label: 'Pass %', value: `${passPercentage}%`, icon: 'mdi:chart-donut', color: '#3b82f6' },
    { label: 'Highest %', value: `${highestPercentage}%`, icon: 'mdi:trophy', color: '#f59e0b' },
    {
      label: 'Average %',
      value: `${averagePercentage}%`,
      icon: 'mdi:trending-up',
      color: '#a855f7',
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
        gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))"
        gap={2}
        mb={2.5}
      >
        {cards.map((card) => (
          <Card
            key={card.label}
            sx={{
              p: 2.25,
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              cursor: 'default',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 6px 20px ${alpha(card.color, 0.08)}`,
                borderColor: card.color,
              },
            }}
          >
            {/* Top Row: Muted Label and Small Icon Badge */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontSize: 10,
                }}
              >
                {card.label}
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(card.color, 0.1),
                  color: card.color,
                }}
              >
                <Iconify icon={card.icon} width={16} />
              </Box>
            </Box>

            {/* Bottom Row: Big Bold Metric Value */}
            <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1 }}>
              {card.value}
            </Typography>

            {/* Subtle bottom color indicator bar */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                bgcolor: alpha(card.color, 0.6),
              }}
            />
          </Card>
        ))}
      </Box>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

const ResultCreation = (_props: TabComponentType) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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
      GradeEntryPublishedOnly: true,
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
        forceRegenerate: true,
      }).unwrap();
      shikshaMitraToast.success({
        message: `Result generated! ${result?.passed ?? 0} passed out of ${result?.totalStudents ?? 0} students.`,
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
          minWidth: 130,
          align: 'left' as const,
          sticky: colId === 'RollNo' || colId === 'StudentName',
          render: (value: any, row: any) => {
            if (value == null || value === '') {
              return (
                <Typography variant="caption" color="text.disabled">
                  —
                </Typography>
              );
            }
            if (colId === 'Total' || colId === 'total') {
              const maxMarks = row.TotalMaxMarks || row.totalMaxMarks || '—';
              return (
                <Typography variant="caption" fontWeight={600}>
                  {value} / {maxMarks}
                </Typography>
              );
            }
            if (isStatusColumn(colId)) {
              return (
                <Label variant="soft" color={getStatusColor(String(value))}>
                  {value}
                </Label>
              );
            }
            if (isPercentageColumn(colId)) {
              return (
                <Label variant="soft" color={getPercentageColor(String(value))}>
                  {value}
                </Label>
              );
            }
            if (colId === 'Grade' || colId === 'grade') {
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

    // 5. Add new Pass/Fail column
    finalCols.push({
      id: 'pass_fail',
      label: 'Pass/Fail',
      minWidth: 120,
      align: 'left' as const,
      render: (_value: any, row: any) => {
        const grade = row.Grade || row.grade;
        if (!grade || grade === '—') {
          return (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          );
        }
        const isPass = grade !== 'F';
        return (
          <Label variant="soft" color={isPass ? 'success' : 'error'}>
            {isPass ? 'PASS' : 'FAIL'}
          </Label>
        );
      },
    });

    // Add any other columns that we didn't explicitly place (in case there are any)
    mappedCols.forEach((col) => {
      if (!finalCols.some((fc) => fc.id === col.id)) {
        finalCols.push(col);
      }
    });

    // Action column — view student details
    finalCols.push({
      id: '_action',
      label: 'Details',
      minWidth: 50,
      sticky: true,
      align: 'center' as const,
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
            <Iconify icon="mdi:eye-outline" width={17} sx={{ color: 'text.secondary' }} />
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
        sticky: true,
      },
      {
        id: 'pass_fail',
        label: 'Pass/Fail',
        minWidth: 120,
        align: 'left' as const,
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
                Generate Result
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
        examId={examId}
        examName={examOptions.find((opt) => opt.examId === examId)?.examName || ''}
        schoolName={schoolName}
      />
    </Box>
  );
};

export default ResultCreation;
