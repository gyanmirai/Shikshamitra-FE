'use client';

import React, { useState, useMemo } from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Table,
  Paper,
  Drawer,
  Button,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  LinearProgress,
  TableContainer,
} from '@mui/material';

import type { IGrade, IGradingScale } from './type';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getStatusLabel = (status: any) => {
  if (status === 0 || status === 'Active') return { label: 'Active', color: 'success' as const };
  if (status === 1 || status === 'Inactive') return { label: 'Inactive', color: 'error' as const };
  if (status === 2 || status === 'SystemDefault')
    return { label: 'System Default', color: 'info' as const };
  if (status === 3 || status === 'Archived')
    return { label: 'Archived', color: 'warning' as const };
  return { label: 'Unknown', color: 'default' as const };
};

const getResultLabel = (resultStatus: any) => {
  const statusNum = Number(resultStatus);
  if (statusNum === 0 || resultStatus === 'Pass')
    return { label: 'Pass', color: 'success' as const };
  if (statusNum === 1 || resultStatus === 'Fail') return { label: 'Fail', color: 'error' as const };
  if (statusNum === 2 || resultStatus === 'Optional')
    return { label: 'Optional', color: 'warning' as const };
  return { label: 'Unknown', color: 'default' as const };
};

type ColorVariant = 'error' | 'success' | 'primary' | 'info' | 'warning';

const getGradeColorKey = (index: number, total: number, resultStatus: any): ColorVariant => {
  const statusNum = Number(resultStatus);
  if (statusNum === 1) return 'error';
  if (index === 0) return 'success';
  if (index < total / 3) return 'primary';
  if (index < (2 * total) / 3) return 'info';
  return 'warning';
};

interface GradeScaleDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  gradeScale: IGrade | null;
  onEdit?: () => void;
  canEdit?: boolean;
}

export default function GradeScaleDetailsDrawer({
  open,
  onClose,
  gradeScale,
  onEdit,
  canEdit = false,
}: GradeScaleDetailsDrawerProps) {
  const [simMarks, setSimMarks] = useState<string>('');

  const statusInfo = gradeScale ? getStatusLabel(gradeScale.status) : null;
  const totalMarks = gradeScale ? Number(gradeScale.totalMarks) || 0 : 0;
  const passMarks =
    gradeScale && gradeScale.passMarks !== undefined && gradeScale.passMarks !== null
      ? Number(gradeScale.passMarks)
      : null;

  const sortedRanges = useMemo(() => {
    if (!gradeScale?.gradingScale) return [];
    return [...gradeScale.gradingScale].sort((a, b) => Number(b.minMarks) - Number(a.minMarks));
  }, [gradeScale?.gradingScale]);

  // Simulator calculation
  const marksInput = Number(simMarks);
  const matchedRange = useMemo(() => {
    if (simMarks === '' || Number.isNaN(marksInput) || !gradeScale?.gradingScale) return null;
    return gradeScale.gradingScale.find(
      (r: IGradingScale) =>
        r.minMarks !== '' &&
        r.maxMarks !== '' &&
        marksInput >= Number(r.minMarks) &&
        marksInput <= Number(r.maxMarks)
    );
  }, [simMarks, marksInput, gradeScale?.gradingScale]);

  // Keep the Drawer mounted so its first open uses MUI's slide transition.
  if (!gradeScale) return <Drawer anchor="right" open={false} onClose={onClose} />;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600, md: 720 },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        },
      }}
    >
      {/* ------------------------------------------------------------------- */}
      {/* Drawer Header                                                       */}
      {/* ------------------------------------------------------------------- */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
              }}
            >
              <Iconify icon="mdi:scale-balance" width={24} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={700}>
                  {gradeScale.name}
                </Typography>
                <CustomTooltip
                  arrow
                  placement="top"
                  title="View grade scale parameters, tier breakdown, and interactive simulator."
                >
                  <Iconify
                    icon="lucide:info"
                    sx={{ cursor: 'pointer', color: 'info.main', width: 18, height: 18 }}
                  />
                </CustomTooltip>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                {statusInfo && <Label color={statusInfo.color}>{statusInfo.label}</Label>}
                {gradeScale.isDefault && (
                  <Label color="info" startIcon={<Iconify icon="mdi:star" width={14} />}>
                    Default Scale
                  </Label>
                )}
                {(gradeScale.usageCount || 0) > 0 && (
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<Iconify icon="mdi:file-document-check-outline" width={14} />}
                    label={`${gradeScale.usageCount} linked exams`}
                    sx={{ height: 22, fontSize: 11 }}
                  />
                )}
              </Stack>
            </Box>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1}>
            {canEdit && onEdit && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <Iconify icon="mdi:close" width={20} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* ------------------------------------------------------------------- */}
      {/* Scrollable Content                                                  */}
      {/* ------------------------------------------------------------------- */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* --------------------------------------------------------------- */}
          {/* 1. Quick Stats Overview Cards                                   */}
          {/* --------------------------------------------------------------- */}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total Marks
                  </Typography>
                  <Typography variant="h5" color="primary.main" fontWeight={700}>
                    {totalMarks}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Maximum score
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
                  borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Pass Marks
                  </Typography>
                  <Typography variant="h5" color="success.main" fontWeight={700}>
                    {passMarks !== null ? passMarks : '-'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {passMarks !== null && totalMarks > 0
                      ? `${Math.round((passMarks / totalMarks) * 100)}% threshold`
                      : 'Passing score'}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                  borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Grade Tiers
                  </Typography>
                  <Typography variant="h5" color="info.main" fontWeight={700}>
                    {sortedRanges.length}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {sortedRanges.length > 0
                      ? `${sortedRanges[0]?.grade} to ${sortedRanges[sortedRanges.length - 1]?.grade}`
                      : 'Defined bands'}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
                  borderColor: (theme) => alpha(theme.palette.warning.main, 0.2),
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Exams Linked
                  </Typography>
                  <Typography variant="h5" color="warning.main" fontWeight={700}>
                    {gradeScale.usageCount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Active usage
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* --------------------------------------------------------------- */}
          {/* 2. Description / Details Box                                    */}
          {/* --------------------------------------------------------------- */}
          {gradeScale.description && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" color="text.primary">
                {gradeScale.description}
              </Typography>
            </Box>
          )}

          {/* --------------------------------------------------------------- */}
          {/* 3. Configured Grade Ranges Table                                */}
          {/* --------------------------------------------------------------- */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon="mdi:format-list-numbered"
                  sx={{ color: 'primary.main', width: 20, height: 20 }}
                />
                <Typography variant="subtitle1" fontWeight={700}>
                  Grade Ranges & Points
                </Typography>
              </Stack>
              <Chip
                label={`${sortedRanges.length} Bands Configured`}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Stack>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                overflow: 'hidden',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.25 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.25 }}>Marks Range</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.25 }} align="center">
                      Point
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.25 }}>Result</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.25 }}>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRanges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No grade ranges configured.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedRanges.map((range, index) => {
                      const res = getResultLabel(range.resultStatus);
                      const isSimMatched = matchedRange && matchedRange.grade === range.grade;
                      const colorKey = getGradeColorKey(
                        index,
                        sortedRanges.length,
                        range.resultStatus
                      );

                      return (
                        <TableRow
                          key={index}
                          sx={{
                            transition: 'background-color 0.2s ease',
                            bgcolor: isSimMatched
                              ? (theme) => alpha(theme.palette.primary.main, 0.08)
                              : 'inherit',
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.action.hover, 0.08),
                            },
                          }}
                        >
                          <TableCell sx={{ py: 1.25 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  minWidth: 32,
                                  height: 32,
                                  px: 1,
                                  borderRadius: 1,
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                  bgcolor: (theme) => alpha(theme.palette[colorKey].main, 0.12),
                                  color: (theme) => theme.palette[colorKey].main,
                                  border: '1px solid',
                                  borderColor: (theme) => alpha(theme.palette[colorKey].main, 0.3),
                                }}
                              >
                                {range.grade}
                              </Box>
                              {isSimMatched && (
                                <Label color="primary" sx={{ height: 20, fontSize: 10 }}>
                                  Match
                                </Label>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ py: 1.25 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {range.minMarks} &ndash; {range.maxMarks}
                            </Typography>
                            {totalMarks > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {Math.round((Number(range.minMarks) / totalMarks) * 100)}% &ndash;{' '}
                                {Math.round((Number(range.maxMarks) / totalMarks) * 100)}%
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell sx={{ py: 1.25 }} align="center">
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={
                                range.gradePoint !== '' &&
                                range.gradePoint !== null &&
                                range.gradePoint !== undefined
                                  ? 'text.primary'
                                  : 'text.disabled'
                              }
                            >
                              {range.gradePoint !== '' &&
                              range.gradePoint !== null &&
                              range.gradePoint !== undefined
                                ? range.gradePoint
                                : '-'}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ py: 1.25 }}>
                            <Label color={res.color}>{res.label}</Label>
                          </TableCell>

                          <TableCell sx={{ py: 1.25 }}>
                            <Typography
                              variant="body2"
                              color={range.remark ? 'text.primary' : 'text.disabled'}
                            >
                              {range.remark || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* --------------------------------------------------------------- */}
          {/* 4. Live Grade Simulator Card                                    */}
          {/* --------------------------------------------------------------- */}
          <Card
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'background.paper',
              borderColor: 'divider',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon="mdi:calculator-variant-outline"
                  sx={{ color: 'primary.main', width: 22, height: 22 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Grade Scaling Simulator
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Test how marks are converted to grades with real-time feedback.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Sample Obtained Marks"
                    placeholder={`e.g. 0 to ${totalMarks || 100}`}
                    value={simMarks}
                    onChange={(e) => setSimMarks(e.target.value)}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {totalMarks > 0 && (
                      <>
                        <Chip
                          label="Min (0)"
                          size="small"
                          onClick={() => setSimMarks('0')}
                          sx={{ cursor: 'pointer' }}
                        />
                        {passMarks !== null && (
                          <Chip
                            label={`Pass (${passMarks})`}
                            size="small"
                            color="success"
                            variant="outlined"
                            onClick={() => setSimMarks(String(passMarks))}
                            sx={{ cursor: 'pointer' }}
                          />
                        )}
                        <Chip
                          label={`75% (${Math.round(totalMarks * 0.75)})`}
                          size="small"
                          onClick={() => setSimMarks(String(Math.round(totalMarks * 0.75)))}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip
                          label={`Max (${totalMarks})`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => setSimMarks(String(totalMarks))}
                          sx={{ cursor: 'pointer' }}
                        />
                      </>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              {/* Live result display */}
              {matchedRange ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 1.5,
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 800,
                            fontSize: '1.5rem',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            boxShadow: (theme) =>
                              `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                          }}
                        >
                          {matchedRange.grade}
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Calculated Grade
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Grade {matchedRange.grade}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 4, sm: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Result Status
                      </Typography>
                      <Box sx={{ mt: 0.25 }}>
                        <Label color={getResultLabel(matchedRange.resultStatus).color}>
                          {getResultLabel(matchedRange.resultStatus).label}
                        </Label>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 4, sm: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Grade Point
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {matchedRange.gradePoint !== '' &&
                        matchedRange.gradePoint !== null &&
                        matchedRange.gradePoint !== undefined
                          ? matchedRange.gradePoint
                          : '-'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 4, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Remark
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {matchedRange.remark || '-'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {totalMarks > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Score Position ({marksInput} / {totalMarks})
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color="primary.main">
                          {Math.round((marksInput / totalMarks) * 100)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Math.max((marksInput / totalMarks) * 100, 0), 100)}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
                    border: '1px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {simMarks === ''
                      ? 'Enter sample marks above to test the grade calculator.'
                      : `No grade range defined for ${simMarks} marks.`}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Card>
        </Stack>
      </Box>

      {/* ------------------------------------------------------------------- */}
      {/* Drawer Footer                                                       */}
      {/* ------------------------------------------------------------------- */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Close
          </Button>
          {canEdit && onEdit && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={onEdit}
            >
              Edit Grade Scale
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
