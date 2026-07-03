'use client';

import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Paper, Typography } from '@mui/material';

import type { AuditLogApprovalStep } from '../types/auditLogs.types';

interface Props {
  steps?: AuditLogApprovalStep[];
}

const statusMeta = {
  done: { icon: 'mdi:check-circle', colorKey: 'success', label: 'Completed' },
  pending: { icon: 'mdi:clock-outline', colorKey: 'warning', label: 'Pending' },
  rejected: { icon: 'mdi:close-circle', colorKey: 'error', label: 'Rejected' },
} as const;

/** Vertical approval trail (Requested → Approved → Applied). */
const AuditApprovalTrail = ({ steps }: Props) => {
  if (!steps || steps.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          No approval trail — this change did not require approval.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={0}>
      {steps.map((step, i) => {
        const meta = statusMeta[step.status];
        const color = meta.colorKey;
        const isLast = i === steps.length - 1;
        return (
          <Box key={`${step.step}-${i}`} sx={{ display: 'flex', gap: 1.5 }}>
            {/* Dot + connector */}
            <Stack alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: (t) =>
                    varAlpha(
                      (t.palette as any)[`${color}MainChannel`] || (t.palette as any)[color].main,
                      0.12
                    ),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify
                  icon={meta.icon}
                  width={16}
                  sx={{ color: (t) => (t.palette as any)[color].main }}
                />
              </Box>
              {!isLast && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 20,
                    backgroundColor: (t) =>
                      varAlpha(
                        (t.palette as any)[`${color}MainChannel`] || (t.palette as any)[color].main,
                        0.2
                      ),
                    mt: 0.5,
                  }}
                />
              )}
            </Stack>

            {/* Content */}
            <Box sx={{ pb: isLast ? 0 : 2, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700}>
                {step.step}
              </Typography>
              {(step.actor || step.timestamp) && (
                <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                  {step.actor && (
                    <Typography variant="caption" color="text.secondary">
                      by{' '}
                      <Box component="span" fontWeight={700}>
                        {step.actor}
                      </Box>
                      {step.actorRole ? ` (${step.actorRole})` : ''}
                    </Typography>
                  )}
                  {step.timestamp && (
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <Iconify
                        icon="mdi:clock-time-four-outline"
                        width={11}
                        color="text.disabled"
                      />
                      <Typography variant="caption" color="text.disabled">
                        {dayjs(step.timestamp).format('DD MMM YYYY, hh:mm A')}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              )}
              {step.note && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  “{step.note}”
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

export default AuditApprovalTrail;
