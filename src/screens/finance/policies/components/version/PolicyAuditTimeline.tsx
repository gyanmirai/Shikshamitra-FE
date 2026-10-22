'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Paper,
  Avatar,
  Button,
  Collapse,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import VersionDiffTable from './VersionDiffTable';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';
import type { VersionValueContext } from './finance-policy-version-formatters';

const ACTION_LABELS: Record<string, string> = {
  created: 'Policy created',
  create: 'Policy created',
  updated: 'Policy updated',
  update: 'Policy updated',
  edited: 'Policy updated',
  cloned: 'Policy cloned',
  clone: 'Policy cloned',
  archived: 'Policy archived',
  archive: 'Policy archived',
  unarchived: 'Policy restored',
  unarchive: 'Policy restored',
  activated: 'Policy activated',
  activate: 'Policy activated',
};

const ACTION_ICONS: Record<string, string> = {
  created: 'mdi:file-document-plus-outline',
  create: 'mdi:file-document-plus-outline',
  updated: 'mdi:pencil-outline',
  update: 'mdi:pencil-outline',
  edited: 'mdi:pencil-outline',
  cloned: 'mdi:content-copy',
  clone: 'mdi:content-copy',
  archived: 'mdi:archive-outline',
  archive: 'mdi:archive-outline',
  unarchived: 'mdi:archive-arrow-up-outline',
  unarchive: 'mdi:archive-arrow-up-outline',
  activated: 'mdi:check-circle-outline',
  activate: 'mdi:check-circle-outline',
};

const getInitials = (actor: string) =>
  actor
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'S';

export default function PolicyAuditTimeline({
  versions,
  valueContext,
  policyName,
}: {
  versions: PolicyVersion[];
  valueContext: VersionValueContext;
  policyName: string;
}) {
  const theme = useTheme();
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const grouped = versions.reduce<Record<string, PolicyVersion[]>>((groups, version) => {
    const date = dayjs(version.createdAt);
    const key = date.isValid() ? date.format('YYYY-MM-DD') : 'unknown';
    (groups[key] ||= []).push(version);
    return groups;
  }, {});

  const toggleDate = (date: string) => {
    setCollapsedDates((previous) => {
      const next = new Set(previous);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  return (
    <Stack spacing={1.5}>
      {Object.entries(grouped).map(([date, entries]) => {
        const expanded = !collapsedDates.has(date);
        const headingId = `policy-audit-date-${date}`;
        const contentId = `policy-audit-events-${date}`;
        return (
          <Paper
            key={date}
            variant="outlined"
            sx={{ borderRadius: 1.5, overflow: 'hidden', bgcolor: 'background.paper' }}
          >
            <Button
              fullWidth
              id={headingId}
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={() => toggleDate(date)}
              sx={{
                px: 2,
                py: 1.25,
                minHeight: 48,
                justifyContent: 'flex-start',
                textAlign: 'left',
                color: 'text.primary',
                bgcolor: alpha(theme.palette.primary.main, 0.035),
                borderRadius: 0,
              }}
            >
              <Iconify
                icon="mdi:calendar-blank-outline"
                width={18}
                sx={{ color: 'primary.main', mr: 1 }}
              />
              <Typography variant="subtitle2" component="span" fontWeight={800}>
                {date === 'unknown' ? 'Date unavailable' : dayjs(date).format('DD-MM-YYYY')}
              </Typography>
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.85,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  color: 'primary.main',
                  typography: 'caption',
                  fontWeight: 700,
                }}
              >
                {entries.length} event{entries.length === 1 ? '' : 's'}
              </Box>
              <Iconify
                icon="eva:arrow-ios-downward-fill"
                width={18}
                sx={{ ml: 'auto', transform: expanded ? 'rotate(180deg)' : 'none' }}
              />
            </Button>
            <Collapse in={expanded} unmountOnExit>
              <Box
                id={contentId}
                role="region"
                aria-labelledby={headingId}
                sx={{ p: { xs: 1.5, sm: 2 } }}
              >
                <Stack spacing={1}>
                  {entries.map((version, index) => {
                    const timestamp = dayjs(version.createdAt);
                    const actor = version.actor || 'System';
                    const action = version.action.toLowerCase();
                    const hasChanges = version.changedFields.length > 0;
                    return (
                      <Stack key={version.eventId} direction="row" spacing={1} alignItems="stretch">
                        <Stack alignItems="center" sx={{ width: 58, flexShrink: 0 }}>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            color="text.secondary"
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {timestamp.isValid() ? timestamp.format('hh:mm A') : '—'}
                          </Typography>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              mt: 0.5,
                              bgcolor: 'primary.main',
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}
                          />
                          {index < entries.length - 1 && (
                            <Box
                              sx={{
                                width: 2,
                                flex: 1,
                                minHeight: 24,
                                mt: 0.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                              }}
                            />
                          )}
                        </Stack>
                        <Accordion
                          disableGutters
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: '12px !important',
                            boxShadow: 'none',
                            overflow: 'hidden',
                            '&.Mui-expanded': { m: 0 },
                            '&::before': { display: 'none' },
                          }}
                        >
                          <AccordionSummary
                            id={`audit-${version.eventId}`}
                            aria-controls={`audit-changes-${version.eventId}`}
                            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={18} />}
                            sx={{
                              px: 1.75,
                              minHeight: 72,
                              '& .MuiAccordionSummary-content': { my: 1.5, minWidth: 0 },
                              '& .MuiAccordionSummary-content.Mui-expanded': { my: 1.5 },
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              sx={{ minWidth: 0, width: 1 }}
                            >
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                                  color: 'primary.main',
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(actor)}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.75}
                                  useFlexGap
                                  flexWrap="wrap"
                                >
                                  <Box
                                    sx={{
                                      px: 1,
                                      py: 0.45,
                                      borderRadius: 1.5,
                                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                                      border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                                      color: 'primary.main',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <Iconify
                                      icon={ACTION_ICONS[action] || 'mdi:history'}
                                      width={14}
                                    />
                                    <Typography variant="caption" fontWeight={700}>
                                      {ACTION_LABELS[action] || 'Policy changed'}
                                    </Typography>
                                  </Box>
                                  <Label color="default">v{version.versionNumber}</Label>
                                </Stack>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{ mt: 0.5 }}
                                >
                                  by {actor}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color={hasChanges ? 'primary.main' : 'text.secondary'}
                                  display="block"
                                  sx={{ mt: 0.5 }}
                                >
                                  {hasChanges
                                    ? `${version.changedFields.length} ${version.changedFields.length === 1 ? 'field changed' : 'fields changed'} · View changes`
                                    : 'No changes recorded'}
                                </Typography>
                              </Box>
                              <CustomTooltip title={policyName} placement="left" arrow>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                  tabIndex={0}
                                  sx={{ maxWidth: 120, display: { xs: 'none', sm: 'block' } }}
                                >
                                  {policyName}
                                </Typography>
                              </CustomTooltip>
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails
                            id={`audit-changes-${version.eventId}`}
                            sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}
                          >
                            <Typography variant="caption" color="text.secondary" display="block">
                              Change reason
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mt: 0.5, mb: 2, overflowWrap: 'anywhere' }}
                            >
                              {version.changeReason || 'No reason recorded'}
                            </Typography>
                            <VersionDiffTable
                              selectedVersion={version}
                              valueContext={valueContext}
                              showSummary={false}
                            />
                          </AccordionDetails>
                        </Accordion>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
}
