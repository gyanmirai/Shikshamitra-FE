import { Avatar } from '@mui/material';

import { useHouseLogo } from './use-house-logo';

export default function HouseLogoAvatar({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  const src = useHouseLogo(logoUrl);
  return (
    <Avatar
      src={src}
      alt={name}
      sx={{ width: 32, height: 32, bgcolor: 'background.neutral', color: 'text.secondary' }}
    >
      {name.slice(0, 1)}
    </Avatar>
  );
}
