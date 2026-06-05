'use client';

import React from 'react';
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

        <Stack spacing={1.5} sx={{ px: 2.5, py: 2 }}>
          {/* Header */}
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {auditTarget?.title || auditSummary?.name || 'Audit Trail'}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {auditTarget?.entityType
                ? toLabel(auditTarget.entityType)
                : 'HR audit event timeline'}
            </Typography>
          </Stack>

          {/* Created/modified summary */}
          {auditSummary ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Created by{' '}
                <strong>
                  {formatHrAuditActor(
                    auditSummary.createdByName || auditSummary.creatorId,
                    'Unknown user'
                  )}
                </strong>{' '}
                on {formatHrAuditDateTime(auditSummary.creationTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
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
                          {formatHrAuditText(event.summary)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatHrAuditActor(
                            event.actorDisplayName || event.actorNameSnapshot || event.actorUserId
                          )}
                        </Typography>
                        {event.reason ? (
                          <Typography variant="body2">
                            Reason: {formatHrAuditText(event.reason)}
                          </Typography>
                        ) : null}
                        {event.changedFields?.length ? (
                          <Box
                            sx={{
                              overflowX: 'auto',
                              width: 1,
                              mt: 1.5,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                            }}
                          >
                            <Table size="small" sx={{ width: 1, tableLayout: 'fixed' }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ bgcolor: 'background.neutral' }}>
                                    Field
                                  </TableCell>
                                  <TableCell sx={{ bgcolor: 'background.neutral' }}>
                                    Before
                                  </TableCell>
                                  <TableCell sx={{ bgcolor: 'background.neutral' }}>
                                    After
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {event.changedFields.slice(0, 8).map((field) => (
                                  <TableRow
                                    key={field.field}
                                    sx={{ '&:last-child td': { border: 0 } }}
                                  >
                                    <TableCell
                                      sx={{
                                        width: '28%',
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                        wordBreak: 'break-word',
                                      }}
                                    >
                                      {toHrAuditLabel(field.field)}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        width: '36%',
                                        color: 'text.primary',
                                        wordBreak: 'break-word',
                                        minWidth: 120,
                                      }}
                                    >
                                      <HrAuditValueView value={field.oldValue} dense maxDepth={3} />
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        width: '36%',
                                        color: 'text.primary',
                                        wordBreak: 'break-word',
                                        minWidth: 120,
                                      }}
                                    >
                                      <HrAuditValueView value={field.newValue} dense maxDepth={3} />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        ) : null}
                        {context ? (
                          <Stack spacing={0.75}>
                            {Object.entries(context)
                              .slice(0, 6)
                              .map(([key, value]) => (
                                <Box
                                  key={key}
                                  sx={{
                                    p: 0.75,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                  }}
                                >
                                  <HrAuditValueView
                                    value={value}
                                    label={toHrAuditLabel(key)}
                                    dense
                                  />
                                </Box>
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
