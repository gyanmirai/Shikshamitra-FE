import type {
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Card,
  Alert,
  Stack,
  Button,
  Divider,
  IconButton,
  Typography,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import { policyImpactRows } from '../policyImpactModel';
import { structurePolicyError } from '../feeStructureModel';

import type { StructurePolicyFamily } from '../feeStructureModel';
import type { PolicyImpactRow, ImpactPolicyData } from '../policyImpactModel';

export interface StructurePolicyImpact {
  key: StructurePolicyFamily;
  label: string;
  description: string;
  empty: string;
  policyLabel: string;
  rows?: PolicyImpactRow[];
}

interface Props {
  candidate: StructureCandidate;
  settings: StructureSettings;
  impacts: StructurePolicyImpact[];
  catalogs: Record<
    StructurePolicyFamily,
    { items: ImpactPolicyData[]; loading: boolean; error: boolean; retry: () => void }
  >;
  writable: boolean;
  locked: boolean;
  busy: boolean;
  onChange: (family: StructurePolicyFamily, version: string) => void;
  onView: (family: StructurePolicyFamily) => void;
}

export default function FeeStructurePoliciesStep({
  candidate,
  settings,
  impacts,
  catalogs,
  writable,
  locked,
  busy,
  onChange,
  onView,
}: Props) {
  const [choosing, setChoosing] = useState<StructurePolicyFamily>();
  const selectedFamily = impacts.find((impact) => impact.key === choosing);
  const options = choosing
    ? settings.policies
        .filter((policy) => policy.family === choosing)
        .map((policy) => {
          const rows = policyImpactRows(
            choosing,
            {
              ...candidate,
              [`${choosing}PolicyId`]: policy.id,
              [`${choosing}PolicyVersionId`]: policy.versionId,
            },
            settings,
            catalogs[choosing].items?.find(
              (item) => item.id === policy.id && item.currentVersionId === policy.versionId
            )
          );
          const matches = rows?.filter((row) =>
            choosing === 'collection'
              ? row.treatment === 'Late fee applies'
              : row.treatment !== 'Excluded'
          ).length;
          return {
            ...policy,
            _id: policy.versionId,
            coverage: rows
              ? choosing === 'collection'
                ? `Late fees on ${matches} of ${rows.length} fee heads`
                : `${matches} of ${rows.length} fee heads match`
              : 'Exact-version coverage unavailable',
          };
        })
    : [];
  const refundMismatch =
    !!candidate.refundPolicyVersionId &&
    impacts.some(
      (impact) =>
        impact.key === 'refund' &&
        !!impact.rows?.length &&
        impact.rows.every((row) => row.treatment === 'Excluded')
    );
  return (
    <>
      <Stack spacing={2} sx={{ width: 1, maxWidth: 'md', mx: 'auto', py: 1, minWidth: 0 }}>
        <Card
          component="section"
          aria-label="Policy selections"
          variant="outlined"
          sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, minWidth: 0 }}
        >
          <Stack spacing={2}>
            <Stack spacing={2} divider={<Divider />}>
              {impacts.map((impact) => {
                const { key } = impact;
                const version = candidate[`${key}PolicyVersionId`];
                const requiredError = locked ? '' : structurePolicyError(candidate, key);
                const requiredErrorId = `structure-${key}-policy-required`;
                const allowed =
                  writable && !!settings.permissions[key] && !!settings.permissions[`${key}Read`];
                const policy = locked
                  ? undefined
                  : settings.policies.find(
                      (item) => item.family === key && item.versionId === version
                    );
                const mismatched = key === 'refund' && refundMismatch;
                const matchedHeads =
                  impact.rows?.filter((row) =>
                    key === 'collection'
                      ? row.treatment === 'Late fee applies'
                      : row.treatment !== 'Excluded'
                  ).length ?? 0;
                const versionNumber =
                  policy?.versionNumber ??
                  / · v(\d+)(?: · Default)?$/.exec(impact.policyLabel)?.[1];
                return (
                  <Box
                    component="section"
                    key={key}
                    role="group"
                    aria-label={impact.label}
                    aria-describedby={requiredError ? requiredErrorId : undefined}
                    data-invalid={!!requiredError}
                    tabIndex={requiredError ? -1 : undefined}
                    sx={{ minWidth: 0 }}
                  >
                    <FormSectionHeader
                      descriptionTooltip={impact.description}
                      descriptionTooltipLabel={`${impact.label} information`}
                      icon={version ? GlobalIcons.approvedIcon : GlobalIcons.documentIcon}
                      title={
                        <Stack
                          component="span"
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                          useFlexGap
                          flexWrap="wrap"
                        >
                          <span>{impact.label}</span>
                          <Typography component="span" variant="caption" color="text.secondary">
                            Required
                          </Typography>
                        </Stack>
                      }
                      titleTypographyProps={{
                        component: 'h3',
                        variant: 'subtitle1',
                        fontWeight: 600,
                      }}

                      action={
                        <Stack direction="row" spacing={0.5}>
                          {!locked && (
                            <CustomTooltip
                              title={
                                allowed
                                  ? `${version ? 'Change' : 'Select'} ${impact.label}`
                                  : 'Editing this policy requires an editable draft and policy permissions.'
                              }
                            >
                              <span>
                                <IconButton
                                  type="button"
                                  size="small"
                                  disabled={!allowed || busy}
                                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                                  aria-label={`${version ? 'Change' : 'Select'} ${impact.label}`}
                                  onClick={() => setChoosing(key)}
                                >
                                  <Iconify
                                    icon={version ? GlobalIcons.edit : GlobalIcons.addIcon}
                                  />
                                </IconButton>
                              </span>
                            </CustomTooltip>
                          )}
                          <CustomTooltip
                            title={
                              version
                                ? `View ${impact.label} coverage`
                                : 'Select a policy to view its coverage.'
                            }
                          >
                            <span>
                              <IconButton
                                type="button"
                                size="small"
                                disabled={busy || !version}
                                sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                                aria-label={`View ${impact.label} fee head impact`}
                                onClick={() => onView(key)}
                              >
                                <Iconify icon={GlobalIcons.eye} />
                              </IconButton>
                            </span>
                          </CustomTooltip>
                        </Stack>
                      }
                    />
                    <Stack spacing={0.5} sx={{ pl: { xs: 0, sm: 5.5 }, mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}
                      >
                        {version
                          ? policy?.name || impact.policyLabel
                          : `Choose a ${key} policy before review.`}
                      </Typography>
                      {requiredError && (
                        <FormHelperText id={requiredErrorId} error sx={{ m: 0 }}>
                          {requiredError}
                        </FormHelperText>
                      )}
                      {version && (
                        <Typography variant="caption" color="text.secondary">
                          {versionNumber ? `Version ${versionNumber}` : 'Attached version'}
                          {policy?.isDefault ? ' · Default' : ''}
                        </Typography>
                      )}
                      {version && !mismatched && (
                        <Typography variant="caption" color="text.secondary">
                          {impact.rows
                            ? !impact.rows.length
                              ? 'No fee heads have been added to this structure.'
                              : key === 'collection'
                                ? `${matchedHeads} of ${impact.rows.length} fee head${impact.rows.length === 1 ? '' : 's'} ${matchedHeads === 1 ? 'has' : 'have'} late fees`
                                : `${matchedHeads} of ${impact.rows.length} fee head${impact.rows.length === 1 ? '' : 's'} ${matchedHeads === 1 ? 'matches' : 'match'} refund rules`
                            : catalogs[key].loading
                              ? 'Loading coverage…'
                              : 'Coverage details unavailable'}
                        </Typography>
                      )}
                      {mismatched && (
                        <Alert severity="error">
                          No matching fee heads. Choose another refund policy before publishing.
                        </Alert>
                      )}
                      {!settings.permissions[`${key}Read`] && (
                        <Typography variant="body2" color="text.secondary">
                          You do not have permission to browse this policy family.
                        </Typography>
                      )}
                      {catalogs[key].error && (
                        <Alert
                          severity="error"
                          action={
                            <Button
                              type="button"
                              size="small"
                              disabled={busy || !settings.permissions[`${key}Read`]}
                              onClick={catalogs[key].retry}
                              startIcon={<Iconify icon={GlobalIcons.refresh} />}
                            >
                              Retry
                            </Button>
                          }
                        >
                          Could not load this policy list. The attached version is preserved.
                        </Alert>
                      )}
                      {!version &&
                        settings.policies.filter((item) => item.family === key && item.isDefault)
                          .length > 1 && (
                          <Alert severity="error">
                            Multiple default policies exist. Choose one explicitly and correct
                            defaults in Settings.
                          </Alert>
                        )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        </Card>
      </Stack>
      {choosing && selectedFamily && (
        <CustomDialog
          titleInfo={selectedFamily.description}
          open
          title={`Choose ${selectedFamily.label}`}

          maxWidth="md"
          hasForm={false}
          guardUnsavedChanges={false}
          disableClose={busy}
          handleClose={() => {
            if (!busy) setChoosing(undefined);
          }}
        >
          <DialogScrollContent>
            <CustomizableTable
              tableTitle={`${selectedFamily.label} choices`}
              tableId={`structure-policy-picker-${choosing}`}
              data={options}
              isLoading={catalogs[choosing].loading && !options.length}
              isSearch
              isFilter={false}
              isPagination={options.length > 10}
              isShowedDense={false}
              searchableFields={['name']}
              noDataText={`No published ${selectedFamily.label.toLowerCase()} is available for this academic year.`}
              errorContent={
                catalogs[choosing].error ? (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" onClick={catalogs[choosing].retry} disabled={busy}>
                        Retry
                      </Button>
                    }
                  >
                    Policies could not be loaded.
                  </Alert>
                ) : undefined
              }
              columns={[
                {
                  id: 'name',
                  label: 'Policy',
                  minWidth: 220,
                  isSort: false,
                  isFilter: false,
                  render: (_value, row) => (
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Version {row.versionNumber}
                        {row.isDefault ? ' · Default' : ''}
                      </Typography>
                    </Stack>
                  ),
                },
                {
                  id: 'coverage',
                  label: 'Fee head coverage',
                  minWidth: 180,
                  isFilter: false,
                  isSort: false,
                },
                {
                  id: 'actions',
                  label: 'Actions',
                  width: 96,
                  minWidth: 96,
                  sticky: true,
                  stickyPosition: 'right',
                  align: 'left',
                  isFilter: false,
                  isSort: false,
                  excludeFromExport: true,
                  render: (_value, row) => (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        busy ||
                        !writable ||
                        !settings.permissions[choosing] ||
                        !settings.permissions[`${choosing}Read`]
                      }
                      aria-label={`Select ${row.name} version ${row.versionNumber}`}
                      onClick={() => {
                        onChange(choosing, row.versionId);
                        shikshaMitraToast.success({
                          message: `${selectedFamily.label} added to this draft.`,
                        });
                        setChoosing(undefined);
                      }}
                    >
                      Select
                    </Button>
                  ),
                },
              ]}
            />
            {catalogs[choosing].loading && !!options.length && (
              <Typography variant="caption" role="status">
                Loading more policies…
              </Typography>
            )}
          </DialogScrollContent>
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1 }} />
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              disabled={busy}
              onClick={() => setChoosing(undefined)}
            >
              Close
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  );
}
