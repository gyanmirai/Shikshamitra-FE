'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import WeeklyPlanningForCatering from './component/weekly-planning-for-catering';

const WeeklyMenuPlannerScreen = () => {
  const links = [
    { name: 'Hostel Management', href: '/hostel/dashboard' },
    { name: 'Catering Management', href: '' },
    { name: 'Weekly Menu Planner', href: '' },
  ];

  return (
    <>
      <CustomBreadcrumbs
        heading="Weekly Menu Planner"
        description="Plan and manage weekly hostel meals by assigning dishes to each day and meal slot. Easily add, view, or update breakfast, lunch, snacks, and dinner menus for every day of the week."
        links={links}
        sx={{ px: 1, mb: 2 }}
      />

      <WeeklyPlanningForCatering />
    </>
  );
};

export default WeeklyMenuPlannerScreen;
