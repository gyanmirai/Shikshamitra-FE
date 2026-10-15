import Box from '@mui/material/Box';
import { Logo } from 'src/components/logo';
import { useState, useEffect } from 'react';
import {
  useGetSchoolBrandingQuery,
  useGetSchoolBrandingImageQuery,
} from 'src/redux/InstituteSetup/schoolIdentityApi';

export function SchoolBrandingLogo({ enabled }: { enabled: boolean }) {
  const query = useGetSchoolBrandingQuery(undefined, { skip: !enabled });
  const hasLogo = Boolean(query.currentData?.effective.logo?.asset);
  const image = useGetSchoolBrandingImageQuery(0, { skip: !enabled || !hasLogo });
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!image.currentData) return undefined;
    const url = URL.createObjectURL(image.currentData);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [image.currentData]);
  if (!enabled || !hasLogo || !image.currentData || !src || image.isError)
    return <Logo data-slot="logo" />;
  return (
    <Box
      component="img"
      src={src}
      alt="School logo"
      data-slot="logo"
      sx={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }}
    />
  );
}
