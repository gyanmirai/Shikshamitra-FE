import { Suspense } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import ExactPermissionGuard from 'src/components/exact-permission-guard';
import MyLibraryWorkspace from 'src/screens/library/portal/MyLibraryWorkspace';

export default function MyLibraryPage() {
  return (
    <ExactPermissionGuard permissionKey="Library.Portal.View">
      <Suspense fallback={<LinearProgress aria-label="Loading My Library" />}>
        <MyLibraryWorkspace />
      </Suspense>
    </ExactPermissionGuard>
  );
}
