'use client';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetAuditLogsQuery } from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  Box,
  Tab,
  Paper,
  Stack,
  Alert,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';

import AuditLogsTable from './components/AuditLogsTable';
import AuditExportMenu from './components/AuditExportMenu';
import AuditSmartFilters from './components/AuditSmartFilters';
import AuditTimelineView from './components/AuditTimelineView';
import AuditAnalyticsView from './components/AuditAnalyticsView';
import AuditAISummaryDrawer from './components/AuditAISummaryDrawer';
import AuditLogDetailsDrawer from './components/AuditLogDetailsDrawer';
import { EMPTY_FILTERS, KEYBOARD_SHORTCUTS } from './constants/auditLogs.constants';

import type { AuditLog, AuditView, AuditFilterState } from './types/auditLogs.types';

// ─── View tabs ────────────────────────────────────────────────────────────────

const VIEW_TABS = [
  {
    value: 'table' as AuditView,
    label: 'Table',
    icon: <Iconify icon="mdi:table-large" width={16} />,
  },
  {
    value: 'timeline' as AuditView,
    label: 'Timeline',
    icon: <Iconify icon="mdi:timeline-clock-outline" width={16} />,
  },
  {
    value: 'analytics' as AuditView,
    label: 'Analytics',
    icon: <Iconify icon="mdi:chart-box-outline" width={16} />,
  },
];

// ─── Local filtering logic (client-side on mock + server data) ────────────────

const matchesFilters = (log: AuditLog, filters: AuditFilterState): boolean => {
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = [
      log.actionLabel,
      log.entityName,
      log.entityType,
      log.changedByName,
      log.changedByRole,
      log.reason || '',
      log.metadata?.ipAddress || '',
      log.metadata?.device || '',
      log.metadata?.browser || '',
      ...(log.diff?.map((d) => d.fieldName) || []),
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filters.action && String(log.action) !== filters.action) return false;
  if (filters.source && String(log.source) !== filters.source) return false;
  if (filters.entityType && log.entityType !== filters.entityType) return false;
  if (filters.changedByRole && log.changedByRole !== filters.changedByRole) return false;
  if (filters.hasDiff === 'true' && !log.hasDiff) return false;
  if (filters.hasDiff === 'false' && log.hasDiff) return false;
  if (filters.reasonAvailable === 'true' && !log.reason) return false;
  if (filters.reasonAvailable === 'false' && log.reason) return false;
  if (filters.approvalStatus && String(log.approvalStatus) !== filters.approvalStatus) return false;
  if (filters.entityId && log.entityId !== filters.entityId) return false;
  return true;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CalendarAuditLogs = () => {
  const theme = useTheme();
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permissions
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.View`
  );
  const canExport = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.Export`
  );
  const canRestore = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.Restore`
  );
  const canViewSensitive = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.ViewSensitiveMetadata`
  );
  const canAddNote = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.AddReviewNote`
  );
  const canViewAI = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.ViewAIInsights`
  );
  const canViewAnalytics = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.auditLogs}.ViewAnalytics`
  );

  // State
  const [view, setView] = useState<AuditView>('table');
  const [filters, setFilters] = useState<AuditFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiLog, setAiLog] = useState<AuditLog | null>(null);
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
  const [restoreDialog, setRestoreDialog] = useState<AuditLog | null>(null);
  const [restoreReason, setRestoreReason] = useState('');
  const [restoring, setRestoring] = useState(false);

  // Query
  const { data: logsRaw, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAuditLogsQuery,
    params: {
      ...(filters.action ? { action: Number(filters.action) } : {}),
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
    },
    popupConfig: { error: false },
  });

  const serverLogs: AuditLog[] = useMemo(() => {
    const items = logsRaw?.items ?? [];
    // BE now returns the full rich shape (actionLabel, changedByName/Role, diff, metadata, etc.)
    // directly — the DTO field names line up with AuditLog, so no client-side backfill needed.
    return items as AuditLog[];
  }, [logsRaw]);

  // Apply client-side filters on top of server/mock data
  const filteredLogs = useMemo(
    () => serverLogs.filter((log) => matchesFilters(log, filters)),
    [serverLogs, filters]
  );

  const totalCount = filteredLogs.length;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isTyping) return;
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setAiDrawerOpen(false);
      }
      if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey) {
        setView((v) => (v === 'table' ? 'timeline' : 'table'));
      }
      if ((e.key === 'a' || e.key === 'A') && !e.metaKey && !e.ctrlKey && canViewAI) {
        setAiLog(null);
        setAiDrawerOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canViewAI]);

  const hasActiveFilters = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS),
    [filters]
  );

  // Handlers
  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(0);
  };

  const handleAIExplain = (log: AuditLog) => {
    setAiLog(log);
    setAiDrawerOpen(true);
  };

  const handleAddNote = async (log: AuditLog, note: string) => {
    // Mock: attach the note locally
    const newNote = {
      id: `rn-${Date.now()}`,
      note,
      createdBy: 'You',
      createdAt: new Date().toISOString(),
    };
    setSelectedLog((prev) =>
      prev && prev.id === log.id
        ? { ...prev, reviewNotes: [...(prev.reviewNotes || []), newNote] }
        : prev
    );
  };

  const handleRestore = async () => {
    if (!restoreDialog || !restoreReason.trim()) return;
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      setRestoreDialog(null);
      setRestoreReason('');
      setDrawerOpen(false);
      shikshaMitraToast.success({
        message: 'Previous version restored. A new audit log has been created.',
      });
    }, 1000);
  };

  // Permission gate
  if (!canView) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CustomBreadcrumbs
          heading="Audit Logs"
          description="Track every academic calendar change with full history, impact, and accountability."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
            { name: 'Audit Logs' },
          ]}
        />
        <Alert severity="warning" icon={<Iconify icon="mdi:lock-outline" />}>
          You do not have permission to view audit logs. Contact your administrator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
      {/* Header */}
      <CustomBreadcrumbs
        heading="Audit Logs"
        description="Track every academic calendar change with full history, impact, and accountability."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
          { name: 'Audit Logs' },
        ]}
        action={
          <Stack direction="row" gap={1}>
            {canViewAI && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<Iconify icon="mdi:robot-outline" width={16} />}
                onClick={() => {
                  setAiLog(null);
                  setAiDrawerOpen(true);
                }}
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
              >
                AI Summary
              </Button>
            )}
            {canExport && (
              <LoadingButton
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:download" width={16} />}
                onClick={(e) => setExportAnchor(e.currentTarget)}
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
              >
                Export Report
              </LoadingButton>
            )}
          </Stack>
        }
      />

      {/* Smart filters */}
      <AuditSmartFilters
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(0);
        }}
        onReset={handleResetFilters}
        totalCount={totalCount}
        canManageSavedFilters
      />

      {/* View switcher */}
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Paper sx={{ flex: 1 }}>
          <CustomTabs
            value={view}
            onChange={(_, val) => setView(val as AuditView)}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: '12px' }}
          >
            {VIEW_TABS.filter((t) => (t.value === 'analytics' ? canViewAnalytics : true)).map(
              (tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                />
              )
            )}
          </CustomTabs>
        </Paper>
        <Tooltip
          title={
            <Box sx={{ p: 0.5 }}>
              <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                Keyboard Shortcuts
              </Typography>
              {KEYBOARD_SHORTCUTS.map((s) => (
                <Stack key={s.key} direction="row" justifyContent="space-between" gap={2}>
                  <Typography variant="caption" color="text.secondary">
                    {s.description}
                  </Typography>
                  <kbd
                    style={{
                      fontSize: 10,
                      padding: '1px 5px',
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    }}
                  >
                    {s.key}
                  </kbd>
                </Stack>
              ))}
            </Box>
          }
          arrow
        >
          <IconButton size="small">
            <Iconify icon="mdi:keyboard-outline" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Main content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {view === 'table' && (
          <AuditLogsTable
            logs={filteredLogs}
            loading={isLoading}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(p, r) => {
              setPage(p);
              setRowsPerPage(r);
            }}
            onRowClick={handleRowClick}
            hasActiveFilters={hasActiveFilters}
          />
        )}
        {view === 'timeline' && (
          <AuditTimelineView
            logs={filteredLogs}
            onLogClick={handleRowClick}
            hasActiveFilters={hasActiveFilters}
          />
        )}
        {view === 'analytics' && canViewAnalytics && <AuditAnalyticsView logs={filteredLogs} />}
      </Box>

      {/* Detail Drawer */}
      <AuditLogDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        log={selectedLog}
        loading={false}
        canViewSensitiveMetadata={canViewSensitive}
        canRestore={canRestore}
        canAddReviewNote={canAddNote}
        canViewAIInsights={canViewAI}
        onRestore={(log) => {
          setRestoreDialog(log);
        }}
        onAddNote={handleAddNote}
        onAIExplain={handleAIExplain}
      />

      {/* AI Summary / Explain Drawer */}
      <AuditAISummaryDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        log={aiLog}
      />

      {/* Export Menu */}
      <AuditExportMenu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
      />

      {/* Restore Confirmation Dialog */}
      <CustomDialog
        open={Boolean(restoreDialog)}
        handleClose={() => setRestoreDialog(null)}
        title="Restore Previous Version?"
        maxWidth="xs"
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <Alert severity="warning" icon={<Iconify icon="mdi:undo-variant" />}>
              This will revert the selected record to its previous state. A new audit log will be
              created for this restore action.
            </Alert>
            {restoreDialog && (
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Restoring
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {restoreDialog.entityName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {restoreDialog.actionLabel}
                </Typography>
              </Paper>
            )}
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Reason for restore *"
              placeholder="Explain why this restore is necessary..."
              value={restoreReason}
              onChange={(e) => setRestoreReason(e.target.value)}
              error={restoreReason.length > 0 && restoreReason.length < 10}
              helperText={
                restoreReason.length > 0 && restoreReason.length < 10
                  ? 'Reason must be at least 10 characters'
                  : 'This reason will be saved in the audit trail.'
              }
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setRestoreDialog(null)}
            disabled={restoring}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            size="small"
            color="warning"
            loading={restoring}
            disabled={restoreReason.trim().length < 10}
            onClick={handleRestore}
            startIcon={<Iconify icon="mdi:undo-variant" width={16} />}
          >
            Restore Previous Version
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default CalendarAuditLogs;
