'use client';

import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Paper,
  Button,
  Collapse,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import VersionDiffTable from './VersionDiffTable';
import { materializePolicyVersion } from '../../utils/policy-version-page';

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

export default function PolicyAuditTimeline({
  versions,
  valueContext,
}: {
  versions: PolicyVersion[];
  valueContext: VersionValueContext;
}) {
  const theme = useTheme();
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const grouped = useMemo(
    () =>
      versions.reduce<Record<string, PolicyVersion[]>>((groups, version) => {
        const date = dayjs(version.createdAt);
        const key = date.isValid() ? date.format('YYYY-MM-DD') : 'unknown';
        (groups[key] ||= []).push(version);
        return groups;
      }, {}),
    [versions]
  );

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
                sx={{ borderTop: 1, borderColor: 'divider' }}
              >
                {entries.map((version, index) => {
                  const timestamp = dayjs(version.createdAt);
                  const actor = version.actor || 'System';
                  const action = version.action.toLowerCase();
                  const eventExpanded = expandedEvents.has(version.eventId);
                  const inspected = eventExpanded ? materializePolicyVersion(version) : version;
                  const hasChanges =
                    version.snapshotJson !== undefined || version.changedFields.length > 0;
                  const detailLabel = hasChanges ? 'recorded changes' : 'event details';

                  return (
                    <Accordion
                      key={version.eventId}
                      disableGutters
                      expanded={eventExpanded}
                      onChange={(_event, isExpanded) =>
                        setExpandedEvents((previous) => {
                          const next = new Set(previous);
                          if (isExpanded) next.add(version.eventId);
                          else next.delete(version.eventId);
                          return next;
                        })
                      }
                      sx={{
                        boxShadow: 'none',
                        bgcolor: 'transparent',
                        borderTop: index === 0 ? 0 : 1,
                        borderColor: 'divider',
                        '&::before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary
                        id={`audit-${version.eventId}`}
                        aria-controls={`audit-changes-${version.eventId}`}
                        expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={18} />}
                        sx={{
                          px: { xs: 1.5, sm: 2 },
                          gap: 1,
                          '& .MuiAccordionSummary-content': {
                            my: 1.25,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            minWidth: 0,
                          },
                        }}
                      >
                        <Label
                          color="primary"
                          startIcon={
                            <Iconify icon={ACTION_ICONS[action] || 'mdi:history'} width={14} />
                          }
                        >
                          {ACTION_LABELS[action] || 'Policy changed'}
                        </Label>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                        >
                          by {actor}
                          {timestamp.isValid() && (
                            <>
                              {' '}
                              • <Box component="span">{timestamp.format('hh:mm A')}</Box>
                            </>
                          )}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="primary.main"
                          sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
                        >
                          {eventExpanded ? `Hide ${detailLabel}` : `View ${detailLabel}`}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Change reason
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.5, mb: 2, overflowWrap: 'anywhere' }}
                        >
                          {version.changeReason || 'No reason recorded'}
                        </Typography>
                        {eventExpanded &&
                          (hasChanges ? (
                            <VersionDiffTable
                              selectedVersion={inspected}
                              valueContext={valueContext}
                              showSummary={false}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No changes recorded
                            </Typography>
                          ))}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
}
