import React from 'react';

import GenericList from './GenericList';

const AttendanceAlertsList = () => {
  const list = [
    {
      id: '1',
      title: 'Class 9-C',
      subtitle: 'Low Attendance',
      value: '72%',
      color: '#FF4842',
      icon: 'mdi:account-group-outline',
    },
    {
      id: '2',
      title: 'Class 11-B',
      subtitle: 'Low Attendance',
      value: '74%',
      color: '#FF4842',
      icon: 'mdi:account-group-outline',
    },
  ];

  return (
    <GenericList
      title="Attendance Alerts"
      subheader="Classes with critical attendance"
      list={list}
    />
  );
};

export default AttendanceAlertsList;
