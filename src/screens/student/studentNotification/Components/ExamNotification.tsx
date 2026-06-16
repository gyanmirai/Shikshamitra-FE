import CustomizableTable from 'src/components/customizabaleTable';

const notificationRows: any[] = [];

const ExamNotificationManagement = () => {
  const columns: any[] = [
    { id: 'event', label: 'Event', align: 'left' },
    { id: 'triggerCondition', label: 'Trigger Condition', align: 'left' },
    { id: 'isActive', label: 'Status', align: 'left' },
  ];

  return (
    <CustomizableTable
      tableId="exam-notification-management-table"
      columns={columns}
      data={notificationRows}
      noDataText="No exam notifications found."
    />
  );
};

export default ExamNotificationManagement;
