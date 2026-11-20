import type { LibraryReservation } from 'src/redux/library/reservation-types';

import { GlobalIcons } from 'src/utils/icons';
import { Alert, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { reservationDate, ReservationStatus, reservationPerson } from './reservation-display';

export function ReservationDetails({ item }: { item: LibraryReservation }) {
  return (
    <Stack spacing={2}>
      {item.requiresReview && (
        <Alert severity="warning">
          This legacy request needs review before allocation. {item.reviewReason}
        </Alert>
      )}
      <FormSectionCard
        title="Reservation Request"
        icon={GlobalIcons.bookIcon}
        descriptionTooltip="Saved member identity, request state and confirmed school dates. IDs remain visible when a current display label is unavailable."
      >
        <Stack spacing={1}>
          <Typography variant="body2">Member: {reservationPerson(item)}</Typography>
          <Typography variant="body2">
            Role: {item.role === 0 ? 'Student' : item.role === 1 ? 'Staff' : 'Unavailable'}
            {item.classDivision ? ` · ${item.classDivision}` : ''}
          </Typography>
          <div>
            <ReservationStatus state={item.state} />
          </div>
          <Typography variant="body2">
            Requested date: {reservationDate(item.requestedDate, item.requestedDateProvenance)}
          </Typography>
          <Typography variant="body2">
            Request expiry:{' '}
            {reservationDate(item.requestExpiryDate, item.requestExpiryDateProvenance)}
          </Typography>
          {item.pickupLabel && (
            <Typography variant="body2">Requested pickup: {item.pickupLabel}</Typography>
          )}
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            Request ID: {item.id}
          </Typography>
        </Stack>
      </FormSectionCard>
      <FormSectionCard
        title="Copy Allocation"
        icon={GlobalIcons.bookIcon}
        descriptionTooltip="Only the server-assigned copy is reserved for this request. A spare catalogue copy does not establish a hold or collection deadline."
      >
        {item.hold ? (
          <Stack spacing={1}>
            <Typography variant="body2">
              Accession: {item.hold.accessionNumber || 'Unavailable'}
            </Typography>
            <Typography variant="body2">
              Hold state:{' '}
              {['Allocated', 'Collected', 'Released', 'Expired'][item.hold.state] || 'Unknown'}
            </Typography>
            <Typography variant="body2">
              Pickup deadline:{' '}
              {reservationDate(item.hold.pickupDeadline, item.hold.pickupDeadlineProvenance)}
            </Typography>
            <Typography variant="body2">
              School timezone: {item.hold.timeZoneId || 'Not recorded'}
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              Copy ID: {item.hold.copyId}
            </Typography>
            {item.hold.relatedLoanId && (
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                Collected loan ID: {item.hold.relatedLoanId}
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="body2">No copy has been allocated to this request.</Typography>
        )}
      </FormSectionCard>
      {(item.legacyRequestedDate || item.legacyReserveDueDate) && (
        <FormSectionCard
          title="Legacy Date Evidence"
          icon={GlobalIcons.history}
          descriptionTooltip="Original stored timestamp values are preserved as evidence. They are not interpreted as confirmed school dates."
        >
          <Stack spacing={1} sx={{ overflowWrap: 'anywhere' }}>
            <Typography variant="body2">
              Original requested timestamp: {item.legacyRequestedDate || 'Not recorded'}
            </Typography>
            <Typography variant="body2">
              Original expiry timestamp: {item.legacyReserveDueDate || 'Not recorded'}
            </Typography>
          </Stack>
        </FormSectionCard>
      )}
      {item.policy && (
        <FormSectionCard
          title="Saved Policy"
          icon={GlobalIcons.bookIcon}
          descriptionTooltip="This snapshot records the policy used for this request. Editing a current policy does not rewrite the saved decision."
        >
          <Stack spacing={1}>
            <Typography variant="body2">
              Date rules:{' '}
              {item.policy.isLegacyManualDate
                ? 'Legacy manual dates'
                : item.policy.terms.dueDateMode === 0
                  ? 'Published manual dates'
                  : 'Automatic dates'}
            </Typography>
            <Typography variant="body2">
              Policy version: {item.policy.version ?? 'Legacy rules'}
            </Typography>
            <Typography variant="body2">
              Reservation limit: {item.policy.terms.reservationLimit}
            </Typography>
            <Typography variant="body2">
              Pickup window:{' '}
              {item.policy.terms.pickupWindowDays == null
                ? 'Manual date'
                : `${item.policy.terms.pickupWindowDays} ${item.policy.terms.dayCountingMode === 1 ? 'open days' : 'calendar days'}`}
            </Typography>
          </Stack>
        </FormSectionCard>
      )}
    </Stack>
  );
}
