'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Box, Button } from '@mui/material';

import { EnrollmentSettingsEditorDrawer } from './enrollment-settings-editor-drawer';

import { useAdmissionsPlaybookWorkspace } from './admissions-playbook-configuration-context';

import { AdmissionsPlaybookSlotsStep } from './admissions-playbook-configuration-section-25';

import { AdmissionsPlaybookExamsStep } from './admissions-playbook-configuration-section-24';

import { AdmissionsPlaybookRoundsStep } from './admissions-playbook-configuration-section-23';

import { AdmissionsPlaybookStagesStep } from './admissions-playbook-configuration-section-22';

import { AdmissionsPlaybookBasicsStep } from './admissions-playbook-configuration-section-21';

export function AdmissionsPlaybookSection2() {
  const { state: controllerState, actions, meta } = useAdmissionsPlaybookWorkspace();
  const {
    editing,
    editorOpen,
    editorStepIndex,
    editorSteps,
    editorTab,
    entranceExamMode,
    form,
    handleEditorStepChange,
    handleNextEditorStep,
    handleSave,
    isSaving,
    readOnly,
    setEditorOpen,
    setEditorTab,
    setForm,
    updateExam,
    updateRound,
    updateRule,
    updateSeatPlan,
    updateSlot,
    updateStage,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <EnrollmentSettingsEditorDrawer
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={
          editing
            ? `${editing.name} - Version ${editing.version}`
            : entranceExamMode
              ? 'New Entrance Exam Policy'
              : 'New Admissions Playbook'
        }
        description={
          readOnly
            ? 'Review the published policy. Create a new version to make changes.'
            : entranceExamMode
              ? 'Complete applicability, the assessment process, and scheduling without leaving the policy list.'
              : 'Work through each setup area, then save the draft for review.'
        }
        steps={[...editorSteps]}
        activeStep={editorTab}
        onStepChange={handleEditorStepChange}
        busy={isSaving}
        width={1040}
        actions={
          <>
            <Button disabled={isSaving} onClick={() => setEditorOpen(false)}>
              Close
            </Button>
            {editorStepIndex > 0 ? (
              <Button
                disabled={isSaving}
                onClick={() => setEditorTab(editorSteps[editorStepIndex - 1].value)}
              >
                Back
              </Button>
            ) : null}
            {editorStepIndex < editorSteps.length - 1 ? (
              <Button variant="contained" disabled={isSaving} onClick={handleNextEditorStep}>
                Continue
              </Button>
            ) : null}
            {!readOnly && (Boolean(editing) || editorStepIndex === editorSteps.length - 1) ? (
              <LoadingButton variant="contained" loading={isSaving} onClick={handleSave}>
                Save Draft
              </LoadingButton>
            ) : null}
          </>
        }
      >
        <Box>
          <AdmissionsPlaybookBasicsStep />

          <AdmissionsPlaybookStagesStep />

          <AdmissionsPlaybookRoundsStep />

          <AdmissionsPlaybookExamsStep />

          <AdmissionsPlaybookSlotsStep />
        </Box>
      </EnrollmentSettingsEditorDrawer>
    </>
  );
}
