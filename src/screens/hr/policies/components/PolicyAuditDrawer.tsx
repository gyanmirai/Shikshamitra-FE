'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { HrAuditValueView } from 'src/screens/hr/components/HrAuditValueView';
import {
  toHrAuditLabel,
  formatHrAuditText,
  formatHrAuditActor,
  parseHrAuditContext,
  formatHrAuditDateTime,
} from 'src/utils/hr-audit-format';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Table,
  Drawer,
  Button,
  Divider,
  Collapse,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  LinearProgress,
} from '@mui/material';

import { DrawerHeader } from './HRPolicySharedUI';
import { toLabel } from '../hr-policy-workspace-utils';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- Helpers for compact layout -----------------------------------------------

const getHolidayCount = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.length;
      } catch {
        try {
          const matches = trimmed.match(/"holidayName"\s*:/g);
          return matches ? matches.length : 0;
        } catch {
          return 0;
        }
      }
    }
  }
  return 0;
};

const formatHolidaySummaryCompact = (value: unknown): string => {
  if (!value) return '-';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          const parts: string[] = [];
          if (parsed.totalCount !== undefined) parts.push(`Tot: ${parsed.totalCount}`);
          if (parsed.includedCount !== undefined) parts.push(`Inc: ${parsed.includedCount}`);
          if (parsed.removedCount !== undefined) parts.push(`Rem: ${parsed.removedCount}`);
          if (parsed.centralCount !== undefined) parts.push(`Cen: ${parsed.centralCount}`);
          if (parsed.manualCount !== undefined && parsed.manualCount > 0)
            parts.push(`Man: ${parsed.manualCount}`);
          if (parts.length > 0) return parts.join(' · ');
        }
      } catch {
        // ignore
      }
    }
  }
  return String(value);
};

// --- AuditFieldRow component --------------------------------------------------

function AuditFieldRow({ field }: { field: { field: string; oldValue: any; newValue: any } }) {
  const [expandedOld, setExpandedOld] = React.useState(false);
  const [expandedNew, setExpandedNew] = React.useState(false);

  const fieldName = field.field;

  const isHolidays = fieldName === 'holidays';
  const isHolidaySummary = fieldName === 'holidaySummary';

  const renderValueCell = (
    val: any,
    expanded: boolean,
    setExpanded: (v: boolean) => void,
    bgType: 'old' | 'new'
  ) => {
    const hasVal = val !== undefined && val !== null && val !== '';

    if (!hasVal) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>
          -
        </Typography>
      );
    }

    if (isHolidaySummary) {
      const compactText = formatHolidaySummaryCompact(val);
      return (
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.825rem',
            color: 'text.primary',
            wordBreak: 'break-word',
          }}
        >
          {compactText}
        </Typography>
      );
    }

    if (isHolidays) {
      const count = getHolidayCount(val);
      if (count === 0) {
        return (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>
            -
          </Typography>
        );
      }

      return (
        <Stack spacing={0.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
          {!expanded ? (
            <Button
              size="small"
              variant="text"
              color={bgType === 'old' ? 'inherit' : 'primary'}
              onClick={() => setExpanded(true)}
              startIcon={<Iconify icon="fluent:chevron-right-12-filled" width={10} height={10} />}
              sx={{
                textTransform: 'none',
                py: 0.1,
                px: 0.5,
                fontSize: '0.68rem',
                fontWeight: 600,
                borderRadius: 0.5,
                height: 18,
                minWidth: 'auto',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                },
              }}
            >
              Show {count} holiday{count > 1 ? 's' : ''}
            </Button>
          ) : (
            <Stack spacing={0.5} sx={{ width: 1, minWidth: 0 }}>
              <Button
                size="small"
                variant="text"
                color="inherit"
                onClick={() => setExpanded(false)}
                startIcon={<Iconify icon="fluent:chevron-down-12-filled" width={10} height={10} />}
                sx={{
                  textTransform: 'none',
                  py: 0.1,
                  px: 0.5,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  borderRadius: 0.5,
                  height: 18,
                  minWidth: 'auto',
                  alignSelf: 'flex-start',
                }}
              >
                Hide
              </Button>
              <Collapse in={expanded} sx={{ width: 1 }}>
                <HrAuditValueView value={val} sourceKey={fieldName} dense maxDepth={3} />
              </Collapse>
            </Stack>
          )}
        </Stack>
      );
    }

    // Default formatting
    return (
      <Box sx={{ fontSize: '0.825rem', color: 'text.primary' }}>
        <HrAuditValueView value={val} sourceKey={fieldName} dense maxDepth={3} />
      </Box>
    );
  };

  return (
    <TableRow
      sx={{
        '&:last-child td': { border: 0 },
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <TableCell
        sx={{
          width: '25%',
          fontWeight: 600,
          color: 'text.secondary',
          wordBreak: 'break-word',
          verticalAlign: 'top',
          pt: 1.25,
          pb: 1.25,
          fontSize: '0.825rem',
        }}
      >
        {toHrAuditLabel(fieldName)}
      </TableCell>
      <TableCell
        sx={{
          width: '37.5%',
          color: 'text.primary',
          wordBreak: 'break-word',
          verticalAlign: 'top',
          pt: 1.25,
          pb: 1.25,
        }}
      >
        {renderValueCell(field.oldValue, expandedOld, setExpandedOld, 'old')}
      </TableCell>
      <TableCell
        sx={{
          width: '37.5%',
          color: 'text.primary',
          wordBreak: 'break-word',
          verticalAlign: 'top',
          pt: 1.25,
          pb: 1.25,
        }}
      >
        {renderValueCell(field.newValue, expandedNew, setExpandedNew, 'new')}
      </TableCell>
    </TableRow>
  );
}

// --- AuditTrailEventCard component --------------------------------------------

function AuditTrailEventCard({
  event,
  index,
  totalEvents,
  actionIcon,
  actionBgColor,
  actionTextColor,
}: {
  event: any;
  index: number;
  totalEvents: number;
  actionIcon: string;
  actionBgColor: any;
  actionTextColor: any;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const hasTable = event.changedFields?.length > 0;
  const context = parseHrAuditContext(event.contextJson);

  return (
    <Stack direction="row" spacing={1.5} sx={{ position: 'relative' }}>
      {/* Timeline line and icon */}
      <Stack alignItems="center" sx={{ pt: 1 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: actionBgColor,
            color: actionTextColor,
            display: 'grid',
            placeItems: 'center',
            boxShadow: (theme) => `0 0 0 4px ${theme.palette.background.paper}`,
            zIndex: 1,
          }}
        >
          <Iconify icon={actionIcon} width={16} height={16} />
        </Box>
        {index < totalEvents - 1 ? (
          <Box sx={{ width: 2, flex: 1, minHeight: 24, bgcolor: 'divider', my: 0.5 }} />
        ) : null}
      </Stack>

      {/* Event Card */}
      <Paper
        variant="outlined"
        onClick={hasTable ? () => setExpanded(!expanded) : undefined}
        sx={{
          p: 1.5,
          mb: 1.5,
          flex: 1,
          minWidth: 0,
          cursor: hasTable ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: (theme) =>
              hasTable ? theme.customShadows?.z4 || '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            borderColor: hasTable ? 'primary.light' : 'divider',
          },
          borderRadius: 1.5,
        }}
      >
        <Stack spacing={1}>
          {/* Card Header Row */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Chip
              size="small"
              label={event.actionLabel || toLabel(event.action)}
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.72rem' }}
            />
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {formatHrAuditDateTime(event.occurredAt, event.occurredAtDisplay)}
              </Typography>
              {hasTable ? (
                <Iconify
                  icon={expanded ? 'fluent:chevron-up-12-filled' : 'fluent:chevron-down-12-filled'}
                  width={14}
                  height={14}
                  sx={{ color: 'text.secondary' }}
                />
              ) : null}
            </Stack>
          </Stack>

          <Typography variant="body2" fontWeight={700}>
            {formatHrAuditText(event.summary)}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {formatHrAuditActor(
              event.actorDisplayName || event.actorNameSnapshot || event.actorUserId
            )}
          </Typography>

          {event.reason ? (
            <Typography variant="body2">Reason: {formatHrAuditText(event.reason)}</Typography>
          ) : null}

          {/* Collapsible details (table and context) */}
          {hasTable ? (
            <Collapse in={expanded} onClick={(e) => e.stopPropagation()}>
              <Box sx={{ pt: 1.5 }}>
                {/* The Table of changed fields */}
                <Box
                  sx={{
                    overflowX: 'auto',
                    width: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Table size="small" sx={{ width: 1, tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            bgcolor: 'background.neutral',
                            fontSize: '0.75rem',
                            py: 1,
                            width: '25%',
                          }}
                        >
                          Field
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: 'background.neutral',
                            fontSize: '0.75rem',
                            py: 1,
                            width: '37.5%',
                          }}
                        >
                          Before
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: 'background.neutral',
                            fontSize: '0.75rem',
                            py: 1,
                            width: '37.5%',
                          }}
                        >
                          After
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {event.changedFields.slice(0, 8).map((field: any) => (
                        <AuditFieldRow key={field.field} field={field} />
                      ))}
                    </TableBody>
                  </Table>
                </Box>

                {/* Context metadata (if exists) inside the accordion details */}
                {context ? (
                  <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Event Metadata
                    </Typography>
                    <Stack spacing={0.5}>
                      {Object.entries(context)
                        .slice(0, 6)
                        .map(([key, value]) => (
                          <Box
                            key={key}
                            sx={{
                              p: 0.6,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              bgcolor: 'background.neutral',
                            }}
                          >
                            <HrAuditValueView
                              value={value}
                              label={toHrAuditLabel(key)}
                              sourceKey={key}
                              dense
                            />
                          </Box>
                        ))}
                    </Stack>
                  </Stack>
                ) : null}
              </Box>
            </Collapse>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}

// --- PolicyAuditDrawer ---------------------------------------------------------

export function PolicyAuditDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const { auditTarget, auditSummary, auditEvents, auditLoading, setAuditTarget } = ctx;

  return (
    <Drawer
      anchor="right"
      open={Boolean(auditTarget)}
      onClose={() => setAuditTarget(null)}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 720 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        },
      }}
    >
      {/* Sticky Header Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          position: 'relative',
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 20px 0 rgba(0, 0, 0, 0.4)'
              : '0 4px 20px 0 rgba(145, 158, 171, 0.06)',
        }}
      >
        <DrawerHeader
          title="Audit Trail"
          helpText="Track who changed this policy, what fields were updated, and when each change occurred."
          onClose={() => setAuditTarget(null)}
        />
        <Divider />

        <Stack spacing={1} sx={{ px: 2.5, py: 1.5 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack spacing={0.25} sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {auditTarget?.title || auditSummary?.name || 'Audit Trail'}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {auditTarget?.entityType
                  ? toLabel(auditTarget.entityType)
                  : 'HR audit event timeline'}
              </Typography>
            </Stack>
          </Stack>

          {/* Created/modified summary in a compact horizontal strip */}
          {auditSummary ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 0.5, sm: 2 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              divider={
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'text.disabled',
                    display: { xs: 'none', sm: 'block' },
                  }}
                />
              }
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                Created by{' '}
                <strong>
                  {formatHrAuditActor(
                    auditSummary.createdByName || auditSummary.creatorId,
                    'Unknown user'
                  )}
                </strong>{' '}
                on {formatHrAuditDateTime(auditSummary.creationTime)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                Last edited by{' '}
                <strong>
                  {formatHrAuditActor(
                    auditSummary.lastModifiedByName || auditSummary.lastModifierId,
                    'Unknown user'
                  )}
                </strong>{' '}
                on {formatHrAuditDateTime(auditSummary.lastModificationTime)}
              </Typography>
            </Stack>
          ) : null}
        </Stack>

        {auditLoading ? (
          <LinearProgress
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 1,
              height: 3,
              zIndex: 11,
            }}
          />
        ) : null}
      </Box>

      {/* Scrollable Content Area */}
      <Scrollbar sx={{ flexGrow: 1 }}>
        <Stack spacing={2.5} sx={{ p: 2.5 }}>
          {/* Detailed audit events (from entity audit endpoint) */}
          {(auditEvents?.items || []).length ? (
            <Stack spacing={0}>
              {auditEvents!.items.map((event, index) => {
                let actionIcon = 'fluent:info-24-regular';
                let actionBgColor: any = (theme: any) =>
                  theme.palette.mode === 'dark' ? 'rgba(118, 53, 220, 0.16)' : 'primary.lighter';
                let actionTextColor: any = (theme: any) =>
                  theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark';

                const actionLower = (event.action || '').toLowerCase();
                if (actionLower.includes('create')) {
                  actionIcon = 'fluent:add-circle-24-regular';
                  actionBgColor = (theme: any) =>
                    theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.16)' : 'success.lighter';
                  actionTextColor = (theme: any) =>
                    theme.palette.mode === 'dark' ? 'success.light' : 'success.dark';
                } else if (actionLower.includes('edit') || actionLower.includes('update')) {
                  actionIcon = 'fluent:edit-24-regular';
                  actionBgColor = (theme: any) =>
                    theme.palette.mode === 'dark' ? 'rgba(0, 184, 217, 0.16)' : 'info.lighter';
                  actionTextColor = (theme: any) =>
                    theme.palette.mode === 'dark' ? 'info.light' : 'info.dark';
                } else if (actionLower.includes('archive')) {
                  actionIcon = 'fluent:archive-24-regular';
                  actionBgColor = (theme: any) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 171, 0, 0.16)' : 'warning.lighter';
                  actionTextColor = (theme: any) =>
                    theme.palette.mode === 'dark' ? 'warning.light' : 'warning.dark';
                } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
                  actionIcon = 'fluent:delete-24-regular';
                  actionBgColor = (theme: any) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 72, 66, 0.16)' : 'error.lighter';
                  actionTextColor = (theme: any) =>
                    theme.palette.mode === 'dark' ? 'error.light' : 'error.dark';
                }

                return (
                  <AuditTrailEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    totalEvents={auditEvents!.items.length}
                    actionIcon={actionIcon}
                    actionBgColor={actionBgColor}
                    actionTextColor={actionTextColor}
                  />
                );
              })}
            </Stack>
          ) : auditSummary ? (
            /* Fallback to summary-level events */
            <Stack spacing={1.5}>
              {(auditSummary.events || []).length ? (
                auditSummary.events!.map((event, index) => (
                  <Paper
                    key={`${event.timestamp}-${event.action}-${index}`}
                    variant="outlined"
                    sx={{ p: 1.5 }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={700}>
                        {toLabel(event.action)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatHrAuditDateTime(event.timestamp)} -{' '}
                        {formatHrAuditActor(event.actorName || event.actorId)}
                      </Typography>
                      {event.sourceMethod ? (
                        <Typography variant="caption" color="text.secondary">
                          {formatHrAuditText(event.sourceMethod)}
                        </Typography>
                      ) : null}
                      {event.changedFieldsSummary ? (
                        <Typography variant="body2">
                          {formatHrAuditText(event.changedFieldsSummary)}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Alert severity="info">No detailed audit events found.</Alert>
              )}
            </Stack>
          ) : (
            <Alert severity="info">No detailed audit events found.</Alert>
          )}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
