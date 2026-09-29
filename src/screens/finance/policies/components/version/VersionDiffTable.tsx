'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  Table,
  Paper,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
} from '@mui/material';

import {
  formatFinancePolicyVersionField,
  formatVersionTimestamp,
  formatFinancePolicyVersionValue,
} from './finance-policy-version-formatters';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';
import type { VersionValueContext } from './finance-policy-version-formatters';

interface VersionDiffTableProps {
  selectedVersion: PolicyVersion;
  valueContext?: VersionValueContext;
}

const STATUS_COLORS = {
  Active: 'success',
  Archived: 'default',
  Draft: 'warning',
  Inactive: 'error',
  Published: 'success',
} as const;

const renderValueCell = (
  fieldName: string,
  value: unknown,
  valueContext?: VersionValueContext
) => {
  const formatted = formatFinancePolicyVersionValue(fieldName, value, valueContext);

  if (formatted.kind === 'boolean') {
    return (
      <Label color={formatted.text === 'Yes' ? 'success' : 'default'} sx={{ height: 20, fontSize: '0.7rem' }}>
        {formatted.text}
      </Label>
    );
  }

  if (formatted.kind === 'status') {
    return (
      <Label color={STATUS_COLORS[formatted.text as keyof typeof STATUS_COLORS] || 'default'} sx={{ height: 20, fontSize: '0.7rem' }}>
        {formatted.text}
      </Label>
    );
  }

  if (formatted.kind === 'empty') {
    return (
      <Typography variant="caption" color="text.secondary">
        {formatted.text}
      </Typography>
    );
  }

  return (
    <Typography variant="body2" color="inherit" sx={{ overflowWrap: 'anywhere', fontSize: '13px' }}>
      {formatted.text}
    </Typography>
  );
};

function VersionDiffTable({ selectedVersion, valueContext }: VersionDiffTableProps) {
  const formattedDateTime = selectedVersion.date
    ? formatVersionTimestamp(selectedVersion.date)
    : '—';

  return (
    <Stack spacing={2.5}>
      {/* Version Summary Card */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.95),
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                Version {selectedVersion.versionNumber} Snapshot
              </Typography>
              <Label color="primary" sx={{ height: 20, fontSize: '0.65rem' }}>
                v{selectedVersion.versionNumber}
              </Label>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Modified by:</strong> {selectedVersion.actor}
              </Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                <strong>Timestamp:</strong> {formattedDateTime}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {selectedVersion.summary && (
          <Box
            sx={{
              mt: 1.25,
              p: 1.25,
              bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
              {selectedVersion.summary}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Changed Fields Diff Table */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Field Modifications & State Diffs
          </Typography>
          <Label color="default" sx={{ height: 20, fontSize: '0.65rem' }}>
            {selectedVersion.changedFields.length} field(s) changed
          </Label>
        </Stack>

        {selectedVersion.changedFields.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderStyle: 'dashed',
              borderRadius: 1.5,
            }}
          >
            <Iconify
              icon="solar:info-circle-bold"
              width={32}
              height={32}
              sx={{ color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Initial policy baseline creation.
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block">
              All policy parameters initialized with base creation values.
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 1.5, overflow: 'hidden' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08) }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>Field Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>Previous State</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', py: 1 }}>Updated State</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedVersion.changedFields.map((field, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      '&:hover': { bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4) },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, fontSize: '12px', py: 1 }}>
                      {formatFinancePolicyVersionField(field.field)}
                    </TableCell>
                    <TableCell sx={{ py: 1, color: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.03) }}>
                      {renderValueCell(field.field, field.oldValue, valueContext)}
                    </TableCell>
                    <TableCell sx={{ py: 1, color: 'success.main', bgcolor: (theme) => alpha(theme.palette.success.main, 0.03) }}>
                      {renderValueCell(field.field, field.newValue, valueContext)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Stack>
  );
}

export default React.memo(VersionDiffTable);
