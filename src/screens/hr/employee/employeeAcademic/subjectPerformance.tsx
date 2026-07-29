'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetEmployeeClassesQuery,
  useGetEmployeeDivisionsQuery,
} from 'src/redux/classManagementApi/subjectProgressManageApi/subjectProgressManageApi';
import CourseProgressComponent from 'src/components/course-progress/courseProgress';

interface SubjectPerformanceProps {
  employeeId?: string;
}

const CourseProgress = ({ employeeId }: SubjectPerformanceProps) => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');

  // 1st API: Fetch classes for employee
  const { data: classesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeClassesQuery,
    params: { employeeId: employeeId ?? '' },
    options: {
      skip: !employeeId,
    },
  });

  const allClasses: any[] =
    classesData?.data?.items ??
    classesData?.items ??
    classesData?.records ??
    (Array.isArray(classesData)
      ? classesData
      : Array.isArray(classesData?.data)
        ? classesData.data
        : []);

  // Update selected class when classes list is loaded
  useEffect(() => {
    if (allClasses.length > 0 && !classes) {
      setClasses(allClasses[0]?.id || allClasses[0]?.classId || '');
    }
  }, [allClasses, classes]);

  // 2nd API: Fetch divisions for selected class & employee
  const { data: divisionsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeDivisionsQuery,
    params: {
      employeeId: employeeId ?? '',
      classId: classes,
    },
    options: {
      skip: !employeeId || !classes,
    },
  });

  const allDivisions: any[] =
    divisionsData?.data?.items ??
    divisionsData?.items ??
    divisionsData?.records ??
    (Array.isArray(divisionsData)
      ? divisionsData
      : Array.isArray(divisionsData?.data)
        ? divisionsData.data
        : []);

  // Update selected division when divisions list changes
  useEffect(() => {
    if (allDivisions.length > 0) {
      setDivision(allDivisions[0]?.id || allDivisions[0]?.divisionId || '');
    } else {
      setDivision('');
    }
  }, [allDivisions]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Class and Division selection filters */}
      <Card sx={{ p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <CustomSelect
            options={allClasses}
            label="Class"
            value={classes}
            onChange={(val) => setClasses(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          />
          <CustomSelect
            options={allDivisions}
            label="Division"
            value={division}
            onChange={(val) => setDivision(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            disabled={!classes}
          />
        </Box>
      </Card>

      {/* 3rd API & UI: Course Progress Component */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CourseProgressComponent
          isAction={false}
          selectedClass={classes}
          selectedDivision={division}
          employeeId={employeeId}
        />
      </Box>
    </Box>
  );
};

export default CourseProgress;
