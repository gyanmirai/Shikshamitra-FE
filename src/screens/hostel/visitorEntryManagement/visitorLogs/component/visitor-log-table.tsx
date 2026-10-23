import dayjs from 'dayjs';
import React from 'react';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/hostel/visitorManagement/visitor-logs-data.json';
import {
  VisitorStatusType,
  VisitorStatusColors,
  VisitorStatusOptions,
} from 'src/enums/visitor-status-type';

const VisitorLogtable = () => (
  <CustomizableTable
    tableId="visitor-log-data-table"
    searchFieldProps={{
      placeholder: 'Search by Visitor Name...',
      label: 'Search by Visitor Name...',
      sx: {
        maxWidth: '400px',
        width: '100%',
      },
    }}
    noDataText="No visitor log data available."
    columns={[
      { id: 'visitorName', label: 'Visitor Name', align: 'left' },
      { id: 'visitingWhome', label: 'Student Name', align: 'left' },
      { id: 'visitingType', label: 'Visiting Type', align: 'left' },
      {
        id: 'entryTime',
        label: 'Entry Time',
        filterType: 'string' as const,
        align: 'left',
        isFilter: true,
        isSort: false,

        render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
      },
      {
        id: 'exitTime',
        label: 'Exit Time',
        filterType: 'string' as const,
        align: 'left',
        isFilter: true,
        isSort: false,
        render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum' as const,
        enumOptions: VisitorStatusOptions,
        minWidth: '130px',
        align: 'left',
        render(value, row) {
          const color = VisitorStatusColors[value as VisitorStatusType];

          const val = VisitorStatusType[value];

          return <Label color={color}>{val}</Label>;
        },
      },
    ]}
    data={data}
  />
);

export default VisitorLogtable;
