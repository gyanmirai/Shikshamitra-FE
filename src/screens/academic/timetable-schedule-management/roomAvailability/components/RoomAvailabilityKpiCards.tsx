import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, Tooltip, Skeleton, Typography } from '@mui/material';

import type { RoomAvailabilitySummary, RoomAvailabilityFilters } from '../types';

interface RoomAvailabilityKpiCardsProps {
  summary: RoomAvailabilitySummary | null;
  isLoading?: boolean;
  onFilterClick?: (patch: Partial<RoomAvailabilityFilters>) => void;
}

export const RoomAvailabilityKpiCards = ({
  summary,
  isLoading,
  onFilterClick,
}: RoomAvailabilityKpiCardsProps) => {
  if (isLoading || !summary) {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} sx={{ flex: 1, p: 2 }}>
            <Skeleton variant="rectangular" height={70} />
          </Card>
        ))}
      </Stack>
    );
  }

  const cards = [
    {
      label: 'Free Rooms',
      value: summary.freeRooms,
      icon: 'mdi:door-open',
      color: 'success.main',
      bgcolor: 'success.lighter',
      subtitle: `${summary.freeRoomPercentage}% available`,
      context: summary.bestAvailableRoom
        ? `Best: ${summary.bestAvailableRoom} · ${summary.bestAvailableRoomCapacity} seats`
        : undefined,
      filterPatch: { status: 'available', onlyAvailable: true } as Partial<RoomAvailabilityFilters>,
      tooltip: 'Click to show only available rooms',
    },
    {
      label: 'Occupied Rooms',
      value: summary.occupiedRooms,
      icon: 'mdi:account-multiple',
      color: 'warning.main',
      bgcolor: 'warning.lighter',
      subtitle: 'In use via timetable',
      context: summary.nextFreeingRoom
        ? `${summary.nextFreeingRoom} frees at ${summary.nextFreeingTime}`
        : undefined,
      filterPatch: { status: 'occupied' } as Partial<RoomAvailabilityFilters>,
      tooltip: 'Click to show only occupied rooms',
    },
    {
      label: 'Active Reservations',
      value: summary.activeReservations,
      icon: 'mdi:calendar-check',
      color: 'info.main',
      bgcolor: 'info.lighter',
      subtitle: 'Reserved slots',
      context: summary.nextReservation
        ? `Next: ${summary.nextReservation} · ${summary.nextReservationTime}`
        : undefined,
      filterPatch: { source: 'Room Reservation' } as Partial<RoomAvailabilityFilters>,
      tooltip: 'Click to show reserved rooms',
    },
    {
      label: 'Conflicts Visible',
      value: summary.conflictsVisible,
      icon: 'mdi:alert-circle-outline',
      color: 'error.main',
      bgcolor: 'error.lighter',
      subtitle: undefined,
      context: undefined,
      extra:
        summary.conflictsVisible > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            {summary.criticalConflicts > 0 && (
              <Chip
                size="small"
                label={`${summary.criticalConflicts} Critical`}
                color="error"
                variant="soft"
                sx={{ fontSize: 10 }}
              />
            )}
            {summary.warningConflicts > 0 && (
              <Chip
                size="small"
                label={`${summary.warningConflicts} Warning`}
                color="warning"
                variant="soft"
                sx={{ fontSize: 10 }}
              />
            )}
          </Stack>
        ) : null,
      filterPatch: { conflictSeverity: 'critical' } as Partial<RoomAvailabilityFilters>,
      tooltip: 'Click to show rooms with conflicts',
    },
  ];

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      {cards.map((card) => (
        <Tooltip key={card.label} title={card.tooltip} arrow>
          <Card
            onClick={() => onFilterClick?.(card.filterPatch)}
            sx={{
              flex: 1,
              borderRadius: 2,
              cursor: onFilterClick ? 'pointer' : 'default',
              transition: 'all 0.15s',
              '&:hover': onFilterClick ? { transform: 'translateY(-2px)', boxShadow: 4 } : {},
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    display: 'grid',
                    borderRadius: 1.5,
                    placeItems: 'center',
                    color: card.color,
                    bgcolor: card.bgcolor,
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={card.icon} width={24} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {card.label}
                  </Typography>
                  {card.subtitle && (
                    <Typography variant="caption" color="text.disabled" noWrap>
                      {card.subtitle}
                    </Typography>
                  )}
                  {card.context && (
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                      {card.context}
                    </Typography>
                  )}
                  {card.extra}
                </Box>
              </Stack>
            </Box>
          </Card>
        </Tooltip>
      ))}
    </Stack>
  );
};
