import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useGetEmployeeICardSchoolLogoQuery } from 'src/redux/hr/employee-icard-template-api';

export function SharedSchoolLogo({ mediumStageId }: { mediumStageId?: string }) {
  const query = useGetEmployeeICardSchoolLogoQuery(mediumStageId);
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!query.currentData) { setSrc(''); return undefined; }
    const url = URL.createObjectURL(query.currentData);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [query.currentData]);
  if (query.isError) return <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>School logo could not be loaded.</Alert>;
  if (query.isFetching) return <Skeleton variant="rectangular" width="100%" height="100%" />;
  return src ? <Box component="img" src={src} alt="School logo" sx={{ width: 1, height: 1, objectFit: 'contain' }} /> : null;
}
