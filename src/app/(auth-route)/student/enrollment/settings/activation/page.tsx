'use client';

import { Iconify } from 'src/components/iconify';
import { Alert, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';
import { EnrollmentSettingsPage } from 'src/screens/student/enrollment/setting/enrollment-settings-page';
import { useEnrollmentWorkspace } from 'src/screens/student/enrollment/admissions-crm/enrollment-workspace-context';
import { ActivationSettingsConfiguration } from 'src/screens/student/enrollment/setting/activation-settings-configuration';
import AdmissionsNumberSeriesConfiguration from 'src/screens/student/enrollment/setting/admissions-number-series-configuration';

export default function ActivationSettingsPage() {
  const { academicYearId } = useEnrollmentWorkspace();

  return (
    <EnrollmentSettingsPage
      title="Activation Settings"
      description="Configure required gates, approval ownership, cancellation timing, and activation messages."
      layout="document"
    >
      {academicYearId ? (
        <>
          <ActivationSettingsConfiguration academicYearId={academicYearId} />
          <Accordion variant="outlined" disableGutters>
            <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
              <Typography variant="subtitle2">Identifier numbering</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AdmissionsNumberSeriesConfiguration />
            </AccordionDetails>
          </Accordion>
        </>
      ) : (
        <Alert severity="info">Select an academic year to configure Activation.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
