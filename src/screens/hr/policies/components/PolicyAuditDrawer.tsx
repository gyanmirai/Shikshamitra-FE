'use client';

import React from 'react';
import {
  formatHrAuditValue,
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
  Divider,
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

// ─── PolicyAuditDrawer ─────────────────────────────────────────────────────────

export function PolicyAuditDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const { auditTarget, auditSummary, auditEvents, auditLoading, setAuditTarget } = ctx;

  return (
    <Drawer
      anchor="right"
      open={Boolean(auditTarget)}
      onClose={() => setAuditTarget(null)}
      PaperProps={{ sx: { width: { xs: '100%', md: 520 } } }}
    >
      <DrawerHeader
        title="Audit Trail"
        helpText="Track who changed this policy, what fields were updated, and when each change occurred."
        onClose={() => setAuditTarget(null)}
      />
      <Divider />
      <Stack spacing={2} sx={{ p: 2.5 }}>
        {auditLoading ? <LinearProgress /> : null}

        {/* Header */}
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">
            {auditTarget?.title || auditSummary?.name || 'Audit Trail'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {auditTarget?.entityType ? toLabel(auditTarget.entityType) : 'HR audit event timeline'}
          </Typography>
        </Stack>

        {/* Created/modified summary */}
        {auditSummary ? (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Created by {auditSummary.createdByName || auditSummary.creatorId || 'Unknown'} on{' '}
              {formatHrAuditDateTime(auditSummary.creationTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last edited by{' '}
              {auditSummary.lastModifiedByName || auditSummary.lastModifierId || 'Unknown'} on{' '}
              {formatHrAuditDateTime(auditSummary.lastModificationTime)}
            </Typography>
          </Stack>
        ) : null}

        <Divider />

        {/* Detailed audit events (from entity audit endpoint) */}
        {(auditEvents?.items || []).length ? (
          <Stack spacing={0}>
            {auditEvents!.items.map((event, index) => {
              const context = parseHrAuditContext(event.contextJson);
              return (
                <Stack key={event.id} direction="row" spacing={1.5} sx={{ position: 'relative' }}>
                  <Stack alignItems="center" sx={{ pt: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        typography: 'caption',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Box>
                    {index < auditEvents!.items.length - 1 ? (
                      <Box sx={{ width: 2, flex: 1, minHeight: 24, bgcolor: 'divider' }} />
                    ) : null}
                  </Stack>
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, flex: 1, minWidth: 0 }}>
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Chip
                          size="small"
                          label={event.actionLabel || toLabel(event.action)}
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatHrAuditDateTime(event.occurredAt, event.occurredAtDisplay)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700}>
                        {event.summary}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.actorDisplayName ||
                          event.actorNameSnapshot ||
                          event.actorUserId ||
                          'Unknown actor'}
                      </Typography>
                      {event.reason ? (
                        <Typography variant="body2">Reason: {event.reason}</Typography>
                      ) : null}
                      {event.changedFields?.length ? (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Field</TableCell>
                              <TableCell>Before</TableCell>
                              <TableCell>After</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {event.changedFields.slice(0, 8).map((field) => (
                              <TableRow key={field.field}>
                                <TableCell>{toLabel(field.field)}</TableCell>
                                <TableCell>{formatHrAuditValue(field.oldValue)}</TableCell>
                                <TableCell>{formatHrAuditValue(field.newValue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : null}
                      {context ? (
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          {Object.entries(context)
                            .slice(0, 6)
                            .map(([key, value]) => (
                              <Chip
                                key={key}
                                size="small"
                                variant="outlined"
                                label={`${toLabel(key)}: ${formatHrAuditValue(value)}`}
                                sx={{ maxWidth: '100%' }}
                              />
                            ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  </Paper>
                </Stack>
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
                      {formatHrAuditDateTime(event.timestamp)} ·{' '}
                      {event.actorName || event.actorId || 'Unknown actor'}
                    </Typography>
                    {event.sourceMethod ? (
                      <Typography variant="caption" color="text.secondary">
                        {event.sourceMethod}
                      </Typography>
                    ) : null}
                    {event.changedFieldsSummary ? (
                      <Typography variant="body2">{event.changedFieldsSummary}</Typography>
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
    </Drawer>
  );
}
