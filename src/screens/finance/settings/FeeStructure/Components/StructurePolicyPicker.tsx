import type {
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Label } from 'src/components/label';
import { shikshaMitraToast } from 'src/components/toast';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  List,
  Paper,
  Alert,
  Stack,
  Button,
  Skeleton,
  ListItem,
  TextField,
  Typography,
  ListItemButton,
} from '@mui/material';

import StructurePolicyPreview from './StructurePolicyPreview';
import { policyImpactRows, refundPolicyMatchesHeads } from '../policyImpactModel';

import type { ImpactPolicyData } from '../policyImpactModel';
import type { StructurePolicyFamily } from '../feeStructureModel';
import type { StructurePolicyImpact } from './FeeStructurePoliciesStep';

export interface StructurePolicyCatalog {
  items: ImpactPolicyData[];
  loading: boolean;
  error: boolean;
  retry: () => void;
}

interface Props {
  family: Pick<StructurePolicyImpact, 'key' | 'label' | 'description'>;
  candidate: StructureCandidate;
  settings: StructureSettings;
  catalog: StructurePolicyCatalog;
  canSelect: boolean;
  busy: boolean;
  onChange: (family: StructurePolicyFamily, version: string) => void;
  onClose: () => void;
}

export default function StructurePolicyPicker({
  family,
  candidate,
  settings,
  catalog,
  canSelect,
  busy,
  onChange,
  onClose,
}: Props) {
  const { key, label, description } = family;
  const [search, setSearch] = useState('');
  const [previewVersionId, setPreviewVersionId] = useState<string>();
  const refreshOnClose = useRef(false);
  const previewPane = useRef<HTMLDivElement>(null);
  const markCatalogForRefresh = useCallback(() => {
    refreshOnClose.current = true;
  }, []);
  const query = search.trim().toLowerCase();
  const attachedVersionId = candidate[`${key}PolicyVersionId`]?.trim().toLowerCase();
  const attachedPolicyId = candidate[`${key}PolicyId`]?.trim().toLowerCase();
  const options = settings.policies
    .filter((policy) => policy.family === key && policy.name.toLowerCase().includes(query))
    .map((policy) => {
      const selected = attachedVersionId
        ? policy.versionId.trim().toLowerCase() === attachedVersionId
        : policy.id.trim().toLowerCase() === attachedPolicyId;
      const detail = catalog.items.find(
        (item) => item.id === policy.id && item.currentVersionId === policy.versionId
      );
      const refund = key === 'refund' ? (policy.feeHeadScope ? policy : detail) : undefined;
      const eligible = refundPolicyMatchesHeads(refund, candidate.feeHeads);
      const refundHeads =
        refund?.feeHeadScope === 'AllFeeHeads'
          ? ['All fee heads']
          : (refund?.applicableFeeHeadIds?.map(
              (id) =>
                policy.feeHeadNames?.[id] ??
                settings.heads.find((head) => head.id === id)?.name ??
                'Fee head name unavailable'
            ) ?? []);
      const coverage =
        key === 'collection'
          ? policyImpactRows(
              key,
              {
                ...candidate,
                collectionPolicyId: policy.id,
                collectionPolicyVersionId: policy.versionId,
              },
              settings,
              detail
            )
          : undefined;
      return { policy, selected, eligible, refundHeads, coverage };
    });
  const preview =
    options.find(({ policy }) => policy.versionId === previewVersionId) ??
    options.find(({ selected }) => selected) ??
    options[0];
  const shownVersionId = preview?.policy.versionId;

  useEffect(() => {
    if (previewPane.current) previewPane.current.scrollTop = 0;
  }, [shownVersionId]);

  const close = () => {
    if (busy) return;
    if (refreshOnClose.current) catalog.retry();
    onClose();
  };

  const select = (versionId: string) => {
    onChange(key, versionId);
    if (versionId) shikshaMitraToast.success({ message: `${label} added to this draft.` });
    close();
  };

  return (
    <CustomDialog
      open
      title={`Choose ${label}`}
      titleInfo={description}
      maxWidth="lg"
      hasForm={false}
      guardUnsavedChanges={false}
      disableClose={busy}
      handleClose={close}
    >
      <DialogScrollContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(280px, 2fr) minmax(0, 3fr)' },
            height: { md: 'min(620px, calc(100dvh - 160px))' },
            gap: 2,
          }}
        >
          <Paper
            variant="outlined"
            sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
          >
            <Stack spacing={1} sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                size="small"
                label="Search policies"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                slotProps={{ htmlInput: { 'aria-label': `Search ${label.toLowerCase()} choices` } }}
              />
              {key === 'proration' && (
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  disabled={!canSelect}
                  onClick={() => select('')}
                >
                  Use academic-year default
                </Button>
              )}
              {catalog.error && (
                <Alert
                  severity="error"
                  action={
                    <Button size="small" onClick={catalog.retry} disabled={busy}>
                      Retry
                    </Button>
                  }
                >
                  Policies could not be loaded.
                </Alert>
              )}
            </Stack>
            <Box sx={{ minHeight: 0, maxHeight: { xs: '32dvh', md: 'none' }, overflowY: 'auto' }}>
              {options.length > 0 ? (
                <List disablePadding aria-label={`${label} choices`}>
                  {options.map(({ policy, selected, eligible, refundHeads, coverage }) => {
                    const identity = `${policy.name} version ${policy.versionNumber}`;
                    const isPreviewed = shownVersionId === policy.versionId;
                    const refundRestriction =
                      key === 'refund' && eligible !== true
                        ? eligible === false
                          ? 'No matching fee heads'
                          : catalog.loading
                            ? 'Checking fee head coverage…'
                            : 'Fee head coverage unavailable'
                        : undefined;
                    return (
                      <ListItem
                        key={policy.versionId}
                        disablePadding
                        divider
                        sx={{ gap: 1, pr: 1.5 }}
                      >
                        <ListItemButton
                          component="button"
                          type="button"
                          aria-label={`Preview ${identity}`}
                          aria-pressed={isPreviewed}
                          selected={isPreviewed}
                          onClick={() => setPreviewVersionId(policy.versionId)}
                          sx={{ alignSelf: 'stretch', textAlign: 'left', minWidth: 0 }}
                        >
                          <Stack
                            component="span"
                            spacing={0.25}
                            sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                          >
                            <Typography component="span" variant="subtitle2">
                              {policy.name}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                              Version {policy.versionNumber}
                              {policy.isDefault ? ' · Default' : ''}
                            </Typography>
                            {key === 'collection' && (
                              <Typography component="span" variant="caption" color="text.secondary">
                                {coverage
                                  ? `Late fees on ${coverage.filter((row) => row.treatment === 'Late fee applies').length} of ${coverage.length} fee heads`
                                  : catalog.loading
                                    ? 'Checking fee head coverage…'
                                    : 'Fee head coverage unavailable'}
                              </Typography>
                            )}
                            {refundHeads.length > 0 && (
                              <Typography component="span" variant="caption" color="text.secondary">
                                {refundHeads.join(', ')}
                              </Typography>
                            )}
                            {refundRestriction && (
                              <Typography component="span" variant="caption" color="text.secondary">
                                {refundRestriction}
                              </Typography>
                            )}
                          </Stack>
                        </ListItemButton>
                        {selected ? (
                          <Label color="success" sx={{ flexShrink: 0 }}>
                            Selected
                          </Label>
                        ) : (
                          <Button
                            type="button"
                            size="small"
                            variant="outlined"
                            aria-label={`Select ${identity}`}
                            disabled={!canSelect || !!refundRestriction}
                            onClick={() => select(policy.versionId)}
                          >
                            Select
                          </Button>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              ) : catalog.loading ? (
                <Stack role="status" aria-label="Loading policies" spacing={1.5} sx={{ p: 1.5 }}>
                  <Skeleton variant="rounded" height={44} />
                  <Skeleton variant="rounded" height={44} />
                </Stack>
              ) : (
                !catalog.error && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    {query
                      ? 'No policies match your search.'
                      : `No published ${label.toLowerCase()} is available for this academic year.`}
                  </Typography>
                )
              )}
            </Box>
            {catalog.loading && options.length > 0 && (
              <Typography variant="caption" role="status" sx={{ p: 1.5 }}>
                Loading more policies…
              </Typography>
            )}
          </Paper>
          {preview && (
            <Paper
              ref={previewPane}
              component="section"
              aria-label="Policy configuration"
              variant="outlined"
              sx={{ minWidth: 0, minHeight: 0, overflowY: { md: 'auto' } }}
            >
              <StructurePolicyPreview
                option={preview.policy}
                settings={settings}
                onVersionChanged={markCatalogForRefresh}
              />
            </Paper>
          )}
        </Box>
      </DialogScrollContent>
    </CustomDialog>
  );
}
