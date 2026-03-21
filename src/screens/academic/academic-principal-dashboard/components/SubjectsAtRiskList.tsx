import React from 'react';

import GenericList from './GenericList';

const SubjectsAtRiskList = () => {
  const list = [
    {
      id: '1',
      title: 'Mathematics',
      subtitle: 'Pass Rate: 60%',
      value: 'Critical',
      color: '#FF4842',
      icon: 'mdi:calculator-variant-outline',
    },
    {
      id: '2',
      title: 'Physics',
      subtitle: 'Pass Rate: 65%',
      value: 'Warning',
      color: '#FFAB00',
      icon: 'mdi:atom',
    },
  ];

  return (
    <GenericList
      title="Subjects Requiring Intervention"
      subheader="Low pass rate subjects"
      list={list}
    />
  );
};

export default SubjectsAtRiskList;
