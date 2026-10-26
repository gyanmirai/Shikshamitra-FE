'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizabaleTable';
import { HrAuditValueView } from 'src/screens/hr/components/HrAuditValueView';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Drawer,
  Divider,
  Collapse,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  toHrAuditLabel,
  formatHrAuditText,
  formatHrAuditActor,
  parseHrAuditContext,
  getHrAuditValueText,
  formatHrAuditDateTime,
} from 'src/utils/hr-audit-format';

import { DrawerHeader } from './HRPolicySharedUI';
import { toLabel } from '../hr-policy-workspace-utils';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

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
  const changedFields = (event.changedFields || []).filter(
    (field: any) => String(field.oldValue ?? '').trim() !== String(field.newValue ?? '').trim()
  );
  const hasTable = changedFields.length > 0;
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
                <IconButton
                  size="small"
                  aria-label={`${expanded ? 'Hide' : 'Show'} changes for ${formatHrAuditText(event.summary)}`}
                  aria-expanded={expanded}
                  onClick={() => setExpanded(!expanded)}
                >
                  <Iconify
                    icon={
                      expanded ? 'fluent:chevron-up-12-filled' : 'fluent:chevron-down-12-filled'
                    }
                    width={14}
                    height={14}
                    sx={{ color: 'text.secondary' }}
                  />
                </IconButton>
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
                  <CustomizableTable
                    tableId={`hr-audit-changes-${event.id || index}`}
                    tableTitle="Audit changes"
                    variant="embedded"
                    showColumns
                    showExport
                    showFullScreen
                    exportScope="all"
                    isSearch={false}
                    isFilter={false}
                    isPagination={changedFields.length > 8}
                    defaultRowsPerPage={8}
                    rowsPerPageOptions={[8, 25, 50]}
                    data={changedFields.map((field: any) => ({ ...field, id: field.field }))}
                    columns={[
                      {
                        id: 'field',
                        label: 'Field',
                        minWidth: 130,
                        render: (value) => toHrAuditLabel(value),
                        filterValue: (value) => toHrAuditLabel(String(value)),
                        sortValue: (value) => toHrAuditLabel(String(value)),
                        exportValue: (value) => toHrAuditLabel(String(value)),
                      },
                      ...['oldValue', 'newValue'].map((id) => ({
                        id,
                        label: id === 'oldValue' ? 'Before' : 'After',
                        minWidth: 180,
                        filterValue: (value: unknown, row: any) =>
                          getHrAuditValueText(value, row.field),
                        searchValue: (value: unknown, row: any) =>
                          getHrAuditValueText(value, row.field),
                        sortValue: (value: unknown, row: any) =>
                          getHrAuditValueText(value, row.field),
                        exportValue: (value: unknown, row: any) =>
                          getHrAuditValueText(value, row.field),
                        render: (value: unknown, row: any) => (
                          <AuditTableValue value={value} field={row.field} />
                        ),
                      })),
                    ]}
                  />
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
              {auditSummary.lastModificationTime ? (
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
              ) : null}
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

function AuditTableValue({ value, field }: { value: unknown; field: string }) {
  const [open, setOpen] = React.useState(false);
  let count = 0;
  if (field === 'holidays') {
    try {
      const holidays = typeof value === 'string' ? JSON.parse(value) : value;
      count = Array.isArray(holidays) ? holidays.length : 0;
    } catch {
      count = 0;
    }
  }
  if (!count) return <HrAuditValueView value={value} sourceKey={field} dense maxDepth={3} />;
  return (
    <Stack alignItems="flex-start">
      <Button size="small" onClick={() => setOpen((current) => !current)}>
        {open ? 'Hide holidays' : `Show ${count}${count === 1 ? ' holiday' : ' holidays'}`}
      </Button>
      {open && <HrAuditValueView value={value} sourceKey={field} dense maxDepth={3} />}
    </Stack>
  );
}
