import React from 'react';
import { Box } from '@mui/material';

import { RenderDocuments } from './employee-form-fields/RenderDocuments';

const QualificationAndCertification = ({ employee }: any) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 280px)',
      minHeight: 0,
    }}
  >
    <RenderDocuments employeeId={employee?.id} />
  </Box>
);
export default QualificationAndCertification;
