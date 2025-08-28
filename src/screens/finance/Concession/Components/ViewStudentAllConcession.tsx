import React from 'react';

import { Typography } from '@mui/material';

import {
  ConcessionStatusType,
  ConcessionStatusOptions,
  ConcessionStatusTypeColors,
} from 'src/enums/concession-status-type';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IStudentInfo } from '../type';

const ViewStudentAllConcession = ({ data }: { data: IStudentInfo }) => {
  console.log('selectedConcession0000', data);

  return (
    <Scrollbar sx={{ height: '150px', p: 2 }}>
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
};

export default ViewStudentAllConcession;
