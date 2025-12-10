import { Box } from '@mui/material';

interface RoleColorIndicatorProps {
  color: string | undefined;
}

export const RoleColorIndicator = ({ color }: RoleColorIndicatorProps) => (
  <Box
    sx={{
      width: 4,
      height: 18,
      borderRadius: 1,
      backgroundColor: color,
    }}
  />
);
