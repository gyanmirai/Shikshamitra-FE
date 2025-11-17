import { useTheme } from '@mui/material/styles';
import { Box, Divider, Typography } from '@mui/material';

export const StudentFeesSummaryView = ({ student }: any) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        boxShadow: 'var(--shadows-4)',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {/* Student Details */}
      <Box flex={1} display="flex" alignItems="center" gap={4}>
        {/* Name */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Name
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {student?.name}({student?.grNumber})
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Class & Section */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Class/Div
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {student?.className}-{student?.division}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Roll No */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Roll No
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {student?.rollNumber}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Contact */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Contact
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {student?.contactNumber}
          </Typography>
        </Box>
      </Box>

      {/* Status Chip */}
    </Box>
  );
};
