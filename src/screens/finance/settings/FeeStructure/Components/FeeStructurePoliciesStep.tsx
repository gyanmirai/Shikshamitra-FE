import type {
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { FormSectionHeader } from 'src/components/form-section-card';
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

import StructurePolicyPicker from './StructurePolicyPicker';
import { structurePolicyError } from '../feeStructureModel';

import type { StructurePolicyFamily } from '../feeStructureModel';
import type { PolicyImpactRow } from '../policyImpactModel';
import type { StructurePolicyCatalog } from './StructurePolicyPicker';

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
    StructurePolicyCatalog
  > & {
    proration?: StructurePolicyCatalog;
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
  const [choosing, setChoosing] = useState<StructurePolicyFamily>();
  const selectedFamily = impacts.find((impact) => impact.key === choosing);
  const catalogFor = (family: StructurePolicyFamily) => catalogs[family] ?? {
    items: [], loading: false, error: false, retry: () => {},
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
                                  aria-label={`${version ? 'Change' : 'Select'} ${impact.label}`}
                                  onClick={() => setChoosing(key)}
                                >
                                  <Iconify
                                    icon={version ? GlobalIcons.edit : GlobalIcons.addIcon}
                                    width={16}
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
      {selectedFamily && !locked && settings.permissions[`${selectedFamily.key}Read`] && (
        <StructurePolicyPicker
          key={selectedFamily.key}
          family={selectedFamily}
          candidate={candidate}
          settings={settings}
          catalog={catalogFor(selectedFamily.key)}
          canSelect={writable && !!settings.permissions[selectedFamily.key] && !busy}
          busy={busy}
          onChange={onChange}
          onClose={() => setChoosing(undefined)}
        />
      )}
    </>
  );
}
