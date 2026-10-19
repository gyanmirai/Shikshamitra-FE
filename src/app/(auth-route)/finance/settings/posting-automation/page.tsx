import React from 'react';
import PostingAutomation from 'src/screens/finance/settings/PostingAutomation';
import ExactPermissionGuard from 'src/components/exact-permission-guard';
import { financePermissions } from 'src/constants/finance-menu';

export const metadata = {
  title: 'Accounts Posting Setup | Shikshamitra',
};

export default function PostingAutomationPage() {
  return (
    <ExactPermissionGuard permissionKey={financePermissions.accounts.settings.postingAutomation}>
      <PostingAutomation />
    </ExactPermissionGuard>
  );
}
