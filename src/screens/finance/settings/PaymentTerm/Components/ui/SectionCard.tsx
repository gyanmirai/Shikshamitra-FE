import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import { InfoTooltipIcon } from 'src/screens/hr/policies/components/HRPolicySharedUI';

// ---------------------------------------------------------------------------
// SectionCard — labelled card wrapper used throughout PaymentTermForm sections
// ---------------------------------------------------------------------------
interface SectionCardProps {
  title: string;
  subtitle?: string;
  info?: string;
  /** Optional action element rendered in the card header (e.g. an "Add" button) */
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, subtitle, info, action, children }: SectionCardProps) {
  const hasContent = React.Children.toArray(children).filter(Boolean).length > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2.5,
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
        borderRadius: 2,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: hasContent ? '1px solid' : 'none',
          borderColor: 'divider',
          borderRadius: hasContent ? '8px 8px 0 0' : 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography variant="h6" fontWeight={700} lineHeight={1.4}>
              {title}
            </Typography>
            {info ? <InfoTooltipIcon title={info} /> : null}
          </Stack>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {hasContent && <Box sx={{ p: 2.5 }}>{children}</Box>}
    </Card>
  );
}
