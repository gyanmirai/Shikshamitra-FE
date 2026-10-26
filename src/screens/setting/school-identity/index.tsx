'use client';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { InstituteFieldFormattingPopover } from 'src/components/institute-field-formatting/institute-field-formatting-popover';

import { useSchoolIdentity } from './hooks/use-school-identity';
import { IdentityWorkspace } from './components/identity-workspace';

export default function SchoolIdentityScreen() {
  const workspace = useSchoolIdentity();
  const { permissions } = workspace;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 0,
        '& .MuiButtonBase-root:focus-visible': {
          outline: '2px solid',
          outlineColor: 'text.primary',
          outlineOffset: 2,
        },
        '& .MuiTab-root:focus-visible': { outlineOffset: -3 },
      }}
    >
      <CustomBreadcrumbs
        heading="School Identity"
        description="Manage shared school assets and board, medium or organization overrides."
        action={<InstituteFieldFormattingPopover scope="schoolIdentity" />}
        slotProps={{
          action: {},
          heading: {},
          moreLink: {},
          breadcrumbs: { '& .MuiBreadcrumbs-li:last-child > div': { color: 'text.primary' } },
        }}
        links={[
          { name: 'Institute setup', href: instituteSetupPaths.academicSetup },
          { name: 'School Identity' },
        ]}
      />
      {!permissions.ready ? (
        <CircularProgress aria-label="Loading access permissions" />
      ) : !permissions.canView ? (
        <Alert severity="warning">You do not have permission to view School Identity.</Alert>
      ) : (
        <IdentityWorkspace workspace={workspace} />
      )}
    </Box>
  );
}
