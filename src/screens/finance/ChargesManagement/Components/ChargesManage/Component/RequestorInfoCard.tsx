import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';

import type { RequestorInfoProps } from './type';

const RequestorInfoCard: React.FC<RequestorInfoProps> = ({ charge }) => (
  <Box sx={{ p: 2 }}>
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" color="#00A76F" gutterBottom>
          Requestor Information
        </Typography>

        {/* First Row - Basic Info */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {charge?.requestorName || 'Dharmik Jinjala'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Department
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {charge?.department || 'Science'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Affected Students
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              Class : {charge?.class}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              Division : {charge?.divisions?.join(', ') || 'ALL'}
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              Students : {charge?.students || 80}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography color="text.secondary">Requested On</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {charge?.requestedOn || '20-08-2025'}
            </Typography>
          </Grid>
        </Grid>

        {/* Affected Students Table Section */}
      </CardContent>
    </Card>
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" color="#00A76F" gutterBottom>
        Affected Students
      </Typography>

      <CustomizableTable
        tableId="affected-students"
        noDataText="No students found"
        columns={[
          { id: 'name', label: 'Name', align: 'left', sticky: true },
          { id: 'class', label: 'Class', align: 'left' },
          { id: 'division', label: 'Division', align: 'left' },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            filterType: 'number',
            minWidth: 100,
          },
          { id: 'grNo', label: 'GR No.', align: 'left', minWidth: 100 },
        ]}
        data={
          charge?.studentList?.map((student, index) => ({
            name: student.name,
            class: charge?.class || '10',
            division: student.division,
            rollNo: student.rollNo || String(index + 1).padStart(2, '0'),
            grNo: student.grNo || `GR${String(index + 1).padStart(3, '0')}`,
          })) || [
            {
              name: 'Dharmik Jinjala',
              class: '10',
              division: 'A',
              rollNo: '01',
              grNo: 'GR001',
            },
            { name: 'Prerna Atre', class: '10', division: 'B', rollNo: '05', grNo: 'GR002' },
            { name: 'Mayur Solanki', class: '10', division: 'C', rollNo: '08', grNo: 'GR003' },
          ]
        }
      />
    </Box>
  </Box>
);

export default RequestorInfoCard;
