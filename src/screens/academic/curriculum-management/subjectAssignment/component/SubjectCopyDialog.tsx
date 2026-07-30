'use client';

import type { Standards } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ContentCopy, Close, Search, Refresh } from '@mui/icons-material';
import {
  useGetSubjectAssignmentsQuery,
  subjectAssignmentsApi,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  Grid,
  Alert,
  Stack,
  Radio,
  Button,
  Dialog,
  Switch,
  Divider,
  Skeleton,
  Checkbox,
  InputBase,
  RadioGroup,
  TextField,
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

  // ── Form state ─────────────────────────────────────────────────────────
  // copyFromClass = the class selected in dropdown (Nursery – has subjects to copy FROM)
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

  // ── Lazy subject fetch — fetches FROM the selected copy-from class (e.g. Nursery)
  // Only triggered when user switches to "Select Specific Subjects"
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

  // ── Reset on close ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
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
    // sourceClassId = class to copy FROM (dropdown selection, e.g. Nursery)
    // targetClassId = class to copy TO   (current screen class, e.g. LKG)
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
  };

  const canSubmit = !!copyFromClass && (selectionMode === 'ALL' || selectedSubjectIds.length > 0);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          py: 1.5,
          px: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ContentCopy fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Copy Subject Allocations
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose} disabled={isLoading}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 2.5, py: 2 }}>
        <Stack spacing={2}>
          {/* ── Copy To banner (current screen class = destination) ── */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: 1,
              bgcolor: 'primary.lighter',
              border: '1px solid',
              borderColor: 'primary.light',
            }}
          >
            <Typography
              variant="caption"
              color="primary.main"
              fontWeight={700}
              textTransform="uppercase"
              display="block"
              lineHeight={1.4}
            >
              Copy To
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {sourceClassName || '—'}
            </Typography>
          </Box>

          {/* ── Copy From dropdown (class with subjects to copy FROM) ── */}
          <Box>
            <Typography variant="body2" fontWeight={600} mb={0.75}>
              Copy From *
            </Typography>

            {isFilteringClasses ? (
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            ) : filterError ? (
              <Alert
                severity="error"
                action={
                  <Button size="small" startIcon={<Refresh />} onClick={runClassFilter}>
                    Retry
                  </Button>
                }
              >
                Failed to load eligible classes.
              </Alert>
            ) : eligibleClasses.length === 0 ? (
              <Alert severity="info">
                No other classes have subject allocations configured yet.
              </Alert>
            ) : (
              <Autocomplete
                size="small"
                options={eligibleClasses}
                getOptionLabel={(o) => o.name}
                value={copyFromClass}
                onChange={(_, v) => {
                  setCopyFromClass(v);
                  // Reset subject selection when source class changes
                  setSelectedSubjectIds([]);
                  setSubjectSearch('');
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select class to copy from" />
                )}
                noOptionsText="No eligible classes found"
              />
            )}
          </Box>

          <Divider />

          {/* ── Subjects to Copy ── */}
          <Box>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              Subjects to Copy
            </Typography>

            <RadioGroup
              row
              value={selectionMode}
              onChange={(e) => handleModeChange(e.target.value as 'ALL' | 'SPECIFIC')}
            >
              <FormControlLabel
                value="ALL"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Copy All Subjects</Typography>}
              />
              <FormControlLabel
                value="SPECIFIC"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Select Specific Subjects</Typography>}
              />
            </RadioGroup>

            {selectionMode === 'SPECIFIC' && (
              <Box mt={1}>
                {isSubjectsLoading ? (
                  <Stack spacing={1}>
                    {[0, 1, 2].map((i) => (
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        height={36}
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                ) : isSubjectsError ? (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" startIcon={<Refresh />} onClick={() => retrySubjects()}>
                        Retry
                      </Button>
                    }
                  >
                    Failed to load subjects.
                  </Alert>
                ) : allSubjects.length === 0 ? (
                  <Alert severity="info">No subjects configured for this class.</Alert>
                ) : (
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Search bar */}
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Search fontSize="small" color="action" />
                      <InputBase
                        placeholder="Search subjects..."
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        sx={{ fontSize: '0.8125rem', flex: 1 }}
                      />
                    </Box>

                    {/* Select All row */}
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.hover',
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
                          <Typography variant="caption" fontWeight={700}>
                            Select All ({filteredSubjects.length})
                          </Typography>
                        }
                      />
                      {selectedSubjectIds.length > 0 && (
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          {selectedSubjectIds.length} selected
                        </Typography>
                      )}
                    </Box>

                    {/* Subject list */}
                    <Box sx={{ maxHeight: 180, overflowY: 'auto' }}>
                      {filteredSubjects.length === 0 ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ px: 2, py: 1.5, display: 'block' }}
                        >
                          No subjects match your search.
                        </Typography>
                      ) : (
                        filteredSubjects.map((s) => (
                          <Box
                            key={s.id}
                            sx={{
                              px: 1,
                              py: 0.25,
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <FormControlLabel
                              sx={{ m: 0, flex: 1 }}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={selectedSubjectIds.includes(s.id)}
                                  onChange={() => handleToggleSubject(s.id)}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" lineHeight={1.2}>
                                    {s.name}
                                  </Typography>
                                  {s.code && (
                                    <Typography variant="caption" color="text.secondary">
                                      {s.code}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Divider />

          {/* ── Copy Options + Conflict Strategy ── */}
          <Grid container spacing={2}>
            {/* Copy Options */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" fontWeight={600} mb={0.75}>
                Copy Options
              </Typography>
              <Stack spacing={0.25}>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      size="small"
                      checked={includeCurriculumDetails}
                      onChange={(e) => setIncludeCurriculumDetails(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Curriculum Specification</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Goals, prerequisites &amp; descriptions
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      size="small"
                      checked={includeDocuments}
                      onChange={(e) => setIncludeDocuments(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Attached Documents</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Reference files &amp; links
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      size="small"
                      checked={includeTeachers}
                      onChange={(e) => setIncludeTeachers(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Teacher Assignments</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Primary &amp; secondary teachers
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Grid>

            {/* Conflict Strategy */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" fontWeight={600} mb={0.75}>
                If Subject Exists in Target
              </Typography>
              <RadioGroup
                value={conflictStrategy}
                onChange={(e) => setConflictStrategy(e.target.value as 'SKIP' | 'OVERWRITE')}
              >
                <FormControlLabel
                  value="SKIP"
                  control={<Radio size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Skip Existing{' '}
                        <Typography component="span" variant="caption" color="primary.main">
                          (Recommended)
                        </Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Preserve current target settings
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="OVERWRITE"
                  control={<Radio size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Overwrite Existing
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Replace with source settings
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Grid>
          </Grid>

          {/* ── Info Banner ── */}
          <Alert severity="warning" sx={{ py: 0.75 }}>
            <Typography variant="caption">
              Copied allocations will be created in <strong>Draft</strong> status so you can review
              them before publishing.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          size="small"
          variant="outlined"
          color="inherit"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading}
          disabled={!canSubmit}
          variant="contained"
          size="small"
          startIcon={<ContentCopy />}
          onClick={handleSubmit}
        >
          Copy to Class
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SubjectCopyDialog);
