'use client';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, Typography } from '@mui/material';

const riskData = [
  {
    title: '8B - Chemistry',
    description: 'Teacher missing',
    status: 'Critical',
    color: 'error',
  },
  {
    title: '6A - Math',
    description: 'Only 4/12 chapters done (Low Progress)',
    status: 'Warning',
    color: 'warning',
  },
  {
    title: '10C - Physics',
    description: 'Syllabus lagging by 2 weeks',
    status: 'Warning',
    color: 'warning',
  },
  {
    title: '5A - English',
    description: 'Teacher on long leave',
    status: 'Critical',
    color: 'error',
  },
];

const PrincipalRiskDashboard = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6">Risk Dashboard</Typography>
    </Box>
    <Scrollbar sx={{ maxHeight: '300px' }}>
      <Stack spacing={1.5}>
        {riskData.map((item, index) => (
          <RiskCard
            key={index}
            title={item.title}
            description={item.description}
            status={item.status}
            color={
              item.color as
                | 'error'
                | 'warning'
                | 'success'
                | 'info'
                | 'default'
                | 'primary'
                | 'secondary'
            }
          />
        ))}
      </Stack>
    </Scrollbar>
  </Card>
);

export default PrincipalRiskDashboard;

const RiskCard = ({
  title,
  description,
  status,
  color,
}: {
  title: string;
  description: string;
  status: string;
  color: 'error' | 'warning' | 'success' | 'info' | 'default' | 'primary' | 'secondary';
}) => (
  <Card
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 2,
      display: 'flex',
      gap: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
    <Label color={color}>{status}</Label>
  </Card>
);
