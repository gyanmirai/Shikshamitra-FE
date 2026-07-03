'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { AuditSource } from '../../types/auditLogs.types';
import { SOURCE_ICONS, SOURCE_LABELS, SOURCE_COLOR_KEYS } from '../../constants/auditLogs.constants';

interface Props {
  source?: AuditSource;
}

/** Compact source badge (Web / Mobile / API / Bulk Upload / System). */
const AuditSourceBadge = ({ source }: Props) => {
  // Server data may omit the source — render nothing instead of an empty chip.
  if (!SOURCE_LABELS[source]) return null;

  return (
    <Label
      variant="soft"
      color={SOURCE_COLOR_KEYS[source] as any}
      startIcon={<Iconify icon={SOURCE_ICONS[source]} width={12} />}
      sx={{
        fontWeight: 600,
        fontSize: '10px',
        height: 20,
        textTransform: 'capitalize',
      }}
    >
      {SOURCE_LABELS[source]}
    </Label>
  );
};

export default AuditSourceBadge;
