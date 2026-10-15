import { Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import SchoolIdentityScreen from 'src/screens/setting/school-identity';

export default function SchoolIdentityPage() {
  return (
    <Suspense fallback={<CircularProgress aria-label="Loading School Identity" />}>
      <SchoolIdentityScreen />
    </Suspense>
  );
}
