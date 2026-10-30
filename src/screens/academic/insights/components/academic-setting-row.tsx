import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Link, Stack, Typography } from '@mui/material';

import type { AcademicSettingRow } from './academic-settings-data';

export function AcademicSettingStatusRow({ row }: { row: AcademicSettingRow }) {
  const state =
    row.status === 'configured'
      ? { text: 'Records available', color: 'default' as const }
      : row.status === 'empty'
        ? { text: 'No records', color: 'warning' as const }
        : row.status === 'context-required'
          ? { text: 'Class needed', color: 'info' as const }
          : { text: 'Unavailable', color: 'default' as const };
  return (
    <Stack
      component="li"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{
        py: 1,
        minWidth: 0,
        flexWrap: 'wrap',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {row.href ? (
        <Link
          component={NextLink}
          href={row.href}
          color="inherit"
          underline="hover"
          variant="body2"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            py: 0.5,
            fontWeight: 500,
            overflowWrap: 'anywhere',
            width: 'fit-content',
            maxWidth: 1,
          }}
        >
          <Box component="span" sx={{ minWidth: 0 }}>
            {row.label}
          </Box>
          <Iconify
            icon={GlobalIcons.eye}
            width={16}
            aria-hidden
            sx={{ flexShrink: 0, color: 'text.secondary' }}
          />
        </Link>
      ) : (
        <Typography variant="body2" sx={{ py: 0.5, fontWeight: 500, overflowWrap: 'anywhere' }}>
          {row.label}
        </Typography>
      )}
      <Box>
        <Label color={state.color} variant="soft">
          {state.text}
        </Label>
      </Box>
    </Stack>
  );
}
