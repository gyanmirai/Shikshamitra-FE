import CustomizableTable from 'src/components/customizabaleTable';

const notificationRows: any[] = [];

const AttendanceNotificationManagement = () => {
  const columns: any[] = [
    { id: 'event', label: 'Event', align: 'left' },
    { id: 'triggerCondition', label: 'Trigger Condition', align: 'left' },
    { id: 'isActive', label: 'Status', align: 'left' },
  ];

  return (
    <CustomizableTable
      tableId="attendance-notification-management-table"
      columns={columns}
      data={notificationRows}
      noDataText="No attendance notifications found."
    />
  );
};

export default AttendanceNotificationManagement;
