import type { AdmissionNumberingHistoryEntry } from 'src/redux/student/admissions/admission-numbering-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetAdmissionNumberingHistoryQuery } from 'src/redux/student/admissions/admission-numbering-api';

import { ADMISSION_DATE_TIME_FORMAT } from './admission-date-formats';
import { numberingCycles, numberingYearLabels } from './admission-numbering-model';

function Settings({ label, entry }: { label: string; entry: AdmissionNumberingHistoryEntry }) {
  const cycle =
    numberingCycles.find((item) => item.value === entry.resetPolicy)?.label ?? 'Unknown';
  const fields = [
    ['Numbering cycle', cycle],
    ['Year in number', numberingYearLabels[entry.yearFormat] ?? 'Unknown'],
    ['Prefix', entry.prefix || 'None'],
    ['Suffix', entry.suffix || 'None'],
    ['Separator', entry.separator || 'None'],
    ['Number of digits', entry.digits],
    ['Starting number', entry.startingNumber],
  ];
  return (
    <Stack component="section" aria-label={label} spacing={1} sx={{ minWidth: 0 }}>
      <Typography component="h3" variant="subtitle2">{label}</Typography>
      <Box
        component="dl"
        sx={{
          m: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1.5,
          overflowWrap: 'anywhere',
        }}
      >
        {fields.map(([name, value]) => (
          <Box key={name}>
            <Typography component="dt" variant="caption" color="text.secondary">
              {name}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}

export function AdmissionNumberingHistoryDialog({ onClose }: { onClose: () => void }) {
  const history = useGetAdmissionNumberingHistoryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const entries = history.currentData ?? [];
  return (
    <CustomDialog
      open
      title="Numbering History"
      titleInfo="See when application numbering changed, who made each change, and the previous and new settings."
      titleInfoPlacement="right"
      handleClose={onClose}
      hasForm={false}
      guardUnsavedChanges={false}
      maxWidth="sm"
    >
      <DialogScrollContent scrollBarProps={{ sx: { bgcolor: 'background.neutral' } }}>
        {history.isFetching && !history.currentData ? (
          <Stack spacing={1} role="status" aria-label="Loading numbering history">
            <Skeleton variant="rounded" height={80} />
            <Skeleton variant="rounded" height={80} />
          </Stack>
        ) : history.isError ? (
          <Alert
            severity="error"
            variant="outlined"
            action={
              <Button
                size="small"
                color="inherit"
                variant="outlined"
                startIcon={<Iconify icon="mdi:refresh" />}
                onClick={() => history.refetch()}
              >
                Retry
              </Button>
            }
          >
            Unable to load numbering history.
          </Alert>
        ) : entries.length ? (
          <Stack
            component="ol"
            spacing={2}
            aria-label="Numbering history, newest first"
            sx={{ m: 0, p: 0, listStyle: 'none' }}
          >
            {entries.map((entry, index) => {
              const previous = entries[index + 1];
              return (
                <Box component="li" key={entry.version} sx={{ minWidth: 0 }}>
                  <FormSectionCard
                    icon={GlobalIcons.history}
                    title={`Version ${entry.version}`}
                    descriptionTooltip={previous
                      ? 'Compare the settings saved in this version with the preceding version.'
                      : 'This is the earliest version in the saved history.'}
                  >
                    <Stack spacing={0.25} sx={{ overflowWrap: 'anywhere' }}>
                      <Typography variant="body2" color="text.secondary">
                        {fDateTime(entry.creationTime, ADMISSION_DATE_TIME_FORMAT)}
                        {entry.changedByName ? ` · ${entry.changedByName}` : ''}
                      </Typography>
                      {!previous && (
                        <Typography variant="caption" color="text.secondary">
                          First recorded version
                        </Typography>
                      )}
                    </Stack>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: previous
                          ? { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }
                          : 'minmax(0, 1fr)',
                        gap: 2,
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                      }}
                    >
                      {previous && <Settings label="Previous Settings" entry={previous} />}
                      <Settings label="New Settings" entry={entry} />
                    </Box>
                  </FormSectionCard>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No numbering changes have been recorded yet.
          </Typography>
        )}
      </DialogScrollContent>
    </CustomDialog>
  );
}
