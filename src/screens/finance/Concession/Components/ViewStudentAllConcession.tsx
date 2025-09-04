import React from 'react';

import { Box, Grid, Typography } from '@mui/material';

import {
  DocumentStatusType,
  DocumentStatusOptions,
  DocumentStatusTypeColors,
} from 'src/enums/document-statusType';
import {
  ConcessionStatusType,
  ConcessionStatusOptions,
  ConcessionStatusTypeColors,
} from 'src/enums/concession-status-type';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentInfo } from '../type';

const ViewStudentAllConcession = ({ data }: { data: IStudentInfo }) => (
  <Scrollbar sx={{ height: '500px', p: 2 }}>
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2} color="primary.main">
        Student Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Student Name
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {data?.studentName}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Roll No.
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {data?.rollNo}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Sibling
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {data?.sibling}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Contact No.
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {data?.contactNo}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Class/Division
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {data?.classDivision}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            GR No.
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {data?.grNo}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Parent Name
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {data?.parentName}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {data?.email}
          </Typography>
        </Grid>
      </Grid>
    </Box>
    <CustomizableTable
      tableId="concession-table"
      noDataText="No concession requests found"
      columns={[
        {
          id: 'concessionType',
          label: 'Concession Type',
          align: 'left',
          minWidth: 150,
        },
        {
          id: 'reason',
          label: 'Reason',
          align: 'left',
          minWidth: 220,
          render: (value) => (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {value}
            </Typography>
          ),
        },
        {
          id: 'documentStatus',
          label: 'Document Status',
          align: 'left',
          minWidth: 120,
          filterType: 'enum',
          enumOptions: DocumentStatusOptions,
          render: (value) => {
            if (value === undefined || value === null) return '-';
            const color = DocumentStatusTypeColors[value as DocumentStatusType];
            return (
              <Label
                color={
                  color as
                    | 'default'
                    | 'primary'
                    | 'secondary'
                    | 'info'
                    | 'success'
                    | 'warning'
                    | 'error'
                }
              >
                {DocumentStatusType[value]}
              </Label>
            );
          },
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: 120,
          filterType: 'enum',
          enumOptions: ConcessionStatusOptions,
          render: (value) => {
            if (value === undefined || value === null) return '-';
            const color = ConcessionStatusTypeColors[value as ConcessionStatusType];
            return (
              <Label
                color={
                  color as
                    | 'default'
                    | 'primary'
                    | 'secondary'
                    | 'info'
                    | 'success'
                    | 'warning'
                    | 'error'
                }
              >
                {ConcessionStatusType[value]}
              </Label>
            );
          },
        },
      ]}
      data={data?.concessions || []}
    />
  </Scrollbar>
);

export default ViewStudentAllConcession;
