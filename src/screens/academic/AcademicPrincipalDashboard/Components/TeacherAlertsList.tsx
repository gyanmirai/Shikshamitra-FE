import React from 'react';

import GenericList from './GenericList';

const TeacherAlertsList = () => {
  const list = [
    {
      id: '1',
      title: 'Mr. Verma',
      subtitle: 'Delayed Evaluation',
      value: '3 Days Late',
      color: '#FFAB00',
      icon: 'mdi:clock-alert-outline',
    },
    {
      id: '2',
      title: 'Ms. Sharma',
      subtitle: 'Low Attendance',
      value: '85%',
      color: '#FFAB00',
      icon: 'mdi:account-alert-outline',
    },
  ];

  return (
    <GenericList title="Teacher Alerts" subheader="Performance and attendance issues" list={list} />
  );
};

export default TeacherAlertsList;
