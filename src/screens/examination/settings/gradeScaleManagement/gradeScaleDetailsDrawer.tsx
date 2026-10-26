'use client';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useId, useMemo, useState } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Table,
  Drawer,
  Button,
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

import { GradeScaleDetailField } from './GradeScaleDetailField';

import type { IGrade, IGradingScale } from './type';

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
  const titleId = useId();
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
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': titleId,
        sx: {
          width: { xs: '100%', sm: 600, md: 720 },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        },
      }}
    >
      <Box
        component="header"
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 0.75,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'background.neutral',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            <Iconify icon={GlobalIcons.notebook} width={20} aria-hidden />
          </Box>
          <Stack sx={{ minWidth: 0, flex: 1 }} spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
              <Typography
                id={titleId}
                variant="h6"
                component="h2"
                sx={{ overflowWrap: 'anywhere' }}
              >
                {gradeScale.name}
              </Typography>
              {statusInfo && <Label color={statusInfo.color}>{statusInfo.label}</Label>}
              {gradeScale.isDefault && <Label color="info">Default scale</Label>}
              <CustomTooltip
                arrow
                placement="bottom"
                title="Review the saved grade scale details, configured ranges and grade calculator."
              >
                <IconButton
                  size="small"
                  aria-label="Grade scale information"
                  sx={{ color: 'info.main', width: 44, height: 44 }}
                >
                  <Iconify icon={GlobalIcons.info} width={16} />
                </IconButton>
              </CustomTooltip>
            </Stack>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close grade scale details"
            sx={{ color: 'text.secondary', width: 44, height: 44, flexShrink: 0 }}
          >
            <Iconify icon={GlobalIcons.cancel} width={20} />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <FormSectionCard
            icon={GlobalIcons.notebook}
            title="Grade Scale Details"
            descriptionTooltip="Saved title, marks, status and default-scale settings, with current usage."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <GradeScaleDetailField label="Grade scale title" value={gradeScale.name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GradeScaleDetailField label="Total marks" value={totalMarks} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GradeScaleDetailField
                  label="Pass marks"
                  value={passMarks !== null ? passMarks : '-'}
                  helper={
                    passMarks !== null && totalMarks > 0
                      ? `${Math.round((passMarks / totalMarks) * 100)}% threshold`
                      : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GradeScaleDetailField
                  label="Status"
                  value={
                    statusInfo ? <Label color={statusInfo.color}>{statusInfo.label}</Label> : '-'
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GradeScaleDetailField
                  label="Set as default scale"
                  value={gradeScale.isDefault ? 'Yes' : 'No'}
                />
              </Grid>
              {gradeScale.description && (
                <Grid size={{ xs: 12 }}>
                  <GradeScaleDetailField label="Description" value={gradeScale.description} />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <GradeScaleDetailField
                  label="Grade tiers"
                  value={sortedRanges.length}
                  helper={
                    sortedRanges.length > 0
                      ? `${sortedRanges[0]?.grade} to ${sortedRanges[sortedRanges.length - 1]?.grade}`
                      : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GradeScaleDetailField label="Exams linked" value={gradeScale.usageCount || 0} />
              </Grid>
            </Grid>
          </FormSectionCard>

          <FormSectionCard
            icon={GlobalIcons.notebook}
            title="Configured Grade Ranges"
            descriptionTooltip="Saved mark ranges, grade points, result statuses and remarks for each band."
          >
            <TableContainer
              sx={{ overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}
            >
              <Table size="small" aria-label="Configured grade ranges" sx={{ minWidth: 500 }}>
                <TableHead sx={{ bgcolor: 'background.neutral' }}>
                  <TableRow>
                    <TableCell>Grade</TableCell>
                    <TableCell>Marks range</TableCell>
                    <TableCell align="center">Point</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRanges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyContent
                          title="No grade ranges configured"
                          sx={{ py: 3, height: 'auto' }}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedRanges.map((range, index) => {
                      const res = getResultLabel(range.resultStatus);
                      const isSimMatched = matchedRange && matchedRange.grade === range.grade;
                      return (
                        <TableRow key={index} selected={Boolean(isSimMatched)}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2">{range.grade}</Typography>
                              {isSimMatched && <Label color="primary">Match</Label>}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {range.minMarks} &ndash; {range.maxMarks}
                            </Typography>
                            {totalMarks > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {Math.round((Number(range.minMarks) / totalMarks) * 100)}% &ndash;{' '}
                                {Math.round((Number(range.maxMarks) / totalMarks) * 100)}%
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {range.gradePoint !== '' &&
                              range.gradePoint !== null &&
                              range.gradePoint !== undefined
                                ? range.gradePoint
                                : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Label color={res.color}>{res.label}</Label>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
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
          </FormSectionCard>

          <FormSectionCard
            icon={GlobalIcons.notebook}
            title="Grade Scaling Simulator"
            descriptionTooltip="Enter sample marks or select a quick score to find the matching configured grade range."
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Sample obtained marks"
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
                      <Chip label="Min (0)" size="small" onClick={() => setSimMarks('0')} />
                      {passMarks !== null && (
                        <Chip
                          label={`Pass (${passMarks})`}
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => setSimMarks(String(passMarks))}
                        />
                      )}
                      <Chip
                        label={`75% (${Math.round(totalMarks * 0.75)})`}
                        size="small"
                        onClick={() => setSimMarks(String(Math.round(totalMarks * 0.75)))}
                      />
                      <Chip
                        label={`Max (${totalMarks})`}
                        size="small"
                        variant="outlined"
                        onClick={() => setSimMarks(String(totalMarks))}
                      />
                    </>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {matchedRange ? (
              <Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <GradeScaleDetailField label="Calculated grade" value={matchedRange.grade} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <GradeScaleDetailField
                      label="Result status"
                      value={
                        <Label color={getResultLabel(matchedRange.resultStatus).color}>
                          {getResultLabel(matchedRange.resultStatus).label}
                        </Label>
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <GradeScaleDetailField
                      label="Grade point"
                      value={
                        matchedRange.gradePoint !== '' &&
                        matchedRange.gradePoint !== null &&
                        matchedRange.gradePoint !== undefined
                          ? matchedRange.gradePoint
                          : '-'
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <GradeScaleDetailField label="Remark" value={matchedRange.remark || '-'} />
                  </Grid>
                </Grid>
                {totalMarks > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Typography variant="caption" color="text.secondary">
                        Score position ({marksInput} / {totalMarks})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
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
              <EmptyContent
                title={simMarks === '' ? 'Enter sample marks' : 'No matching grade range'}
                description={
                  simMarks === ''
                    ? 'Enter sample marks above to test the grade calculator.'
                    : `No grade range defined for ${simMarks} marks.`
                }
                sx={{ py: 2, height: 'auto' }}
              />
            )}
          </FormSectionCard>
        </Stack>
      </Box>

      <Box
        component="footer"
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.75,
          flexShrink: 0,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
        >
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            onClick={onClose}
          >
            Close
          </Button>
          {canEdit && onEdit && (
            <Button
              type="button"
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.edit} width={18} />}
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
