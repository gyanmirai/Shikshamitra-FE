import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { readAdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import { readAdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import { readAdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import { readAdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';
import { readAdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import { readAdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';
import {
  Alert,
  Stack,
  Switch,
  Accordion,
  TextField,
  Typography,
  AccordionDetails,
  FormControlLabel,
  AccordionSummary,
} from '@mui/material';

import { WorkflowPreservedCondition } from './workflow-preserved-condition';
import { WorkflowTransitionStageSelect } from './workflow-transition-stage-select';
import { WorkflowReviewRoute, isReviewOutcomeCondition } from './workflow-review-route';
import { WorkflowTransitionConditionFields } from './workflow-transition-condition-fields';
import { WorkflowDocumentRoute, isDocumentOutcomeCondition } from './workflow-document-route';
import { WorkflowAssessmentRoute, isAssessmentOutcomeCondition } from './workflow-assessment-route';
import {
  WorkflowEligibilityRoute,
  isEligibilityOutcomeCondition,
} from './workflow-eligibility-route';
import {
  WorkflowOutcomeRoute,
  isWorkflowOutcomeCondition,
  type WorkflowOutcomeOption,
} from './workflow-outcome-route';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

type Props = {
  formik: FormikProps<WorkflowTransitionFormValues>;
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
  lockFromStage?: boolean;
};

const inquiryOutcomes: WorkflowOutcomeOption[] = [
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Nurture', label: 'Needs follow-up' },
  { value: 'NotInterested', label: 'Not interested' },
  { value: 'Lost', label: 'Lost inquiry' },
  { value: 'Duplicate', label: 'Duplicate inquiry' },
];
const paymentOutcomes: WorkflowOutcomeOption[] = [
  { value: 'settled', label: 'Payment settled' },
  { value: 'waived', label: 'Payment waived' },
  { value: 'pendingVerification', label: 'Waiting for verification' },
  { value: 'failed', label: 'Payment failed' },
];
const offerOutcomes: WorkflowOutcomeOption[] = [
  { value: 'accepted', label: 'Offer accepted' },
  { value: 'declined', label: 'Offer declined' },
  { value: 'expired', label: 'Offer expired' },
  { value: 'withdrawn', label: 'Offer withdrawn' },
];
const seatOutcomes: WorkflowOutcomeOption[] = [
  { value: 'confirmed', label: 'Seat confirmed' },
  { value: 'waitlisted', label: 'Applicant waitlisted' },
  { value: 'released', label: 'Seat released' },
  { value: 'expired', label: 'Seat hold expired' },
];

export function WorkflowTransitionFields({
  formik,
  stages,
  readOnly,
  lockFromStage = false,
}: Props) {
  const from = stages.find((stage) => stage.id === formik.values.fromStageId);
  const assessment =
    from?.stageType === 2 &&
    readAdmissionAssessmentPolicy(from.configurationJson)?.enabled === true;
  const documents =
    from?.stageType === 5 && readAdmissionDocumentPolicy(from.configurationJson)?.enabled === true;
  const eligibility =
    from?.stageType === 3 &&
    readAdmissionEligibilityPolicy(from.configurationJson)?.enabled === true;
  const review =
    from?.stageType === 6 && readAdmissionReviewPolicy(from.configurationJson)?.enabled === true;
  const inquiry =
    from?.stageType === 0 && readAdmissionInquiryPolicy(from.configurationJson)?.enabled === true;
  const payment =
    from?.stageType === 4 && readAdmissionPaymentPolicy(from.configurationJson)?.enabled === true;
  const offer =
    from?.stageType === 8 && readAdmissionOfferPolicy(from.configurationJson)?.enabled === true;
  const seat =
    from?.stageType === 9 && readAdmissionSeatPolicy(from.configurationJson)?.enabled === true;
  const showCondition =
    formik.values.hasCondition &&
    !formik.values.preserveCondition &&
    (!assessment || !isAssessmentOutcomeCondition(formik.values)) &&
    (!documents || !isDocumentOutcomeCondition(formik.values)) &&
    (!eligibility || !isEligibilityOutcomeCondition(formik.values)) &&
    (!review || !isReviewOutcomeCondition(formik.values)) &&
    (!inquiry ||
      !isWorkflowOutcomeCondition(formik.values, 'inquiry.management.outcome', inquiryOutcomes)) &&
    (!payment || !isWorkflowOutcomeCondition(formik.values, 'payment.status', paymentOutcomes)) &&
    (!offer || !isWorkflowOutcomeCondition(formik.values, 'offer.status', offerOutcomes)) &&
    (!seat || !isWorkflowOutcomeCondition(formik.values, 'seat.status', seatOutcomes));
  return (
    <Scrollbar role="region" aria-label="Next-step configuration" sx={{ flex: 1, minHeight: 0 }}>
      <Stack spacing={2} sx={{ p: 2 }}>
        {lockFromStage ? (
          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
              After
            </Typography>
            <Typography variant="subtitle2">{from?.name ?? 'Current stage'}</Typography>
          </Stack>
        ) : (
          <WorkflowTransitionStageSelect
            formik={formik}
            field="fromStageId"
            label="From stage *"
            stages={stages}
            readOnly={readOnly}
          />
        )}
        <WorkflowTransitionStageSelect
          formik={formik}
          field="toStageId"
          label="Continue to *"
          stages={stages}
          readOnly={readOnly}
        />
        {formik.values.preserveCondition ? (
          <WorkflowPreservedCondition json={formik.values.conditionRuleJson ?? ''} />
        ) : assessment ? (
          <WorkflowAssessmentRoute formik={formik} readOnly={readOnly} />
        ) : documents ? (
          <WorkflowDocumentRoute formik={formik} readOnly={readOnly} />
        ) : eligibility ? (
          <WorkflowEligibilityRoute formik={formik} readOnly={readOnly} />
        ) : review ? (
          <WorkflowReviewRoute formik={formik} readOnly={readOnly} />
        ) : inquiry ? (
          <WorkflowOutcomeRoute
            formik={formik}
            readOnly={readOnly}
            field="inquiry.management.outcome"
            label="Continue when inquiry is"
            defaultLabel="Qualified (default route)"
            outcomes={inquiryOutcomes}
            guidance="Add matching routes for outcomes that should leave the main admission journey."
          />
        ) : payment ? (
          <WorkflowOutcomeRoute
            formik={formik}
            readOnly={readOnly}
            field="payment.status"
            label="Continue when payment is"
            defaultLabel="Settled or waived (default route)"
            outcomes={paymentOutcomes}
            guidance="Managed payment completes only after settlement or an authorized waiver."
          />
        ) : offer ? (
          <WorkflowOutcomeRoute
            formik={formik}
            readOnly={readOnly}
            field="offer.status"
            label="Continue when offer is"
            defaultLabel="Accepted (default route)"
            outcomes={offerOutcomes}
            guidance="Configure separate routes for declined, expired, and withdrawn offers."
          />
        ) : seat ? (
          <WorkflowOutcomeRoute
            formik={formik}
            readOnly={readOnly}
            field="seat.status"
            label="Continue when seat is"
            defaultLabel="Confirmed (default route)"
            outcomes={seatOutcomes}
            guidance="Configure separate routes for waitlisted, released, and expired seat outcomes."
          />
        ) : (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={formik.values.hasCondition}
                disabled={readOnly}
                onChange={(_, value) => {
                  formik.setFieldValue('hasCondition', value);
                  formik.setFieldValue('isDefault', !value);
                }}
              />
            }
            label="Use a condition"
          />
        )}
        {showCondition ? (
          <WorkflowTransitionConditionFields formik={formik} readOnly={readOnly} />
        ) : !assessment &&
          !documents &&
          !eligibility &&
          !review &&
          !inquiry &&
          !payment &&
          !offer &&
          !seat &&
          !formik.values.hasCondition ? (
          <Alert severity="info">
            This is the default route and is used only when no conditional route matches. A stage
            can have one default route.
          </Alert>
        ) : null}
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Typography variant="subtitle2">Advanced route order</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Route order *"
              disabled={readOnly}
              {...formik.getFieldProps('priority')}
              error={formik.touched.priority && Boolean(formik.errors.priority)}
              helperText={
                formik.touched.priority && formik.errors.priority
                  ? formik.errors.priority
                  : 'Lower numbers are checked first when more than one special path matches.'
              }
            />
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Scrollbar>
  );
}
