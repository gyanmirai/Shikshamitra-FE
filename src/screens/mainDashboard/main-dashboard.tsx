'use client';

import React from 'react';

import MainDashboardTeacher from './teacher/main-dashboard-teacher';
import MainDashboardStudent from './student/main-dashboard-student';
import MainDashboardPrincipal from './principal/main-dashboard-principal';

const MainDashboard = () => (
  <>
    <MainDashboardPrincipal />
    <MainDashboardTeacher />
    <MainDashboardStudent />
  </>
);

export default MainDashboard;
