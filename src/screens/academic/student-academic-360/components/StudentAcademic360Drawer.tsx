'use client';

import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Alert, Stack, Button, Drawer, Divider, Skeleton } from '@mui/material';
import { useGetStudentAcademic360Query } from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

import { getStudentId } from '../types';
import { SuccessOverview } from './SuccessOverview';
import { SuccessDetailTabs } from './SuccessDetailTabs';
import { StudentSuccessHeader } from './StudentSuccessHeader';
import { Academic360EmptyState } from './Academic360EmptyState';

import type { Academic360Response, Academic360StudentRow } from '../types';

type StudentAcademic360DrawerProps = {
  open: boolean;
  student: Academic360StudentRow | null;
  students: Academic360StudentRow[];
  standardId: string;
  divisionId: string;
  onStudentChange: (student: Academic360StudentRow) => void;
  onClose: () => void;
};

const tabs = [
  { value: 'overview', label: 'Overview', icon: 'mdi:view-dashboard-outline' },
  { value: 'attendance', label: 'Attendance', icon: 'mdi:calendar-check-outline' },
  { value: 'learning', label: 'Learning', icon: 'mdi:clipboard-text-outline' },
  { value: 'exams', label: 'Exams', icon: 'mdi:trophy-outline' },
  { value: 'timeline', label: 'Timeline', icon: 'mdi:timeline-clock-outline' },
  { value: 'interventions', label: 'Interventions', icon: 'mdi:hand-heart-outline' },
];

export function StudentAcademic360Drawer({
  open,
  student,
  students = [],
  standardId: _standardId,
  divisionId: _divisionId,
  onStudentChange,
  onClose,
}: StudentAcademic360DrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(false);
  const studentId = student ? getStudentId(student) : '';
  const currentIndex = students.findIndex((item) => getStudentId(item) === studentId);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < students.length - 1;

  const { data, isFetching, isError } = useGetStudentAcademic360Query(
    { studentId, recentTaskCount: 10, recentExamCount: 5 },
    { skip: !open || !studentId }
  );
  const academic360 = data as Academic360Response | undefined;
  const drawerStudent = academic360?.student || student;

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if (isTyping) return;

      if (event.key === 'ArrowLeft' && canGoPrevious) {
        onStudentChange(students[currentIndex - 1]);
      }
      if (event.key === 'ArrowRight' && canGoNext) {
        onStudentChange(students[currentIndex + 1]);
      }
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoNext, canGoPrevious, currentIndex, onClose, onStudentChange, open, students]);

  const handlePrevious = () => {
    if (canGoPrevious) onStudentChange(students[currentIndex - 1]);
  };

  const handleNext = () => {
    if (canGoNext) onStudentChange(students[currentIndex + 1]);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isExpanded ? '100%' : { xs: '100%', md: '75vw' },
          maxWidth: isExpanded ? '100%' : 1280,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {drawerStudent ? (
          <StudentSuccessHeader
            student={drawerStudent}
            health={academic360?.academicHealth}
            kpis={academic360?.kpis}
            currentIndex={currentIndex}
            totalStudents={students.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onClose={onClose}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
          />
        ) : (
          <Skeleton variant="rectangular" height={112} />
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={activeTab}
            onChange={(_event, value: string) => setActiveTab(value)}
            variant="scrollable"
            sx={{ minHeight: 48, '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600 } }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="start"
                icon={<Iconify icon={tab.icon} width={18} />}
              />
            ))}
          </Tabs>
          <Button
            size="small"
            variant="text"
            startIcon={<Iconify icon={isExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} />}
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded ? 'Exit Fullscreen' : 'Expand'}
          </Button>
        </Stack>
        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'background.neutral' }}>
          {student ? (
            <Stack spacing={2}>
              {isError && (
                <Alert severity="error" variant="outlined">
                  Unable to load the Academic 360 summary. Please try again.
                </Alert>
              )}
              {activeTab === 'overview' ? (
                <SuccessOverview data={academic360} />
              ) : (
                <SuccessDetailTabs data={academic360} activeTab={activeTab} isLoading={isFetching} />
              )}
            </Stack>
          ) : (
            <Academic360EmptyState
              icon="mdi:account-search-outline"
              title="Select a student"
              description="Choose a student from the list to open their Academic 360 view — health score, attendance, learning, exams and more, all in one place."
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
