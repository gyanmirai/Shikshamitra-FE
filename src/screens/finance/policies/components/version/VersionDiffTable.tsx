'use client';

import React from 'react';
import { Label } from 'src/components/label';
import {
  Box,
  Chip,
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
      <Chip
        label={formatted.text}
        size="small"
        color={formatted.text === 'Yes' ? 'success' : 'error'}
        variant="outlined"
      />
    );
  }

  if (formatted.kind === 'status') {
    return (
      <Label color={STATUS_COLORS[formatted.text as keyof typeof STATUS_COLORS] || 'default'}>
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
    <Typography variant="caption" color="inherit" sx={{ overflowWrap: 'anywhere' }}>
      {formatted.text}
    </Typography>
  );
};

function VersionDiffTable({ selectedVersion, valueContext }: VersionDiffTableProps) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
          Version {selectedVersion.versionNumber} Changes
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Modified by:</strong> {selectedVersion.actor}
          </Typography>
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            <strong>Date:</strong> {selectedVersion.date}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{
            mt: 1.5,
            p: 1.5,
            bgcolor: 'background.neutral',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {selectedVersion.summary}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Field Modifications Diff
        </Typography>
        {selectedVersion.changedFields.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Initial creation: all policy fields set to default initial values.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Field Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Previous Value</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>New Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedVersion.changedFields.map((field, idx) => (
                  <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatFinancePolicyVersionField(field.field)}
                    </TableCell>
                    <TableCell sx={{ color: 'error.main' }}>
                      {renderValueCell(field.field, field.oldValue, valueContext)}
                    </TableCell>
                    <TableCell sx={{ color: 'success.main' }}>
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

/**
 * Memoization Justification:
 * Avoids re-rendering diff tables unless the version to display updates referentially.
 */
export default React.memo(VersionDiffTable);
