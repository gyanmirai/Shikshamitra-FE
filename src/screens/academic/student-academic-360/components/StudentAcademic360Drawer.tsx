'use client';

import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Alert, Stack, Button, Drawer, Divider, Skeleton, Grid, Card } from '@mui/material';
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
            <Stack spacing={1}>
              {isError && (
                <Alert severity="error" variant="outlined">
                  Unable to load the Academic 360 summary. Please try again.
                </Alert>
              )}
              {isFetching ? (
                <DrawerSkeleton activeTab={activeTab} />
              ) : activeTab === 'overview' ? (
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

type DrawerSkeletonProps = {
  activeTab: string;
};

function DrawerSkeleton({ activeTab }: DrawerSkeletonProps) {
  if (activeTab === 'overview') {
    return (
      <Stack spacing={1}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ p: 2.5, height: 180, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={72} height={72} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Stack>
              <Skeleton variant="text" width="90%" sx={{ mt: 2 }} />
              <Skeleton variant="text" width="80%" />
            </Card>
          </Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 2 }}>
              <Card variant="outlined" sx={{ p: 2, height: 180, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="text" width="50%" />
                </Stack>
                <Skeleton variant="text" width="70%" height={40} sx={{ mt: 2 }} />
                <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
              </Card>
            </Grid>
          ))}
        </Grid>
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Skeleton variant="text" width="150px" height={24} sx={{ mb: 1.5 }} />
          <Stack spacing={1}>
            {[1, 2].map((i) => (
              <Box key={i} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="100px" />
                    <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Card>
      </Stack>
    );
  }
  if (activeTab === 'attendance') {
    return (
      <Stack spacing={1}>
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Skeleton variant="text" width="100px" height={24} />
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1 }} />
        </Card>
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Skeleton variant="text" width="200px" height={24} sx={{ mb: 1.5 }} />
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
        </Card>
      </Stack>
    );
  }
  if (activeTab === 'learning' || activeTab === 'exams') {
    return (
      <Stack spacing={1}>
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Skeleton variant="text" width="150px" height={24} sx={{ mb: 1.5 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
        </Card>
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Skeleton variant="text" width="180px" height={24} sx={{ mb: 1.5 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
        </Card>
      </Stack>
    );
  }
  if (activeTab === 'timeline') {
    return (
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Skeleton variant="text" width="150px" height={24} sx={{ mb: 1.5 }} />
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <Skeleton variant="text" width="50px" />
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width="200px" />
            </Stack>
          ))}
        </Stack>
      </Card>
    );
  }
  if (activeTab === 'interventions') {
    return (
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Skeleton variant="text" width="220px" height={24} sx={{ mb: 1.5 }} />
        <Stack spacing={1}>
          {[1, 2].map((i) => (
            <Box key={i} sx={{ p: 1.75, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
              <Skeleton variant="text" width="150px" height={20} />
              <Skeleton variant="text" width="250px" sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" height={10} sx={{ mt: 2, borderRadius: 1 }} />
            </Box>
          ))}
        </Stack>
      </Card>
    );
  }
  return <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />;
}
