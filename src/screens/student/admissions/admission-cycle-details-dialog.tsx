'use client';

import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Chip, Alert, Stack, Button, Divider, Typography, DialogActions, CircularProgress } from '@mui/material';
import {
  type AdmissionCycle,
  useGetAdmissionCycleImpactQuery,
  useGetAdmissionCycleHistoryQuery,
} from 'src/redux/student/admissions/admission-cycles-api';

import { windowLabels, lifecycleLabels } from './admission-cycle-model';

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
    <CustomDialog open handleClose={onClose} title="Admission Cycle Details" maxWidth="sm">
      <DialogScrollContent>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6">{cycle.name}</Typography>
              <Chip size="small" label={cycle.code} variant="outlined" />
              <Chip size="small" label={lifecycleLabels[cycle.status]} />
              <Chip
                size="small"
                color={cycle.isAcceptingApplications ? 'success' : 'default'}
                label={windowLabels[cycle.windowStatus]}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {cycle.academicYearName || 'Academic year'} · {dayjs(cycle.startDate).format('DD MMM YYYY')}–
              {dayjs(cycle.endDate).format('DD MMM YYYY')}
            </Typography>
            {cycle.description && <Typography sx={{ mt: 1 }}>{cycle.description}</Typography>}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
            {metrics.map(([label, value]) => (
              <Box key={String(label)} sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h6">{impactLoading ? '—' : value}</Typography>
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
          <Stack spacing={1.5}>
            {history.map((item) => (
              <Box key={item.id} sx={{ pl: 1.5, borderLeft: 2, borderColor: 'divider' }}>
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
