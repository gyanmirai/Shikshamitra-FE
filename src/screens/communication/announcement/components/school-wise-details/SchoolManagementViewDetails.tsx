'use client';

import React, { memo } from 'react';
import { Stack } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import SchoolWiseAnnouncementDetailCard from './SchoolWiseAnnouncementDetails2';
import SchoolWiseAnnouncementDetailsInfoCard from './SchoolWiseAnnouncementDetailsInfoCard';

import type { ISchoolWiseAnnouncement } from '../../type';

interface Props {
  announcement: ISchoolWiseAnnouncement | null;
}

const SchoolManagementViewDetails = ({ announcement }: Props) => (
  <Scrollbar sx={{ maxHeight: 600, p: 2 }}>
    <Stack spacing={3}>
      <SchoolWiseAnnouncementDetailsInfoCard announcement={announcement} />
      <SchoolWiseAnnouncementDetailCard announcement={announcement} />
    </Stack>
  </Scrollbar>
);

/**
 * Memoization Justification:
 * Component is a container for multiple detail cards. Memoizing prevents re-renders
 * when the parent state changes unless the announcement object itself changes.
 */
export default memo(SchoolManagementViewDetails);
