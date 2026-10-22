'use client';

import React from 'react';
import { Label } from 'src/components/label';

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
  IconButton,
} from '@mui/material';

import {
  formatVersionTimestamp,
  contextFromRefundSnapshot,
  formatFinancePolicyVersionField,
  formatFinancePolicyVersionValue,
} from './finance-policy-version-formatters';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';
import type { VersionValueContext } from './finance-policy-version-formatters';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

interface VersionDiffTableProps {
  selectedVersion: PolicyVersion;
  valueContext?: VersionValueContext;
  showSummary?: boolean;
}

const STATUS_COLORS = {
  Active: 'success',
  Archived: 'default',
  Draft: 'warning',
  Inactive: 'error',
  Published: 'success',
} as const;

const renderValueCell = (fieldName: string, value: unknown, valueContext?: VersionValueContext) => {
  const formatted = formatFinancePolicyVersionValue(fieldName, value, valueContext);
  if (formatted.kind === 'status') {
    return (
      <Label color={STATUS_COLORS[formatted.text as keyof typeof STATUS_COLORS] || 'default'}>
        {formatted.text}
      </Label>
    );
  }
  return (
    <Typography
      variant="body2"
      color={formatted.kind === 'empty' ? 'text.secondary' : 'text.primary'}
      sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
    >
      {formatted.text === 'Empty' && formatted.kind === 'empty' ? '—' : formatted.text}
    </Typography>
  );
};

function VersionDiffTable({
  selectedVersion,
  valueContext,
  showSummary = true,
}: VersionDiffTableProps) {
  return (
    <Stack spacing={2}>
      {showSummary && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography variant="subtitle1" component="h3">
              Version {selectedVersion.versionNumber}
            </Typography>
            {selectedVersion.status &&
              renderValueCell('status', selectedVersion.status, valueContext)}
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 2 }}
            sx={{ mt: 1 }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              By {selectedVersion.actor || 'System'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatVersionTimestamp(selectedVersion.date)}
            </Typography>
          </Stack>
          <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Change reason
              </Typography>
              <CustomTooltip
                placement="right"
                arrow
                title="The reason recorded when this version was created. Older snapshots may have no recorded reason."
              >
                <IconButton size="small" aria-label="Change reason information">
                  <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
                </IconButton>
              </CustomTooltip>
            </Stack>
            <Typography variant="body2" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
              {selectedVersion.changeReason || 'No reason recorded'}
            </Typography>
          </Box>
        </Paper>
      )}
      <Box>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="subtitle1" component="h3">
              Changes
            </Typography>
            <CustomTooltip
              placement="right"
              arrow
              title="Before shows the previous version's recorded value. After shows the selected version's value. The first version has no previous snapshot; a dash (—) means no value was recorded."
            >
              <IconButton size="small" aria-label="Version changes information">
                <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <Label color="default">
            {selectedVersion.changedFields.length}{' '}
            {selectedVersion.changedFields.length === 1 ? 'field' : 'fields'}
          </Label>
        </Stack>
        {selectedVersion.changedFields.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No changes recorded for this version.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table
              size="small"
              aria-label={`Changes in version ${selectedVersion.versionNumber}`}
              sx={{
                tableLayout: 'fixed',
                '& th, & td': {
                  verticalAlign: 'top',
                  overflowWrap: 'anywhere',
                  px: { xs: 1, sm: 1.5 },
                  py: 1.25,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '30%' }}>Field</TableCell>
                  <TableCell sx={{ width: '35%' }}>Before</TableCell>
                  <TableCell sx={{ width: '35%' }}>After</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedVersion.changedFields.map((field) => (
                  <TableRow key={field.field} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight={600}>
                        {formatFinancePolicyVersionField(field.field)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {renderValueCell(
                        field.field,
                        field.oldValue,
                        contextFromRefundSnapshot(selectedVersion.snapshotBefore, valueContext)
                      )}
                    </TableCell>
                    <TableCell>
                      {renderValueCell(
                        field.field,
                        field.newValue,
                        contextFromRefundSnapshot(selectedVersion.snapshotAfter, valueContext)
                      )}
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
