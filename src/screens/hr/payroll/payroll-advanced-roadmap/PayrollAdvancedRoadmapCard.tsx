'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, List, ListItem, Typography, CardContent, ListItemText } from '@mui/material';

import { PAYROLL_UX_ROADMAP_PHASES } from './payroll-advanced-roadmap.data';

const PayrollAdvancedRoadmapCard = () => (
  <Card variant="outlined">
    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Iconify icon="solar:map-point-wave-bold" width={22} color="action.active" />
        <Typography variant="subtitle1" fontWeight={700}>
          Later milestones (roadmap)
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Current release focuses on a trustworthy cycle, clear exceptions, and India setup. Upcoming
        waves add scale, insight, and collaboration - without bloating the daily flow.
      </Typography>
      {PAYROLL_UX_ROADMAP_PHASES.map((phase) => (
        <Box key={phase.id} sx={{ mb: phase.id === 'phase-4' ? 0 : 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            {phase.title}
          </Typography>
          <List dense disablePadding>
            {phase.bullets.map((bullet) => (
              <ListItem key={bullet} disableGutters sx={{ alignItems: 'flex-start', py: 0.5 }}>
                <ListItemText
                  primary={bullet}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </CardContent>
  </Card>
);

export default PayrollAdvancedRoadmapCard;
