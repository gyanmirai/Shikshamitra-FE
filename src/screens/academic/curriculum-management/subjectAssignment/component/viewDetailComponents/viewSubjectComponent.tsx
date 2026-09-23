'use client';

import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTabs } from 'src/hooks/use-tabs';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Tab, Tabs, Grid, Card, Paper, Drawer, Button, Typography } from '@mui/material';

import SubjectOverview from './subjectOverview';
import SubjectSyllabus from './subjectSyllabus';
import SubjectDocument from './subjectDocument';
import SubjectNavigator from './SubjectNavigator';
import { ViewSubjectSkeleton } from './ViewSubjectSkeleton';
import SubjectWorkspaceHeader from './SubjectWorkspaceHeader';
import { useSubjectWorkspace } from '../../hooks/useSubjectWorkspace';

import type { ISubjectDetail, IViewSubjectProps } from '../type';

export interface StudentTabsComponentType {
  tabs?: UseTabsReturn;
  subject?: ISubjectDetail | null;
  subjectStatus?: number | string;
  isLoading?: boolean;
}

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: <Iconify icon="solar:widget-2-bold-duotone" width={18} />,
    component: (props: StudentTabsComponentType) => (
      <SubjectOverview subject={props.subject ?? null} status={props.subjectStatus} isLoading={props.isLoading} />
    ),
  },
  {
    value: 'syllabus',
    label: 'Syllabus',
    icon: <Iconify icon="solar:notebook-bold-duotone" width={18} />,
    component: (props: StudentTabsComponentType) => (
      <SubjectSyllabus {...props} />
    ),
  },
  {
    value: 'documents',
    label: 'Documents',
    icon: <Iconify icon="solar:document-bold-duotone" width={18} />,
    component: (props: StudentTabsComponentType) => (
      <SubjectDocument {...props} />
    ),
  },
];

export const ViewSubject: React.FC<IViewSubjectProps> = ({ subject, classId, classes }) => {
  const theme = useTheme();
  const tabs = useTabs('overview');
  const mobileNav = useBoolean();

  const {
    isListLoading,
    listError,
    refetchList,
    isDetailLoading,
    isDetailFetching,
    coreSubjects,
    electiveGroups,
    totalSubjectsCount,
    totalFilteredCount,
    selectedAssignmentId,
    selectedSubjectCode,
    selectedSubjectId,
    activeSubjectDetail,
    activeNavigatorItem,
    navigationInfo,
    selectSubject,
    searchQuery,
    setSearchQuery,
    expandedGroups,
    toggleGroup,
    filteredCoreSubjects,
    filteredElectiveGroups,
  } = useSubjectWorkspace({
    classId,
    initialSubject: subject,
  });

  const isFetchingDetail = isDetailLoading || isDetailFetching;

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  const handleSelectSubject = (item: any) => {
    selectSubject(item);
    if (mobileNav.value) {
      mobileNav.onFalse();
    }
  };

  if (isListLoading && totalSubjectsCount === 0) {
    return <ViewSubjectSkeleton />;
  }

  if (listError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            maxWidth: 440,
            borderRadius: 2,
            borderStyle: 'dashed',
            borderColor: 'error.main',
            bgcolor: varAlpha(theme.palette.error.mainChannel, 0.04),
          }}
        >
          <Iconify icon="solar:danger-triangle-bold" width={52} sx={{ color: 'error.main', mb: 1.5 }} />
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
            Unable to load subject allocations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Failed to retrieve subject allocations for {classes || 'this class'}.
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mdi:refresh" />}
            onClick={() => refetchList()}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Grid container spacing={1.5} sx={{ height: '100%', minHeight: 0 }}>
      {/* ── DESKTOP LEFT PANE: Grouped Left Navigator ── */}
      <Grid
        size={{ xs: 12, md: 3.5, lg: 3 }}
        sx={{
          height: '100%',
          minHeight: 0,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <SubjectNavigator
          coreSubjects={filteredCoreSubjects}
          electiveGroups={filteredElectiveGroups}
          totalSubjectsCount={totalSubjectsCount}
          totalFilteredCount={totalFilteredCount}
          selectedAssignmentId={selectedAssignmentId}
          selectedSubjectCode={selectedSubjectCode}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={handleSelectSubject}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          expandedGroups={expandedGroups}
          onToggleGroup={toggleGroup}
        />
      </Grid>

      {/* ── MOBILE DRAWER: Grouped Left Navigator ── */}
      <Drawer
        open={mobileNav.value}
        onClose={mobileNav.onFalse}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              p: 1.5,
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <SubjectNavigator
          coreSubjects={filteredCoreSubjects}
          electiveGroups={filteredElectiveGroups}
          totalSubjectsCount={totalSubjectsCount}
          totalFilteredCount={totalFilteredCount}
          selectedAssignmentId={selectedAssignmentId}
          selectedSubjectCode={selectedSubjectCode}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={handleSelectSubject}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          expandedGroups={expandedGroups}
          onToggleGroup={toggleGroup}
        />
      </Drawer>

      {/* ── RIGHT PANE: Dedicated Subject Workspace ── */}
      <Grid size={{ xs: 12, md: 8.5, lg: 9 }} sx={{ height: '100%', minHeight: 0 }}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadows-4)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* 1. Header with Metadata, Quick Switcher, Position & Prev/Next buttons */}
          <SubjectWorkspaceHeader
            subject={activeSubjectDetail}
            activeNavigatorItem={activeNavigatorItem}
            coreSubjects={coreSubjects}
            electiveGroups={electiveGroups}
            selectedAssignmentId={selectedAssignmentId}
            selectedSubjectCode={selectedSubjectCode}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={handleSelectSubject}
            navigationInfo={navigationInfo}
            isLoading={isFetchingDetail}
            onOpenMobileNav={mobileNav.onTrue}
          />

          {/* 2. Workspace Navigation Tabs */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 2 },
              pt: 1,
              bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tabs
              value={tabs.value}
              onChange={tabs.onChange}
              sx={{
                minHeight: 40,
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                '& .MuiTab-root': {
                  minHeight: 40,
                  minWidth: 90,
                  mr: 1,
                  px: 1.5,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                },
              }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  icon={tab.icon}
                  iconPosition="start"
                  label={tab.label}
                  disableRipple
                />
              ))}
            </Tabs>
          </Box>

          {/* 3. Main Workspace Tab Panel Content */}
          <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
            {currentActiveComponent?.component && (
              <currentActiveComponent.component
                tabs={tabs}
                subject={activeSubjectDetail}
                subjectStatus={activeNavigatorItem?.status}
                isLoading={isFetchingDetail}
              />
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default React.memo(ViewSubject);
