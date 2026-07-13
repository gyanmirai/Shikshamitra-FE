'use client';

import type { RootState } from 'src/redux/store';

import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { SplashScreen } from 'src/components/loading-screen';
import { Box, Tab, Tabs, Paper, Stack, Typography } from '@mui/material';

const loading = () => <SplashScreen />;

const AdmissionsCrmConfiguration = dynamic(() => import('./admissions-crm-configuration'), {
  loading,
});
const AdmissionsPlaybookConfiguration = dynamic(
  () => import('./admissions-playbook-configuration'),
  { loading }
);
const AdmissionsRegistrationConfiguration = dynamic(
  () => import('./admissions-registration-configuration'),
  { loading }
);
const AdmissionsDocumentConfiguration = dynamic(
  () => import('./admissions-document-configuration'),
  { loading }
);
const AdmissionsSeatPoolConfiguration = dynamic(
  () => import('./admissions-seat-pool-configuration'),
  { loading }
);
const AdmissionsNumberSeriesConfiguration = dynamic(
  () => import('./admissions-number-series-configuration'),
  { loading }
);
const AdmissionsPolicyPackConfiguration = dynamic(
  () => import('./admissions-policy-pack-configuration'),
  { loading }
);
const AdmissionsRouteConfiguration = dynamic(() => import('./admissions-route-configuration'), {
  loading,
});
const AdmissionsGovernanceConfiguration = dynamic(
  () => import('./admissions-governance-configuration'),
  { loading }
);

type SettingsSection =
  | 'journey'
  | 'capture'
  | 'routing'
  | 'exams'
  | 'registration'
  | 'seats'
  | 'activation'
  | 'governance'
  | 'communications'
  | 'automation';

const sections: Array<{ value: SettingsSection; label: string }> = [
  { value: 'journey', label: 'Journey' },
  { value: 'capture', label: 'Inquiry Capture' },
  { value: 'routing', label: 'Routing & Scoring' },
  { value: 'exams', label: 'Entrance Exams' },
  { value: 'registration', label: 'Registration & Documents' },
  { value: 'seats', label: 'Offers & Seats' },
  { value: 'activation', label: 'Activation' },
  { value: 'governance', label: 'Governance' },
  { value: 'communications', label: 'Communications' },
  { value: 'automation', label: 'Automation' },
];

const AdmissionsSettingsWorkspace = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id as string | undefined;
  const [section, setSection] = useState<SettingsSection>('journey');
  const [isDirty, setIsDirty] = useState(false);
  const configurationDialog = useBoolean();

  useEffect(() => {
    const handleDirtyState = (event: Event) => {
      setIsDirty(Boolean((event as CustomEvent<{ dirty?: boolean }>).detail?.dirty));
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('admissions-settings-dirty', handleDirtyState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('admissions-settings-dirty', handleDirtyState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleSectionChange = (nextSection: SettingsSection) => {
    if (isDirty && !window.confirm('Discard unsaved enrollment setting changes?')) return;
    setIsDirty(false);
    setSection(nextSection);
  };

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Box>
        <Typography variant="h5">Enrollment Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure the admission journey for the selected academic year.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 1, overflowX: 'auto' }}>
        <Tabs
          value={section}
          onChange={(_, value: SettingsSection) => handleSectionChange(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Enrollment settings sections"
        >
          {sections.map((item) => (
            <Tab key={item.value} value={item.value} label={item.label} />
          ))}
        </Tabs>
      </Paper>

      {(['journey', 'capture', 'routing', 'communications', 'automation'] as const).includes(
        section as 'journey'
      ) && (
        <AdmissionsCrmConfiguration
          admissionsCrmConfigurationDialog={configurationDialog}
          focusSection={
            section as 'journey' | 'capture' | 'routing' | 'communications' | 'automation'
          }
        />
      )}
      {section === 'exams' && <AdmissionsPlaybookConfiguration academicYearId={academicYearId} />}
      {section === 'registration' && (
        <Stack spacing={1.5}>
          <AdmissionsRegistrationConfiguration academicYearId={academicYearId} />
          <AdmissionsDocumentConfiguration academicYearId={academicYearId} />
        </Stack>
      )}
      {section === 'seats' && <AdmissionsSeatPoolConfiguration />}
      {section === 'activation' && <AdmissionsNumberSeriesConfiguration />}
      {section === 'governance' && (
        <Stack spacing={1.5}>
          <AdmissionsRouteConfiguration />
          <AdmissionsPolicyPackConfiguration />
          <AdmissionsGovernanceConfiguration />
        </Stack>
      )}
    </Box>
  );
};

export default AdmissionsSettingsWorkspace;
