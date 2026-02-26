'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { Box, Card } from '@mui/material';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import courseProgressTableData from 'src/json/academic/syllabus/courseProgressTableData.json';

import CourseProgressComponent from './courseProgress';

const CourseProgress = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Custom breadcrumbs navigation component */}
      <CustomBreadcrumbs
        heading="Chapters Progress"
        description="Track the progress of each subject and its chapters in real-time. Monitor completed and pending chapters, and analyze progress to ensure curriculum coverage and effective learning."
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Chapters Progress' },
        ]}
        sx={{ px: 2 }}
      />
      {/* Class and Division selection filters */}
      <Card sx={{ p: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <PaginatedSearchSelect
            label="Class"
            noOptionsText="No results found"
            fetchOptions={async (query) => {
              const items = allClass || [];
              const filtered = items.filter((item: any) =>
                item?.name?.toLowerCase().includes(query.toLowerCase())
              );
              return {
                data: filtered.map((item: any) => ({
                  label: item.name,
                  id: item.id,
                })),
                hasMore: false,
              };
            }}
            value={
              classes
                ? {
                    label: allClass.find((c: any) => c.id === classes)?.name || '',
                    id: classes,
                  }
                : null
            }
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            getOptionLabel={(option: any) => option?.label || ''}
            renderOption={(optionProps, option: any) => (
              <li {...optionProps} key={option.id}>
                {option.label}
              </li>
            )}
            minChars={0}
            onChange={(_, value: any) => {
              const val = value?.id || '';
              setClasses(val);
            }}
            sx={{ maxWidth: '250px', width: '100%' }}
            size="small"
          />
          <PaginatedSearchSelect
            label="Division"
            noOptionsText="No results found"
            fetchOptions={async (query) => {
              const items = allDivision || [];
              const filtered = items.filter((item: any) =>
                item?.name?.toLowerCase().includes(query.toLowerCase())
              );
              return {
                data: filtered.map((item: any) => ({
                  label: item.name,
                  id: item.id,
                })),
                hasMore: false,
              };
            }}
            value={
              division
                ? {
                    label: allDivision.find((d: any) => d.id === division)?.name || '',
                    id: division,
                  }
                : null
            }
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            getOptionLabel={(option: any) => option?.label || ''}
            renderOption={(optionProps, option: any) => (
              <li {...optionProps} key={option.id}>
                {option.label}
              </li>
            )}
            disabled={!classes}
            minChars={0}
            onChange={(_, value: any) => {
              const val = value?.id || '';
              setDivision(val);
            }}
            sx={{ maxWidth: '250px', width: '100%' }}
            size="small"
          />
        </Box>
      </Card>

      <CourseProgressComponent
        courseData={courseProgressTableData}
        isAction
        selectedClass={classes}
        selectedDivision={division}
      />
    </Box>
  );
};

export default CourseProgress;
