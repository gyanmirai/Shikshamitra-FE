import CustomizableTable from '../customizabaleTable';

const AcademicActivity = () => (
  <CustomizableTable
    columns={[
      { id: 'activity', label: 'Activity' },
      { id: 'date', label: 'Date', filterType: 'date' },
    ]}
    data={[]}
    tableId="student-activity-table"
    noDataText={<>No academic activities found.</>}
  />
);

export default AcademicActivity;
