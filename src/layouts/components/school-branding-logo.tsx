import Box from '@mui/material/Box';
import { Logo } from 'src/components/logo';
import { useState, useEffect } from 'react';
import { useGetSchoolBrandingImageQuery } from 'src/redux/InstituteSetup/schoolIdentityApi';

export function SchoolBrandingLogo({ tenantId }: { tenantId?: string }) {
  const image = useGetSchoolBrandingImageQuery(
    { kind: 'logo', tenantId: tenantId ?? '' },
    { skip: !tenantId }
  );
  const [source, setSource] = useState<{ blob: Blob; url: string } | null>(null);
  const [failedSource, setFailedSource] = useState('');
  useEffect(() => {
    if (!image.currentData) return undefined;
    const url = URL.createObjectURL(image.currentData);
    setSource({ blob: image.currentData, url });
    return () => URL.revokeObjectURL(url);
  }, [image.currentData]);

  // currentData and the blob identity prevent a previous tenant/image from flashing during a switch.
  if (
    !tenantId ||
    !image.currentData ||
    source?.blob !== image.currentData ||
    source.url === failedSource ||
    image.isError
  )
    return <Logo data-slot="logo" />;
  return (
    <Box
      component="img"
      src={source.url}
      alt="School logo"
      onError={() => setFailedSource(source.url)}
      data-slot="logo"
      sx={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }}
    />
  );
}
