'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useRef, useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CalendarAuditAction, CALENDAR_AUDIT_ACTION_LABELS } from 'src/enums/academic-calendar';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Paper,
  Select,
  Button,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  IconButton,
  Typography,
  FormControl,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import {
  ROLE_OPTIONS,
  EMPTY_FILTERS,
  REASON_OPTIONS,
  APPROVAL_OPTIONS,
  HAS_DIFF_OPTIONS,
  DATE_RANGE_OPTIONS,
  ENTITY_TYPE_OPTIONS,
  DEFAULT_SAVED_FILTERS,
} from '../constants/auditLogs.constants';

import type { AuditFilterState, SavedAuditFilter } from '../types/auditLogs.types';

interface Props {
  filters: AuditFilterState;
  onChange: (next: AuditFilterState) => void;
  onReset: () => void;
  totalCount?: number;
  canManageSavedFilters?: boolean;
}

const ACTION_OPTIONS = [
  { label: 'All Actions', value: '' },
  ...Object.entries(CALENDAR_AUDIT_ACTION_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

/** Counts how many filters are currently active (for the "More Filters" badge). */
const countActiveAdvanced = (f: AuditFilterState) =>
  [
    f.entityType,
    f.changedByRole,
    f.hasDiff,
    f.reasonAvailable,
    f.approvalStatus,
    f.dateRange,
    f.entityId,
  ].filter(Boolean).length;

const withoutDeprecatedRiskFilter = (filters: AuditFilterState): AuditFilterState => {
  const next = { ...EMPTY_FILTERS, ...filters } as AuditFilterState & { riskLevel?: string; source?: string };
  delete next.riskLevel;
  delete next.source;
  return next;
};

const AuditSmartFilters = ({
  filters,
  onChange,
  onReset,
  totalCount,
  canManageSavedFilters = true,
}: Props) => {
  const theme = useTheme();
  const moreDialog = useBoolean(false);
  const savedDialog = useBoolean(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [savedFilters, setSavedFilters] = useSavedFilters();
  const [newPresetName, setNewPresetName] = useState('');
  const [presetError, setPresetError] = useState('');

  const savedFiltersForDisplay = savedFilters.filter((sf) => sf.id !== 'preset-critical-month');

  // Keyboard shortcut: focus search on "/"
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const set = <K extends keyof AuditFilterState>(key: K, value: AuditFilterState[K]) =>
    onChange({ ...filters, [key]: value });

  const advancedCount = countActiveAdvanced(filters);
  const hasAnyFilter = advancedCount > 0 || !!filters.search || !!filters.action;

  const handleClearAdvanced = () => {
    onChange({
      ...filters,
      entityType: '',
      entityId: '',
      changedByRole: '',
      hasDiff: '',
      reasonAvailable: '',
      approvalStatus: '',
      dateRange: '',
      fromDate: undefined,
      toDate: undefined,
    });
    shikshaMitraToast.info({ message: 'Advanced filters cleared' });
  };

  const handleSavePreset = () => {
    const trimmed = newPresetName.trim();
    if (!trimmed) {
      setPresetError('Please enter a preset name');
      return;
    }
    if (savedFilters.some((sf) => sf.name.toLowerCase() === trimmed.toLowerCase())) {
      setPresetError('A preset with this name already exists');
      return;
    }

    const newPreset: SavedAuditFilter = {
      id: `sf-${Date.now()}`,
      name: trimmed,
      filters: { ...filters },
    };

    setSavedFilters([...savedFilters, newPreset]);
    setNewPresetName('');
    setPresetError('');
    shikshaMitraToast.success({ message: `Preset "${trimmed}" saved successfully` });
  };

  const handleDeletePreset = (id: string, name: string) => {
    setSavedFilters(savedFilters.filter((s) => s.id !== id));
    shikshaMitraToast.success({ message: `Preset "${name}" removed` });
  };

  const handleApplyPreset = (sf: SavedAuditFilter) => {
    onChange(withoutDeprecatedRiskFilter(sf.filters));
    savedDialog.onFalse();
    shikshaMitraToast.success({ message: `Applied "${sf.name}" filter preset` });
  };

  // Helper labels for active chips
  const getEntityTypeLabel = (val: string) =>
    ENTITY_TYPE_OPTIONS.find((opt) => opt.value === val)?.label || val;
  const getRoleLabel = (val: string) =>
    ROLE_OPTIONS.find((opt) => opt.value === val)?.label || val;
  const getDateRangeLabel = (val: string) =>
    DATE_RANGE_OPTIONS.find((opt) => opt.value === val)?.label || val;
  const getApprovalLabel = (val: string) =>
    APPROVAL_OPTIONS.find((opt) => opt.value === val)?.label || val;

  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.customShadows?.card || '0px 2px 12px rgba(0,0,0,0.03)',
        backgroundColor: 'background.paper',
      }}
    >
      <Grid container spacing={1.25} alignItems="center">
        {/* Search */}
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            inputRef={searchRef}
            fullWidth
            size="small"
            placeholder="Search audit logs... (Press / to focus)"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mdi:magnify" width={18} color="text.secondary" />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => set('search', '')}>
                    <Iconify icon="mdi:close" width={16} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Grid>

        {/* Action */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
            <InputLabel shrink>Action</InputLabel>
            <Select
              label="Action"
              displayEmpty
              value={filters.action}
              onChange={(e) => set('action', e.target.value)}
              renderValue={(selected) => {
                if (!selected) {
                  return 'All Actions';
                }

                return CALENDAR_AUDIT_ACTION_LABELS[Number(selected) as CalendarAuditAction];
              }}
            >
              {ACTION_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* More Filters + Saved + Reset */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack
            direction="row"
            gap={1}
            justifyContent="flex-end"
            alignItems="center"
            flexWrap="wrap"
            sx={{
              '& .MuiButton-root': {
                whiteSpace: 'nowrap',
              },
            }}
          >
            <Button
              size="small"
              variant={advancedCount > 0 ? 'contained' : 'outlined'}
              color={advancedCount > 0 ? 'primary' : 'inherit'}
              onClick={moreDialog.onTrue}
              startIcon={<Iconify icon={GlobalIcons.applyFilter} width={16} />}
              sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              More Filters
              {advancedCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 0.75,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: 'common.white',
                    color: 'primary.main',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 0.5,
                  }}
                >
                  {advancedCount}
                </Box>
              )}
            </Button>

            {canManageSavedFilters && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={savedDialog.onTrue}
                startIcon={<Iconify icon="mdi:bookmark-outline" width={16} />}
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
              >
                Saved
              </Button>
            )}

            <Button
              size="small"
              variant="text"
              color="error"
              disabled={!hasAnyFilter}
              onClick={onReset}
              startIcon={<Iconify icon={GlobalIcons.resetIcon} width={16} />}
              sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              Reset
            </Button>

            {typeof totalCount === 'number' && (
              <Label
                variant="outlined"
                color="default"
                startIcon={<Iconify icon={GlobalIcons.history} width={14} />}
                sx={{ py: 1.5, px: 1.5 }}
              >
                {totalCount} entries
              </Label>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Active filter chips */}
      {hasAnyFilter && (
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
          {filters.search && (
            <Chip
              size="small"
              variant="soft"
              color="primary"
              label={`Search: "${filters.search}"`}
              onDelete={() => set('search', '')}
            />
          )}
          {filters.action && (
            <Chip
              size="small"
              variant="soft"
              color="primary"
              label={`Action: ${CALENDAR_AUDIT_ACTION_LABELS[Number(filters.action) as CalendarAuditAction] || filters.action}`}
              onDelete={() => set('action', '')}
            />
          )}
          {filters.dateRange && (
            <Chip
              size="small"
              variant="soft"
              color="info"
              label={`Date: ${getDateRangeLabel(filters.dateRange)}`}
              onDelete={() => set('dateRange', '')}
            />
          )}
          {filters.entityType && (
            <Chip
              size="small"
              variant="soft"
              color="info"
              label={`Entity: ${getEntityTypeLabel(filters.entityType)}`}
              onDelete={() => set('entityType', '')}
            />
          )}
          {filters.changedByRole && (
            <Chip
              size="small"
              variant="soft"
              color="info"
              label={`Role: ${getRoleLabel(filters.changedByRole)}`}
              onDelete={() => set('changedByRole', '')}
            />
          )}
          {filters.hasDiff && (
            <Chip
              size="small"
              variant="soft"
              color="info"
              label={`Diff: ${filters.hasDiff === 'true' ? 'Has Diff' : 'No Diff'}`}
              onDelete={() => set('hasDiff', '')}
            />
          )}
          {filters.reasonAvailable && (
            <Chip
              size="small"
              variant="soft"
              color="info"
              label={`Reason: ${filters.reasonAvailable === 'true' ? 'Available' : 'Missing'}`}
              onDelete={() => set('reasonAvailable', '')}
            />
          )}
          {filters.approvalStatus && (
            <Chip
              size="small"
              variant="soft"
              color="info"
              label={`Approval: ${getApprovalLabel(filters.approvalStatus)}`}
              onDelete={() => set('approvalStatus', '')}
            />
          )}
          {filters.entityId && (
            <Chip
              size="small"
              variant="soft"
              color="info"
              label={`Entity ID: ${filters.entityId}`}
              onDelete={() => set('entityId', '')}
            />
          )}
        </Stack>
      )}

      {/* ─── Advanced Filters Dialog ─────────────────────────────────── */}
      <CustomDialog
        open={moreDialog.value}
        handleClose={moreDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Advanced Filters
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Refine audit trail logs by date range, entity type, user role, diff changes, and approval status."
            >
              <Iconify
                icon={GlobalIcons.info}
                sx={{ cursor: 'pointer' }}
                color="info.main"
                width={18}
                height={18}
              />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  label="Date Range"
                  value={filters.dateRange}
                  onChange={(e) =>
                    set('dateRange', e.target.value as AuditFilterState['dateRange'])
                  }
                >
                  {DATE_RANGE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Entity Type</InputLabel>
                <Select
                  label="Entity Type"
                  value={filters.entityType}
                  onChange={(e) => set('entityType', e.target.value)}
                >
                  {ENTITY_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Changed By Role</InputLabel>
                <Select
                  label="Changed By Role"
                  value={filters.changedByRole}
                  onChange={(e) => set('changedByRole', e.target.value)}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Has Diff</InputLabel>
                <Select
                  label="Has Diff"
                  value={filters.hasDiff}
                  onChange={(e) => set('hasDiff', e.target.value)}
                >
                  {HAS_DIFF_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Reason</InputLabel>
                <Select
                  label="Reason"
                  value={filters.reasonAvailable}
                  onChange={(e) => set('reasonAvailable', e.target.value)}
                >
                  {REASON_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Approval Status</InputLabel>
                <Select
                  label="Approval Status"
                  value={filters.approvalStatus}
                  onChange={(e) => set('approvalStatus', e.target.value)}
                >
                  {APPROVAL_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Entity ID"
                value={filters.entityId}
                onChange={(e) => set('entityId', e.target.value)}
                placeholder="Paste exact entity ID"
              />
            </Grid>
          </Grid>
        </DialogScrollContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.resetFilter} />}
            onClick={handleClearAdvanced}
            disabled={advancedCount === 0}
          >
            Clear Filters
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={moreDialog.onFalse}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.applyFilter} />}
              onClick={moreDialog.onFalse}
            >
              Apply Filters
            </Button>
          </Stack>
        </DialogActions>
      </CustomDialog>

      {/* ─── Saved Filters Dialog ────────────────────────────────────── */}
      <CustomDialog
        open={savedDialog.value}
        handleClose={savedDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Saved Filters
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Save and quickly apply frequently used audit log search and filter presets."
            >
              <Iconify
                icon={GlobalIcons.info}
                sx={{ cursor: 'pointer' }}
                color="info.main"
                width={18}
                height={18}
              />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {/* Save current filters card */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                borderColor: (t) => alpha(t.palette.primary.main, 0.2),
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <Iconify icon="mdi:bookmark-plus-outline" width={18} color="primary.main" />
                Save Current Filters as Preset
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                <TextField
                  fullWidth
                  size="small"
                  label="Preset Name"
                  placeholder="e.g. Published Calendar Updates"
                  value={newPresetName}
                  onChange={(e) => {
                    setNewPresetName(e.target.value);
                    if (presetError) setPresetError('');
                  }}
                  error={Boolean(presetError)}
                  helperText={presetError}
                />
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.submit} />}
                  disabled={!hasAnyFilter || !newPresetName.trim()}
                  onClick={handleSavePreset}
                  sx={{ whiteSpace: 'nowrap', minWidth: 120, height: 40 }}
                >
                  Save Preset
                </Button>
              </Stack>

              {!hasAnyFilter && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Apply search keywords or filters to save them as a reusable preset.
                </Typography>
              )}
            </Paper>

            <Divider />

            {/* Presets list */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <Iconify icon="mdi:bookmark-multiple-outline" width={18} />
                Saved Presets ({savedFiltersForDisplay.length})
              </Typography>

              <Stack spacing={1.25}>
                {savedFiltersForDisplay.map((sf) => {
                  const activeFilterEntries = Object.entries(sf.filters).filter(
                    ([k, v]) => k !== 'riskLevel' && k !== 'source' && !!v
                  );

                  return (
                    <Paper
                      key={sf.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" alignItems="center" gap={0.75}>
                          <Iconify icon="mdi:bookmark-check" width={16} color="primary.main" />
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {sf.name}
                          </Typography>
                        </Stack>

                        <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ mt: 0.75 }}>
                          {activeFilterEntries.slice(0, 4).map(([key, val]) => (
                            <Chip
                              key={key}
                              size="small"
                              label={`${key}: ${val}`}
                              sx={{ fontSize: 10, height: 18 }}
                            />
                          ))}
                          {activeFilterEntries.length > 4 && (
                            <Chip
                              size="small"
                              label={`+${activeFilterEntries.length - 4} more`}
                              sx={{ fontSize: 10, height: 18 }}
                            />
                          )}
                          {activeFilterEntries.length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              No filter criteria set
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<Iconify icon={GlobalIcons.tick} width={14} />}
                          onClick={() => handleApplyPreset(sf)}
                          sx={{ textTransform: 'none', px: 1.25 }}
                        >
                          Apply
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePreset(sf.id, sf.name)}
                          title="Delete Preset"
                        >
                          <Iconify icon={GlobalIcons.delete} width={16} />
                        </IconButton>
                      </Stack>
                    </Paper>
                  );
                })}

                {savedFiltersForDisplay.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Iconify
                      icon="mdi:bookmark-off-outline"
                      width={36}
                      color="text.disabled"
                    />
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mt={1}>
                      No saved presets yet
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Save your current filter configuration above for quick one-click access.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogScrollContent>

        <DialogActions sx={{ p: 2, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={savedDialog.onFalse}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </Paper>
  );
};

// ─── Local hook for persisted saved filters ───────────────────────────────────

const STORAGE_KEY = 'audit-saved-filters';

const useSavedFilters = (): [SavedAuditFilter[], (next: SavedAuditFilter[]) => void] => {
  const [saved, setSaved] = useStateWithStorage<SavedAuditFilter[]>(
    STORAGE_KEY,
    DEFAULT_SAVED_FILTERS
  );
  return [saved, setSaved];
};

/** Tiny wrapper to persist a value in localStorage. */
const useStateWithStorage = <T,>(key: string, fallback: T): [T, (next: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });
  const update = (next: T) => {
    setValue(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  };
  return [value, update];
};

export default AuditSmartFilters;
