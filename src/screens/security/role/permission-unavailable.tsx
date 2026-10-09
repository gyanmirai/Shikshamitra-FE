import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';

export default function PermissionUnavailable({
  title,
  permissionName,
  availableNames,
}: {
  title: string;
  permissionName?: string | string[];
  availableNames: string[];
}) {
  const [reference] = useState(() => `PERM-${crypto.randomUUID()}`);
  const diagnostic = JSON.stringify({ permissionName, availableNames });

  useEffect(() => {
    console.error('Permission catalogue mapping unavailable', {
      reference,
      title,
      ...JSON.parse(diagnostic),
    });
  }, [diagnostic, reference, title]);

  return (
    <Typography role="alert" variant="caption" color="error">
      Permissions for this sub-module are unavailable. Contact support. Reference: {reference}
    </Typography>
  );
}
