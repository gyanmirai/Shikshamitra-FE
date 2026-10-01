'use client';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, Divider, Typography, DialogActions, CircularProgress } from '@mui/material';
import {
  type AdmissionCycle,
  useGetAdmissionCycleImpactQuery,
  useGetAdmissionCycleHistoryQuery,
} from 'src/redux/student/admissions/admission-cycles-api';

import { windowLabels, windowColors, lifecycleLabels, lifecycleColors } from './admission-cycle-model';

type Props = { cycle: AdmissionCycle | null; onClose: () => void };

export function AdmissionCycleDetailsDialog({ cycle, onClose }: Props) {
  const { data: impact, isLoading: impactLoading } = useGetAdmissionCycleImpactQuery(cycle?.id ?? '', {
    skip: !cycle,
  });
  const { data: history = [], isLoading: historyLoading, isError } =
    useGetAdmissionCycleHistoryQuery(cycle?.id ?? '', { skip: !cycle });

  if (!cycle) return null;

  const metrics = [
    ['Linked offerings', impact?.linkedOfferingCount ?? cycle.linkedOfferingCount],
    ['Active offerings', impact?.activeOfferingCount ?? cycle.activeOfferingCount],
    ['Applications', impact?.applicationCount ?? cycle.applicationCount],
    ['Submitted', impact?.submittedApplicationCount ?? '—'],
  ];

  return (
    <CustomDialog open handleClose={onClose} title="Admission Cycle Details" maxWidth="sm" hasForm={false}>
      <DialogScrollContent>
        <Stack spacing={2}>
          <Stack spacing={0.75}>
            <Typography variant="h6">{cycle.name}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.secondary">{cycle.code}</Typography>
              <Label color={lifecycleColors[cycle.status]}>{lifecycleLabels[cycle.status]}</Label>
              <Label color={windowColors[cycle.windowStatus]}>{windowLabels[cycle.windowStatus]}</Label>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {cycle.academicYearName || 'Academic year'} · {dayjs(cycle.startDate).format('DD MMM YYYY')}–
              {dayjs(cycle.endDate).format('DD MMM YYYY')}
            </Typography>
            {cycle.description && (
              <Typography variant="body2" color="text.secondary">{cycle.description}</Typography>
            )}
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, columnGap: 2, rowGap: 1.5, py: 0.5 }}>
            {metrics.map(([label, value]) => (
              <Box key={String(label)} sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700}>{impactLoading ? '—' : value}</Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            ))}
          </Box>

          {(cycle.scheduledPublishAt || cycle.scheduledCloseAt) && (
            <Alert severity="info">
              {cycle.scheduledPublishAt && `Scheduled publish: ${dayjs(cycle.scheduledPublishAt).format('DD MMM YYYY, hh:mm A')}`}
              {cycle.scheduledPublishAt && cycle.scheduledCloseAt && ' · '}
              {cycle.scheduledCloseAt && `Scheduled close: ${dayjs(cycle.scheduledCloseAt).format('DD MMM YYYY, hh:mm A')}`}
            </Alert>
          )}

          <Divider />
          <Typography variant="subtitle1">Activity history</Typography>
          {historyLoading && <CircularProgress size={24} />}
          {isError && <Alert severity="error">Unable to load activity history.</Alert>}
          {!historyLoading && !isError && !history.length && (
            <Typography variant="body2" color="text.secondary">No history is available yet.</Typography>
          )}
          <Stack spacing={0}>
            {history.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  position: 'relative',
                  pl: 2.5,
                  pb: index === history.length - 1 ? 0 : 2,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 4,
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
                      top: 16,
                      bottom: 0,
                      left: '3.5px',
                      width: '1px',
                      bgcolor: 'divider',
                    },
                  }),
                }}
              >
                <Typography variant="body2" fontWeight={600}>{item.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(item.occurredAt).format('DD MMM YYYY, hh:mm A')}
                </Typography>
                {item.reason && <Typography variant="body2" sx={{ mt: 0.25 }}>Reason: {item.reason}</Typography>}
              </Box>
            ))}
          </Stack>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose} startIcon={<Iconify icon={GlobalIcons.cancel} />}>
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
