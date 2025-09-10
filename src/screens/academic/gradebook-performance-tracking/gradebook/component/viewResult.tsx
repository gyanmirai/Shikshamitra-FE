'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import DetailRow from 'src/screens/communication/announcement/components/detailRow';

import type { TStudentGrade } from '../gradebook';

interface ViewResultProps {
  student: TStudentGrade | null;
}

const ViewResult: React.FC<ViewResultProps> = ({ student }) => (
  <Box sx={{ p: 2 }}>
    <Scrollbar sx={{ height: '300px' }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="ph:student-fill" className="text-gray-500 w-6 h-6" />
        <Typography variant="h6" className="font-semibold">
          {student?.studentName}
        </Typography>
      </Box>
      <hr className="border-gray-200" />

      <DetailRow
        label="Subject"
        icon="material-symbols:subject"
        value={
          <Typography variant="body2" className="text-gray-700">
            {student?.subject}
          </Typography>
        }
      />

      <DetailRow
        label="Assignment"
        icon="material-symbols:assignment"
        value={
          <Typography variant="body2" className="text-gray-700">
            {student?.assignments}
          </Typography>
        }
      />

      <DetailRow
        label="Grade"
        icon="material-symbols:grade"
        value={
          <Typography variant="body2" className="text-gray-700">
            {student?.grade}
          </Typography>
        }
      />

      <DetailRow
        label="Weighted Average"
        icon="hugeicons:chart-average"
        value={
          <Typography variant="body2" className="text-gray-700">
            {student?.weightedAverage}
          </Typography>
        }
      />
    </Scrollbar>
  </Box>
);

export default ViewResult;
