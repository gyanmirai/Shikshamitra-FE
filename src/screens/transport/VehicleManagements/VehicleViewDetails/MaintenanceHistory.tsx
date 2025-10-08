import { Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetmaintenanceHistoryDataQuery } from 'src/redux/transport/vehicle-management/vehicleDocumentDataApi';

export interface IMaintenanceHistoryRow {
  date: string;
  serviceType: string;
  cost: number;
  nextDue: string;
}

const MaintenanceHistory = () => {
  const { data: maintenanceHistoryData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetmaintenanceHistoryDataQuery,
  });
  return (
    <Card sx={{ p: 2, mb: 2 }}>
      {/* Heading */}
      <Typography variant="h6" mb={2} color="primary.main">
        Maintenance History
      </Typography>

      <CustomizableTable
        tableId="maintenance-history-table"
        noDataText="No Maintenance Records Found"
        isSearch={false}
        isFilter={false}
        columns={[
          {
            id: 'date',
            label: 'Date',
            align: 'left',
            minWidth: '120px',
          },
          {
            id: 'serviceType',
            label: 'Service Type',
            align: 'left',
            minWidth: '180px',
          },
          {
            id: 'cost',
            label: 'Cost',
            align: 'left',
            minWidth: '120px',
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'nextDue',
            label: 'Next Due',
            align: 'left',
            minWidth: '120px',
          },
        ]}
        data={maintenanceHistoryData || []}
      />
    </Card>
  );
};
export default MaintenanceHistory;
