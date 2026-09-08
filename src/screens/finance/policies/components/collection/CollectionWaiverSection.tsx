'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Card,
  Stack,
  Switch,
  Checkbox,
  TextField,
  Typography,
  Autocomplete,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { SectionCard } from './CollectionCommon';

interface CollectionWaiverSectionProps {
  formik: any;
  feeHeads: any[];
}

export default function CollectionWaiverSection({
  formik,
  feeHeads,
}: CollectionWaiverSectionProps) {
  const isWaiverEnabled = Boolean(formik.values.enableWaiver);
  const requiresApproval = Boolean(formik.values.requiresApproval);
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const roles = rolesData?.items ?? [];

  return (
    <SectionCard
      title="Waiver Rules & Controls"
      subtitle="Define waiver eligibility, maximum concessions, maker-checker approver roles, and thresholds."
      icon="solar:tag-price-bold"
      action={
        <Label color={isWaiverEnabled ? 'info' : 'default'} sx={{ height: 22 }}>
          {isWaiverEnabled ? 'Waivers Enabled' : 'Disabled'}
        </Label>
      }
    >
      <Grid container spacing={2.5}>
        {/* Enable Waiver Switch Card */}
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              bgcolor: (theme) =>
                isWaiverEnabled
                  ? alpha(theme.palette.info.main, 0.05)
                  : alpha(theme.palette.background.default, 0.4),
              borderColor: (theme) =>
                isWaiverEnabled ? alpha(theme.palette.info.main, 0.4) : theme.palette.divider,
              boxShadow: (theme) =>
                isWaiverEnabled ? `0 0 0 1px ${alpha(theme.palette.info.main, 0.2)}` : 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                borderColor: (theme) =>
                  isWaiverEnabled ? 'info.main' : alpha(theme.palette.text.primary, 0.2),
              },
            }}
            onClick={() => formik.setFieldValue('enableWaiver', !isWaiverEnabled)}
          >
            <FormControlLabel
              sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
              control={
                <Switch
                  size="small"
                  checked={isWaiverEnabled}
                  color="info"
                  sx={{ mr: 1 }}
                />
              }
              label={
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Enable Late Fee / Penalty Waivers
                    </Typography>
                    {isWaiverEnabled && (
                      <Label color="info" sx={{ height: 18, fontSize: '0.65rem' }}>
                        Active
                      </Label>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                    Permit staff or administrators to request discounts or full forgiveness on late fee dues.
                  </Typography>
                </Box>
              }
            />
          </Card>
        </Grid>

        {isWaiverEnabled && (
          <>
            {/* Apply On Fee Heads */}
            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={
                  formik.touched.waiverApplyOnFeeHeads &&
                  Boolean(formik.errors.waiverApplyOnFeeHeads)
                }
              >
                <Autocomplete
                  multiple
                  size="small"
                  options={feeHeads}
                  groupBy={(option) => option.feeCategoryName || 'Other'}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={feeHeads.filter((h) =>
                    formik.values.waiverApplyOnFeeHeads?.includes(h.id)
                  )}
                  onChange={(_, newValue) => {
                    formik.setFieldValue(
                      'waiverApplyOnFeeHeads',
                      newValue.map((v) => v.id)
                    );
                  }}
                  disableCloseOnSelect
                  renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props as any;
                    return (
                      <li key={key || option.id} {...optionProps}>
                        <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                        <Typography variant="body2">{option.name}</Typography>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="waiverApplyOnFeeHeads"
                      label="Apply Waiver On Fee Heads *"
                      placeholder="Select fee heads..."
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.waiverApplyOnFeeHeads &&
                        Boolean(formik.errors.waiverApplyOnFeeHeads)
                      }
                      helperText={
                        (formik.touched.waiverApplyOnFeeHeads &&
                          (formik.errors.waiverApplyOnFeeHeads as string)) ||
                        'Waivers can only be applied to late charges linked to these fee heads.'
                      }
                    />
                  )}
                />
              </ShakingTextField>
            </Grid>

            {/* Requires Approval Switch Card */}
            <Grid size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) =>
                    requiresApproval
                      ? alpha(theme.palette.primary.main, 0.04)
                      : alpha(theme.palette.background.default, 0.3),
                  borderColor: (theme) =>
                    requiresApproval ? alpha(theme.palette.primary.main, 0.3) : theme.palette.divider,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const nextVal = !requiresApproval;
                  formik.setFieldValue('requiresApproval', nextVal);
                  if (!nextVal) {
                    formik.setFieldValue('approvalRoleIds', []);
                    formik.setFieldValue('approvalThresholdAmount', null);
                  }
                }}
              >
                <FormControlLabel
                  sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
                  control={
                    <Switch
                      size="small"
                      checked={requiresApproval}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                  }
                  label={
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                          Require Approval Workflow (Maker-Checker Control)
                        </Typography>
                        {requiresApproval && (
                          <Label color="primary" sx={{ height: 18, fontSize: '0.65rem' }}>
                            Workflow Enforced
                          </Label>
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                        Waiver requests must be vetted and authorized by designated roles before being applied to student ledgers.
                      </Typography>
                    </Box>
                  }
                />
              </Card>
            </Grid>

            {requiresApproval && (
              <>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <ShakingTextField
                    error={formik.touched.approvalRoleIds && Boolean(formik.errors.approvalRoleIds)}
                  >
                    <Autocomplete
                      multiple
                      size="small"
                      loading={rolesLoading}
                      options={roles}
                      getOptionLabel={(option) => option.name || ''}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={roles.filter((role) =>
                        formik.values.approvalRoleIds.includes(role.id)
                      )}
                      onChange={(_, selected) =>
                        formik.setFieldValue(
                          'approvalRoleIds',
                          selected.map((role) => role.id)
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="approvalRoleIds"
                          label="Approving Roles *"
                          placeholder="Select roles..."
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.approvalRoleIds && Boolean(formik.errors.approvalRoleIds)
                          }
                          helperText={
                            formik.touched.approvalRoleIds &&
                            (formik.errors.approvalRoleIds as string)
                          }
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                  <ShakingTextField
                    error={
                      formik.touched.approvalThresholdAmount &&
                      Boolean(formik.errors.approvalThresholdAmount)
                    }
                  >
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Approval Threshold Amount"
                      placeholder="0.00"
                      name="approvalThresholdAmount"
                      value={formik.values.approvalThresholdAmount ?? ''}
                      onChange={(event) =>
                        formik.setFieldValue(
                          'approvalThresholdAmount',
                          event.target.value === '' ? null : +event.target.value
                        )
                      }
                      onBlur={formik.handleBlur}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        },
                        htmlInput: { min: 0 },
                      }}
                      error={
                        formik.touched.approvalThresholdAmount &&
                        Boolean(formik.errors.approvalThresholdAmount)
                      }
                      helperText={
                        (formik.touched.approvalThresholdAmount &&
                          (formik.errors.approvalThresholdAmount as string)) ||
                        'Optional: Waivers above this amount require designated approver authorization.'
                      }
                    />
                  </ShakingTextField>
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={
                  formik.touched.maximumWaiverAmount && Boolean(formik.errors.maximumWaiverAmount)
                }
              >
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Maximum Waiver Cap Amount"
                  placeholder="No ceiling"
                  name="maximumWaiverAmount"
                  value={formik.values.maximumWaiverAmount ?? ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    },
                    htmlInput: { min: 0 },
                  }}
                  error={
                    formik.touched.maximumWaiverAmount && Boolean(formik.errors.maximumWaiverAmount)
                  }
                  helperText={
                    (formik.touched.maximumWaiverAmount &&
                      (formik.errors.maximumWaiverAmount as string)) ||
                    'Maximum monetary waiver allowed per invoice/term.'
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <ShakingTextField
                error={
                  formik.touched.maximumWaiverPercentage &&
                  Boolean(formik.errors.maximumWaiverPercentage)
                }
              >
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Maximum Waiver Percentage"
                  placeholder="100%"
                  name="maximumWaiverPercentage"
                  value={formik.values.maximumWaiverPercentage ?? ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    },
                    htmlInput: { min: 0, max: 100, step: 0.1 },
                  }}
                  error={
                    formik.touched.maximumWaiverPercentage &&
                    Boolean(formik.errors.maximumWaiverPercentage)
                  }
                  helperText={
                    (formik.touched.maximumWaiverPercentage &&
                      (formik.errors.maximumWaiverPercentage as string)) ||
                    'Upper percentage limit that can be waived (e.g., 50% or 100%).'
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <DatePicker
                label="Waiver Policy Expiry Date"
                value={formik.values.waiverExpiry ? dayjs(formik.values.waiverExpiry) : null}
                onChange={(date) =>
                  formik.setFieldValue('waiverExpiry', date ? date.toISOString() : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    helperText: 'Optional date after which no new waivers under this rule can be granted.',
                  },
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </SectionCard>
  );
}
