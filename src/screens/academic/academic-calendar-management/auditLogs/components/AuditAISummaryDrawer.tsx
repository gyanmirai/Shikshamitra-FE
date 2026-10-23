'use client';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import HelpTooltip from 'src/components/help-tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Paper,
  Drawer,
  Divider,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import { buildAuditSummary } from '../utils/auditSummary';
import { summarizeImpact } from '../utils/auditFormatters';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  open: boolean;
  onClose: () => void;
  /** A selected event switches the drawer from the loaded-page summary to its explanation. */
  log?: AuditLog | null;
  logs: AuditLog[];
}

/** Builds a plain-language explanation for a single log. */
const buildExplain = (log: AuditLog) => ({
  text: `This log means ${log.actionLabel.toLowerCase()} was performed on "${log.entityName}" by ${
    log.changedByName
  } (${log.changedByRole}). ${
    log.reason ? `The reason recorded was: "${log.reason}".` : 'No reason was provided.'
  } ${
    log.impact && (log.impact.workingDaysAffected || log.impact.lecturesAffected)
      ? `${summarizeImpact(log.impact)}.`
      : ''
  }`,
});
const AuditAISummaryDrawer = ({ open, onClose, log, logs }: Props) => {
  const theme = useTheme();
  const [loading] = useState(false);

  const isExplainMode = !!log;
  const explain = log ? buildExplain(log) : null;
  const summary = buildAuditSummary(logs);

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
        role: 'dialog',
        'aria-modal': true,
        'aria-label': isExplainMode ? 'Explain Calendar Change' : 'Calendar Activity Summary',
        sx: {
          width: { xs: '100%', sm: 460 },
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:robot-outline" width={22} color="success.main" />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Typography variant="subtitle1" fontWeight={800}>
                  {isExplainMode ? 'Explain Change' : 'Audit Activity Summary'}
                </Typography>
                <HelpTooltip
                  title="Summary of the audit records loaded on the current page."
                  label="Audit summary information"
                  placement="right"
                  arrow
                >
                  <Iconify
                    icon={GlobalIcons.info}
                    color="info.main"
                    width={16}
                    height={16}
                    sx={{ cursor: 'pointer' }}
                  />
                </HelpTooltip>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {isExplainMode ? log?.entityName : 'Current filtered page'}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            aria-label="Close activity summary"
            onClick={onClose}
            sx={{ p: 0.5, color: 'text.secondary' }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {loading ? (
          <Stack spacing={1} sx={{ py: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Analyzing audit activity...
            </Typography>
            <LinearProgress />
          </Stack>
        ) : (
          <Stack spacing={1}>
            {/* AI disclaimer */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                borderColor: alpha(theme.palette.success.main, 0.25),
                backgroundColor: alpha(theme.palette.success.main, 0.02),
              }}
            >
              <Stack direction="row" alignItems="flex-start" gap={1}>
                <Iconify
                  icon="mdi:information-outline"
                  width={16}
                  color="success.main"
                  sx={{ mt: 0.2 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Summary calculated from the loaded audit records. Other pages and filtered-out
                  records are not included.
                </Typography>
              </Stack>
            </Paper>

            {/* Summary text */}
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, borderColor: alpha(theme.palette.primary.main, 0.15) }}
            >
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <Iconify icon="mdi:lightbulb-on-outline" width={16} color="primary.main" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Summary
                </Typography>
              </Stack>
              <Typography variant="body2" lineHeight={1.6}>
                {isExplainMode ? explain?.text : summary.text}
              </Typography>
            </Paper>

            {/* Suggested actions */}
            {!isExplainMode && summary.suggestedActions.length > 0 && (
              <Box>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                  <Iconify icon="mdi:format-list-checks" width={16} color="info.main" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Recommended Actions
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {summary.suggestedActions.map((action, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      alignItems="flex-start"
                      gap={1}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.info.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                      }}
                    >
                      <Iconify
                        icon="mdi:checkbox-blank-circle-outline"
                        width={14}
                        color="info.main"
                        sx={{ mt: 0.2 }}
                      />
                      <Typography variant="caption" color="text.primary">
                        {action}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}

            {isExplainMode && log?.riskReason && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Risk Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {log.riskReason}
                  </Typography>
                </Box>
              </>
            )}

            {/* Tip */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                borderColor: alpha(theme.palette.warning.main, 0.2),
                backgroundColor: alpha(theme.palette.warning.main, 0.02),
              }}
            >
              <Stack direction="row" alignItems="flex-start" gap={1}>
                <Iconify icon={GlobalIcons.info} width={16} color="warning.main" sx={{ mt: 0.2 }} />
                <Typography variant="caption" color="text.secondary">
                  Use the filters or open a record to review its recorded changes.
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export default AuditAISummaryDrawer;
