import CustomizableTable from '../customizabaleTable';

const AcademicActivity = () => {
  const studentActivityData = [
    { id: '1', activity: 'Joined Math Club', date: '2023-01-15' },
    { id: '2', activity: 'Participated in Science Fair', date: '2023-03-20' },
    { id: '3', activity: 'Attended Literature Workshop', date: '2023-05-10' },
    { id: '4', activity: 'Completed Online Python Course', date: '2023-07-05' },
    { id: '5', activity: 'Volunteered at Local Library', date: '2023-09-01' },
  ];

  return (
    <CustomizableTable
      searchFieldProps={{
        placeholder: 'Search by Activity, Date...',
        label: 'Search by Activity, Date...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      columns={[
        { id: 'activity', label: 'Activity' },
        { id: 'date', label: 'Date', filterType: 'date' },
      ]}
      data={studentActivityData}
      tableId="student-activity-table"
    />
  );
};

export default AcademicActivity;
