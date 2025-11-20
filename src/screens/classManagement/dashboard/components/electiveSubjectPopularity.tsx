'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { Card } from '@mui/material';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ElectiveSubjectPopularity = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes, setDivision]);

  return (
    <Card sx={{ height: '100%' }}>
      <AnalyticsWebsiteVisits
        title="Elective Subject Popularity"
        chart={{
          categories: ['Computer', 'Sanskrit', 'Yoga', 'Sport'],
          series: [
            {
              name: 'Elective Subject',
              data: [120, 85, 97, 115],
            },
          ],
        }}
        firstDropdownLabel="Class"
        firstDropdownOptions={allClass.map((cls) => ({ label: cls.name, value: cls.id }))}
        firstDropdownValue={classes}
        firstDropdownOnChange={(val) => setClasses(val)}
        secondDropdownLabel="Div"
        secondDropdownOptions={allDivision.map((div) => ({ label: div.name, value: div.id }))}
        secondDropdownValue={division}
        secondDropdownOnChange={(val) => setDivision(val)}
      />
    </Card>
  );
};

export default ElectiveSubjectPopularity;
