import type { LabelColor } from 'src/components/label/types';

import dayjs from 'dayjs';
import React from 'react';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/security/admin-dashboard-table-data.json';
import {
  CommonComplaintStatusType,
  CommonComplaintStatusTypeColor,
  CommonComplaintStatusTypeOptions,
} from 'src/enums/common-complaint-statusType';

const AlertDashboardTable = () => (
  <CustomizableTable
    searchFieldProps={{
      placeholder: 'Search by  Name, status...',
      label: 'Search by  Name, status...',
      sx: {
        maxWidth: '400px',
        width: '100%',
      },
    }}
    tableId="access-logs-management-table"
    noDataText="No Alerts Found"
    columns={[
      {
        id: 'studentName',
        label: 'Student Name',
      },
      {
        id: 'aknowledgementBy',
        label: 'Officer',
        render: (value) => value || '-',
      },
      {
        id: 'time',
        label: 'Time',
        isFilter: false,
        isSort: false,
        render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        enumOptions: CommonComplaintStatusTypeOptions,
        minWidth: '130px',
        align: 'left',
        render(value, row) {
          const color = CommonComplaintStatusTypeColor[
            value as CommonComplaintStatusType
          ] as LabelColor;

          const val = CommonComplaintStatusType[value];
          return <Label color={color}>{val}</Label>;
        },
      },
    ]}
    data={data}
  />
);

export default AlertDashboardTable;
