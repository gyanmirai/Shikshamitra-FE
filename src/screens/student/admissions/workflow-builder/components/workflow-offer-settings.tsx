import type { FormikProps } from 'formik';
import type { AdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Stack, Typography } from '@mui/material';
import CustomAccordion from 'src/components/custom-accordian';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  DEFAULT_OFFER_POLICY,
  readAdmissionOfferPolicy,
  writeAdmissionOfferPolicy,
  getAdmissionOfferConfigurationError,
} from 'src/redux/student/admissions/admission-offer-policy';

import { OfferContentSettings } from './offer-content-settings';
import { WorkflowProcessChoice } from './workflow-process-choice';
import { OfferResponseSettings } from './offer-response-settings';

type Props = { formik: FormikProps<AdmissionWorkflowStage>; available: boolean; readOnly: boolean };

export function WorkflowOfferSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionOfferPolicy(json);
  const error = getAdmissionOfferConfigurationError(json);
  const unreadable = Boolean(readStageConfiguration(json)?.offer !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionOfferPolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionOfferPolicy(json, { ...(policy ?? DEFAULT_OFFER_POLICY), ...change })
    );
  return (
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:email-check-outline"
        title="Offer process"
        descriptionTooltip="Configure offer content, validity, responses and allowed completion outcomes. Every offer action is recorded. The workflow continues only for the selected completion outcomes."
      >
        <Stack spacing={2}>
          {!available && (
            <StudentFeedback notificationKey="STU-0563" presentation="inline" severity="info">
              Managed Offer settings are not available in this environment yet.
            </StudentFeedback>
          )}
          <WorkflowProcessChoice
            label="Offer process"
            value={policy?.enabled ? 'managed' : 'basic'}
            disabled={disabled}
            onChange={(value) => update({ enabled: value === 'managed' })}
            options={[
              {
                value: 'basic',
                title: 'Use existing offer actions',
                description: 'Keep the existing Offer actions and completion process.',
                icon: 'mdi:email-outline',
              },
              {
                value: 'managed',
                title: 'Manage offer validity and responses',
                description:
                  'Configure the offer message, expiry, response evidence and permitted completion outcomes.',
                icon: 'mdi:email-check-outline',
              },
            ]}
          />
          {error && (
            <StudentFeedback notificationKey="STU-0564" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
        </Stack>
      </FormSectionCard>
      {policy?.enabled && (
        <>
          <OfferContentSettings policy={policy} disabled={disabled} onChange={update} />
          <OfferResponseSettings policy={policy} disabled={disabled} onChange={update} />
          <FormSectionCard
            icon="mdi:eye-outline"
            title="Offer preview"
            descriptionTooltip="Review the title and message before applying this offer configuration."
          >
            <CustomAccordion
              title="Preview offer content"
              content={
                <Stack spacing={1}>
                  <Typography variant="subtitle1">{policy.title || 'Untitled offer'}</Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    {policy.message || 'Add the offer message.'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {policy.offerType === 'conditional' ? 'Conditional' : 'Unconditional'} · valid
                    for {policy.validityDays} days
                  </Typography>
                </Stack>
              }
            />
          </FormSectionCard>
        </>
      )}
    </Stack>
  );
}
