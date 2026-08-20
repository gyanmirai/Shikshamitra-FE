'use client';

import type { RootState } from 'src/redux/store';
import type { TooltipProps } from '@mui/material';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import Button from '@mui/material/Button';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Paper, Drawer, IconButton, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useGetSeatAllocationTableDataQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import { toSeatingPlanListRow } from '../utils/mappers';
import SeatingAllocationPage from './SeatingAllocationPage';
import SeatingPlanTable from '../components/list/SeatingPlanTable';
import AllocationReviewDialog from '../components/review/AllocationReviewDialog';
import SeatingPlanSummaryCards from '../components/list/SeatingPlanSummaryCards';
import SeatingPlanPreviewDrawer from '../components/list/SeatingPlanPreviewDrawer';

import type { SeatingPlanListRow } from '../types';

type WorkspaceDrawerState = {
  row: SeatingPlanListRow;
  mode: 'allocation' | 'review';
  divisionId?: string;
  roomIds?: string[];
  seatingPlanId?: string;
  standardId?: string;
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
  const [isWorkspaceDirty, setIsWorkspaceDirty] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    const allClasses =
      currentMedium?.educationMediumStages?.flatMap(
        (stage: Organization) => stage.standards || []
      ) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [currentMedium]);

  const {
    data: seatAllocationData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
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
      mode: 'allocation',
    });
  };

  // Immediate, unguarded close — used once the user has confirmed the discard
  // (or when there are no unsaved changes). Resets dirty/confirm tracking state.
  const closePlanWorkspace = () => {
    setWorkspaceDrawer(null);
    setIsWorkspaceDirty(false);
    setConfirmDiscardOpen(false);
  };

  // Guarded close for the drawer X, backdrop/Esc, and the workspace Back action:
  // unsaved seating changes must be explicitly confirmed before being discarded.
  const requestClosePlanWorkspace = () => {
    if (isWorkspaceDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    closePlanWorkspace();
  };

  const workspaceActionsTooltip = (
    <Box sx={{ p: 1.5, maxWidth: 360 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Seating Workspace — Action Guide
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Quick guide for workspace controls and action buttons:
      </Typography>

      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Reset</strong> — Clears all seat allocations, subject-wise scope configurations,
          and resets the seating plan to its default state.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Auto Allocate</strong> — Automatically places unassigned students into available
          room seats following active seating rules.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Save Draft</strong> — Saves your current room seat allocations so you can safely
          pause and resume editing later.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Review</strong> — Opens the allocation summary to check room utilization, capacity
          shortages, and finalize/publish the plan.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Undo / Redo</strong> (<em>Ctrl+Z / Ctrl+Y</em>) — Revert or re-apply recent
          seating layout changes.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Scope &amp; Room Selectors</strong> — Switch between class divisions and
          examination rooms to manage seating per room.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Student Queue (Left Panel)</strong> — Filter and drag-and-drop students into
          specific seats in the canvas layout.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Rules &amp; Conflicts (Right Panel)</strong> — Displays live validation errors
          like seat overlaps or room capacity limits.
        </Typography>
      </Box>
    </Box>
  );

  const seatingPlanTooltip = (
    <Box sx={{ p: 1.5, maxWidth: 340 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Seating Plan — Workflow Guide
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Plan, validate, and finalize exam seating arrangements per class and subject.
      </Typography>

      <Typography
        variant="caption"
        fontWeight={700}
        color="text.primary"
        sx={{ display: 'block', mb: 0.5 }}
      >
        Key Features &amp; Actions:
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25 } }}>
        <Typography component="li" variant="caption" color="text.secondary">
          Filter exams by <strong>Class</strong> dropdown or status summary cards (e.g., In
          Progress, Ready for Review).
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Click <strong>Plan Seating</strong> to allocate rooms, layout arrangements, and student
          seat assignments.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Click <strong>Review</strong> to inspect capacity shortages, room allocations, and roll
          distributions.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Use <strong>Preview</strong> (eye icon) to quick-view seating allocations without entering
          the workspace.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Finalize and <strong>Publish</strong> seating plans once room capacities are validated.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Seating Plan"
        description=" "
        tooltipProps={
          {
            title: seatingPlanTooltip,
            sx: { textAlign: 'left' },
          } as TooltipProps
        }
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
        onClose={requestClosePlanWorkspace}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Create Seating Plan
                  </Typography>
                  <CustomTooltip arrow placement="right" title={workspaceActionsTooltip}>
                    <Iconify
                      icon="lucide:info"
                      sx={{ cursor: 'pointer' }}
                      fontSize={16}
                      color="info.main"
                    />
                  </CustomTooltip>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {workspaceDrawer.row.examName} / {workspaceDrawer.row.standardName}
                </Typography>
              </Box>
              <IconButton
                onClick={requestClosePlanWorkspace}
                aria-label="Close seating plan workspace"
              >
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <SeatingAllocationPage
                examId={workspaceDrawer.row.examId}
                onClose={requestClosePlanWorkspace}
                onDirtyStateChange={setIsWorkspaceDirty}
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
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Allocation review dialog — opens on top of the allocation workspace drawer */}
      {workspaceDrawer && (
        <AllocationReviewDialog
          open={workspaceDrawer.mode === 'review'}
          onClose={() =>
            setWorkspaceDrawer((current) =>
              current ? { ...current, mode: 'allocation' } : current
            )
          }
          examId={workspaceDrawer.row.examId}
          standardId={workspaceDrawer.standardId ?? classes}
          divisionId={workspaceDrawer.divisionId}
          roomIds={workspaceDrawer.roomIds}
          seatingPlanId={workspaceDrawer.seatingPlanId}
          onBackToAllocation={() =>
            setWorkspaceDrawer((current) =>
              current ? { ...current, mode: 'allocation' } : current
            )
          }
        />
      )}

      {/* Unsaved-changes intercept for the Create Seating Plan workspace */}
      <ConfirmDialog
        open={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        title="Unsaved Changes"
        content="You have unsaved seating changes. If you exit now, all unsaved allocations will be lost. Are you sure you want to exit without saving?"
        icon="warning"
        action={
          <Button variant="contained" color="error" onClick={closePlanWorkspace}>
            Discard &amp; Exit
          </Button>
        }
      />
    </Box>
  );
}
