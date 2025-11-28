import React from 'react';

import GenericList from './GenericList';

const AtRiskStudentsList = () => {
  const list = [
    {
      id: '1',
      title: 'Rohan Gupta',
      subtitle: 'Class 9-B',
      value: 'Avg: 35%',
      color: '#FF4842',
      avatarUrl: '/static/images/avatars/avatar_4.png',
    },
    {
      id: '2',
      title: 'Sneha Singh',
      subtitle: 'Class 8-A',
      value: 'Avg: 38%',
      color: '#FF4842',
      avatarUrl: '/static/images/avatars/avatar_5.png',
    },
    {
      id: '3',
      title: 'Amit Kumar',
      subtitle: 'Class 10-C',
      value: 'Avg: 40%',
      color: '#FFAB00',
      avatarUrl: '/static/images/avatars/avatar_6.png',
    },
  ];

  return (
    <GenericList
      title="Students at Academic Risk"
      subheader="Consistent low performance"
      list={list}
    />
  );
};

export default AtRiskStudentsList;
