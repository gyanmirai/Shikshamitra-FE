'use client';

import type { Standards } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { alpha } from '@mui/material/styles';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { East, Close, Clear, Search, Refresh, ContentCopy, CheckCircle } from '@mui/icons-material';
import {
  subjectAssignmentsApi,
  useGetSubjectAssignmentsQuery,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Stack,
  Radio,
  Paper,
  Button,
  Dialog,
  Switch,
  Divider,
  Skeleton,
  Checkbox,
  InputBase,
  TextField,
  RadioGroup,
  IconButton,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

// --------------------------------------------------------------------------
// Payload matches backend contract exactly (flat, single targetClassId)
// --------------------------------------------------------------------------
export interface CopySubjectPayload {
  sourceClassId: string;
  targetClassId: string;
  subjectIds: string[] | null;
  includeTeachers: boolean;
  includeCurriculumDetails: boolean;
  includeDocuments: boolean;
  conflictStrategy: 'SKIP' | 'OVERWRITE';
  targetStatus: number;
}

interface SubjectCopyDialogProps {
  open: boolean;
  isLoading: boolean;
  allClass: Standards[];
  sourceClassId: string;
  sourceClassName?: string;
  onClose: () => void;
  onConfirm: (payload: CopySubjectPayload) => Promise<void>;
}

// --------------------------------------------------------------------------
// SubjectCopyDialog
// --------------------------------------------------------------------------
const SubjectCopyDialog = ({
  open,
  isLoading,
  allClass,
  sourceClassId,
  sourceClassName,
  onClose,
  onConfirm,
}: SubjectCopyDialogProps) => {
  const dispatch = useDispatch();

  // ── Confirmation Modal State ─────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────
  const [copyFromClass, setCopyFromClass] = useState<Standards | null>(null);
  const [selectionMode, setSelectionMode] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [includeCurriculumDetails, setIncludeCurriculumDetails] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeTeachers, setIncludeTeachers] = useState(false);
  const [conflictStrategy, setConflictStrategy] = useState<'SKIP' | 'OVERWRITE'>('SKIP');

  // ── Target class filtering ──────────────────────────────────────────────
  const [eligibleClassIds, setEligibleClassIds] = useState<Set<string>>(new Set());
  const [isFilteringClasses, setIsFilteringClasses] = useState(false);
  const [filterError, setFilterError] = useState(false);

  // All classes except current source
  const candidateClasses = useMemo(
    () => (allClass || []).filter((c) => String(c.id) !== String(sourceClassId)),
    [allClass, sourceClassId]
  );

  // Batch-check which candidates have ≥ 1 subject assignment record
  const runClassFilter = useCallback(async () => {
    if (candidateClasses.length === 0) {
      setEligibleClassIds(new Set());
      return;
    }
    let mounted = true;
    setIsFilteringClasses(true);
    setFilterError(false);
    try {
      const results = await Promise.all(
        candidateClasses.map((cls) =>
          dispatch(
            (subjectAssignmentsApi.endpoints as any).getSubjectAssignments.initiate(
              { standardId: cls.id, page: 0, pageSize: 1, status: 'all' },
              { track: false }
            )
          )
        )
      );
      if (!mounted) return;
      const eligible = new Set<string>();
      (results as any[]).forEach((result, i) => {
        if ((result?.data?.data?.totalCount ?? 0) > 0) {
          eligible.add(String(candidateClasses[i].id));
        }
      });
      setEligibleClassIds(eligible);
    } catch {
      if (mounted) setFilterError(true);
    } finally {
      if (mounted) setIsFilteringClasses(false);
      mounted = false;
    }
  }, [candidateClasses, dispatch]);

  useEffect(() => {
    if (open) runClassFilter();
  }, [open, runClassFilter]);

  const eligibleClasses = useMemo(
    () => candidateClasses.filter((c) => eligibleClassIds.has(String(c.id))),
    [candidateClasses, eligibleClassIds]
  );

  // ── Lazy subject fetch — fetches FROM the selected copy-from class
  const {
    data: subjectsApiData,
    isLoading: isSubjectsLoading,
    isError: isSubjectsError,
    refetch: retrySubjects,
  } = useGetSubjectAssignmentsQuery(
    { standardId: String(copyFromClass?.id ?? ''), page: 0, pageSize: 100, status: 'all' },
    { skip: selectionMode !== 'SPECIFIC' || !copyFromClass?.id || !open }
  );

  const allSubjects = useMemo(() => {
    if (!subjectsApiData?.data?.items) return [];
    return (subjectsApiData.data.items as any[]).flatMap((assignment: any) =>
      (assignment.subjects || []).map((s: any) => ({
        id: String(s.subjectId),
        name: s.subjectName || 'Unnamed',
        code: s.subjectCode || '',
      }))
    );
  }, [subjectsApiData]);

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return allSubjects;
    const q = subjectSearch.toLowerCase();
    return allSubjects.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [allSubjects, subjectSearch]);

  const selectedSubjectsList = useMemo(() => {
    const set = new Set(selectedSubjectIds);
    return allSubjects.filter((s) => set.has(s.id));
  }, [allSubjects, selectedSubjectIds]);

  // ── Reset on close ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setConfirmOpen(false);
      setCopyFromClass(null);
      setSelectionMode('ALL');
      setSelectedSubjectIds([]);
      setSubjectSearch('');
      setIncludeCurriculumDetails(true);
      setIncludeDocuments(true);
      setIncludeTeachers(false);
      setConflictStrategy('SKIP');
    }
  }, [open]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleToggleSubject = useCallback((id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedSubjectIds((prev) =>
      prev.length === filteredSubjects.length ? [] : filteredSubjects.map((s) => s.id)
    );
  }, [filteredSubjects]);

  const handleModeChange = (value: 'ALL' | 'SPECIFIC') => {
    setSelectionMode(value);
    setSelectedSubjectIds([]);
    setSubjectSearch('');
  };

  const handleSubmit = async () => {
    if (!copyFromClass) return;
    try {
      await onConfirm({
        sourceClassId: String(copyFromClass.id),
        targetClassId: sourceClassId,
        subjectIds: selectionMode === 'ALL' ? null : selectedSubjectIds,
        includeTeachers,
        includeCurriculumDetails,
        includeDocuments,
        conflictStrategy,
        targetStatus: 0,
      });
      setConfirmOpen(false);
    } catch {
      // Error handled upstream
    }
  };

  const canSubmit = !!copyFromClass && (selectionMode === 'ALL' || selectedSubjectIds.length > 0);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* ── Header ── */}
        <DialogTitle
          sx={{
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
              }}
            >
              <ContentCopy fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                Copy Subject Allocations
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Copy subject allocations and settings from another class
              </Typography>
            </Box>
          </Stack>

          <IconButton size="small" onClick={onClose} disabled={isLoading}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>
            {/* ── Balanced Source & Target Class Cards ── */}
            <Grid container spacing={2} alignItems="stretch" sx={{ pt: 1 }}>
              {/* Source Class (Copy From Dropdown) */}
              <Grid size={{ xs: 12, sm: 5.25 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    textTransform="uppercase"
                    letterSpacing={0.5}
                    display="block"
                    mb={0.75}
                  >
                    Source Class (Copy From) *
                  </Typography>
                  {isFilteringClasses ? (
                    <Skeleton variant="rectangular" height={38} sx={{ borderRadius: 1 }} />
                  ) : filterError ? (
                    <Alert
                      severity="error"
                      variant="outlined"
                      sx={{ py: 0 }}
                      action={
                        <Button size="small" startIcon={<Refresh />} onClick={runClassFilter}>
                          Retry
                        </Button>
                      }
                    >
                      Failed
                    </Alert>
                  ) : eligibleClasses.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      No other classes with subjects
                    </Typography>
                  ) : (
                    <Autocomplete
                      size="small"
                      options={eligibleClasses}
                      getOptionLabel={(o) => o.name}
                      value={copyFromClass}
                      onChange={(_, v) => {
                        setCopyFromClass(v);
                        setSelectedSubjectIds([]);
                        setSubjectSearch('');
                      }}
                      renderInput={(params) => <TextField {...params} placeholder="Select class" />}
                      noOptionsText="No eligible classes"
                    />
                  )}
                </Paper>
              </Grid>

              {/* Center Arrow Icon */}
              <Grid
                size={{ xs: 12, sm: 1.5 }}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <East fontSize="small" />
                </Box>
              </Grid>

              {/* Target Class (Copy To) */}
              <Grid size={{ xs: 12, sm: 5.25 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.75,
                    borderRadius: 1.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.24),
                  }}
                >
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontWeight={700}
                    textTransform="uppercase"
                    letterSpacing={0.5}
                    display="block"
                    mb={0.5}
                  >
                    Target Class (Copy To)
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {sourceClassName || '—'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* ── Subjects Selection Mode ── */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Subjects to Copy
              </Typography>

              <RadioGroup
                row
                value={selectionMode}
                onChange={(e) => handleModeChange(e.target.value as 'ALL' | 'SPECIFIC')}
                sx={{ gap: 2, mb: 1.5 }}
              >
                <Paper
                  variant="outlined"
                  onClick={() => handleModeChange('ALL')}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 1,
                    cursor: 'pointer',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor:
                      selectionMode === 'ALL'
                        ? (theme) => alpha(theme.palette.primary.main, 0.08)
                        : 'transparent',
                    borderColor: selectionMode === 'ALL' ? 'primary.main' : 'divider',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  <FormControlLabel
                    value="ALL"
                    control={<Radio size="small" readOnly checked={selectionMode === 'ALL'} />}
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        All Subjects
                      </Typography>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  onClick={() => handleModeChange('SPECIFIC')}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 1,
                    cursor: 'pointer',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor:
                      selectionMode === 'SPECIFIC'
                        ? (theme) => alpha(theme.palette.primary.main, 0.08)
                        : 'transparent',
                    borderColor: selectionMode === 'SPECIFIC' ? 'primary.main' : 'divider',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  <FormControlLabel
                    value="SPECIFIC"
                    control={<Radio size="small" readOnly checked={selectionMode === 'SPECIFIC'} />}
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        Specific Subjects
                      </Typography>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>
              </RadioGroup>

              {selectionMode === 'SPECIFIC' && (
                <Box>
                  {!copyFromClass ? (
                    <Alert severity="info" variant="outlined">
                      Please select a <strong>Source Class</strong> first to view its subjects.
                    </Alert>
                  ) : isSubjectsLoading ? (
                    <Stack spacing={1}>
                      {[0, 1, 2].map((i) => (
                        <Skeleton
                          key={i}
                          variant="rectangular"
                          height={40}
                          sx={{ borderRadius: 1 }}
                        />
                      ))}
                    </Stack>
                  ) : isSubjectsError ? (
                    <Alert
                      severity="error"
                      variant="outlined"
                      action={
                        <Button
                          size="small"
                          startIcon={<Refresh />}
                          onClick={() => retrySubjects()}
                        >
                          Retry
                        </Button>
                      }
                    >
                      Failed to load subjects.
                    </Alert>
                  ) : allSubjects.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                      No subjects configured for this class.
                    </Alert>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        borderColor: 'divider',
                      }}
                    >
                      {/* Search & Counter Bar */}
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.default, 0.6)
                              : alpha(theme.palette.grey[500], 0.04),
                        }}
                      >
                        <Search fontSize="small" color="action" />
                        <InputBase
                          placeholder="Search subject by name or code..."
                          value={subjectSearch}
                          onChange={(e) => setSubjectSearch(e.target.value)}
                          sx={{ fontSize: '0.85rem', flex: 1 }}
                        />
                        {subjectSearch && (
                          <IconButton size="small" onClick={() => setSubjectSearch('')}>
                            <Clear fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      {/* Select All Toggle Header */}
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: (theme) => alpha(theme.palette.action.hover, 0.5),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Checkbox
                              size="small"
                              checked={
                                filteredSubjects.length > 0 &&
                                selectedSubjectIds.length === filteredSubjects.length
                              }
                              indeterminate={
                                selectedSubjectIds.length > 0 &&
                                selectedSubjectIds.length < filteredSubjects.length
                              }
                              onChange={handleSelectAll}
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={700}>
                              Select All ({filteredSubjects.length})
                            </Typography>
                          }
                        />
                        <Chip
                          label={`${selectedSubjectIds.length} of ${allSubjects.length} Selected`}
                          size="small"
                          color={selectedSubjectIds.length > 0 ? 'primary' : 'default'}
                          variant={selectedSubjectIds.length > 0 ? 'soft' : 'outlined'}
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </Box>

                      {/* Subject Cards Grid */}
                      <Box sx={{ maxHeight: 200, overflowY: 'auto', p: 1.5 }}>
                        {filteredSubjects.length === 0 ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ p: 2, textAlign: 'center', display: 'block' }}
                          >
                            No subjects match your search.
                          </Typography>
                        ) : (
                          <Stack spacing={1}>
                            {filteredSubjects.map((s) => {
                              const isSelected = selectedSubjectIds.includes(s.id);
                              return (
                                <Paper
                                  key={s.id}
                                  variant="outlined"
                                  onClick={() => handleToggleSubject(s.id)}
                                  sx={{
                                    p: 1.25,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    bgcolor: isSelected
                                      ? (theme) => alpha(theme.palette.primary.main, 0.08)
                                      : 'background.paper',
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    transition: 'all 0.15s ease-in-out',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      bgcolor: isSelected
                                        ? (theme) => alpha(theme.palette.primary.main, 0.12)
                                        : 'action.hover',
                                    },
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Checkbox
                                      size="small"
                                      checked={isSelected}
                                      onChange={() => handleToggleSubject(s.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      sx={{ p: 0 }}
                                    />
                                    <Box>
                                      <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                                        {s.name}
                                      </Typography>
                                    </Box>
                                  </Stack>

                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    {s.code && (
                                      <Chip
                                        label={s.code}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: '0.6875rem',
                                          height: 20,
                                          fontWeight: 600,
                                          borderColor: isSelected ? 'primary.main' : 'divider',
                                        }}
                                      />
                                    )}
                                    {isSelected && (
                                      <CheckCircle color="primary" sx={{ fontSize: 18 }} />
                                    )}
                                  </Stack>
                                </Paper>
                              );
                            })}
                          </Stack>
                        )}
                      </Box>
                    </Paper>
                  )}
                </Box>
              )}
            </Box>

            <Divider />

            {/* ── Grouped Options & Strategy (Refined Card Styling) ── */}
            <Grid container spacing={2.5}>
              {/* Include Component Options Cards */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Include Component Options
                </Typography>
                <Stack spacing={1}>
                  <Paper
                    variant="outlined"
                    onClick={() => setIncludeCurriculumDetails(!includeCurriculumDetails)}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: includeCurriculumDetails
                        ? (theme) => alpha(theme.palette.primary.main, 0.06)
                        : 'transparent',
                      borderColor: includeCurriculumDetails ? 'primary.main' : 'divider',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box sx={{ pr: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Curriculum Specs
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Goals, prerequisites &amp; descriptions
                      </Typography>
                    </Box>
                    <Switch
                      size="small"
                      checked={includeCurriculumDetails}
                      onChange={(e) => setIncludeCurriculumDetails(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Paper>

                  <Paper
                    variant="outlined"
                    onClick={() => setIncludeDocuments(!includeDocuments)}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: includeDocuments
                        ? (theme) => alpha(theme.palette.primary.main, 0.06)
                        : 'transparent',
                      borderColor: includeDocuments ? 'primary.main' : 'divider',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box sx={{ pr: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Attached Documents
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Reference files &amp; resource links
                      </Typography>
                    </Box>
                    <Switch
                      size="small"
                      checked={includeDocuments}
                      onChange={(e) => setIncludeDocuments(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Paper>

                  <Paper
                    variant="outlined"
                    onClick={() => setIncludeTeachers(!includeTeachers)}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: includeTeachers
                        ? (theme) => alpha(theme.palette.primary.main, 0.06)
                        : 'transparent',
                      borderColor: includeTeachers ? 'primary.main' : 'divider',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box sx={{ pr: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Teacher Assignments
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Primary &amp; secondary teachers
                      </Typography>
                    </Box>
                    <Switch
                      size="small"
                      checked={includeTeachers}
                      onChange={(e) => setIncludeTeachers(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Paper>
                </Stack>
              </Grid>

              {/* Conflict Strategy Cards */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  If Subject Exists in Target
                </Typography>
                <RadioGroup
                  value={conflictStrategy}
                  onChange={(e) => setConflictStrategy(e.target.value as 'SKIP' | 'OVERWRITE')}
                  sx={{ gap: 1 }}
                >
                  <Paper
                    variant="outlined"
                    onClick={() => setConflictStrategy('SKIP')}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor:
                        conflictStrategy === 'SKIP'
                          ? (theme) => alpha(theme.palette.primary.main, 0.06)
                          : 'transparent',
                      borderColor: conflictStrategy === 'SKIP' ? 'primary.main' : 'divider',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <FormControlLabel
                      value="SKIP"
                      control={
                        <Radio size="small" readOnly checked={conflictStrategy === 'SKIP'} />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Skip Existing{' '}
                            <Typography component="span" variant="caption" color="primary.main">
                              (Recommended)
                            </Typography>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Keep existing target class settings
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  </Paper>

                  <Paper
                    variant="outlined"
                    onClick={() => setConflictStrategy('OVERWRITE')}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor:
                        conflictStrategy === 'OVERWRITE'
                          ? (theme) => alpha(theme.palette.primary.main, 0.06)
                          : 'transparent',
                      borderColor: conflictStrategy === 'OVERWRITE' ? 'primary.main' : 'divider',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <FormControlLabel
                      value="OVERWRITE"
                      control={
                        <Radio size="small" readOnly checked={conflictStrategy === 'OVERWRITE'} />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Overwrite Existing
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Replace existing target class settings
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  </Paper>
                </RadioGroup>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <Divider />

        {/* ── Footer Actions ── */}
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={onClose}
            size="small"
            variant="outlined"
            color="inherit"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!canSubmit}
            startIcon={<ContentCopy />}
            onClick={() => setConfirmOpen(true)}
          >
            Copy to Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirmation Overlay Modal ── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ py: 2, px: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ContentCopy color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              Confirm Subject Allocation Copy
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 1.5 }}>
          <Stack spacing={2}>
            {/* Visual Direction Banner */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    FROM
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                    {copyFromClass?.name}
                  </Typography>
                </Box>
                <East fontSize="small" color="primary" />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    TO
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                    {sourceClassName || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Typography variant="body2">
              Are you sure you want to copy subject allocations from{' '}
              <strong>{copyFromClass?.name}</strong> to <strong>{sourceClassName}</strong>?
            </Typography>

            {/* Target Subjects Summary */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                display="block"
                mb={0.5}
              >
                SELECTED SUBJECTS (
                {selectionMode === 'ALL' ? 'ALL SUBJECTS' : selectedSubjectIds.length})
              </Typography>
              {selectionMode === 'SPECIFIC' && selectedSubjectsList.length > 0 && (
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.5)
                        : alpha(theme.palette.grey[500], 0.06),
                    maxHeight: 90,
                    overflowY: 'auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                  }}
                >
                  {selectedSubjectsList.map((s) => (
                    <Chip
                      key={s.id}
                      label={s.name}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.72rem', height: 22, fontWeight: 600 }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
              <Typography variant="caption">
                Copied allocations will be saved in <strong>Draft</strong> status for safety.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => setConfirmOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            loading={isLoading}
            startIcon={<ContentCopy />}
            onClick={handleSubmit}
          >
            Confirm &amp; Copy
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(SubjectCopyDialog);
