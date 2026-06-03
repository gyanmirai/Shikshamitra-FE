'use client';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';

import AuditCard from './AuditCard';
import { getFinanceAuditSubModuleColor } from '../constants/subModuleColors';

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
              const dotColor = getFinanceAuditSubModuleColor(log.subModule);
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
                    {/* Glowing node */}
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: alpha(dotColor, 0.13),
                        border: `2.5px solid ${dotColor}`,
                        boxShadow: `0 0 0 3px ${alpha(dotColor, 0.13)}`,
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
                    {/* {idx < dateLogs.length - 1 && ( */}
                    <Box
                      sx={{
                        width: 2,
                        flexGrow: 1,
                        mt: 0.75,
                        background: `linear-gradient(to bottom, ${alpha(dotColor, 0.72)} 0%, ${alpha(dotColor, 0.45)} 42%, ${alpha(dotColor, 0.25)} 100%)`,
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
