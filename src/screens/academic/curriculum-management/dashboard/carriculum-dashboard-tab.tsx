import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import SubjectManagement from './component/carriculum-contentview-dashboard-component';
import CarriculumListDashboardComponent from './component/carriculum-list-dashboard-component';
import CarriculumnDashboardOverviewComponent from './component/carriculumn-dashboard-overview-component';

const CarriculumDashboardTab = (props: TabComponentType) => (
  <>
    <CarriculumnDashboardOverviewComponent {...props} />
    <CarriculumListDashboardComponent {...props} />
    <SubjectManagement {...props} />

    {/* <CarriculumContentviewDashboardComponent /> */}
  </>
);

export default CarriculumDashboardTab;
