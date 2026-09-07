'use client';

import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Alert,
  Stack,
  Badge,
  Button,
  Drawer,
  Divider,
  Skeleton,
  Grid,
  Card,
  Tooltip,
} from '@mui/material';
import { useGetStudentAcademic360TabQuery } from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

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
  { value: 'timetable', label: 'Timetable', icon: 'mdi:timetable' },
  { value: 'timeline', label: 'Timeline', icon: 'mdi:timeline-clock-outline' },
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

  const { data, isFetching, isError } = useGetStudentAcademic360TabQuery(
    { studentId, tab: activeTab },
    { skip: !open || !studentId }
  );
  const academic360 = data as Academic360Response | undefined;
  const drawerStudent = academic360?.student || student;

  // Pending homework count for badge
  const pendingHomeworkCount = academic360?.learningTasks?.pending ?? 0;

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isExpanded ? '100%' : { xs: '100%', md: '80vw', lg: '85vw' },
          maxWidth: isExpanded ? '100%' : 1440,
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
          <Skeleton variant="rectangular" height={100} />
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1.5, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={activeTab}
            onChange={(_event, value: string) => setActiveTab(value)}
            variant="scrollable"
            sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 600, fontSize: 13, py: 1, px: 1.5 } }}
          >
            {tabs.map((tab) => {
              const isLearningTab = tab.value === 'learning';
              const showBadge = isLearningTab && pendingHomeworkCount > 0 && !isFetching;

              return (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={
                    showBadge ? (
                      <Badge
                        badgeContent={pendingHomeworkCount}
                        color="error"
                        max={99}
                        sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
                      >
                        {tab.label}
                      </Badge>
                    ) : (
                      tab.label
                    )
                  }
                  iconPosition="start"
                  icon={<Iconify icon={tab.icon} width={16} />}
                />
              );
            })}
          </Tabs>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Button
              size="small"
              variant="text"
              startIcon={<Iconify icon={isExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} width={16} />}
              onClick={() => setIsExpanded((value) => !value)}
              sx={{ fontSize: 12, height: 32 }}
            >
              {isExpanded ? 'Exit Fullscreen' : 'Expand'}
            </Button>
          </Stack>
        </Stack>
        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: 1.5, bgcolor: 'background.neutral' }}>
          {student ? (
            <Stack spacing={1.5}>
              {isError && (
                <Alert severity="error" variant="outlined" sx={{ borderRadius: 1.5 }}>
                  Unable to load the Academic 360 summary. Please try again.
                </Alert>
              )}
              {isFetching ? (
                <DrawerSkeleton activeTab={activeTab} />
              ) : activeTab === 'overview' ? (
                <SuccessOverview data={academic360} />
              ) : (
                <SuccessDetailTabs
                  data={academic360}
                  activeTab={activeTab}
                  isLoading={isFetching}
                  student={drawerStudent}
                />
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
      <Stack spacing={1.5}>
        {/* KPI snapshot grid skeleton */}
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card variant="outlined" sx={{ p: 1.5, height: 104, borderRadius: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="text" width="60%" height={16} />
                </Stack>
                <Skeleton variant="text" width="50%" height={28} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="70%" height={14} />
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 2-Column main dashboard skeleton */}
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
            <Stack spacing={1.5}>
              <Card variant="outlined" sx={{ p: 1.5, height: 200, borderRadius: 1.5 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1.5 }} />
                <Grid container spacing={1.25}>
                  {[1, 2, 3, 4].map((i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6 }}>
                      <Skeleton variant="rectangular" height={54} sx={{ borderRadius: 1.25 }} />
                    </Grid>
                  ))}
                </Grid>
              </Card>
              <Card variant="outlined" sx={{ p: 1.5, height: 160, borderRadius: 1.5 }}>
                <Skeleton variant="text" width="35%" height={24} />
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1.25 }} />
                  ))}
                </Stack>
              </Card>
              <Card variant="outlined" sx={{ p: 1.5, height: 140, borderRadius: 1.5 }}>
                <Skeleton variant="text" width="35%" height={24} />
                <Grid container spacing={1.25} sx={{ mt: 0.5 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6 }}>
                      <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1.25 }} />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
            <Stack spacing={1.5}>
              <Card variant="outlined" sx={{ p: 1.5, height: 150, borderRadius: 1.5 }}>
                <Skeleton variant="text" width="45%" height={24} />
                <Stack spacing={0.75} sx={{ mt: 1 }}>
                  {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={42} sx={{ borderRadius: 1.25 }} />
                  ))}
                </Stack>
              </Card>
              <Card variant="outlined" sx={{ p: 1.5, height: 180, borderRadius: 1.5 }}>
                <Skeleton variant="text" width="50%" height={24} />
                <Stack spacing={0.75} sx={{ mt: 1 }}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: 1.25 }} />
                  ))}
                </Stack>
              </Card>
              <Card variant="outlined" sx={{ p: 1.5, height: 140, borderRadius: 1.5 }}>
                <Skeleton variant="text" width="45%" height={24} />
                <Stack spacing={0.75} sx={{ mt: 1 }}>
                  {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={38} sx={{ borderRadius: 1.25 }} />
                  ))}
                </Stack>
              </Card>
              <Card variant="outlined" sx={{ p: 1.5, height: 120, borderRadius: 1.5 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="rectangular" height={5} sx={{ my: 1, borderRadius: 1 }} />
                <Skeleton variant="text" width="90%" height={16} />
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    );
  }
  if (activeTab === 'attendance') {
    return (
      <Stack spacing={1.5}>
        <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
          <Skeleton variant="text" width="100px" height={24} />
          <Skeleton variant="text" width="60%" height={18} />
          <Skeleton variant="rectangular" height={90} sx={{ mt: 1.5, borderRadius: 1 }} />
        </Card>
        <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
          <Skeleton variant="text" width="200px" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
        </Card>
      </Stack>
    );
  }
  if (activeTab === 'learning' || activeTab === 'exams') {
    return (
      <Stack spacing={1.5}>
        <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
          <Skeleton variant="text" width="150px" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 1 }} />
        </Card>
        <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
          <Skeleton variant="text" width="180px" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 1 }} />
        </Card>
      </Stack>
    );
  }
  if (activeTab === 'timetable') {
    return (
      <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
        <Skeleton variant="text" width="150px" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 1 }} />
      </Card>
    );
  }
  if (activeTab === 'timeline') {
    return (
      <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
        <Skeleton variant="text" width="150px" height={24} sx={{ mb: 1 }} />
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
  return <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 1.5 }} />;
}
