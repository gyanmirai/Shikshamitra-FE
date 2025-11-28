import React from 'react';

import GenericList from './GenericList';

const TopClassesList = () => {
  const list = [
    {
      id: '1',
      title: 'Class 10-A',
      subtitle: 'Average Score: 92%',
      value: 'Excellent',
      color: '#00AB55',
      icon: 'mdi:star-circle-outline',
    },
    {
      id: '2',
      title: 'Class 12-B',
      subtitle: 'Average Score: 89%',
      value: 'Very Good',
      color: '#00AB55',
      icon: 'mdi:star-circle-outline',
    },
    {
      id: '3',
      title: 'Class 6-A',
      subtitle: 'Average Score: 88%',
      value: 'Very Good',
      color: '#00AB55',
      icon: 'mdi:star-circle-outline',
    },
  ];

  return (
    <GenericList
      title="Best Performing Classes"
      subheader="Top classes by average score"
      list={list}
    />
  );
};

export default TopClassesList;
