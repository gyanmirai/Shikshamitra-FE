'use client';

import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';

import AuditCard from './AuditCard';
import { FINANCE_AUDIT_SUBMODULE_COLORS } from '../constants/subModuleColors';

import type { FinanceAuditLog } from '../types/financeAudit.types';

interface AuditTimelineProps {
  logs: FinanceAuditLog[];
}

function groupByDate(logs: FinanceAuditLog[]): Record<string, FinanceAuditLog[]> {
  return logs.reduce<Record<string, FinanceAuditLog[]>>((acc, log) => {
    const dateKey = dayjs(log.createdAt).format('DD MMM YYYY');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});
}

const AuditTimeline = ({ logs }: AuditTimelineProps) => {
  if (logs.length === 0) {
    return (
      <EmptyContent
        title="No audit history found"
        description="There are no audit logs matching the selected filters."
        imgUrl="/assets/illustrations/illustration-empty-content.svg"
        sx={{ py: 10 }}
      />
    );
  }

  const grouped = groupByDate(logs);

  // running index for stagger animations
  let globalIdx = 0;

  return (
    <Box sx={{ position: 'relative' }}>
      {Object.entries(grouped).map(([date, dateLogs]) => (
        <Box key={date} sx={{ mb: 3 }}>
          {/* ── Date pill ────────────────────────────────────── */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.75,
              py: 0.6,
              mb: 2,
              bgcolor: 'background.neutral',
              borderRadius: 6,
              border: '1px solid',
              borderColor: 'divider',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'text.disabled',
              }}
            />
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ fontSize: 12, letterSpacing: 0.3 }}
            >
              {date}
            </Typography>
          </Box>

          {/* ── Timeline entries ─────────────────────────────── */}
          <Box sx={{ pl: { xs: 1, sm: 2 } }}>
            {dateLogs.map((log, idx) => {
              const dotColor = FINANCE_AUDIT_SUBMODULE_COLORS[log.subModule] ?? '#607D8B';
              const cardIndex = globalIdx;
              globalIdx += 1;

              return (
                <Box
                  key={log.id}
                  sx={{
                    display: 'flex',
                    gap: { xs: 1.5, sm: 2 },
                    position: 'relative',
                    pb: idx < dateLogs.length - 1 ? 2.5 : 0,
                  }}
                >
                  {/* ── Connector column ─────────────── */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                      width: 20,
                    }}
                  >
                    {/* Glowing node */}
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: `${dotColor}22`,
                        border: `2.5px solid ${dotColor}`,
                        boxShadow: `0 0 0 3px ${dotColor}22`,
                        flexShrink: 0,
                        mt: 1.4,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::after': {
                          content: '""',
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          bgcolor: dotColor,
                        },
                      }}
                    />

                    {/* Vertical line */}
                    {idx < dateLogs.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          flexGrow: 1,
                          mt: 0.75,
                          background: `linear-gradient(to bottom, ${dotColor}60, transparent)`,
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </Box>

                  {/* ── Audit card ───────────────────── */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <AuditCard log={log} index={cardIndex} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default AuditTimeline;
