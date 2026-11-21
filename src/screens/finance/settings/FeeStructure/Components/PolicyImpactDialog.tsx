import type {
  PolicyFamily,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetRefundPolicyVersionsQuery } from 'src/redux/finance/refundPolicy';
import { useGetCollectionPolicyVersionsQuery } from 'src/redux/finance/collectionPolicy';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, Skeleton, Typography, DialogActions } from '@mui/material';
import { DetailGrid, DetailField, DetailSection } from 'src/screens/finance/components/detail-view';
import { parsePolicyVersionSnapshot } from 'src/screens/finance/policies/utils/policy-version-page';

import { policyImpactRows } from '../policyImpactModel';
import {
  policyImpactRuleFields,
  policyImpactRowsWithOverrides,
  policyImpactSnapshotCoverage,
} from '../policyImpactDetails';

import type { PolicyImpactRow } from '../policyImpactModel';

interface Props {
  family: PolicyFamily;
  title: string;
  policyLabel: string;
  rows?: PolicyImpactRow[];
  loading: boolean;
  error: boolean;
  canRead: boolean;
  saved: boolean;
  policy?: Record<string, unknown>;
  rulesLoading?: boolean;
  rulesError?: boolean;
  onClose: () => void;
}

const effects: Record<string, { label: string; description: string; covered: boolean }> = {
  'Policy eligible': {
    label: 'Eligible for refunds',
    description: 'Eligible paid amounts can be considered for a refund under this policy.',
    covered: true,
  },
  Excluded: {
    label: 'Excluded',
    description: 'The policy excludes this fee head from refunds.',
    covered: false,
  },
  'Late fee applies': {
    label: 'Late fee applies',
    description: 'This fee head is in scope for late fees under the attached policy.',
    covered: true,
  },
  'Custom late fee': {
    label: 'Custom late-fee rule',
    description: 'This fee head uses its own late-fee rule after the grace period.',
    covered: true,
  },
  'No late fee': {
    label: 'No late fee',
    description: 'This policy does not charge a late fee for this fee head.',
    covered: false,
  },
  'No late fee override': {
    label: 'No late fee',
    description: 'This fee head has an override that disables late fees.',
    covered: false,
  },
};

export function AttachedPolicyImpactDialog({
  candidate,
  settings,
  ...props
}: Omit<Props, 'policy' | 'rulesLoading' | 'rulesError'> & {
  candidate: StructureCandidate;
  settings: StructureSettings;
}) {
  const policyId = candidate[`${props.family}PolicyId`];
  const versionId = candidate[`${props.family}PolicyVersionId`];
  const params = { id: policyId ?? '', versionId: versionId ?? '', maxResultCount: 1 };
  const canFetch = props.canRead && !!policyId && !!versionId;
  const collection = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCollectionPolicyVersionsQuery,
    params,
    options: { skip: !canFetch || props.family !== 'collection', refetchOnMountOrArgChange: false },
    popupConfig: { error: false },
  });
  const refund = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRefundPolicyVersionsQuery,
    params,
    options: { skip: !canFetch || props.family !== 'refund', refetchOnMountOrArgChange: false },
    popupConfig: { error: false },
  });
  const query = props.family === 'refund' ? refund : collection;
  const version = query.currentData?.items?.find(
    (item: { id: string; policyId: string }) => item.id === versionId && item.policyId === policyId
  );
  const snapshot = version && parsePolicyVersionSnapshot(version.snapshotJson);
  const policy = snapshot && Object.keys(snapshot).length ? snapshot : undefined;
  const scope =
    policy && policyId && versionId
      ? policyImpactSnapshotCoverage(props.family, policy, policyId, versionId)
      : undefined;
  return (
    <PolicyImpactDialog
      {...props}
      rows={props.rows ?? (scope && policyImpactRows(props.family, candidate, settings, scope))}
      policy={policy}
      loading={props.loading || !!query.isFetching}
      rulesLoading={!!query.isFetching}
      rulesError={canFetch && !query.isFetching && !policy}
    />
  );
}

export default function PolicyImpactDialog({
  family,
  title,
  policyLabel,
  rows,
  loading,
  error,
  canRead,
  saved,
  policy,
  rulesLoading,
  rulesError,
  onClose,
}: Props) {
  const coverage = policyImpactRowsWithOverrides(family, rows, policy);
  const affected = coverage?.filter((row) => effects[row.treatment]?.covered).length ?? 0;
  const total = coverage?.length ?? 0;
  const showSummary = total > 0 && coverage?.every((row) => effects[row.treatment]);
  const headsLabel = total === 1 ? 'fee head' : 'fee heads';
  const summary =
    family === 'refund'
      ? `This policy covers ${affected} of ${total} ${headsLabel} for refunds.`
      : affected
        ? policy
          ? `Late fees apply to ${affected} of ${total} ${headsLabel}.`
          : `Late-fee scope covers ${affected} of ${total} ${headsLabel}.`
        : 'No fee heads accrue late fees under this policy.';
  const rules = policy ? policyImpactRuleFields(family, policy) : [];
  return (
    <CustomDialog
      open
      title={policyLabel}
      titleInfo="See how the attached policy version affects this fee structure."
      handleClose={onClose}
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {saved && <Label sx={{ alignSelf: 'flex-start' }}>Saved publication review</Label>}
          {(family === 'collection' || family === 'refund') &&
            (showSummary || rules.length > 0 || rulesLoading || rulesError) && (
              <DetailSection
                title="Applied Policy Impact"
                icon={GlobalIcons.documentIcon}
                helpText="Coverage is based on the fee heads in this structure and the attached version’s rules."
              >
                {showSummary && <Typography variant="subtitle2">{summary}</Typography>}
                {family === 'refund' && total > 0 && affected > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    The refund amount depends on eligible paid amounts and any previous refunds.
                  </Typography>
                )}
                {rulesLoading && !policy ? (
                  <Skeleton aria-label="Loading applied policy rules" />
                ) : rules.length > 0 ? (
                  <DetailGrid>
                    {rules.map(({ label, value }) => (
                      <DetailField key={label} label={label} value={value} />
                    ))}
                  </DetailGrid>
                ) : rulesError ? (
                  <Typography variant="body2" color="text.secondary">
                    The saved rules for this version are unavailable.
                  </Typography>
                ) : null}
              </DetailSection>
            )}
          <DetailSection
            title="Fee Head Coverage"
            icon={GlobalIcons.assigned}
            helpText="Shows how each fee head is treated by the attached policy."
          >
            {coverage ? (
              coverage.length ? (
                <CustomizableTable
                  tableTitle="Policy fee head coverage"
                  tableId={`policy-impact-${title}`}
                  variant="embedded"
                  data={coverage.map((row) => ({ ...row, _id: row.id }))}
                  showToolbar={false}
                  isPagination={coverage.length > 10}
                  isSearch={false}
                  isFilter={false}
                  isShowedDense={false}
                  columns={[
                    {
                      id: 'name',
                      label: 'Fee head',
                      minWidth: 180,
                      isFilter: false,
                      isSort: false,
                      render: (value) => (
                        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                          {value}
                        </Typography>
                      ),
                    },
                    {
                      id: 'treatment',
                      label: 'Effect on this fee head',
                      minWidth: 230,
                      isFilter: false,
                      isSort: false,
                      render: (value) => (
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Label color={effects[value]?.covered ? 'success' : 'default'}>
                            {effects[value]?.label ?? value}
                          </Label>
                          {effects[value] && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ whiteSpace: 'normal' }}
                            >
                              {effects[value].description}
                            </Typography>
                          )}
                        </Stack>
                      ),
                    },
                  ]}
                />
              ) : (
                <EmptyContent
                  title="No fee heads have been added to this structure."
                  sx={{ py: 2 }}
                />
              )
            ) : loading ? (
              <Stack aria-label="Loading fee head impact" role="status" spacing={1}>
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : (
              <Alert severity={error ? 'error' : 'info'}>
                {!canRead
                  ? 'Policy details are unavailable with your current access.'
                  : error
                    ? 'Policy details could not be loaded. Close this dialog and retry.'
                    : 'Fee head details for this selected version are not available here.'}
              </Alert>
            )}
          </DetailSection>
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
