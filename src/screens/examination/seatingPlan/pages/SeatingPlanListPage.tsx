'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Paper, Drawer, IconButton, Typography } from '@mui/material';
import { useGetSeatAllocationTableDataQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import SeatingReviewPage from './SeatingReviewPage';
import { toSeatingPlanListRow } from '../utils/mappers';
import SeatingAllocationPage from './SeatingAllocationPage';
import SeatingPlanTable from '../components/list/SeatingPlanTable';
import SeatingPlanSummaryCards from '../components/list/SeatingPlanSummaryCards';
import SeatingPlanPreviewDrawer from '../components/list/SeatingPlanPreviewDrawer';

import type { SeatingPlanListRow } from '../types';

type WorkspaceDrawerState = {
  row: SeatingPlanListRow;
  mode: 'allocation' | 'review';
  divisionId?: string;
  roomIds?: string[];
  seatingPlanId?: string;
} | null;

const SUMMARY_FILTER_PREDICATES: Record<string, (row: SeatingPlanListRow) => boolean> = {
  'requiring-seating': (r) => r.status !== 'published',
  'in-progress': (r) => r.status === 'in-progress',
  'ready-for-review': (r) => r.status === 'ready',
  'fully-allocated': (r) => r.status === 'completed' || r.status === 'published',
  'capacity-issues': (r) => r.capacityStatus === 'shortage',
  published: (r) => r.status === 'published',
};

export default function SeatingPlanListPage() {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.seatAllocation}.Add`
  );

  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [activeSummaryFilter, setActiveSummaryFilter] = useState<string | null>(null);
  const [previewRow, setPreviewRow] = useState<SeatingPlanListRow | null>(null);
  const [workspaceDrawer, setWorkspaceDrawer] = useState<WorkspaceDrawerState>(null);

  useEffect(() => {
    const allClasses =
      currentMedium?.educationMediumStages?.flatMap(
        (stage: Organization) => stage.standards || []
      ) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [currentMedium]);

  const { data: seatAllocationData, isLoading, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationTableDataQuery,
    params: { standardId: classes },
    options: { skip: !classes },
  });

  const rows: SeatingPlanListRow[] = useMemo(
    () => (seatAllocationData?.items || []).map(toSeatingPlanListRow),
    [seatAllocationData]
  );

  const filteredRows = useMemo(() => {
    if (!activeSummaryFilter) return rows;
    const predicate = SUMMARY_FILTER_PREDICATES[activeSummaryFilter];
    return predicate ? rows.filter(predicate) : rows;
  }, [rows, activeSummaryFilter]);

  const openPlanWorkspace = (row: SeatingPlanListRow) => {
    setPreviewRow(null);
    setWorkspaceDrawer({
      row,
      mode: row.status === 'ready' || row.status === 'completed' || row.status === 'published' ? 'review' : 'allocation',
    });
  };

  const closePlanWorkspace = () => setWorkspaceDrawer(null);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Seating Plan"
        description="Plan, validate, and finalize exam seating"
        links={[
          { name: 'Academic', href: '/academic/dashboard' },
          { name: 'Examination' },
          { name: 'Seating Plan' },
        ]}
      />

      <Paper sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1, borderRadius: 2 }}>
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClasses(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
      </Paper>

      <SeatingPlanSummaryCards
        rows={rows}
        isLoading={isLoading || isFetching}
        activeFilter={activeSummaryFilter}
        onFilterClick={(key) => setActiveSummaryFilter((prev) => (prev === key ? null : key))}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <SeatingPlanTable
          rows={filteredRows}
          isLoading={isLoading || isFetching}
          canAdd={canAdd}
          onRowClick={(row) => setPreviewRow(row)}
          onPrimaryAction={openPlanWorkspace}
        />
      </Box>

      <SeatingPlanPreviewDrawer
        row={previewRow}
        onClose={() => setPreviewRow(null)}
        onPrimaryAction={openPlanWorkspace}
      />

      <Drawer
        anchor="right"
        open={!!workspaceDrawer}
        onClose={closePlanWorkspace}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '100%',
            p: 0,
          },
        }}
      >
        {workspaceDrawer && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {workspaceDrawer.mode === 'review' ? 'Review Seating Plan' : 'Create Seating Plan'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {workspaceDrawer.row.examName} / {workspaceDrawer.row.standardName}
                </Typography>
              </Box>
              <IconButton onClick={closePlanWorkspace}>
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {workspaceDrawer.mode === 'review' ? (
                <SeatingReviewPage
                  examId={workspaceDrawer.row.examId}
                  standardId={classes}
                  divisionId={workspaceDrawer.divisionId}
                  roomIds={workspaceDrawer.roomIds}
                  seatingPlanId={workspaceDrawer.seatingPlanId}
                  onBackToAllocation={() =>
                    setWorkspaceDrawer((current) =>
                      current ? { ...current, mode: 'allocation' } : current
                    )
                  }
                />
              ) : (
                <SeatingAllocationPage
                  examId={workspaceDrawer.row.examId}
                  onClose={closePlanWorkspace}
                  onOpenReview={(context) =>
                    setWorkspaceDrawer((current) =>
                      current
                        ? {
                            ...current,
                            mode: 'review',
                            divisionId: context.divisionId,
                            roomIds: context.roomIds,
                            seatingPlanId: context.seatingPlanId,
                          }
                        : current
                    )
                  }
                />
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
