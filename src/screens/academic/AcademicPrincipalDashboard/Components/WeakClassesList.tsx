import React from 'react';

import GenericList from './GenericList';

const WeakClassesList = () => {
  const list = [
    {
      id: '1',
      title: 'Class 5-B',
      subtitle: 'Average Score: 45%',
      value: 'Needs Attention',
      color: '#FF4842',
      icon: 'mdi:alert-circle-outline',
    },
    {
      id: '2',
      title: 'Class 8-C',
      subtitle: 'Average Score: 48%',
      value: 'Needs Attention',
      color: '#FF4842',
      icon: 'mdi:alert-circle-outline',
    },
    {
      id: '3',
      title: 'Class 9-A',
      subtitle: 'Average Score: 52%',
      value: 'Warning',
      color: '#FFAB00',
      icon: 'mdi:alert-outline',
    },
  ];

  return (
    <GenericList title="Classes Needing Attention" subheader="Low performing classes" list={list} />
  );
};

export default WeakClassesList;
