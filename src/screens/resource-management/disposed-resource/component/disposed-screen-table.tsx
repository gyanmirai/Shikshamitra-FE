import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

const ResourceDisposedTable = () => (
  <CustomizableTable
    tableId="resource-disposed-table"
    searchFieldProps={{
      placeholder: 'Search by Name, Category...',
      label: 'Search by Name, Category...',
      sx: {
        maxWidth: '400px',
        width: '100%',
      },
    }}
    noDataText={<>No Resources Disposed Found.</>}
    columns={[
      {
        label: 'Name',
        id: 'name',
      },
      {
        label: 'Category',
        id: 'category',
      },

      // {
      //     label: 'Status',
      //     id: 'maintenanceStatus',
      //     minWidth: '100px',
      //     filterType: 'enum',
      //     enumOptions: ResourceMaintenanceRequestStatusTypeOptions,
      //     render(value, row) {
      //         const color = ResourceMaintenanceRequestStatusTypeColors[
      //             value as ResourceMaintenanceRequestStatusType
      //         ] as LabelColor;

      //         return <Label color={color}>{ResourceMaintenanceRequestStatusType[value]}</Label>;
      //     },
      // },
    ]}
    data={[]}
  />
);

export default ResourceDisposedTable;
