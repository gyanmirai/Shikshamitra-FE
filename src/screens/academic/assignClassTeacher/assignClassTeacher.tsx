'use client';

import { useState } from 'react';
import { Box, Alert, Typography } from '@mui/material';
import { academicPaths } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AcademicContextContent } from 'src/screens/academic/components/AcademicContextContent';

import { useClassTeacherActions } from './useClassTeacherActions';
import { ReviewAssignmentDrawer } from './ReviewAssignmentDrawer';
import { useClassTeacherWorkspace } from './useClassTeacherWorkspace';
import { ClassTeacherHistoryDrawer } from './ClassTeacherHistoryDrawer';
import { ClassTeacherStatusFilters } from './ClassTeacherStatusFilters';
import { classTeacherAssignmentColumns } from './classTeacherAssignmentColumns';
import { ClassTeacherAssignmentControls } from './ClassTeacherAssignmentControls';

export default function ClassTeacherAssignment() {
  const workspace = useClassTeacherWorkspace();
  const actions = useClassTeacherActions(workspace);
  const [historyOpen, setHistoryOpen] = useState(false);
  const hasScope = workspace.canView && Boolean(workspace.organization);
  const loading = hasScope && !workspace.workspace && !workspace.isError;
  const ready = hasScope && Boolean(workspace.workspace) && !workspace.isError;
  const locked = actions.busy || workspace.isFetching || !ready;
  const noDataText =
    workspace.statusFilter !== 'all'
      ? 'No class divisions match this status. Choose All to view every division.'
      : 'No class divisions found for this organization.';
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        minHeight: 0,
        minWidth: 0,
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="Class Teacher Assignment"
        headingComponent="h1"
        links={[
          { name: 'Academics', href: academicPaths.dashboard },
          { name: 'Class Teacher Assignment' },
        ]}
        description="Assign and manage class teachers while checking workload, availability, conflicts, and continuity."
      />
      <AcademicContextContent>
        <ClassTeacherAssignmentControls
          workspace={workspace}
          actions={actions}
          onHistory={() => setHistoryOpen(true)}
        />
        {!hasScope && (
          <Alert severity="info">
            {workspace.canView
              ? 'Select an academic year, board, and medium with an organization to view assignments.'
              : 'You do not have permission to view class teacher assignments.'}
          </Alert>
        )}
        {ready && workspace.tableData.length > 0 && (
          <Alert
            severity={workspace.summary.status === 'Ready' ? 'success' : 'warning'}
            sx={{ flexShrink: 0, py: 0.5 }}
          >
            <Typography variant="body2" component="span" fontWeight={600}>
              Allocation status: {workspace.summary.status}.{' '}
            </Typography>
            {workspace.summary.reasons.length
              ? workspace.summary.reasons.join(' ')
              : 'All class divisions are assigned.'}
          </Alert>
        )}
        {actions.invalidDates && (
          <Alert severity="error">
            Correct the invalid effective dates before saving or reviewing assignments.
          </Alert>
        )}
        <ClassTeacherStatusFilters
          summary={workspace.summary}
          value={workspace.statusFilter}
          known={ready}
          disabled={!ready || actions.busy}
          onChange={workspace.setStatusFilter}
        />
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          <CustomizableTable
            tableTitle="Class Teacher Assignments"
            tableId="assignTeacherTable"
            wrapperProps={{ sx: { height: 1, minHeight: 0, minWidth: 0, flex: 1 } }}
            tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
            isLoading={loading}
            isRefreshing={Boolean(workspace.isFetching && workspace.workspace)}
            error={workspace.isError ? workspace.error : undefined}
            onRetry={() => workspace.refetch()}
            noDataText={noDataText}
            page={workspace.page}
            onPaginationChange={(page) => workspace.setPage(page)}
            columns={classTeacherAssignmentColumns({
              rows: workspace.tableData,
              teachers: workspace.teachers,
              disabled: locked || !workspace.canAdd,
              updateRow: (key, patch) => {
                if (!locked) workspace.updateRow(key, patch);
              },
              changeTeacher: (row, teacher) => {
                if (!locked) workspace.changeTeacher(row, teacher);
              },
            })}
            data={hasScope ? workspace.filteredData : []}
          />
        </Box>
        <ReviewAssignmentDrawer
          open={workspace.canAdd && actions.reviewOpen}
          validation={actions.validation}
          changedRows={workspace.pendingRows}
          isSaving={actions.isSaving}
          onClose={actions.closeReview}
          onConfirm={actions.confirm}
        />
        <ClassTeacherHistoryDrawer
          open={historyOpen}
          organization={workspace.organization}
          canView={workspace.canView}
          onClose={() => setHistoryOpen(false)}
        />
      </AcademicContextContent>
    </Box>
  );
}
