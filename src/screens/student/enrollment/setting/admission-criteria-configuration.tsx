'use client';

import RuleOutlined from '@mui/icons-material/RuleOutlined';
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import { Box, Chip, Paper, Stack, Button, Typography } from '@mui/material';

import AdmissionsFinancialConfiguration from './admissions-financial-configuration';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

const gates = [
  {
    icon: <DescriptionOutlined fontSize="small" />,
    title: 'Registration verified',
    description: 'The submitted form must pass template validation and be verified by staff.',
  },
  {
    icon: <FactCheckOutlined fontSize="small" />,
    title: 'Required documents resolved',
    description:
      'Blocking documents must be verified, waived with a reason, or approved through readiness review.',
  },
  {
    icon: <PaymentsOutlined fontSize="small" />,
    title: 'Payment condition satisfied',
    description: 'The published financial policy decides the required payment state and milestone.',
  },
];

export default function AdmissionCriteriaConfiguration() {
  const { updateState } = useEnrollmentWorkspace();

  return (
    <Stack spacing={1.5}>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <Box>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <RuleOutlined fontSize="small" />
                <Typography variant="subtitle1">Admission confirmation gates</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Enrollment checks these conditions before final approval and student activation.
              </Typography>
            </Box>
            <Chip size="small" color="info" variant="outlined" label="Backend enforced" />
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            {gates.map((gate, index) => (
              <Paper key={gate.title} variant="outlined" sx={{ p: 1.25 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Chip size="small" label={index + 1} color="primary" />
                  <Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {gate.icon}
                      <Typography variant="subtitle2">{gate.title}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {gate.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>

          <Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => updateState({ settingsPanel: 'documents', page: 1 }, 'push')}
            >
              Configure required documents
            </Button>
          </Box>
        </Stack>
      </Paper>

      <AdmissionsFinancialConfiguration />
    </Stack>
  );
}
