'use client';

import { Box } from '@mui/material';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

import { AdmissionsCrmConfigurationPipelinePanel } from './admissions-crm-configuration-section-23';

import { AdmissionsCrmConfigurationCapturePanel } from './admissions-crm-configuration-section-22';

import { AdmissionsCrmConfigurationJourneyPanel } from './admissions-crm-configuration-section-21';

export function AdmissionsCrmConfigurationSection2() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    approvedMessageTemplates,
    channelSettings,
    cycleForm,
    focusPanel,
    focusSection,
    formTemplates,
    handleAddApplicantChecklistItem,
    handleApplicantChecklistChange,
    handleApplySchoolDefaultCycle,
    handleChannelSettingChange,
    handleCycleChange,
    handleCycleReadinessToggle,
    handleRemoveApplicantChecklistItem,
    handleSaveCycle,
    handleSaveSchoolDefaultCycle,
    handleSaveStage,
    handleStageChange,
    handleToggleJourneyLock,
    inquirySourceOptions,
    inquirySources,
    isLockingJourney,
    isPreviewingCycleImpact,
    isSchoolDefaultCycleFetching,
    isUnlockingJourney,
    isUpdatingCycle,
    isUpdatingPipelineStage,
    isUpdatingSchoolDefaultCycle,
    journeyLockReason,
    openInquirySourceDialog,
    ownerOptions,
    schoolDefaultCycle,
    setCustomStageOpen,
    setCycleForm,
    setInquirySourceStatus,
    setJourneyLockReason,
    stageForms,
    stages,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 1.5,
        }}
      >
        {focusSection === 'journey' && (!focusPanel || focusPanel === 'cycle') && (
          <AdmissionsCrmConfigurationJourneyPanel />
        )}

        {focusSection === 'capture' && (!focusPanel || focusPanel === 'capture') && (
          <AdmissionsCrmConfigurationCapturePanel />
        )}

        {focusSection === 'journey' && (!focusPanel || focusPanel === 'pipeline') && (
          <AdmissionsCrmConfigurationPipelinePanel />
        )}
      </Box>
    </>
  );
}
