import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { readAdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import { readAdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import { readAdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import { readAdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import { readAdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';
import {
  Alert,
  Stack,
  Button,
  Accordion,
  TextField,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { hasInquiryCondition } from '../workflow-inquiry-retirement';
import { WorkflowPreservedCondition } from './workflow-preserved-condition';
import { WorkflowTransitionStageSelect } from './workflow-transition-stage-select';
import { WorkflowReviewRoute, isReviewOutcomeCondition } from './workflow-review-route';
import { WorkflowTransitionConditionFields } from './workflow-transition-condition-fields';
import { WorkflowDocumentRoute, isDocumentOutcomeCondition } from './workflow-document-route';
import { ROUTE_OPERATOR_LABELS, type WorkflowConditionField } from '../workflow-condition-catalog';
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
  conditionFields?: WorkflowConditionField[];
  competingPaths?: number;
  formsLoading?: boolean;
  formsError?: boolean;
  onRetryForms?: () => void;
};

const paymentOutcomes: WorkflowOutcomeOption[] = [
  { value: 'settled', label: 'Payment settled' },
  { value: 'waived', label: 'Payment waived' },
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
  conditionFields = [],
  competingPaths = 0,
  formsLoading,
  formsError,
  onRetryForms,
}: Props) {
  const from = stages.find((stage) => stage.id === formik.values.fromStageId);
  const conditionLabel =
    conditionFields.find((field) => field.value === formik.values.conditionField)?.label ||
    formik.values.conditionField ||
    'the selected field';
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
    (!payment || !isWorkflowOutcomeCondition(formik.values, 'payment.status', paymentOutcomes)) &&
    (!offer || !isWorkflowOutcomeCondition(formik.values, 'offer.status', offerOutcomes)) &&
    (!seat || !isWorkflowOutcomeCondition(formik.values, 'seat.status', seatOutcomes));
  return (
    <Scrollbar role="region" aria-label="Next-step configuration" sx={{ flex: 1, minHeight: 0 }}>
      <Stack spacing={2} sx={{ p: 2 }}>
        {formik.status && <Alert severity="error">{String(formik.status)}</Alert>}
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
          <Stack spacing={1}>
            <WorkflowPreservedCondition json={formik.values.conditionRuleJson ?? ''} />
            {!readOnly && hasInquiryCondition(formik.values.conditionRuleJson) && (
              <Button size="small" variant="outlined" onClick={() => formik.setValues({
                ...formik.values,
                preserveCondition: false,
                conditionRuleJson: undefined,
                conditionField: '',
                conditionOperator: 'Equals',
                conditionValue: '',
              })}>
                Replace inquiry condition
              </Button>
            )}
          </Stack>
        ) : assessment ? (
          <WorkflowAssessmentRoute formik={formik} readOnly={readOnly} />
        ) : documents ? (
          <WorkflowDocumentRoute formik={formik} readOnly={readOnly} />
        ) : eligibility ? (
          <WorkflowEligibilityRoute formik={formik} readOnly={readOnly} />
        ) : review ? (
          <WorkflowReviewRoute formik={formik} readOnly={readOnly} />
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
            allowedOutcomes={readAdmissionOfferPolicy(from?.configurationJson)?.allowedCompletionOutcomes}
            defaultAllowed={readAdmissionOfferPolicy(from?.configurationJson)?.allowedCompletionOutcomes.includes('accepted')}
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
            allowedOutcomes={readAdmissionSeatPolicy(from?.configurationJson)?.allowedCompletionOutcomes}
            guidance="Configure separate routes for waitlisted, released, and expired seat outcomes."
          />
        ) : (
          <CustomSelect
            size="small"
            fullWidth
            label="When to continue"
            disabled={readOnly}
            value={formik.values.hasCondition ? 'special' : 'usual'}
            options={[
              { value: 'usual', label: 'Usual next step' },
              { value: 'special', label: 'Only when a condition matches' },
            ]}
            onChange={(value) =>
              formik.setValues({
                ...formik.values,
                hasCondition: value === 'special',
                isDefault: value === 'usual',
              })
            }
          />
        )}
        {showCondition ? (
          <>
          {formsLoading && <Typography variant="caption">Loading published form answers…</Typography>}
          {formsError && <Alert severity="warning" action={<Button size="small" onClick={onRetryForms}>Retry</Button>}>Some form answers could not load. Saved conditions are retained.</Alert>}
          <WorkflowTransitionConditionFields
            formik={formik}
            readOnly={readOnly}
            fields={conditionFields}
          />
          </>
        ) : !assessment &&
          !documents &&
          !eligibility &&
          !review &&
          !payment &&
          !offer &&
          !seat &&
          !formik.values.hasCondition ? (
          <Alert severity="info">
            This is the default route and is used only when no conditional route matches. A stage
            can have one default route.
          </Alert>
        ) : null}
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          After {from?.name ?? 'this stage'} is complete, continue to{' '}
          {stages.find((stage) => stage.id === formik.values.toStageId)?.name ??
            'the selected stage'}
          {formik.values.hasCondition
            ? formik.values.preserveCondition
              ? ' when the saved advanced condition matches.'
              : ` when ${conditionLabel} ${ROUTE_OPERATOR_LABELS[formik.values.conditionOperator] ?? formik.values.conditionOperator}${['IsEmpty', 'IsNotEmpty'].includes(formik.values.conditionOperator) ? '' : ` ${formik.values.conditionValue || 'the selected value'}`}.`
            : ' when no special condition matches.'}
        </Typography>
        {formik.values.hasCondition &&
          (competingPaths > 0 ||
            formik.values.preserveCondition ||
            Boolean(formik.errors.priority)) && (
            <Accordion
              disableGutters
              elevation={0}
              defaultExpanded={Boolean(formik.errors.priority)}
              sx={{ border: 1, borderColor: 'divider' }}
            >
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
          )}
      </Stack>
    </Scrollbar>
  );
}
