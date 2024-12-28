'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import CurriculumOverview from '../../curriculum-overview';

const CarriculumListDashboardComponent = (props: TabComponentType) => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return <CurriculumOverview />;
};

export default CarriculumListDashboardComponent;
