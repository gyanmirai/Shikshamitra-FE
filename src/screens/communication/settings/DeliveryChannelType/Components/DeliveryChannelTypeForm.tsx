'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  CommunicationChannelType,
  CommunicationProviderStatus,
} from 'src/redux/communication/communicationTypes';
import {
  useCreateProviderSettingMutation,
  useUpdateProviderSettingMutation,
} from 'src/redux/communication/setting/deliveryChannelApi';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  channelLabel,
  providerStatusOptions,
  isMetaWhatsAppProvider,
  isMetaWhatsAppAccountId,
  mapProviderFormToPayload,
  getProviderInitialValues,
  communicationChannelOptions,
} from 'src/redux/communication/communicationMappers';

import { MetaWhatsAppAccountFields } from './MetaWhatsAppAccountFields';

import type { IProviderSettingFormProps, IProviderSettingFormValues } from '../type';

const enabledProvider = (values: IProviderSettingFormValues) =>
  values.isEnabled && values.status === CommunicationProviderStatus.Enabled;

const validateProviderForm = (values: IProviderSettingFormValues) => {
  const errors: Partial<Record<keyof IProviderSettingFormValues, string>> = {};

  if (!values.providerName.trim()) {
    errors.providerName = 'Provider name is required';
  }

  if (values.dailyQuota && Number(values.dailyQuota) < 0) {
    errors.dailyQuota = 'Daily quota cannot be negative';
  }

  if (values.monthlyQuota && Number(values.monthlyQuota) < 0) {
    errors.monthlyQuota = 'Monthly quota cannot be negative';
  }

  if (!values.fallbackOrder.length) {
    errors.fallbackOrder = 'At least one fallback channel is required';
  }

  if (isMetaWhatsAppProvider(values)) {
    const businessAccountId = values.businessAccountId.trim();
    const phoneNumberId = values.phoneNumberId.trim();
    const secretReference = values.secretReference.trim();

    if (enabledProvider(values) || businessAccountId || phoneNumberId) {
      if (!isMetaWhatsAppAccountId(businessAccountId)) {
        errors.businessAccountId = 'Enter the business account ID using 1 to 32 digits.';
      }
      if (!isMetaWhatsAppAccountId(phoneNumberId)) {
        errors.phoneNumberId = 'Enter the phone number ID using 1 to 32 digits.';
      }
    }
    if (enabledProvider(values) &&
      !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(secretReference)) {
      errors.secretReference = 'Enter the Azure token reference using letters, digits, hyphens, or underscores.';
    }
  }

  return errors;
};

const DeliveryChannelForm: React.FC<IProviderSettingFormProps> = ({ onClose, editData }) => {
  const [createProviderSetting, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateProviderSettingMutation,
  });

  const [updateProviderSetting, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateProviderSettingMutation,
  });

  const formik = useFormik<IProviderSettingFormValues>({
    initialValues: getProviderInitialValues(editData),
    validate: validateProviderForm,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const data = mapProviderFormToPayload(values, editData);

        if (editData) {
          await updateProviderSetting({ id: editData.id, data }).unwrap();
          shikshaMitraToast.success({
            message: `${values.providerName} provider setting updated successfully`,
          });
        } else {
          await createProviderSetting(data).unwrap();
          shikshaMitraToast.success({
            message: `${values.providerName} provider setting added successfully`,
          });
        }

        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to save provider setting',
        });
      }
    },
  });

  const isSubmitting = isCreating || isUpdating;
  const metaWhatsApp = isMetaWhatsAppProvider(formik.values);
  const metaCredentialsRequired = metaWhatsApp && enabledProvider(formik.values);
  const secretReferenceError = formik.touched.secretReference && formik.errors.secretReference;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Channel *"
              name="channel"
              size="small"
              value={formik.values.channel}
              onChange={(event) => formik.setFieldValue('channel', Number(event.target.value))}
            >
              {communicationChannelOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.providerName && formik.errors.providerName)}>
              <TextField
                fullWidth
                label="Provider Name *"
                name="providerName"
                size="small"
                value={formik.values.providerName}
                onChange={formik.handleChange}
                error={formik.touched.providerName && Boolean(formik.errors.providerName)}
                helperText={(formik.touched.providerName && formik.errors.providerName) ||
                  (formik.values.channel === CommunicationChannelType.WhatsApp && !metaWhatsApp
                    ? 'Use Meta WhatsApp Cloud API for Academic notifications.'
                    : undefined)}
              />
            </ShakingTextField>
          </Grid>

          {metaWhatsApp && (
            <Grid size={{ xs: 12 }}>
              <MetaWhatsAppAccountFields formik={formik} required={metaCredentialsRequired} />
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sender ID"
              name="senderId"
              size="small"
              value={formik.values.senderId}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              size="small"
              value={formik.values.status}
              onChange={(event) => formik.setFieldValue('status', Number(event.target.value))}
            >
              {providerStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.isEnabled}
                    onChange={(event) => formik.setFieldValue('isEnabled', event.target.checked)}
                  />
                }
                label="Enabled"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.isDefault}
                    onChange={(event) => formik.setFieldValue('isDefault', event.target.checked)}
                  />
                }
                label="Default Provider"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.consentRequired}
                    onChange={(event) =>
                      formik.setFieldValue('consentRequired', event.target.checked)
                    }
                  />
                }
                label="Consent Required"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.templateApprovalRequired}
                    onChange={(event) =>
                      formik.setFieldValue('templateApprovalRequired', event.target.checked)
                    }
                  />
                }
                label="Template Approval Required"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
              Fallback Order *
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {communicationChannelOptions.map((option) => {
                const checked = formik.values.fallbackOrder.includes(option.value);
                return (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...formik.values.fallbackOrder, option.value]
                            : formik.values.fallbackOrder.filter(
                                (channel) => channel !== option.value
                              );
                          formik.setFieldValue('fallbackOrder', next);
                        }}
                      />
                    }
                    label={channelLabel(option.value)}
                  />
                );
              })}
            </Box>
            {formik.touched.fallbackOrder && formik.errors.fallbackOrder && (
              <Typography variant="caption" color="error">
                {formik.errors.fallbackOrder as string}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Daily Quota"
              name="dailyQuota"
              size="small"
              type="number"
              value={formik.values.dailyQuota}
              onChange={formik.handleChange}
              error={formik.touched.dailyQuota && Boolean(formik.errors.dailyQuota)}
              helperText={(formik.touched.dailyQuota && formik.errors.dailyQuota) as string}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Monthly Quota"
              name="monthlyQuota"
              size="small"
              type="number"
              value={formik.values.monthlyQuota}
              onChange={formik.handleChange}
              error={formik.touched.monthlyQuota && Boolean(formik.errors.monthlyQuota)}
              helperText={(formik.touched.monthlyQuota && formik.errors.monthlyQuota) as string}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={Boolean(secretReferenceError)}>
              <TextField
                {...formik.getFieldProps('secretReference')}
                fullWidth
                label="Secret reference"
                size="small"
                required={metaCredentialsRequired}
                error={Boolean(secretReferenceError)}
                helperText={secretReferenceError ||
                  (metaWhatsApp ? 'Use the reference from the Azure WhatsApp access token setting.' : undefined)}
                slotProps={{ formHelperText: { 'aria-live': 'polite' } }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          type="submit"
          variant="contained"
          size="small"
          disabled={isSubmitting}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default DeliveryChannelForm;
