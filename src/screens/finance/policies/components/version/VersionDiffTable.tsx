'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/screens/finance/components/detail-view';
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
  IconButton,
  TableContainer,
} from '@mui/material';

import VersionHistorySection from './VersionHistorySection';
import { getPolicyFormHistory } from './policy-form-history';
import {
  formatVersionTimestamp,
  contextFromRefundSnapshot,
  formatFinancePolicyVersionField,
  formatFinancePolicyVersionValue,
} from './finance-policy-version-formatters';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';
import type { VersionValueContext } from './finance-policy-version-formatters';

interface VersionDiffTableProps {
  selectedVersion: PolicyVersion;
  valueContext?: VersionValueContext;
  showSummary?: boolean;
  showChangeReason?: boolean;
  collapsibleChanges?: boolean;
  showSavedDetails?: boolean;
  noChangesMessage?: string;
  renderFieldValue?: (fieldName: string, value: unknown) => React.ReactNode;
}

const STATUS_COLORS = {
  Active: 'success',
  Archived: 'default',
  Draft: 'warning',
  Inactive: 'error',
  Published: 'success',
} as const;

const SNAPSHOT_METADATA_FIELDS = new Set([
  'id',
  'policyid',
  'tenantid',
  'concurrencystamp',
  'version',
  'versionnumber',
  'currentversionid',
  'currentversionnumber',
  'isusedindownstream',
  'createdby',
  'updatedby',
  'creatorid',
  'creatorusername',
  'creationtime',
  'createdat',
  'updatedat',
  'lastmodificationtime',
  'lastmodifierid',
  'feeheadnames',
  'expensecategoryname',
  'defaultpayingbankaccountname',
]);

function ChangesSection({
  collapsible,
  children,
}: {
  collapsible: boolean;
  children: React.ReactNode;
}) {
  if (!collapsible) return <Box>{children}</Box>;

  return (
    <VersionHistorySection
      title="Changes"
      helpText="Before shows the previous version's recorded value. After shows the selected version's value. The first version has no previous snapshot; a dash (—) means no value was recorded."
      helpLabel="Version changes information"
      defaultExpanded
    >
      {children}
    </VersionHistorySection>
  );
}

const renderValueCell = (fieldName: string, value: unknown, valueContext?: VersionValueContext) => {
  const formatted = formatFinancePolicyVersionValue(fieldName, value, valueContext);
  if (formatted.kind === 'status') {
    return (
      <Label color={STATUS_COLORS[formatted.text as keyof typeof STATUS_COLORS] || 'default'}>
        {formatted.text}
      </Label>
    );
  }
  if (formatted.kind === 'proration-rules') {
    return (
      <Stack
        component="ul"
        role="list"
        spacing={1.25}
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          overflowWrap: 'anywhere',
          '& > li + li': { pt: 1.25, borderTop: 1, borderColor: 'divider' },
        }}
      >
        {formatted.rules.map(({ name, admission, earlyWithdrawal }, index) => (
          <Stack component="li" key={`${name}-${index}`} spacing={0.75}>
            <Typography component="div" variant="body2" fontWeight={600}>
              {name}
            </Typography>
            {admission && (
              <DetailField label="Admission" value={admission.replaceAll(' · ', '\n')} />
            )}
            {earlyWithdrawal && (
              <DetailField
                label="Early withdrawal"
                value={earlyWithdrawal.replaceAll(' · ', '\n')}
              />
            )}
          </Stack>
        ))}
      </Stack>
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
  showChangeReason = true,
  collapsibleChanges = false,
  showSavedDetails = false,
  noChangesMessage = 'No changes recorded for this version.',
  renderFieldValue,
}: VersionDiffTableProps) {
  const policyHistory = getPolicyFormHistory(selectedVersion, valueContext?.policyType);
  const changedFields = policyHistory?.changedFields ?? selectedVersion.changedFields;
  const snapshotFields =
    policyHistory?.snapshotFields ??
    Object.entries(selectedVersion.snapshotAfter ?? {}).filter(
      ([field]) =>
        !SNAPSHOT_METADATA_FIELDS.has(field.toLowerCase()) &&
        !(
          field.toLowerCase() === 'academicyearname' &&
          (selectedVersion.snapshotAfter?.AcademicYearId ||
            selectedVersion.snapshotAfter?.academicYearId)
        )
    );
  const snapshotContext = contextFromRefundSnapshot(selectedVersion.snapshotAfter, valueContext);
  const renderField = (fieldName: string, value: unknown, context?: VersionValueContext) => {
    const customValue = renderFieldValue?.(fieldName, value);
    return customValue === undefined ? renderValueCell(fieldName, value, context) : customValue;
  };

  return (
    <Stack spacing={collapsibleChanges ? 1 : 2}>
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
          {showChangeReason && (
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
                    <Iconify
                      icon="lucide:info"
                      width={16}
                      sx={{ color: 'info.main' }}
                      aria-hidden
                    />
                  </IconButton>
                </CustomTooltip>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                {selectedVersion.changeReason || 'No reason recorded'}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      <ChangesSection key={selectedVersion.eventId} collapsible={collapsibleChanges}>
        {!collapsibleChanges && (
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
          </Stack>
        )}
        {changedFields.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {noChangesMessage}
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
                  <TableCell
                    sx={{
                      width: {
                        xs: valueContext?.policyType === 'proration' ? '34%' : '30%',
                        sm: '30%',
                      },
                    }}
                  >
                    Field
                  </TableCell>
                  <TableCell>Before</TableCell>
                  <TableCell>After</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changedFields.map((field) => (
                  <TableRow key={field.field} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight={600}>
                        {formatFinancePolicyVersionField(field.field, valueContext)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {renderField(
                        field.field,
                        field.oldValue,
                        contextFromRefundSnapshot(selectedVersion.snapshotBefore, valueContext)
                      )}
                    </TableCell>
                    <TableCell>
                      {renderField(
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
      </ChangesSection>
      {showSavedDetails && snapshotFields.length > 0 && (
        <VersionHistorySection
          key={`snapshot-${selectedVersion.eventId}`}
          title="Saved version details"
          helpText="The selected version's recorded policy settings. These details come from its saved snapshot."
        >
          <FormSectionCard
            title={`Version ${selectedVersion.versionNumber}`}
            icon={GlobalIcons.notebook}
            descriptionTooltip="The policy settings saved with this version, including values that did not change."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            sx={{ minWidth: 0, boxShadow: 'none', containerType: 'inline-size' }}
          >
            <DetailGrid>
              {snapshotFields.map(([field, value]) => (
                <DetailField
                  key={field}
                  fullWidth={Boolean(policyHistory) && Array.isArray(value)}
                  label={formatFinancePolicyVersionField(field, valueContext).replace(
                    /\b[A-Z][a-z]+/g,
                    (word, index) => (index === 0 ? word : word.toLowerCase())
                  )}
                  value={renderValueCell(field, value, snapshotContext)}
                />
              ))}
            </DetailGrid>
          </FormSectionCard>
        </VersionHistorySection>
      )}
    </Stack>
  );
}

export default React.memo(VersionDiffTable);
