import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  Stack,
  Button,
  Accordion,
  TextField,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { getTransitionSummary } from '../../workflow-builder-utils';
import { hasInquiryCondition } from '../workflow-inquiry-retirement';
import { isApplicationStageType } from '../workflow-stage-configuration';
import { WorkflowPreservedCondition } from './workflow-preserved-condition';
import { WorkflowTransitionStageSelect } from './workflow-transition-stage-select';
import { WorkflowTransitionConditionFields } from './workflow-transition-condition-fields';
import { WorkflowDocumentRoute, isDocumentOutcomeCondition } from './workflow-document-route';
import { ROUTE_OPERATOR_LABELS, type WorkflowConditionField } from '../workflow-condition-catalog';
import { WorkflowAssessmentRoute, isAssessmentOutcomeCondition } from './workflow-assessment-route';

import type { WorkflowTransitionFormValues } from '../workflow-transition-form';

type Props = {
  formik: FormikProps<WorkflowTransitionFormValues>;
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
  simpleNextStep?: boolean;
  lockFromStage?: boolean;
  conditionFields?: WorkflowConditionField[];
  competingPaths?: number;
  formsLoading?: boolean;
  formsError?: boolean;
  onRetryForms?: () => void;
};

export function WorkflowTransitionFields({
  formik,
  stages,
  readOnly,
  simpleNextStep = false,
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
  const showCondition =
    formik.values.hasCondition &&
    !formik.values.preserveCondition &&
    (!assessment || !isAssessmentOutcomeCondition(formik.values)) &&
    (!documents || !isDocumentOutcomeCondition(formik.values));
  if (simpleNextStep) {
    return (
      <Scrollbar role="region" aria-label="Next-step configuration" sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: 2 }}>
          {formik.status && (
            <StudentFeedback notificationKey="STU-0589" presentation="persistent" severity="error">
              {String(formik.status)}
            </StudentFeedback>
          )}
          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
              After
            </Typography>
            <Typography variant="subtitle2">{from?.name ?? 'Current stage'}</Typography>
          </Stack>
          <WorkflowTransitionStageSelect
            formik={formik}
            field="toStageId"
            label="Continue to *"
            stages={stages}
            readOnly={readOnly}
          />
          <Typography variant="body2" color="text.secondary">
            {formik.values.hasCondition
              ? `Saved path: ${getTransitionSummary(formik.values)}. Existing special paths remain read-only.`
              : assessment
                ? 'Passed or waived applicants follow this next step. Failed, absent or retake outcomes stay at Assessment; staff can arrange an allowed retake or end the journey as Withdrawn.'
                : 'The applicant follows this next step after the stage completion requirements are met.'}
          </Typography>
        </Stack>
      </Scrollbar>
    );
  }
  return (
    <Scrollbar role="region" aria-label="Next-step configuration" sx={{ flex: 1, minHeight: 0 }}>
      <Stack spacing={2} sx={{ p: 2 }}>
        {(!from ||
          !isApplicationStageType(from.stageType) ||
          !stages.some(
            (item) => item.id === formik.values.toStageId && isApplicationStageType(item.stageType)
          )) && (
          <StudentFeedback notificationKey="STU-0590" presentation="persistent" severity="warning">
            Replace retired stage types before configuring their next steps.
          </StudentFeedback>
        )}
        {formik.status && (
          <StudentFeedback notificationKey="STU-0589" presentation="persistent" severity="error">
            {String(formik.status)}
          </StudentFeedback>
        )}
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
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  formik.setValues({
                    ...formik.values,
                    preserveCondition: false,
                    conditionRuleJson: undefined,
                    conditionField: '',
                    conditionOperator: 'Equals',
                    conditionValue: '',
                  })
                }
              >
                Replace inquiry condition
              </Button>
            )}
          </Stack>
        ) : assessment ? (
          <WorkflowAssessmentRoute formik={formik} readOnly={readOnly} />
        ) : documents ? (
          <WorkflowDocumentRoute formik={formik} readOnly={readOnly} />
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
            {formsLoading && (
              <Typography variant="caption">Loading published form answers…</Typography>
            )}
            {formsError && (
              <StudentFeedback
                notificationKey="STU-0592"
                presentation="persistent"
                severity="warning"
                action={
                  <Button size="small" onClick={onRetryForms}>
                    Retry
                  </Button>
                }
              >
                Some form answers could not load. Saved conditions are retained.
              </StudentFeedback>
            )}
            <WorkflowTransitionConditionFields
              formik={formik}
              readOnly={readOnly}
              fields={conditionFields}
            />
          </>
        ) : !assessment && !documents && !formik.values.hasCondition ? (
          <StudentFeedback notificationKey="STU-0593" presentation="inline" severity="info">
            This is the default route and is used only when no conditional route matches. A stage
            can have one default route.
          </StudentFeedback>
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
