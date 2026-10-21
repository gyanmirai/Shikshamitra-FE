import { Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import SchoolDocumentsScreen from 'src/screens/setting/school-documents';

export default function SchoolDocumentsPage() {
  return (
    <Suspense fallback={<CircularProgress aria-label="Loading School Documents" />}>
      <SchoolDocumentsScreen />
    </Suspense>
  );
}
