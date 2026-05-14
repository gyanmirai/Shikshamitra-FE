'use client';

import { hrPermissions } from 'src/constants/hr-menus';
import StudentPermissionGuard from 'src/components/student-permission-guard';

const ProfessionalTaxLayout = ({ children }: { children: React.ReactNode }) => (
  <StudentPermissionGuard permissionKey={hrPermissions.payroll.settings.professionalTax}>
    {children}
  </StudentPermissionGuard>
);

export default ProfessionalTaxLayout;
