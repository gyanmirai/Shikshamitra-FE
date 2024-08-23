import CustomizableTable from '../customizabaleTable';

const AcademicActivity = () => {
  const studentActivityData = [
    { id: '1', activity: 'Joined Math Club', date: '2023-01-15' },
    { id: '2', activity: 'Participated in Science Fair', date: '2023-03-20' },
    { id: '3', activity: 'Attended Literature Workshop', date: '2023-05-10' },
    { id: '4', activity: 'Completed Online Python Course', date: '2023-07-05' },
    { id: '5', activity: 'Volunteered at Local Library', date: '2023-09-01' },
  ];

  const columns: any = [
    { id: 'activity', label: 'Activity' },
    { id: 'date', label: 'Date' },
  ];

  return <CustomizableTable columns={columns} data={studentActivityData} />;
};

export default AcademicActivity;
