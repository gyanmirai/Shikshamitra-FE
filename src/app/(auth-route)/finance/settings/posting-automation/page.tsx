import React from 'react';
import PostingAutomation from 'src/screens/finance/settings/PostingAutomation';
import StudentPermissionGuard from 'src/components/student-permission-guard';
import { financePermissions } from 'src/constants/finance-menu';

export const metadata = {
  title: 'Accounts Posting Setup | Shikshamitra',
};

export default function PostingAutomationPage() {
  return <StudentPermissionGuard permissionKey={financePermissions.accounts.settings.postingAutomation}>
    <PostingAutomation />
  </StudentPermissionGuard>;
}
