'use client';

import { Label } from 'src/components/label';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Card,
  Stack,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { SectionCard } from './CollectionCommon';

interface CollectionWaiverSectionProps {
  formik: any;
}

export default function CollectionWaiverSection({ formik }: CollectionWaiverSectionProps) {
  const isLateFeeWaiverEnabled = Boolean(formik.values.enableWaiver);
  const isChargeWaiverEnabled = Boolean(formik.values.enableChargeWaiver);
  const hasAnyWaiver = isLateFeeWaiverEnabled || isChargeWaiverEnabled;
  const requiresApproval = Boolean(formik.values.requiresApproval);
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const roles = rolesData?.items ?? [];

  const toggleCard = (
    field: 'enableWaiver' | 'enableChargeWaiver',
    checked: boolean,
    title: string,
    description: string
  ) => (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: (theme) =>
          checked
            ? alpha(theme.palette.info.main, 0.05)
            : alpha(theme.palette.background.default, 0.4),
        borderColor: (theme) =>
          checked ? alpha(theme.palette.info.main, 0.4) : theme.palette.divider,
        cursor: 'pointer',
      }}
      onClick={() => formik.setFieldValue(field, !checked)}
    >
      <FormControlLabel
        sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
        control={<Switch size="small" checked={checked} color="info" sx={{ mr: 1 }} />}
        label={
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={600}>
                {title}
              </Typography>
              {checked && (
                <Label color="info" sx={{ height: 18, fontSize: '0.65rem' }}>
                  Enabled
                </Label>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          </Box>
        }
      />
    </Card>
  );

  return (
    <SectionCard
      title="Waiver Rules"
      subtitle="Choose what can be waived. Late-fee waivers automatically follow the late-fee fee-head rules."
      icon="solar:tag-price-bold"
      action={
        <Label color={hasAnyWaiver ? 'info' : 'default'} sx={{ height: 22 }}>
          {hasAnyWaiver ? 'Enabled' : 'Disabled'}
        </Label>
      }
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          {toggleCard(
            'enableWaiver',
            isLateFeeWaiverEnabled,
            'Allow late-fee waiver',
            'Allows waiver of a calculated late fee. Eligibility automatically uses the fee heads selected in Late Fee Rules.'
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {toggleCard(
            'enableChargeWaiver',
            isChargeWaiverEnabled,
            'Allow created-charge waiver',
            'Allows waiver requests against the unpaid balance of approved charges.'
          )}
        </Grid>

        {hasAnyWaiver && (
          <>
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
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const nextValue = !requiresApproval;
                  formik.setFieldValue('requiresApproval', nextValue);
                  if (!nextValue) formik.setFieldValue('approvalRoleIds', []);
                }}
              >
                <FormControlLabel
                  sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
                  control={<Switch size="small" checked={requiresApproval} sx={{ mr: 1 }} />}
                  label={
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Require approval for waiver requests
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        When disabled, a valid request is applied immediately. When enabled, every request requires approval.
                      </Typography>
                    </Box>
                  }
                />
              </Card>
            </Grid>

            {requiresApproval && (
              <Grid size={{ xs: 12 }}>
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
                    value={roles.filter((role) => formik.values.approvalRoleIds.includes(role.id))}
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
                        label="Approving roles *"
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
            )}
          </>
        )}
      </Grid>
    </SectionCard>
  );
}
