import React from 'react';

import GenericList from './GenericList';

const KeyInsightsList = () => {
  const list = [
    {
      id: '1',
      title: 'Math Performance Drop',
      subtitle: 'Class 8 showed 10% drop',
      value: 'Insight',
      color: '#1890FF',
      icon: 'mdi:lightbulb-on-outline',
    },
    {
      id: '2',
      title: 'Attendance Improvement',
      subtitle: 'Class 10 improved by 5%',
      value: 'Insight',
      color: '#00AB55',
      icon: 'mdi:trending-up',
    },
  ];

  return (
    <GenericList title="School-Wide Insights" subheader="Auto-generated insights" list={list} />
  );
};

export default KeyInsightsList;
