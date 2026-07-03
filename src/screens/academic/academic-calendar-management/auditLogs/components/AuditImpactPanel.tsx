'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Stack,
  Paper,
  Table,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import { summarizeImpact } from '../utils/auditFormatters';
import { AuditImpactLevel } from '../types/auditLogs.types';
import {
  IMPACT_LABELS,
  IMPACT_COLOR_KEYS,
  IMPACT_CATEGORY_ROWS,
} from '../constants/auditLogs.constants';

import type { AuditLogImpact } from '../types/auditLogs.types';

interface Props {
  impact?: AuditLogImpact;
  impactLevel?: AuditImpactLevel;
}

/** Shows the quantified academic impact of an audit log (working days, lectures, etc). */
const AuditImpactPanel = ({ impact, impactLevel = AuditImpactLevel.None }: Props) => {
  const theme = useTheme();
  const colorKey = IMPACT_COLOR_KEYS[impactLevel] ?? 'default';
  const color =
    colorKey === 'default' ? theme.palette.text.secondary : theme.palette[colorKey].main;

  const affectedRows = IMPACT_CATEGORY_ROWS.filter(
    ({ key }) => ((impact?.[key] as number) ?? 0) > 0
  );
  const hasImpact = impactLevel !== AuditImpactLevel.None && affectedRows.length > 0;

  // Compact success state — a full table of zeros only adds noise.
  if (!hasImpact) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderColor: alpha(theme.palette.success.main, 0.2),
          backgroundColor: alpha(theme.palette.success.main, 0.04),
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Iconify icon="mdi:check-circle-outline" width={22} color={theme.palette.success.main} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="success.dark">
              No downstream impact
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This change did not affect timetables, exams, students, or any other module.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: alpha(color, 0.24),
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(color, 0.04),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: alpha(color, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:radar" width={20} sx={{ color }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color }}>
                Calendar Impact
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {`${affectedRows.length} module${affectedRows.length > 1 ? 's' : ''} affected`}
              </Typography>
            </Box>
          </Stack>
          <Label
            variant="filled"
            color={colorKey as any}
            sx={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}
          >
            {IMPACT_LABELS[impactLevel]}
          </Label>
        </Stack>
      </Box>

      {/* Impact summary line */}
      {impact?.impactSummary && (
        <Box sx={{ px: 2, py: 1.5, backgroundColor: 'background.paper' }}>
          <Stack direction="row" alignItems="flex-start" gap={1}>
            <Iconify
              icon="mdi:information-outline"
              width={15}
              color="text.secondary"
              sx={{ mt: 0.2 }}
            />
            <Typography variant="caption" color="text.secondary">
              {impact.impactSummary}
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Category breakdown — only modules that were actually affected */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  py: 1,
                }}
              >
                Affected Module
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  py: 1,
                }}
              >
                Count
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {affectedRows.map(({ key, label, icon }) => {
              const count = (impact?.[key] as number) ?? 0;
              return (
                <TableRow key={key} hover>
                  <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: 1.5,
                          backgroundColor: alpha(color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Iconify icon={icon} width={14} sx={{ color }} />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {label}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 26,
                        height: 22,
                        borderRadius: 1,
                        px: 1,
                        backgroundColor: alpha(color, 0.08),
                      }}
                    >
                      <Typography variant="caption" fontWeight={800} sx={{ color }}>
                        {count}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer: notifications + summary */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          flexWrap="wrap"
        >
          <Tooltip title={summarizeImpact(impact)}>
            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 320 }} noWrap>
              {summarizeImpact(impact)}
            </Typography>
          </Tooltip>
          {impact?.notificationsTriggered && (
            <Chip
              size="small"
              icon={<Iconify icon="mdi:bell-ring-outline" width={12} />}
              label="Notifications Sent"
              color="info"
              variant="soft"
              sx={{ height: 20, fontSize: 10 }}
            />
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default AuditImpactPanel;
