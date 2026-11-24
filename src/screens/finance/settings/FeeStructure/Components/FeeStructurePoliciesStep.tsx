import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded';
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
  FormHelperText,
} from '@mui/material';

import StructurePolicyPreview from './StructurePolicyPreview';
import { structurePolicyError } from '../feeStructureModel';
import { policyImpactRows, refundPolicyMatchesHeads } from '../policyImpactModel';

import type { StructurePolicyFamily } from '../feeStructureModel';
import type { PolicyImpactRow, ImpactPolicyData } from '../policyImpactModel';

export interface StructurePolicyImpact {
  key: StructurePolicyFamily;
  label: string;
  description: string;
  empty: string;
  policyLabel: string;
  rows?: PolicyImpactRow[];
  incompatible?: boolean;
}

interface Props {
  candidate: StructureCandidate;
  settings: StructureSettings;
  impacts: StructurePolicyImpact[];
  catalogs: Record<
    Exclude<StructurePolicyFamily, 'proration'>,
    { items: ImpactPolicyData[]; loading: boolean; error: boolean; retry: () => void }
  > & {
    proration?: { items: ImpactPolicyData[]; loading: boolean; error: boolean; retry: () => void };
  };
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
  const theme = useTheme();
  const selectionTint = theme.vars
    ? varAlpha(theme.vars.palette.success.mainChannel, 0.08)
    : alpha(theme.palette.success.main, 0.08);
  const [choosing, setChoosing] = useState<StructurePolicyFamily>();
  const [previewOption, setPreviewOption] = useState<StructureSettings['policies'][number]>();
  const [choiceError, setChoiceError] = useState('');
  const selectedFamily = impacts.find((impact) => impact.key === choosing);
  const catalogFor = (family: StructurePolicyFamily) => catalogs[family] ?? {
    items: [], loading: false, error: false, retry: () => {},
  };
  const options = choosing
    ? settings.policies
        .filter((policy) => policy.family === choosing)
        .map((policy) => {
          const detail = catalogFor(choosing).items?.find(
            (item) => item.id === policy.id && item.currentVersionId === policy.versionId
          );
          const refund =
            choosing === 'refund' ? (policy.feeHeadScope ? policy : detail) : undefined;
          const eligible = refundPolicyMatchesHeads(refund, candidate.feeHeads);
          const refundHeadNames = refund?.applicableFeeHeadIds?.map(
            (id) =>
              policy.feeHeadNames?.[id] ??
              settings.heads.find((head) => head.id === id)?.name ??
              'Fee head name unavailable'
          );
          const rows = policyImpactRows(
            choosing,
            {
              ...candidate,
              [`${choosing}PolicyId`]: policy.id,
              [`${choosing}PolicyVersionId`]: policy.versionId,
            },
            settings,
            refund
              ? {
                  id: policy.id,
                  currentVersionId: policy.versionId,
                  feeHeadScope: refund.feeHeadScope ?? undefined,
                  applicableFeeHeadIds: refund.applicableFeeHeadIds ?? [],
                }
              : detail
          );
          const matches = rows?.filter((row) =>
            choosing === 'collection'
              ? row.treatment === 'Late fee applies'
              : row.treatment !== 'Excluded'
          ).length;
          const attachedVersionId = candidate[`${choosing}PolicyVersionId`];
          const attachedPolicyId = candidate[`${choosing}PolicyId`];
          const isSelected = Boolean(
            (attachedVersionId &&
              String(attachedVersionId).trim().toLowerCase() ===
                String(policy.versionId).trim().toLowerCase()) ||
            (!attachedVersionId &&
              attachedPolicyId &&
              String(attachedPolicyId).trim().toLowerCase() ===
                String(policy.id).trim().toLowerCase())
          );
          return {
            ...policy,
            _id: policy.versionId,
            selected: isSelected,
            eligible,
            policyFeeHeads:
              refund?.feeHeadScope === 'AllFeeHeads'
                ? ['All fee heads']
                : refundHeadNames ?? [],
            coverage: rows
              ? choosing === 'collection'
                ? `Late fees on ${matches} of ${rows.length} fee heads`
                : `${matches} of ${rows.length} fee heads`
              : 'Unavailable',
          };
        })
    : [];
  const closePicker = () => {
    setChoiceError('');
    setChoosing(undefined);
  };
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
                const prorationUnavailable = key === 'proration' &&
                  (settings.permissions.proration === undefined || settings.permissions.prorationRead === undefined);
                const requiredError = locked ? '' : structurePolicyError(candidate, key);
                const requiredErrorId = `structure-${key}-policy-required`;
                const allowed =
                  writable && !!settings.permissions[key] && !!settings.permissions[`${key}Read`];
                const policy = locked
                  ? undefined
                  : settings.policies.find(
                      (item) => item.family === key && item.versionId === version
                    );
                const mismatched = !!impact.incompatible;
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
                    aria-describedby={requiredError || mismatched ? requiredErrorId : undefined}
                    data-invalid={!!requiredError || mismatched}
                    tabIndex={requiredError || mismatched ? -1 : undefined}
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
                            {key === 'proration' ? 'Optional' : 'Required'}
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
                                  : prorationUnavailable
                                    ? 'Update the Finance API to select a proration policy.'
                                    : 'Editing this policy requires an editable draft and policy permissions.'
                              }
                            >
                              <span>
                                <IconButton
                                  type="button"
                                  size="small"
                                  disabled={!allowed || busy}
                                  sx={
                                    version
                                      ? undefined
                                      : { border: 1, borderColor: 'divider', borderRadius: 1 }
                                  }
                                  aria-label={`${version ? 'Change' : 'Select'} ${impact.label}`}
                                  onClick={() => setChoosing(key)}
                                >
                                  <Iconify
                                    icon={version ? GlobalIcons.edit : GlobalIcons.addIcon}
                                    width={version ? 16 : undefined}
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
                                aria-label={`View ${impact.label} fee head impact`}
                                onClick={() => onView(key)}
                              >
                                <Iconify icon={GlobalIcons.eye} width={16} />
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
                          : key === 'proration'
                            ? 'Use academic-year default'
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
                      {version && !mismatched && key !== 'proration' && (
                        <Typography variant="caption" color="text.secondary">
                          {impact.rows
                            ? !impact.rows.length
                              ? 'No fee heads have been added to this structure.'
                              : key === 'collection'
                                ? `${matchedHeads} of ${impact.rows.length} fee head${impact.rows.length === 1 ? '' : 's'} ${matchedHeads === 1 ? 'has' : 'have'} late fees`
                                : `${matchedHeads} of ${impact.rows.length} fee head${impact.rows.length === 1 ? '' : 's'} ${matchedHeads === 1 ? 'matches' : 'match'} refund rules`
                            : catalogFor(key).loading
                              ? 'Loading coverage…'
                              : 'Coverage details unavailable'}
                        </Typography>
                      )}
                      {mismatched && (
                        <Alert severity="error" id={requiredErrorId}>
                          No matching fee heads. Choose another refund policy before continuing.
                        </Alert>
                      )}
                      {prorationUnavailable ? (
                        <Typography variant="body2" color="text.secondary">
                          The running Finance API does not support fee structure proration yet.
                        </Typography>
                      ) : !settings.permissions[`${key}Read`] && (
                        <Typography variant="body2" color="text.secondary">
                          You do not have permission to browse this policy family.
                        </Typography>
                      )}
                      {catalogFor(key).error && (
                        <Alert
                          severity="error"
                          action={
                            <Button
                              type="button"
                              size="small"
                              disabled={busy || !settings.permissions[`${key}Read`]}
                              onClick={catalogFor(key).retry}
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
            if (!busy) closePicker();
          }}
        >
          <DialogScrollContent>
            {choiceError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {choiceError}
              </Alert>
            )}
            {choosing === 'proration' && (
              <Button size="small" disabled={busy} sx={{ mb: 1 }} onClick={() => {
                onChange('proration', '');
                closePicker();
              }}>
                Use academic-year default
              </Button>
            )}
            <CustomizableTable
              tableTitle={`${selectedFamily.label} choices`}
              tableId={`structure-policy-picker-${choosing}`}
              data={options}
              getRowAction={(row) =>
                !busy && settings.permissions[`${choosing}Read`]
                  ? {
                      label: `View ${row.name} version ${row.versionNumber}`,
                      onClick: () =>
                        setPreviewOption(
                          options.find((option) => option.versionId === row.versionId)
                        ),
                    }
                  : undefined
              }
              rowProps={(row) => ({
                selected: row.selected,
                'aria-selected': row.selected,
                sx: row.selected
                  ? {
                      '&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'transparent' },
                      '& > td': {
                        bgcolor: 'background.paper',
                        backgroundImage: `linear-gradient(${selectionTint}, ${selectionTint})`,
                      },
                    }
                  : undefined,
              })}
              isLoading={catalogFor(choosing).loading && !options.length}
              isSearch
              isFilter={false}
              isPagination={options.length > 10}
              isShowedDense={false}
              searchableFields={['name']}
              noDataText={`No published ${selectedFamily.label.toLowerCase()} is available for this academic year.`}
              errorContent={
                catalogFor(choosing).error ? (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" onClick={catalogFor(choosing).retry} disabled={busy}>
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
                  headerSx: { minWidth: { sm: 220 } },
                  cellSx: { overflowWrap: 'anywhere' },
                  isSort: false,
                  isFilter: false,
                  render: (_value, row) => (
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Version {row.versionNumber}
                        {row.isDefault ? ' · Default' : ''}
                      </Typography>
                      {choosing === 'collection' && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                          {row.coverage}
                        </Typography>
                      )}
                    </Stack>
                  ),
                },
                ...(choosing === 'collection'
                  ? ([
                      {
                        id: 'coverage',
                        label: 'Fee head coverage',
                        minWidth: 180,
                        headerSx: { display: { xs: 'none', sm: 'table-cell' } },
                        cellSx: { display: { xs: 'none', sm: 'table-cell' } },
                        isFilter: false,
                        isSort: false,
                      },
                    ] satisfies IColumn[])
                  : []),
                ...(choosing === 'refund'
                  ? ([
                      {
                        id: 'policyFeeHeads',
                        label: 'Fee Heads',
                        minWidth: 140,
                        cellSx: { whiteSpace: 'normal', overflowWrap: 'anywhere' },
                        isFilter: false,
                        isSort: false,
                        render: (_value, row) =>
                          row.policyFeeHeads.length ? (
                            <Stack component="ul" spacing={0.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                              {row.policyFeeHeads.map((name: string, index: number) => (
                                <li key={`${name}-${index}`}>{name}</li>
                              ))}
                            </Stack>
                          ) : (
                            'Unavailable'
                          ),
                      },
                    ] satisfies IColumn[])
                  : []),
                {
                  id: 'actions',
                  label: 'Actions',
                  width: 80,
                  minWidth: 80,
                  sticky: true,
                  stickyPosition: 'right',
                  align: 'left',
                  isFilter: false,
                  isSort: false,
                  excludeFromExport: true,
                  render: (_value, row) => (
                    row.selected ? (
                      <CustomTooltip title="Selected">
                        <Box
                          component="span"
                          role="img"
                          aria-label="Selected"
                          sx={{ color: 'success.main', display: 'inline-flex', p: 0.625 }}
                        >
                          <CheckCircleRounded fontSize="small" />
                        </Box>
                      </CustomTooltip>
                    ) : (
                      <CustomTooltip title="Select policy">
                        <span>
                          <IconButton
                            type="button"
                            size="small"
                            aria-label={`Select ${row.name} version ${row.versionNumber}`}
                            disabled={
                              busy ||
                              !writable ||
                              !settings.permissions[choosing] ||
                              !settings.permissions[`${choosing}Read`]
                            }
                            onClick={(event) => {
                              event.stopPropagation();
                              if (choosing === 'refund' && row.eligible !== true) {
                                setChoiceError(
                                  row.eligible === false
                                    ? `${row.name} has no matching fee heads. Choose another refund policy.`
                                    : catalogs.refund.loading
                                      ? 'Refund policy coverage is loading. Try again when it is ready.'
                                      : 'Coverage for this policy version is unavailable. Refresh the list or choose another refund policy.'
                                );
                                return;
                              }
                              onChange(choosing, row.versionId);
                              shikshaMitraToast.success({
                                message: `${selectedFamily.label} added to this draft.`,
                              });
                              closePicker();
                            }}
                            sx={{ color: 'text.secondary' }}
                          >
                            <CheckCircleOutlineRounded fontSize="small" />
                          </IconButton>
                        </span>
                      </CustomTooltip>
                    )
                  ),
                },
              ]}
              searchFieldProps={{
                placeholder: 'Search policies',
                inputProps: {
                  'aria-label': `Search ${selectedFamily.label.toLowerCase()} choices`,
                },
              }}
            />
            {catalogFor(choosing).loading && !!options.length && (
              <Typography variant="caption" role="status">
                Loading more policies…
              </Typography>
            )}
          </DialogScrollContent>
        </CustomDialog>
      )}
      {previewOption && (
        <StructurePolicyPreview
          option={previewOption}
          settings={settings}
          onClose={() => setPreviewOption(undefined)}
          onRefreshOptions={catalogFor(previewOption.family as StructurePolicyFamily).retry}
        />
      )}
    </>
  );
}
