import CustomizableTable from 'src/components/customizabaleTable';

const notificationRows: any[] = [];

const EnrollmentNotificationManagement = () => {
  const columns: any[] = [
    { id: 'event', label: 'Event', align: 'left' },
    { id: 'triggerCondition', label: 'Trigger Condition', align: 'left' },
    { id: 'isActive', label: 'Status', align: 'left' },
  ];

  return (
    <CustomizableTable
      tableId="enrollment-notification-management-table"
      columns={columns}
      data={notificationRows}
      noDataText="No enrollment notifications found."
    />
  );
};

export default EnrollmentNotificationManagement;
