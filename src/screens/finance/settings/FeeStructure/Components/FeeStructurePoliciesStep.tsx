import type {
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, Typography, IconButton } from '@mui/material';

import { policyImpactRows } from '../policyImpactModel';

import type { StructurePolicyFamily } from '../feeStructureModel';
import type { PolicyImpactRow, ImpactPolicyData } from '../policyImpactModel';

export interface StructurePolicyImpact {
  key: StructurePolicyFamily;
  label: string;
  description: string;
  empty: string;
  policyLabel: string;
  policyDescription: string;
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
  onChange: (family: StructurePolicyFamily, version: string | null) => void;
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
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {impacts.map((impact) => {
          const { key } = impact;
          const version = candidate[`${key}PolicyVersionId`];
          const allowed =
            writable && !!settings.permissions[key] && !!settings.permissions[`${key}Read`];
          const policy = locked
            ? undefined
            : settings.policies.find((item) => item.family === key && item.versionId === version);
          const mismatched =
            key === 'refund' &&
            !!version &&
            !!impact.rows?.length &&
            impact.rows.every((row) => row.treatment === 'Excluded');
          return (
            <FormSectionCard
              key={key}
              icon={key === 'collection' ? 'mdi:cash-check' : 'mdi:cash-refund'}
              title={impact.label}
              titleTypographyProps={{ component: 'h3' }}
              descriptionTooltip={impact.description}
              action={
                <Label color="default">{key === 'collection' ? 'Required' : 'Optional'}</Label>
              }
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {version ? policy?.name || impact.policyLabel : impact.empty}
                </Typography>
                {policy && (
                  <Typography variant="caption" color="text.secondary">
                    Version {policy.versionNumber}
                    {policy.isDefault ? ' · Default' : ''}
                  </Typography>
                )}
                {key === 'collection' && !locked && !version && (
                  <Alert severity="error">Collection Policy is required</Alert>
                )}
                {mismatched && (
                  <Alert severity="error">
                    No matching fee heads. Choose another refund policy or remove it before
                    publishing.
                  </Alert>
                )}
                {version && !mismatched && (
                  <Typography variant="caption" color="text.secondary">
                    {impact.rows
                      ? `${impact.rows.length} fee head${impact.rows.length === 1 ? '' : 's'} · View coverage and exclusions`
                      : catalogs[key].loading
                        ? 'Loading coverage…'
                        : 'Coverage unavailable for this attached version.'}
                  </Typography>
                )}
                {!settings.permissions[`${key}Read`] && (
                  <Typography variant="body2" color="text.secondary">
                    You do not have permission to browse this policy family.
                  </Typography>
                )}
                {catalogs[key].error && (
                  <Alert
                    severity="warning"
                    action={
                      <Button
                        size="small"
                        disabled={busy || !settings.permissions[`${key}Read`]}
                        onClick={catalogs[key].retry}
                      >
                        Retry
                      </Button>
                    }
                  >
                    Could not load this policy list. The attached version is preserved.
                  </Alert>
                )}
                {!version &&
                  settings.policies.filter((item) => item.family === key && item.isDefault).length >
                    1 && (
                    <Alert severity="warning">
                      Multiple default policies exist. Choose one explicitly and correct defaults in
                      Settings.
                    </Alert>
                  )}
              </Stack>
              <Stack direction="row" spacing={0.5}>
                {version && (
                  <CustomTooltip title={`View ${impact.label} impact`}>
                    <span>
                      <IconButton
                        size="small"
                        disabled={busy}
                        onClick={() => onView(key)}
                        aria-label={`View ${impact.label} fee head impact`}
                      >
                        <Iconify icon={GlobalIcons.eye} />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                )}
                <CustomTooltip
                  title={
                    allowed
                      ? `${version ? 'Change' : 'Select'} ${impact.label}`
                      : 'Editing this policy requires an editable draft and policy permissions.'
                  }
                >
                  <span>
                    <IconButton
                      size="small"
                      disabled={!allowed || busy}
                      onClick={() => setChoosing(key)}
                      aria-label={`${version ? 'Change' : 'Select'} ${impact.label}`}
                    >
                      <Iconify icon={version ? GlobalIcons.edit : GlobalIcons.addIcon} />
                    </IconButton>
                  </span>
                </CustomTooltip>
                {version && writable && settings.permissions[key] && (
                  <CustomTooltip title={`Remove ${impact.label}`}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={busy}
                        onClick={() => onChange(key, null)}
                        aria-label={`Remove ${impact.label}`}
                      >
                        <Iconify icon={GlobalIcons.delete} />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                )}
              </Stack>
            </FormSectionCard>
          );
        })}
      </Box>
      {choosing && selectedFamily && (
        <CustomDialog
          open
          title={`Choose ${selectedFamily.label}`}
          titleInfo={selectedFamily.description}
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
                  align: 'right',
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
        </CustomDialog>
      )}
    </>
  );
}
