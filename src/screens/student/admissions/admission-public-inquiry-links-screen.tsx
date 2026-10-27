'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdmissionPublicInquiryLinks } from './admission-public-inquiry-links';

export default function AdmissionPublicInquiryLinksScreen() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit = hasGrantedPermission(permissions, 'Students.Admissions.Offerings.Add');
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        minHeight: 0,
        minWidth: 0,
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="Public inquiry links"
        description="Create and manage public admission inquiry forms and links."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Public inquiry links' },
        ]}
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          canEdit ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:link-plus" />}
              onClick={() => setCreateOpen(true)}
            >
              Create inquiry link
            </Button>
          ) : undefined
        }
      />
      <AdmissionPublicInquiryLinks
        canEdit={canEdit}
        createOpen={createOpen}
        onCreateClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
