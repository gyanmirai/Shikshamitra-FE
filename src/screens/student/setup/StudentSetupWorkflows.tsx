'use client';

import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, Button, Typography } from '@mui/material';

import { studentSetupWorkflows } from './student-setup-catalog';

export default function StudentSetupWorkflows({ permissions, disabled }: { permissions: GrantedPermission[]; disabled: boolean }) {
  const workflows = studentSetupWorkflows.filter((item) => hasGrantedPermission(permissions, item.permission));
  return <Stack spacing={3}>
    <Stack spacing={1}>
      <Typography variant="overline" color="text.secondary">Student setup</Typography>
      <Typography variant="h4" component="h1">Student Workflows</Typography>
      <Typography color="text.secondary">Continue in the existing workspaces when you are ready. You can finish this guide before students are admitted.</Typography>
    </Stack>
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper' }}>
      {workflows.map((item) => <Stack key={item.title} direction={{ xs: 'column', sm: 'row' }} spacing={2}
        alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ p: 2, '& + &': { borderTop: 1, borderColor: 'divider' } }}>
        <Box><Typography variant="subtitle2">{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.description}</Typography></Box>
        <Button component="a" href={item.path} target="_blank" rel="noopener noreferrer" variant="outlined" color="inherit" size="small"
          disabled={disabled} aria-label={`Open ${item.title}`} sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}>Open</Button>
      </Stack>)}
      {!workflows.length && <Typography sx={{ p: 2 }} color="text.secondary">An authorized staff member can review operational workflows. Your current permissions allow configuration only.</Typography>}
    </Box>
    <Typography variant="body2" color="text.secondary">Continuing here does not activate a student, assign fees, collect money or send credentials.</Typography>
  </Stack>;
}
