'use client';

import dayjs from 'dayjs';
import {
  Box,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import VersionDiffTable from './VersionDiffTable';
import { formatVersionTimestamp } from './finance-policy-version-formatters';
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

export default function PolicyAuditTimeline({
  versions,
  valueContext,
}: {
  versions: PolicyVersion[];
  valueContext: VersionValueContext;
}) {
  const grouped = versions.reduce<Record<string, PolicyVersion[]>>((groups, version) => {
    const date = dayjs(version.createdAt);
    const label = date.isValid() ? date.format('DD MMM YYYY') : 'Date unavailable';
    (groups[label] ||= []).push(version);
    return groups;
  }, {});

  return (
    <Stack spacing={2.5}>
      {Object.entries(grouped).map(([date, entries]) => (
        <Box key={date}>
          <Typography variant="subtitle2" color="text.secondary" component="h3" sx={{ mb: 1.5 }}>
            {date}
          </Typography>
          <Stack
            spacing={1.5}
            sx={{ borderLeft: 1, borderColor: 'divider', pl: { xs: 1.5, sm: 2 } }}
          >
            {entries.map((version) => (
              <Accordion
                key={version.eventId}
                disableGutters
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  id={`audit-${version.eventId}`}
                  aria-controls={`audit-changes-${version.eventId}`}
                  expandIcon={<Iconify icon="mingcute:down-line" width={18} />}
                  sx={{ px: 2, '& .MuiAccordionSummary-content': { my: 2, minWidth: 0 } }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Typography variant="subtitle2" component="span">
                        {ACTION_LABELS[version.action.toLowerCase()] || 'Policy changed'}
                      </Typography>
                      <Label color="default">v{version.versionNumber}</Label>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.75, overflowWrap: 'anywhere' }}
                    >
                      {version.actor || 'System'} · {formatVersionTimestamp(version.createdAt)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      {version.changedFields.length}{' '}
                      {version.changedFields.length === 1 ? 'field changed' : 'fields changed'} ·
                      View changes
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2, pt: 0 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Change reason
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, overflowWrap: 'anywhere' }}>
                    {version.changeReason || 'No reason recorded'}
                  </Typography>
                  <VersionDiffTable
                    selectedVersion={version}
                    valueContext={valueContext}
                    showSummary={false}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
