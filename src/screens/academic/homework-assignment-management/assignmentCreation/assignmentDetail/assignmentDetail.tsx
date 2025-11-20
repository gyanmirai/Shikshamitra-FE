import React from 'react';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import AssignmentOverview from './assignmentOverview';

import type { IAssignment } from '../type';

const ViewAssignmentDetails = ({ assignment }: { assignment: IAssignment | null }) => (
  <Box sx={{ p: 2, height: '100%' }}>
    <Scrollbar sx={{ height: '450px' }}>
      {/* Assignment Header */}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Iconify
            icon="mdi:book-open-page-variant"
            sx={{
              color: 'text.secondary',
              width: 20,
              height: 20,
              mr: 0.5,
            }}
          />
          <Typography variant="body2" component="span" sx={{ color: 'text.primary' }}>
            {assignment?.subjects}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Iconify
            icon="mdi:google-classroom"
            sx={{
              color: 'text.secondary',
              width: 20,
              height: 20,
              mr: 0.5,
            }}
          />
          <Typography variant="body2" component="span" sx={{ color: 'text.primary' }}>
            {assignment?.class} - {assignment?.divisionMeta?.divisionId}
          </Typography>
        </Box>
      </Box>
      {/* Subjects Accordions - Multiple Subjects */}
      <Box sx={{ borderColor: 'divider', mb: 2 }}>
        {assignment ? (
          <AssignmentOverview assignment={assignment} />
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              border: '1px dashed #ccc',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No Assignment details available
            </Typography>
          </Box>
        )}
      </Box>
    </Scrollbar>
  </Box>
);

export default ViewAssignmentDetails;
