import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';

import type { RequestorInfoProps } from './type';

const RequestorInfoCard: React.FC<RequestorInfoProps> = ({ charge }) => (
  <Box sx={{ p: 2 }}>
    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" color="#00A76F" gutterBottom>
          Requestor Information
        </Typography>

        {/* First Row - Basic Info */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary">Name</Typography>
            <Typography sx={{ fontWeight: 400 }}>
              {charge?.requestorName || 'Dharmik Jinjala'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary">Affected Students</Typography>
            <Typography sx={{ fontWeight: 400 }}>Class : {charge?.class}</Typography>
            <Typography sx={{ fontWeight: 400 }}>
              Division : {charge?.divisions?.join(', ') || 'ALL'}
            </Typography>
            <Typography sx={{ fontWeight: 400 }}>
              Total Students : {charge?.students || 80}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary">Department</Typography>
            <Typography sx={{ fontWeight: 400 }}>{charge?.department || 'Science'}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary">Requested On</Typography>
            <Typography sx={{ fontWeight: 400 }}>{charge?.requestedOn || '20-08-2025'}</Typography>
          </Grid>
        </Grid>

        {/* Affected Students Table Section */}
        <Box>
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
      </CardContent>
    </Card>
  </Box>
);

export default RequestorInfoCard;
