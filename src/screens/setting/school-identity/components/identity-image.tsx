import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useGetSchoolIdentityAssetQuery } from 'src/redux/InstituteSetup/schoolIdentityApi';

import type { IdentityContext } from '../types';

export function IdentityImage({
  id,
  context,
  label,
  height = 120,
  disabled = false,
}: {
  id: string;
  context: IdentityContext;
  label: string;
  height?: number;
  disabled?: boolean;
}) {
  const query = useGetSchoolIdentityAssetQuery({ id, ...context });
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!query.currentData) return undefined;
    const url = URL.createObjectURL(query.currentData);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [query.currentData]);
  if (query.isError)
    return (
      <Alert
        severity="error"
        icon={false}
        sx={{
          p: 1,
          minWidth: 0,
          flexDirection: 'column',
          '& .MuiAlert-message': { minWidth: 0, overflowWrap: 'anywhere' },
          '& .MuiAlert-action': { m: 0, p: 0 },
        }}
        action={
          <Button disabled={disabled} onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Image could not be loaded.
      </Alert>
    );
  if (!query.currentData || !src) return <Skeleton variant="rectangular" height={height} />;
  return (
    <Box
      component={disabled ? 'span' : 'a'}
      href={disabled ? undefined : src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View full-size ${label}`}
      sx={{
        display: 'block',
        minHeight: 44,
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      <Box
        component="img"
        src={src}
        alt={label}
        sx={{ width: 1, height, objectFit: 'contain', bgcolor: 'background.neutral' }}
      />
    </Box>
  );
}
