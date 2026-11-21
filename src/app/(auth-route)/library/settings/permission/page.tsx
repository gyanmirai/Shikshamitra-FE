import { redirect } from 'next/navigation';
import { securityPaths } from 'src/constants/security-menu';

export default function LibraryPermissionSettingsRedirect() {
  redirect(securityPaths.roleAndPermission.role);
}
