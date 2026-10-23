'use client';

import type { TooltipProps } from '@mui/material';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';
import CustomSelect from 'src/components/custom-select';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SeatingPlanTable from '../components/list/SeatingPlanTable';
import { useSeatingPlanList } from '../hooks/use-seating-plan-list';
import { buildSeatingPlanSetupUrl } from '../utils/seating-plan-navigation';
import SeatingPlanHelpTooltip from '../components/list/SeatingPlanHelpTooltip';
import SeatingPlanPreviewDrawer from '../components/list/SeatingPlanPreviewDrawer';

import type { SeatingPlanListRow } from '../types';

const STATUS_OPTIONS = [
  { id: 'all', name: 'All exams' },
  { id: 'requiring-seating', name: 'Requires seating' },
  { id: 'in-progress', name: 'In progress' },
  { id: 'ready-for-review', name: 'Ready for review' },
  { id: 'needs-attention', name: 'Needs attention' },
  { id: 'published', name: 'Published' },
];

export default function SeatingPlanListPage() {
  const router = useRouter();
  const list = useSeatingPlanList();
  const openPlan = (row: SeatingPlanListRow) => {
    router.push(
      buildSeatingPlanSetupUrl(row.examId, list.selectedClassId, list.activeSummaryFilter)
    );
  };

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={1}>
      <CustomBreadcrumbs
        heading="Seating Plan"
        description="Create individual or shared subject plans inside each examination."
        tooltipProps={
          {
            title: <SeatingPlanHelpTooltip />,
            sx: { textAlign: 'left' },
          } as TooltipProps
        }
        links={[
          { name: 'Academics', href: academicPaths.dashboard },
          { name: 'Examination' },
          { name: 'Seating Plan' },
        ]}
      />

      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <CustomSelect
            options={list.classes}
            label="Class"
            value={list.selectedClassId}
            onChange={(value) => {
              list.setSelectedClassId(value as string);
              list.setPreviewRow(null);
            }}
            labelKey="name"
            valueKey="id"
            noOptionsMessage="No classes are available for the current academic context."
            formControlProps={{ sx: { minWidth: { sm: 240 } } }}
          />
          <CustomSelect
            options={STATUS_OPTIONS}
            label="Exam status"
            value={list.activeSummaryFilter ?? 'all'}
            onChange={(value) => {
              list.setActiveSummaryFilter(value === 'all' ? null : (value as string));
              list.setPreviewRow(null);
            }}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: { sm: 220 } } }}
          />
        </Stack>
      </Paper>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: { xs: 'auto', md: 'hidden' } }}>
        <SeatingPlanTable
          rows={list.filteredRows}
          isLoading={list.isListDataLoading}
          canAdd={list.canAdd}
          isFiltered={Boolean(list.activeSummaryFilter)}
          onClearFilter={() => list.setActiveSummaryFilter(null)}
          onRowClick={list.setPreviewRow}
          onPrimaryAction={openPlan}
        />
      </Box>

      <SeatingPlanPreviewDrawer
        row={list.previewRow}
        onClose={() => list.setPreviewRow(null)}
        onPrimaryAction={openPlan}
      />
    </Box>
  );
}
