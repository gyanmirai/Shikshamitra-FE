import { useTheme } from '@mui/material/styles';
import { Box, Card, Divider, Typography } from '@mui/material';

export const StudentFeesSummaryView = ({ student }: any) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%',
        boxShadow: theme.customShadows?.card || theme.shadows[3],
        display: 'flex',
        flexDirection: 'column',
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
    </Card>
  );
};
