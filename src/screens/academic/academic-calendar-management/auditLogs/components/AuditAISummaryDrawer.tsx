'use client';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Stack, Paper, Drawer, Divider, Typography, LinearProgress } from '@mui/material';

import { summarizeImpact } from '../utils/auditFormatters';
import { MOCK_AUDIT_LOGS } from '../constants/auditLogs.mock';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Optional specific log for "Explain Change" mode; if absent, shows weekly summary. */
  log?: AuditLog | null;
}

/** Builds a mock AI summary for the full audit log set. */
const buildWeeklySummary = (logs: AuditLog[]) => {
  const high = logs.filter((l) => (l.riskLevel ?? 0) >= 3).length;
  const workingDayImpacts = logs.filter((l) => (l.impact?.workingDaysAffected ?? 0) > 0).length;
  const publishedMods = logs.filter((l) => l.actionLabel.includes('Published')).length;
  const suspicious = high > 2 || publishedMods > 0;

  return {
    text: `In the last 7 days, ${logs.length} academic calendar ${
      logs.length === 1 ? 'change was' : 'changes were'
    } made. ${high} ${
      high === 1 ? 'change was' : 'changes were'
    } high risk, ${workingDayImpacts} affected working days, and ${publishedMods} published calendar ${
      publishedMods === 1 ? 'modification' : 'modifications'
    } ${publishedMods === 1 ? 'was' : 'were'} recorded. ${
      suspicious ? 'Some changes need review.' : 'No suspicious activity was found.'
    }`,
    suggestedActions: [
      'Review timetable impact for high-risk changes',
      'Notify affected teachers of schedule shifts',
      'Send calendar update to parents',
      'Check exam schedule conflicts',
    ],
  };
};

/** Builds a mock plain-language explanation for a single log. */
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

/** AI summary/explain drawer (mock-powered, ready to connect to real AI endpoints). */
const AuditAISummaryDrawer = ({ open, onClose, log }: Props) => {
  const theme = useTheme();
  const [loading] = useState(false);

  const isExplainMode = !!log;
  const explain = log ? buildExplain(log) : null;
  const summary = buildWeeklySummary(MOCK_AUDIT_LOGS);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.06)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1.5}>
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
              <Typography variant="subtitle1" fontWeight={800}>
                {isExplainMode ? 'AI Explain Change' : 'AI Audit Summary'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isExplainMode ? log?.entityName : 'Last 7 days overview'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {loading ? (
          <Stack spacing={1.5} sx={{ py: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Analyzing audit activity...
            </Typography>
            <LinearProgress />
          </Stack>
        ) : (
          <Stack spacing={2}>
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
                  AI-generated summary based on available audit data. Always verify critical
                  insights before taking action.
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
            {!isExplainMode && (
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
                <Iconify
                  icon="mdi:robot-happy-outline"
                  width={16}
                  color="warning.main"
                  sx={{ mt: 0.2 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {`Tip: Ask in natural language — e.g. "Show me all holiday changes made by Admin last week" — to filter logs instantly.`}
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
