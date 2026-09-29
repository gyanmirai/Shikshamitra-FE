import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useRef, useEffect } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { Box, Tab, Badge, Typography } from '@mui/material';

import { WorkflowFormSettings } from './workflow-form-settings';
import { WorkflowStageNextSteps } from './workflow-stage-next-steps';
import { WorkflowFormStageBasics } from './workflow-form-stage-basics';
import { WorkflowFormStageSettings } from './workflow-form-stage-settings';
import { WorkflowStageCompletionSummary } from './workflow-stage-completion-summary';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  stages: AdmissionWorkflowStage[];
  transitions?: AdmissionWorkflowTransition[];
  formDefinitionId: string;
  formDetailsLoading?: boolean;
  formDetailsError?: boolean;
  onRetryFormDetails?: () => void;
  readOnly: boolean;
};

const FORM_STAGE_TABS = [
  { value: 'basics', label: 'Basics', icon: 'mdi:file-document-outline' },
  { value: 'process', label: 'Process', icon: 'mdi:play-outline' },
  { value: 'settings', label: 'Settings', icon: 'mdi:cog-outline' },
] as const;

export function WorkflowFormStageFields(props: Props) {
  const {
    formik,
    metadata,
    forms,
    formDefinitionId,
    formDetailsLoading,
    formDetailsError,
    onRetryFormDetails,
    readOnly,
    stages,
    transitions,
  } = props;
  const tabs = useTabs(FORM_STAGE_TABS[0].value);
  const hasConfigurationError = Boolean(formik.errors.configurationJson);
  const lastSubmit = useRef(formik.submitCount);

  useEffect(() => {
    if (formik.isValidating || formik.isSubmitting || lastSubmit.current === formik.submitCount)
      return;
    lastSubmit.current = formik.submitCount;
    if (formik.errors.name || formik.errors.code || (hasConfigurationError && !formDefinitionId)) {
      tabs.setValue('basics');
    } else if (hasConfigurationError) {
      tabs.setValue('process');
    }
  }, [
    formDefinitionId,
    formik.errors.code,
    formik.errors.name,
    formik.submitCount,
    formik.isValidating,
    formik.isSubmitting,
    hasConfigurationError,
    tabs,
  ]);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="fullWidth"
        guardUnsavedChanges={false}
        aria-label="Form stage configuration"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-indicator': { display: 'none' },
        }}
        slotProps={{
          scroller: { p: 0 },
          tab: {
            minHeight: 44,
            px: { xs: 1, sm: 2 },
            borderBottom: 2,
            borderColor: 'transparent',
          },
          selected: { borderColor: 'success.main', color: 'text.primary' },
        }}
      >
        {FORM_STAGE_TABS.map((tab) => {
          const needsAttention = tab.value === 'process' && hasConfigurationError;
          return (
            <Tab
              key={tab.value}
              id={`form-stage-${tab.value}-tab`}
              aria-controls={`form-stage-${tab.value}-panel`}
              value={tab.value}
              icon={<Iconify icon={tab.icon} width={20} />}
              iconPosition="start"
              label={
                needsAttention ? (
                  <Badge color="error" variant="dot">
                    <Typography component="span" variant="body2" sx={{ pr: 0.75 }}>
                      {tab.label}
                    </Typography>
                  </Badge>
                ) : (
                  tab.label
                )
              }
              aria-label={needsAttention ? `${tab.label}, needs attention` : tab.label}
            />
          );
        })}
      </CustomTabs>

      <Scrollbar
        id={`form-stage-${tabs.value}-panel`}
        role="tabpanel"
        aria-labelledby={`form-stage-${tabs.value}-tab`}
        aria-label={`${String(tabs.value)} stage settings`}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {tabs.value === 'basics' && <WorkflowFormStageBasics {...props} />}
          {tabs.value === 'process' && (
            <WorkflowFormSettings
              formik={formik}
              forms={forms}
              formDefinitionId={formDefinitionId}
              formDetailsLoading={formDetailsLoading}
              formDetailsError={formDetailsError}
              onRetryFormDetails={onRetryFormDetails}
              readOnly={readOnly}
              available={metadata?.supportedConfiguration?.includes('form') === true}
              onGoToBasics={() => tabs.setValue('basics')}
            />
          )}
          {tabs.value === 'settings' && (
            <>
              <Box sx={{ mb: 2 }}>
                <WorkflowStageCompletionSummary
                  stage={formik.values}
                  error={formik.errors.configurationJson}
                />
              </Box>
              <WorkflowFormStageSettings {...props} />
              <Box sx={{ mt: 2 }}>
                <WorkflowStageNextSteps
                  stage={formik.values}
                  stages={stages}
                  transitions={transitions}
                />
              </Box>
            </>
          )}
        </Box>
      </Scrollbar>
    </Box>
  );
}
