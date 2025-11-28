import React from 'react';

import GenericList from './GenericList';

const SyllabusDelayAlertsList = () => {
  const list = [
    {
      id: '1',
      title: 'History - Class 10',
      subtitle: 'Behind Schedule',
      value: '-2 Chapters',
      color: '#FF4842',
      icon: 'mdi:book-clock-outline',
    },
    {
      id: '2',
      title: 'Physics - Class 12',
      subtitle: 'Behind Schedule',
      value: '-1 Chapter',
      color: '#FFAB00',
      icon: 'mdi:book-clock-outline',
    },
  ];

  return (
    <GenericList title="Syllabus Delay Alerts" subheader="Subjects behind schedule" list={list} />
  );
};

export default SyllabusDelayAlertsList;
