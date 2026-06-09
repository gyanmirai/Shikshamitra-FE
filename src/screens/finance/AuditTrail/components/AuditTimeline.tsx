'use client';

import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';

import AuditCard from './AuditCard';

import type { FinanceAuditLog } from '../types/financeAudit.types';

interface AuditTimelineProps {
  logs: FinanceAuditLog[];
  cardVariant?: 'default' | 'compact';
  onFilterByStudent?: (studentId: string, label: string) => void;
}

function groupByDate(logs: FinanceAuditLog[]): Record<string, FinanceAuditLog[]> {
  return logs.reduce<Record<string, FinanceAuditLog[]>>((acc, log) => {
    const dateKey = dayjs(log.createdAt).format('DD MMM YYYY');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});
}

const AuditTimeline = ({
  logs,
  cardVariant = 'default',
  onFilterByStudent,
}: AuditTimelineProps) => {
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
              const cardIndex = globalIdx;
              globalIdx += 1;

              return (
                <Box
                  key={log.id}
                  sx={{
                    display: 'flex',
                    gap: { xs: 1.5, sm: 2 },
                    position: 'relative',
                    pb: idx < dateLogs.length - 1 ? 1 : 0,
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
                    {/* Neutral node */}
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        border: '2.5px solid',
                        borderColor: 'text.disabled',
                        flexShrink: 0,
                        mt: 1.5,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::after': {
                          content: '""',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: 'text.disabled',
                        },
                      }}
                    />

                    {/* Vertical line */}
                    {/* {idx < dateLogs.length - 1 && ( */}
                    <Box
                      sx={{
                        width: 2,
                        flexGrow: 1,
                        mt: 0.75,
                        bgcolor: 'divider',
                        borderRadius: 2,
                      }}
                    />
                    {/* )} */}
                  </Box>

                  {/* ── Audit card ───────────────────── */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <AuditCard
                      log={log}
                      index={cardIndex}
                      variant={cardVariant}
                      onFilterByStudent={onFilterByStudent}
                    />
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
