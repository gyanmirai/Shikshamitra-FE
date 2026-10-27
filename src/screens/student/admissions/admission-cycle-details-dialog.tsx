'use client';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { formatDateOnly } from 'src/utils/date-only';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, Divider, Skeleton, Typography, DialogActions } from '@mui/material';
import {
  type AdmissionCycle,
  useGetAdmissionCycleImpactQuery,
  useGetAdmissionCycleHistoryQuery,
} from 'src/redux/student/admissions/admission-cycles-api';

import {
  windowLabels,
  windowColors,
  lifecycleLabels,
  lifecycleColors,
} from './admission-cycle-model';

type Props = { cycle: AdmissionCycle | null; onClose: () => void };

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Box>
  );
}

export function AdmissionCycleDetailsDialog({ cycle, onClose }: Props) {
  const impactQuery = useGetAdmissionCycleImpactQuery(cycle?.id ?? '', { skip: !cycle });
  const historyQuery = useGetAdmissionCycleHistoryQuery(cycle?.id ?? '', { skip: !cycle });

  if (!cycle) return null;

  const metrics = [
    {
      label: 'Linked offerings',
      value: impactQuery.data?.linkedOfferingCount ?? cycle.linkedOfferingCount,
    },
    {
      label: 'Active offerings',
      value: impactQuery.data?.activeOfferingCount ?? cycle.activeOfferingCount,
    },
    { label: 'Applications', value: impactQuery.data?.applicationCount ?? cycle.applicationCount },
    { label: 'Submitted', value: impactQuery.data?.submittedApplicationCount ?? '—' },
  ];
  const history = historyQuery.data ?? [];

  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Admission period details"
      maxWidth="sm"
      hasForm={false}
    >
      <DialogScrollContent>
        <Stack spacing={3}>
          <Box component="section" aria-label="Admission period">
            <Typography component="h2" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
              {cycle.name}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 1 }}
            >
              <Label color={lifecycleColors[cycle.status]}>{lifecycleLabels[cycle.status]}</Label>
              <Label color={windowColors[cycle.windowStatus]}>
                {windowLabels[cycle.windowStatus]}
              </Label>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {cycle.code} · {cycle.academicYearName || 'Academic year not set'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Review this period’s admission window, usage, and recorded activity.
            </Typography>
            {cycle.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {cycle.description}
              </Typography>
            )}
          </Box>

          <Box component="section" aria-labelledby="admission-cycle-window-heading">
            <Typography id="admission-cycle-window-heading" variant="subtitle1" sx={{ mb: 1.5 }}>
              Admission window
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                columnGap: 2,
                rowGap: 1.5,
              }}
            >
              <DetailItem label="Opens" value={formatDateOnly(cycle.startDate, 'DD MMM YYYY')} />
              <DetailItem label="Closes" value={formatDateOnly(cycle.endDate, 'DD MMM YYYY')} />
              {cycle.scheduledPublishAt && (
                <DetailItem
                  label="Scheduled publish"
                  value={dayjs(cycle.scheduledPublishAt).format('DD MMM YYYY, hh:mm A')}
                />
              )}
              {cycle.scheduledCloseAt && (
                <DetailItem
                  label="Scheduled close"
                  value={dayjs(cycle.scheduledCloseAt).format('DD MMM YYYY, hh:mm A')}
                />
              )}
            </Box>
          </Box>

          <Box component="section" aria-labelledby="admission-cycle-usage-heading">
            <Typography id="admission-cycle-usage-heading" variant="subtitle1" sx={{ mb: 1.5 }}>
              Usage
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  sm: 'repeat(4, minmax(0, 1fr))',
                },
                columnGap: 2,
                rowGap: 2,
              }}
            >
              {metrics.map((metric) => (
                <Box key={metric.label} sx={{ minWidth: 0 }}>
                  {impactQuery.isLoading ? (
                    <Skeleton
                      variant="text"
                      width={40}
                      height={32}
                      aria-label={`Loading ${metric.label.toLowerCase()}`}
                    />
                  ) : (
                    <Typography variant="h6" fontWeight={700}>
                      {metric.value}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {metric.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            {impactQuery.isError && (
              <StudentFeedback notificationKey="STU-0043" presentation="toast" severity="error">
                Current usage could not be refreshed. Showing available counts.
              </StudentFeedback>
            )}
          </Box>

          <Divider />

          <Box component="section" aria-labelledby="admission-cycle-history-heading">
            <Typography id="admission-cycle-history-heading" variant="subtitle1" sx={{ mb: 2 }}>
              Activity history
            </Typography>
            {historyQuery.isLoading && (
              <Stack spacing={2} aria-label="Loading activity history">
                {[0, 1].map((item) => (
                  <Stack key={item} direction="row" spacing={1.5}>
                    <Skeleton
                      variant="circular"
                      width={9}
                      height={9}
                      sx={{ mt: 0.75, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="65%" />
                      <Skeleton variant="text" width="35%" />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
            {historyQuery.isError && (
              <StudentFeedback notificationKey="STU-0044" presentation="toast" severity="error">
                Activity history could not be loaded.
              </StudentFeedback>
            )}
            {!historyQuery.isLoading && !historyQuery.isError && !history.length && (
              <Typography variant="body2" color="text.secondary">
                No activity has been recorded for this period yet.
              </Typography>
            )}
            {!historyQuery.isLoading && !historyQuery.isError && history.length > 0 && (
              <Stack component="ol" spacing={0} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                {history.map((item, index) => (
                  <Box
                    component="li"
                    key={item.id}
                    sx={{
                      position: 'relative',
                      pl: 2.5,
                      pb: index === history.length - 1 ? 0 : 2,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 5,
                        left: 0,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'text.disabled',
                      },
                      ...(index < history.length - 1 && {
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 17,
                          bottom: 0,
                          left: '3.5px',
                          width: '1px',
                          bgcolor: 'divider',
                        },
                      }),
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                      {item.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fDateTime(item.occurredAt) || 'Time not recorded'}
                    </Typography>
                    {item.reason && (
                      <Typography variant="body2" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                        Reason: {item.reason}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
