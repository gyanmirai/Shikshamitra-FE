import React from 'react';

import CarriculumListDashboardComponent from './component/carriculum-list-dashboard-component';
import CarriculumnDashboardOverviewComponent from './component/carriculumn-dashboard-overview-component';
import CarriculumContentviewDashboardComponent from './component/carriculum-contentview-dashboard-component';
import CarriculumDetailedviewDashboardComponent from './component/cariculum-detailedview-dashboard-component';

const CarriculumDashboardTab = () => (
  <>
    <CarriculumnDashboardOverviewComponent />
    <CarriculumListDashboardComponent />
    <CarriculumDetailedviewDashboardComponent />
    <CarriculumContentviewDashboardComponent />
  </>
);

export default CarriculumDashboardTab;
