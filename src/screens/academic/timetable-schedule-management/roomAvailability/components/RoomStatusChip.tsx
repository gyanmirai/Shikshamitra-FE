import { Chip, Tooltip } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import {
  ROOM_STATUS_ICONS,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
  CONFLICT_SEVERITY_LABELS,
  CONFLICT_SEVERITY_COLORS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
} from '../roomAvailability.constants';

import type { RoomStatus, ConflictSeverity, ReservationStatus } from '../types';

// ─── Room Status Chip ─────────────────────────────────────────────────────────
interface RoomStatusChipProps {
  status: RoomStatus;
  showIcon?: boolean;
  size?: 'small' | 'medium';
  tooltip?: string;
}

export const RoomStatusChip = ({
  status,
  showIcon = true,
  size = 'small',
  tooltip,
}: RoomStatusChipProps) => {
  const chip = (
    <Chip
      size={size}
      label={ROOM_STATUS_LABELS[status]}
      color={ROOM_STATUS_COLORS[status]}
      variant="soft"
      icon={showIcon ? <Iconify icon={ROOM_STATUS_ICONS[status]} width={14} /> : undefined}
    />
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{chip}</Tooltip>;
  }
  return chip;
};

// ─── Conflict Severity Chip ───────────────────────────────────────────────────
interface ConflictSeverityChipProps {
  severity: ConflictSeverity;
  size?: 'small' | 'medium';
}

export const ConflictSeverityChip = ({ severity, size = 'small' }: ConflictSeverityChipProps) => (
  <Chip
    size={size}
    label={CONFLICT_SEVERITY_LABELS[severity]}
    color={CONFLICT_SEVERITY_COLORS[severity]}
    variant="soft"
    icon={
      <Iconify
        icon={
          severity === 'critical'
            ? 'mdi:alert-circle'
            : severity === 'warning'
              ? 'mdi:alert'
              : 'mdi:information'
        }
        width={14}
      />
    }
  />
);

// ─── Reservation Status Chip ──────────────────────────────────────────────────
interface ReservationStatusChipProps {
  status: ReservationStatus;
  size?: 'small' | 'medium';
}

export const ReservationStatusChip = ({ status, size = 'small' }: ReservationStatusChipProps) => (
  <Chip
    size={size}
    label={RESERVATION_STATUS_LABELS[status]}
    color={RESERVATION_STATUS_COLORS[status]}
    variant="soft"
  />
);

// ─── Approval Status Chip ─────────────────────────────────────────────────────
interface ApprovalStatusChipProps {
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'none';
  size?: 'small' | 'medium';
}

export const ApprovalStatusChip = ({ status, size = 'small' }: ApprovalStatusChipProps) => {
  const map = {
    pending: { label: 'Pending', color: 'warning' as const, icon: 'mdi:clock-outline' },
    approved: { label: 'Approved', color: 'success' as const, icon: 'mdi:check-circle' },
    rejected: { label: 'Rejected', color: 'error' as const, icon: 'mdi:close-circle' },
    cancelled: { label: 'Cancelled', color: 'default' as const, icon: 'mdi:cancel' },
    none: { label: '—', color: 'default' as const, icon: 'mdi:minus' },
  };
  const config = map[status] || map.none;
  return (
    <Chip
      size={size}
      label={config.label}
      color={config.color}
      variant="soft"
    />
  );
};
