import React from 'react'
import { Box, } from '@mui/material';

import CarriculumDetailedviewDashboardComponent from './component/cariculum-detailedview-dashboard-component';
import CarriculumContentviewDashboardComponent from './component/carriculum-contentview-dashboard-component';
import CarriculumnDashboardOverviewComponent from './component/carriculumn-dashboard-overview-component';
import CarriculumListDashboardComponent from './component/carriculum-list-dashboard-component';

const CarriculumDashboardTab = () =>
(
   <>
        <CarriculumnDashboardOverviewComponent />
        <CarriculumListDashboardComponent />
        <CarriculumDetailedviewDashboardComponent />
        <CarriculumContentviewDashboardComponent />
    </>
);


export default CarriculumDashboardTab;