'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
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
  InputAdornment,
} from '@mui/material';

import {
  ROLE_OPTIONS,
  EMPTY_FILTERS,
  SOURCE_OPTIONS,
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
    f.source,
    f.entityType,
    f.changedByRole,
    f.hasDiff,
    f.reasonAvailable,
    f.approvalStatus,
    f.dateRange,
    f.entityId,
  ].filter(Boolean).length;

const withoutDeprecatedRiskFilter = (filters: AuditFilterState): AuditFilterState => {
  const next = { ...EMPTY_FILTERS, ...filters } as AuditFilterState & { riskLevel?: string };
  delete next.riskLevel;
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

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.customShadows?.card || '0px 2px 12px rgba(0,0,0,0.03)',
        backgroundColor: 'background.paper',
      }}
    >
      <Grid container spacing={1.5} alignItems="center">
        {/* Search */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            inputRef={searchRef}
            fullWidth
            size="small"
            placeholder="Search by action, user, reason, entity, IP, or field..."
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
              ) : (
                <InputAdornment position="end">
                  <Chip label="/" size="small" sx={{ height: 18, fontSize: 10 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Action */}
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Action</InputLabel>
            <Select
              label="Action"
              value={filters.action}
              onChange={(e) => set('action', e.target.value)}
            >
              {ACTION_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* More Filters + Reset */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack
            direction="row"
            gap={1}
            justifyContent="flex-end"
            alignItems="center"
            flexWrap="wrap"
          >
            <Button
              size="small"
              variant={advancedCount > 0 ? 'contained' : 'outlined'}
              color={advancedCount > 0 ? 'primary' : 'inherit'}
              onClick={moreDialog.onTrue}
              startIcon={<Iconify icon="mdi:filter-variant" width={16} />}
              sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              More Filters
              {advancedCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: 'common.white',
                    color: 'primary.main',
                    fontSize: 10,
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
              startIcon={<Iconify icon="mdi:refresh" width={16} />}
              sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              Reset
            </Button>

            {typeof totalCount === 'number' && (
              <Label
                variant="outlined"
                color="default"
                startIcon={<Iconify icon="mdi:history" width={14} />}
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
        <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
          {filters.search && (
            <Chip
              size="small"
              label={`Search: "${filters.search}"`}
              onDelete={() => set('search', '')}
            />
          )}
          {filters.action && (
            <Chip
              size="small"
              label={`Action: ${
                CALENDAR_AUDIT_ACTION_LABELS[Number(filters.action) as CalendarAuditAction]
              }`}
              onDelete={() => set('action', '')}
            />
          )}
        </Stack>
      )}

      {/* ─── More Filters Drawer ─────────────────────────────────────── */}
      <CustomDialog
        open={moreDialog.value}
        handleClose={moreDialog.onFalse}
        title="Advanced Filters"
        maxWidth="sm"
        hasForm={false}
      >
        <DialogScrollContent>
          <Grid container spacing={2}>
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
                <InputLabel>Source</InputLabel>
                <Select
                  label="Source"
                  value={filters.source}
                  onChange={(e) => set('source', e.target.value)}
                >
                  {SOURCE_OPTIONS.map((opt) => (
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Entity ID"
                value={filters.entityId}
                onChange={(e) => set('entityId', e.target.value)}
                placeholder="Paste exact entity id"
              />
            </Grid>
          </Grid>

          <Stack direction="row" gap={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              size="small"
              variant="text"
              color="error"
              onClick={() =>
                onChange({
                  ...filters,
                  source: '',
                  entityType: '',
                  entityId: '',
                  changedByRole: '',
                  hasDiff: '',
                  reasonAvailable: '',
                  approvalStatus: '',
                  dateRange: '',
                  fromDate: undefined,
                  toDate: undefined,
                })
              }
            >
              Clear Advanced
            </Button>
            <Button size="small" variant="contained" onClick={moreDialog.onFalse}>
              Apply
            </Button>
          </Stack>
        </DialogScrollContent>
      </CustomDialog>

      {/* ─── Saved Filters Dialog ────────────────────────────────────── */}
      <CustomDialog
        open={savedDialog.value}
        handleClose={savedDialog.onFalse}
        title="Saved Filters"
        maxWidth="xs"
        hasForm={false}
      >
        <DialogScrollContent>
          <Stack spacing={1}>
            {savedFiltersForDisplay.map((sf) => (
              <Paper
                key={sf.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    {sf.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {Object.entries(sf.filters)
                      .filter(([key, value]) => key !== 'riskLevel' && !!value)
                      .slice(0, 3)
                      .map(([k]) => k)
                      .join(', ')}
                  </Typography>
                </Box>
                <Stack direction="row" gap={0.5}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      onChange(withoutDeprecatedRiskFilter(sf.filters));
                      savedDialog.onFalse();
                    }}
                  >
                    <Iconify icon="mdi:check" width={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setSavedFilters(savedFilters.filter((s) => s.id !== sf.id))}
                  >
                    <Iconify icon="mdi:delete-outline" width={16} />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
            {savedFiltersForDisplay.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Iconify icon="mdi:bookmark-off-outline" width={32} color="text.disabled" />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  No saved filters yet
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:content-save-plus" width={16} />}
              disabled={!hasAnyFilter}
              onClick={() => {
                const name = window.prompt('Enter a name for this filter:');
                if (!name) return;
                setSavedFilters([
                  ...savedFilters,
                  {
                    id: `sf-${Date.now()}`,
                    name,
                    filters: { ...filters },
                  },
                ]);
              }}
            >
              Save Current Filters
            </Button>
          </Stack>
        </DialogScrollContent>
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
