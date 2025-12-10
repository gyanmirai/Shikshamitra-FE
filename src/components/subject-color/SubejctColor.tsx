import { Box } from '@mui/material';

// Create this component in a new file SubjectColorIndicator.tsx:
interface SubjectColorIndicatorProps {
  color: string | undefined;
}

export const SubjectColorIndicator = ({ color }: SubjectColorIndicatorProps) => (
  <Box
    sx={{
      width: 4,
      height: 18,
      borderRadius: 1,
      bgcolor: color,
    }}
  />
);
