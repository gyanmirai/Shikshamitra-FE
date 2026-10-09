'use client';

import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

import { AcademicSetupHeader } from './academic-setup-header';
import { AcademicSetupStatus } from './academic-setup-status';
import { AcademicSetupSidebar } from './academic-setup-sidebar';
import { AcademicSetupDetails } from './academic-setup-details';
import { AcademicSetupDialogs } from './academic-setup-dialogs';
import { AcademicSetupProgress } from './academic-setup-progress';
import { getHierarchyCounts } from './academic-setup-progress-model';
import { useAcademicSetupWorkspace } from './use-academic-setup-workspace';

import type { AcademicYearRecord } from './academic-setup-model';

const EMPTY_COUNTS = { boards: 0, mediums: 0, stages: 0, standards: 0, divisions: 0 };

const YearSetup = ({ initialYearId }: { initialYearId?: string } = {}) => {
  const workspace = useAcademicSetupWorkspace(initialYearId);
  const yearDialog = useBoolean();
  const boardDialog = useBoolean();
  const [editYear, setEditYear] = useState<AcademicYearRecord | null>(null);
  const counts = workspace.currentYear ? getHierarchyCounts(workspace.boards) : EMPTY_COUNTS;

  const openCreateYear = () => {
    setEditYear(null);
    yearDialog.onTrue();
  };
  const openEditYear = () => {
    if (!workspace.currentYear) return;
    setEditYear(workspace.currentYear);
    yearDialog.onTrue();
  };
  const closeYearDialog = () => {
    yearDialog.onFalse();
    setEditYear(null);
  };

  return (
    <Box
      data-testid="academic-hierarchy-screen"
      sx={{
        height: { xs: 'auto', md: '100%' },
        minHeight: 0,
        overflow: { xs: 'visible', md: 'hidden' },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <AcademicSetupHeader
        years={workspace.years}
        selectedYearId={workspace.selectedYearId}
        currentYear={workspace.currentYear}
        isLoading={workspace.isLoading}
        onSelectYear={workspace.selectYear}
        onCreateYear={openCreateYear}
        onEditYear={openEditYear}
        onAddBoard={boardDialog.onTrue}
      />

      <AcademicSetupProgress counts={counts} isLoading={workspace.isLoading} />

      <Box data-testid="academic-hierarchy-workspace" sx={{ flex: 1, minHeight: 0 }}>
        {workspace.isError ? (
          <AcademicSetupStatus kind="error" onRetry={workspace.retry} />
        ) : workspace.isLoading && !workspace.currentYear ? (
          <AcademicSetupStatus kind="loading" />
        ) : (
          <Grid container spacing={1} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: 0 }}>
            <Grid
              size={{ xs: 12, md: 4, lg: 3 }}
              sx={{
                minHeight: 0,
                height: { xs: 'auto', md: '100%' },
                overflow: { xs: 'visible', md: 'hidden' },
              }}
            >
              <AcademicSetupSidebar
                nodes={workspace.tree}
                selectedNodeId={workspace.selectedNode?.id}
                expandedNodes={workspace.expandedNodes}
                isLoading={workspace.isLoading}
                hasAcademicYear={Boolean(workspace.currentYear)}
                onSelect={workspace.selectNode}
                onToggleExpand={workspace.toggleExpanded}
                onCollapseAll={workspace.collapseAll}
                onAddBoard={boardDialog.onTrue}
                onCreateYear={openCreateYear}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 8, lg: 9 }}
              sx={{
                minHeight: 0,
                height: { xs: 'auto', md: '100%' },
                overflow: { xs: 'visible', md: 'hidden' },
              }}
            >
              {workspace.currentYear && workspace.selectedNode ? (
                <AcademicSetupDetails
                  node={workspace.selectedNode}
                  currentYear={workspace.currentYear}
                  onSelectNode={workspace.selectNode}
                  onSelectCrumb={workspace.selectCrumb}
                />
              ) : (
                <AcademicSetupStatus kind="empty" onCreateYear={openCreateYear} />
              )}
            </Grid>
          </Grid>
        )}
      </Box>

      <AcademicSetupDialogs
        currentYear={workspace.currentYear}
        editYear={editYear}
        isYearDialogOpen={yearDialog.value}
        isBoardDialogOpen={boardDialog.value}
        onCloseYearDialog={closeYearDialog}
        onCloseBoardDialog={boardDialog.onFalse}
      />
    </Box>
  );
};

export default YearSetup;
