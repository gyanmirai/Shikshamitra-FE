'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Card,
  Stack,
  Select,
  Switch,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from './CollectionCommon';

interface CollectionGeneralSectionProps {
  formik: any;
  otherDefaultPolicyName?: string;
  activeEdit?: boolean;
}

export default function CollectionGeneralSection({
  formik,
  otherDefaultPolicyName,
  activeEdit = false,
}: CollectionGeneralSectionProps) {
  const isDefaultSelected = Boolean(formik.values.isDefault);
  const isDefaultDisabled = formik.values.status !== 'Active';

  return (
    <SectionCard
      title="General Information"
      subtitle="Configure policy identity, status, description, and academic year defaults."
      icon={GlobalIcons.notebook}
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <ShakingTextField error={formik.touched.policyName && Boolean(formik.errors.policyName)}>
            <TextField
              fullWidth
              size="small"
              label="Collection Policy Name *"
              placeholder="e.g. Standard Term Collection Policy"
              name="policyName"
              value={formik.values.policyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.policyName && Boolean(formik.errors.policyName)}
              helperText={formik.touched.policyName && (formik.errors.policyName as string)}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.status && Boolean(formik.errors.status)}>
            <FormControl
              fullWidth
              size="small"
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <InputLabel>Status *</InputLabel>
              <Select
                label="Status *"
                name="status"
                value={formik.values.status}
                onChange={(event) => {
                  formik.handleChange(event);
                  if (event.target.value === 'Draft') {
                    formik.setFieldValue('isDefault', false);
                  }
                }}
                onBlur={formik.handleBlur}
                renderValue={(val) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Label color={val === 'Active' ? 'success' : 'warning'} sx={{ height: 20 }}>
                      {val}
                    </Label>
                  </Box>
                )}
              >
                <MenuItem value="Draft">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Label color="warning" sx={{ height: 20 }}>
                      Draft
                    </Label>
                    <Typography variant="caption" color="text.secondary">
                      (Work in progress, not assignable)
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="Active">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Label color="success" sx={{ height: 20 }}>
                      Active
                    </Label>
                    <Typography variant="caption" color="text.secondary">
                      (Ready for fee structures)
                    </Typography>
                  </Stack>
                </MenuItem>
              </Select>
              {formik.touched.status && formik.errors.status && (
                <FormHelperText>{formik.errors.status as string}</FormHelperText>
              )}
            </FormControl>
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField
            error={formik.touched.description && Boolean(formik.errors.description)}
          >
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2.5}
              label="Policy Description"
              placeholder="Describe the rules, purpose, or intended classes/structures for this policy..."
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={
                (formik.touched.description && (formik.errors.description as string)) ||
                `${(formik.values.description || '').length}/500 characters`
              }
              inputProps={{ maxLength: 500 }}
            />
          </ShakingTextField>
        </Grid>

        {activeEdit && (
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={formik.touched.changeReason && Boolean(formik.errors.changeReason)}
            >
              <TextField
                fullWidth
                size="small"
                label="Change Reason (Optional)"
                name="changeReason"
                placeholder="Explain why this active collection policy is being changed..."
                value={formik.values.changeReason || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.changeReason && Boolean(formik.errors.changeReason)}
                helperText={
                  (formik.touched.changeReason && (formik.errors.changeReason as string)) ||
                  `${(formik.values.changeReason || '').length}/500 — recorded in version history and audit trail`
                }
                inputProps={{ maxLength: 500 }}
              />
            </ShakingTextField>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1.5,
              bgcolor: (theme) =>
                isDefaultSelected
                  ? alpha(theme.palette.primary.main, 0.05)
                  : alpha(theme.palette.background.default, 0.4),
              borderColor: (theme) =>
                isDefaultSelected ? alpha(theme.palette.primary.main, 0.4) : theme.palette.divider,
              boxShadow: (theme) =>
                isDefaultSelected
                  ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
                  : 'none',
              transition: 'all 0.2s ease',
              cursor: isDefaultDisabled ? 'not-allowed' : 'pointer',
              opacity: isDefaultDisabled ? 0.6 : 1,
              '&:hover': {
                borderColor: (theme) =>
                  isDefaultDisabled
                    ? theme.palette.divider
                    : isDefaultSelected
                      ? 'primary.main'
                      : alpha(theme.palette.text.primary, 0.2),
              },
            }}
            onClick={() => {
              if (!isDefaultDisabled) formik.setFieldValue('isDefault', !isDefaultSelected);
            }}
          >
            <FormControlLabel
              sx={{ m: 0, width: '100%', pointerEvents: 'none' }}
              control={
                <Switch
                  size="small"
                  checked={isDefaultSelected}
                  disabled={isDefaultDisabled}
                  color="primary"
                  sx={{ mr: 1 }}
                />
              }
              label={
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Default Collection Policy
                    </Typography>
                    {isDefaultSelected && (
                      <Label color="primary" sx={{ height: 18, fontSize: '0.65rem' }}>
                        Default Selected
                      </Label>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                    {isDefaultDisabled
                      ? 'Only an Active policy can be selected as the default.'
                      : 'Use this policy as the academic-year default. Selecting it replaces the current default.'}
                  </Typography>
                </Box>
              }
            />
          </Card>
          {isDefaultSelected && otherDefaultPolicyName && (
            <FormHelperText sx={{ mx: 1.75, mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon={GlobalIcons.alertIcon} width={14} height={14} />
              {`"${otherDefaultPolicyName}" is currently the default and will be replaced when you save.`}
            </FormHelperText>
          )}
        </Grid>
      </Grid>
    </SectionCard>
  );
}
