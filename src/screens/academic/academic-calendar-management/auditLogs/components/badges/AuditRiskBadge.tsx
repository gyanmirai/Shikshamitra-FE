'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Tooltip, Stack, Box } from '@mui/material';

import { AuditRiskLevel } from '../../types/auditLogs.types';
import {
  RISK_LABELS,
  RISK_COLOR_KEYS,
  RISK_ICONS,
  RISK_EXPLANATIONS,
} from '../../constants/auditLogs.constants';

interface Props {
  level?: AuditRiskLevel;
  showTooltip?: boolean;
  size?: 'small' | 'medium';
}

/** Colored risk badge with an explanatory tooltip. */
const AuditRiskBadge = ({ level, showTooltip = true, size = 'small' }: Props) => {
  const label = RISK_LABELS[level];
  const color = RISK_COLOR_KEYS[level];
  const icon = RISK_ICONS[level];
  const explanation = RISK_EXPLANATIONS[level];

  // Server data may omit the risk level — render nothing instead of an empty chip.
  if (!label) return null;

  const content = (
    <Label
      variant="filled"
      color={color as any}
      startIcon={<Iconify icon={icon} width={size === 'small' ? 12 : 14} />}
      sx={{
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: size === 'small' ? '10px' : '11px',
        height: size === 'small' ? 22 : 26,
        letterSpacing: 0.4,
      }}
    >
      {label}
    </Label>
  );

  if (!showTooltip) return content;

  return (
    <Tooltip
      title={
        <Stack spacing={0.5} sx={{ p: 0.5 }}>
          <Box sx={{ fontWeight: 700 }}>{label} Risk</Box>
          <Box sx={{ opacity: 0.85, fontSize: '12px' }}>{explanation}</Box>
        </Stack>
      }
      arrow
      placement="top"
    >
      <Box component="span" sx={{ display: 'inline-flex' }}>
        {content}
      </Box>
    </Tooltip>
  );
};

export default AuditRiskBadge;
