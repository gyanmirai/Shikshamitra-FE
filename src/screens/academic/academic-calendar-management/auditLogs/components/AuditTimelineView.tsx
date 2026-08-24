'use client';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Paper,
  Button,
  Avatar,
  Tooltip,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import AuditRiskBadge from './badges/AuditRiskBadge';
import AuditActionBadge from './badges/AuditActionBadge';
import { groupLogsByDate, getUserInitials } from '../utils/auditFormatters';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  logs: AuditLog[];
  onLogClick?: (log: AuditLog) => void;
  hasActiveFilters?: boolean;
  collapsedDates?: Set<string>;
  onToggleDate?: (date: string) => void;
}

/** Timeline view: groups audit logs by date in collapsible accordion sections with time-spine layout. */
const AuditTimelineView = ({
  logs,
  onLogClick,
  hasActiveFilters,
  collapsedDates: controlledCollapsedDates,
  onToggleDate: controlledOnToggleDate,
}: Props) => {
  const theme = useTheme();
  const groups = groupLogsByDate(logs);

  const [localCollapsedDates, setLocalCollapsedDates] = useState<Set<string>>(new Set());
  const collapsedDates = controlledCollapsedDates ?? localCollapsedDates;

  const handleToggleDate = (date: string) => {
    if (controlledOnToggleDate) {
      controlledOnToggleDate(date);
    } else {
      setLocalCollapsedDates((prev) => {
        const next = new Set(prev);
        if (next.has(date)) {
          next.delete(date);
        } else {
          next.add(date);
        }
        return next;
      });
    }
  };

  if (logs.length === 0) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 8 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="mdi:timeline-outline" width={32} color="text.disabled" />
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {hasActiveFilters ? 'No logs match your filters' : 'No audit events yet'}
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ maxWidth: 360, textAlign: 'center' }}
        >
          {hasActiveFilters
            ? 'Try changing the date range, action, or search keyword.'
            : 'Audit events will appear on the timeline as soon as calendar changes happen.'}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ py: 1 }}>

      {groups.map((group) => {
        const isExpanded = !collapsedDates.has(group.date);

        return (
          <Accordion
            key={group.date}
            expanded={isExpanded}
            onChange={() => handleToggleDate(group.date)}
            disableGutters
            sx={{
              borderRadius: '12px !important',
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              backgroundColor: 'background.paper',
              '&:before': { display: 'none' },
              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
              overflow: 'hidden',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&.Mui-expanded': {
                borderColor: alpha(theme.palette.primary.main, 0.25),
                boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.06)}`,
              },
            }}
          >
            {/* Date header */}
            <AccordionSummary
              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={18} />}
              sx={{
                px: 2,
                py: 1,
                minHeight: 48,
                backgroundColor: isExpanded
                  ? alpha(theme.palette.primary.main, 0.03)
                  : alpha(theme.palette.action.hover, 0.02),
                '&.Mui-expanded': {
                  minHeight: 48,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                },
                '& .MuiAccordionSummary-content': {
                  my: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                },
              }}
            >
              <Iconify icon="mdi:calendar-blank-outline" width={18} color="primary.main" />
              <Typography variant="subtitle2" fontWeight={800}>
                {group.label}
              </Typography>
              <Box
                sx={{
                  px: 0.85,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
              >
                <Typography variant="caption" fontWeight={700} color="primary.main">
                  {group.items.length} event{group.items.length > 1 ? 's' : ''}
                </Typography>
              </Box>
            </AccordionSummary>

            {/* Events */}
            <AccordionDetails sx={{ p: 2, pt: 2.5 }}>
              <Stack spacing={1}>
                {group.items.map((log, idx) => {
                  const ts = dayjs(log.timestamp);
                  const isLast = idx === group.items.length - 1;
                  return (
                    <Box key={log.id} sx={{ display: 'flex', gap: 1 }}>
                      {/* Time + spine */}
                      <Stack alignItems="center" sx={{ minWidth: 64 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          {ts.format('hh:mm A')}
                        </Typography>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            mt: 0.5,
                            backgroundColor: 'primary.main',
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        />
                        {!isLast && (
                          <Box
                            sx={{
                              width: 2,
                              flex: 1,
                              minHeight: 20,
                              backgroundColor: alpha(theme.palette.primary.main, 0.15),
                              mt: 0.5,
                            }}
                          />
                        )}
                      </Stack>

                      {/* Card */}
                      <Paper
                        onClick={() => onLogClick?.(log)}
                        variant="outlined"
                        sx={{
                          flex: 1,
                          p: 1.75,
                          mb: 0,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          alignItems={{ sm: 'center' }}
                          justifyContent="space-between"
                          gap={1}
                        >
                          <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                color: 'primary.main',
                                flexShrink: 0,
                              }}
                            >
                              {getUserInitials(log.changedByName ?? undefined)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <AuditActionBadge action={log.action} />
                              <Stack
                                direction="row"
                                alignItems="center"
                                gap={1}
                                sx={{ mt: 0.5 }}
                                flexWrap="wrap"
                              >
                                <Typography variant="caption" color="text.secondary">
                                  by{' '}
                                  <Box component="span" fontWeight={700}>
                                    {log.changedByName}
                                  </Box>{' '}
                                  ({log.changedByRole})
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>

                          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                            <Tooltip title={log.entityName ?? ''}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ maxWidth: 140 }}
                              >
                                {log.entityName ?? 'Unknown record'}
                              </Typography>
                            </Tooltip>
                            <AuditRiskBadge level={log.riskLevel} showTooltip={false} />
                          </Stack>
                        </Stack>

                        {log.reason && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {log.reason}
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
};

export default AuditTimelineView;
