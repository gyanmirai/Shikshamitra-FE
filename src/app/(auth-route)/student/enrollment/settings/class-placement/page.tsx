'use client';

import { Alert } from '@mui/material';
import { EnrollmentSettingsPage } from 'src/screens/student/enrollment/setting/enrollment-settings-page';
import { ClassPlacementConfiguration } from 'src/screens/student/enrollment/setting/class-placement-configuration';
import { useEnrollmentWorkspace } from 'src/screens/student/enrollment/admissions-crm/enrollment-workspace-context';

export default function ClassPlacementSettingsPage() {
  const { academicYearId } = useEnrollmentWorkspace();

  return (
    <EnrollmentSettingsPage
      title="Class Placement Settings"
      description="Configure division timing, capacity warnings, and authorized placement overrides."
    >
      {academicYearId ? (
        <ClassPlacementConfiguration academicYearId={academicYearId} />
      ) : (
        <Alert severity="info">Select an academic year to configure Class Placement.</Alert>
      )}
    </EnrollmentSettingsPage>
  );
}
