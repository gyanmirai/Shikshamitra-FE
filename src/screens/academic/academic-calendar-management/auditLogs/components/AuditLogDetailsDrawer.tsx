'use client';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CustomTooltip from 'src/components/custom-tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Stack,
  Drawer,
  Avatar,
  Button,
  Tooltip,
  Accordion,
  IconButton,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import AuditDiffViewer from './AuditDiffViewer';
import AuditImpactPanel from './AuditImpactPanel';
import AuditReviewNotes from './AuditReviewNotes';
import AuditRiskBadge from './badges/AuditRiskBadge';
import AuditMetadataPanel from './AuditMetadataPanel';
import AuditApprovalTrail from './AuditApprovalTrail';
import AuditActionBadge from './badges/AuditActionBadge';
import { AuditApprovalStatus } from '../types/auditLogs.types';
import { getUserInitials, formatAuditTimestamp } from '../utils/auditFormatters';
import {
  APPROVAL_LABELS,
  APPROVAL_COLOR_KEYS,
} from '../constants/auditLogs.constants';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  open: boolean;
  onClose: () => void;
  log?: AuditLog | null;
  loading?: boolean;
  // Permissions
  canViewSensitiveMetadata?: boolean;
  canRestore?: boolean;
  canAddReviewNote?: boolean;
  canViewAIInsights?: boolean;
  // Handlers
  onRestore?: (log: AuditLog) => void;
  onAddNote?: (log: AuditLog, note: string) => Promise<void> | void;
  onAIExplain?: (log: AuditLog) => void;
}

/** Card-styled collapsible section used inside the drawer body. */
const Section = ({
  icon,
  title,
  subtitle,
  children,
  defaultExpanded = true,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    elevation={0}
    sx={{
      border: (theme) => `1px solid ${theme.palette.divider}`,
      borderRadius: '12px !important',
      overflow: 'hidden',
      backgroundColor: 'background.paper',
      '&:before': { display: 'none' },
    }}
  >
    <AccordionSummary
      expandIcon={<Iconify icon="mdi:chevron-down" width={18} />}
      sx={{
        px: 2,
        minHeight: 54,
        '& .MuiAccordionSummary-content': { my: 1.25, mx: 0 },
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Iconify icon={icon} width={16} sx={{ color: 'primary.main' }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1.3}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.3}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 2, pt: 0.5, pb: 2 }}>{children}</AccordionDetails>
  </Accordion>
);

/** Full-screen detail drawer with all audit intelligence panels. */
const AuditLogDetailsDrawer = ({
  open,
  onClose,
  log,
  loading,
  canViewSensitiveMetadata = true,
  canRestore = false,
  canAddReviewNote = false,
  canViewAIInsights = false,
  onRestore,
  onAddNote,
  onAIExplain,
}: Props) => {
  const theme = useTheme();
  const [noteSaving, setNoteSaving] = useState(false);

  const ts = log ? formatAuditTimestamp(log.timestamp) : null;

  const handleCopyId = () => {
    if (!log) return;
    navigator.clipboard.writeText(log.id);
    shikshaMitraToast.success({ message: 'Log ID copied' });
  };

  const handleAddNote = async (note: string) => {
    if (!log || !onAddNote) return;
    setNoteSaving(true);
    try {
      await onAddNote(log, note);
      shikshaMitraToast.success({ message: 'Review note added' });
    } finally {
      setNoteSaving(false);
    }
  };

  // Skip rows that would just repeat the header or show nothing.
  const showRecordRow = Boolean(log && log.entityName && log.entityName !== log.actionLabel);
  const approvalStatus = log?.approvalStatus ?? AuditApprovalStatus.NotRequired;
  const approvalLabel = APPROVAL_LABELS[approvalStatus];
  const showApprovalChip =
    approvalStatus !== AuditApprovalStatus.NotRequired && Boolean(approvalLabel);
  const hasStatusChips = Boolean(log && (log.riskLevel != null || showApprovalChip));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.44)',
            backdropFilter: 'blur(3px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 540, md: 600 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
            theme.palette.primary.light,
            0.02
          )} 100%)`,
        }}
      >
        {loading || !log || !ts ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Iconify icon="svg-spinners:90-dots-with-circle" width={28} />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Loading audit details...
            </Typography>
          </Box>
        ) : (
          <>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <AuditActionBadge action={log.action} variant="inline" />
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>
                    {log.actionLabel}
                  </Typography>
                  <CustomTooltip title="Comprehensive audit trail log details" placement="right" arrow>
                    <Iconify
                      icon={GlobalIcons.info}
                      color="info.main"
                      width={16}
                      height={16}
                      sx={{ cursor: 'pointer' }}
                    />
                  </CustomTooltip>
                </Stack>
                {showRecordRow ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {log.entityType} · <b>{log.entityName}</b>
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {log.entityType}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={onClose} sx={{ p: 0.5, color: 'text.secondary' }}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Stack>

            {hasStatusChips && (
              <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5 }} flexWrap="wrap">
                <AuditRiskBadge level={log.riskLevel} />
                {showApprovalChip && (
                  <Label
                    variant="soft"
                    color={APPROVAL_COLOR_KEYS[approvalStatus] as any}
                    sx={{ fontWeight: 600, fontSize: 10 }}
                  >
                    {approvalLabel}
                  </Label>
                )}
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: alpha(theme.palette.grey[500], 0.06),
        }}
      >
        {!loading && log && (
          <Stack spacing={1}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              gap={1.5}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
              }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                  }}
                >
                  {getUserInitials(log.changedByName ?? undefined)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700} lineHeight={1.3}>
                    {log.changedByName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {log.changedByRole}
                  </Typography>
                </Box>
              </Stack>
              <Tooltip title={ts?.full}>
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }}
                >
                  <Iconify icon="mdi:clock-outline" width={13} color="text.secondary" />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {ts?.label}
                  </Typography>
                </Stack>
              </Tooltip>
            </Stack>
            {/* Change Details */}
            <Section
              icon="mdi:clipboard-text-outline"
              title="Change Details"
              subtitle="What happened, to which record, and why"
            >
              <Stack spacing={0}>
                <DetailRow label="Action" value={log.actionLabel} />
                {showRecordRow && <DetailRow label="Record" value={log.entityName ?? undefined} />}
                <DetailRow label="Record Type" value={log.entityType ?? undefined} />
                <DetailRow
                  label="Reason"
                  value={log.reason || 'No reason provided'}
                  muted={!log.reason}
                />
                {log.correlationId && (
                  <DetailRow label="Correlation ID" value={log.correlationId} mono last />
                )}
              </Stack>
            </Section>


            {/* Diff */}
            <Section
              icon="mdi:compare-horizontal"
              title="Before vs After"
              subtitle="Field-by-field values before and after this change"
            >
              <AuditDiffViewer diff={log.diff} variant="full" />
            </Section>

            {/* Impact */}
            <Section
              icon="mdi:radar"
              title="Calendar Impact"
              subtitle="Downstream effect on timetables, exams, students and more"
            >
              <AuditImpactPanel impact={log.impact} impactLevel={log.impactLevel} />
            </Section>

            {/* Approval Trail */}
            {log.approvalTrail && log.approvalTrail.length > 0 && (
              <Section
                icon="mdi:check-decagram-outline"
                title="Approval Trail"
                subtitle="Who reviewed and approved this change"
              >
                <AuditApprovalTrail steps={log.approvalTrail} />
              </Section>
            )}

            {/* Metadata */}
            <Section
              icon="mdi:server-network"
              title="Technical Metadata"
              subtitle="Device, network, and request details"
              defaultExpanded={false}
            >
              <AuditMetadataPanel
                metadata={log.metadata}
                showSensitive={canViewSensitiveMetadata}
              />
            </Section>

            {/* Related Records */}
            {log.relatedRecords && log.relatedRecords.length > 0 && (
              <Section
                icon="mdi:link-variant"
                title="Related Records"
                subtitle="Other records connected to this change"
                defaultExpanded={false}
              >
                <Stack spacing={1}>
                  {log.relatedRecords.map((r, i) => (
                    <Stack
                      key={`${r.name}-${i}`}
                      direction="row"
                      alignItems="center"
                      gap={1}
                      sx={{
                        py: 0.75,
                        cursor: r.href ? 'pointer' : 'default',
                        '&:hover': r.href ? { color: 'primary.main' } : {},
                      }}
                    >
                      <Iconify icon="mdi:chevron-right" width={14} color="text.secondary" />
                      <Typography variant="caption" color="text.secondary">
                        {r.type}:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {r.name}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Section>
            )}

            {/* Review Notes */}
            <Section
              icon="mdi:comment-text-outline"
              title="Comments / Review Notes"
              subtitle="Discussion and follow-ups on this change"
            >
              <AuditReviewNotes
                notes={log.reviewNotes}
                canAddNote={canAddReviewNote}
                onAdd={handleAddNote}
              />
            </Section>
          </Stack>
        )}
      </Box>

      {/* Footer Actions */}
      {!loading && log && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper',
          }}
        >
          <Stack direction="row" gap={1} justifyContent="flex-end" flexWrap="wrap">
            <Stack direction="row" gap={1}>
              {canRestore && log.isRollbackAvailable && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<Iconify icon="mdi:undo-variant" width={16} />}
                  onClick={() => onRestore?.(log)}
                >
                  Restore
                </LoadingButton>
              )}
              <Button size="small" onClick={onClose} startIcon={<Iconify icon={GlobalIcons.cancel} />} variant="outlined">
                Close
              </Button>
            </Stack>
          </Stack>
        </Box>
      )
      }
    </Drawer >
  );
};

const DetailRow = ({
  label,
  value,
  children,
  mono,
  muted,
  last,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
  last?: boolean;
}) => {
  const isEmpty = !children && !value;
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        py: 1,
        minHeight: 34,
        borderBottom: last ? 'none' : (theme) => `1px dashed ${theme.palette.divider}`,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ width: 110, flexShrink: 0, fontWeight: 500 }}
      >
        {label}
      </Typography>
      {children ||
        (isEmpty ? (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        ) : (
          <Tooltip title={mono ? value : ''} placement="top">
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                fontFamily: mono ? 'monospace' : 'inherit',
                fontSize: mono ? 11 : undefined,
                color: muted ? 'text.disabled' : 'text.primary',
                minWidth: 0,
              }}
              noWrap
            >
              {value}
            </Typography>
          </Tooltip>
        ))}
    </Stack>
  );
};

export default AuditLogDetailsDrawer;
